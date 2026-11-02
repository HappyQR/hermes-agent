import { useStore } from '@nanostores/react'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { ArchiveSkillConfirmDialog } from '@/app/learning/archive-skill-confirm-dialog'
import { PageLoader } from '@/components/page-loader'
import { PopupSelect } from '@/components/studio/pages/controls'
import { Button } from '@/components/ui/button'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Switch } from '@/components/ui/switch'
import { getOfficialSkills, type ProfileScope, profileScopeKey, setSkillEnabled } from '@/hermes'
import { useI18n } from '@/i18n'
import { queryClient } from '@/lib/query-client'
import { invalidateSlashCompletions } from '@/lib/slash-completion-cache'
import { useStoreSelector } from '@/lib/use-session-slice'
import { $hubActions, installHubSkill, notifyHubActionFailed, OFFICIAL_SKILLS_KEY } from '@/store/hub-actions'
import { notify, notifyError } from '@/store/notifications'
import type { OfficialSkillInfo, SkillInfo } from '@/types/hermes'

import { PanelEmpty } from '../../overlays/panel'
import { MEMORY_ROUTE, navigateToWorkspacePage } from '../../routes'
import { CapBulkMenu, type CapBulkToggle } from '../studio/bulk-menu'
import { CapabilityPageEmpty } from '../studio/empty'
import { HubSheet } from '../studio/hub-sheet'
import { OfficialSkillSheet, SkillSheet } from '../studio/skill-sheets'
import { SkillsGrid } from '../studio/skills-grid'
import { $skillsSort, applySkillSort, SKILL_SORTS, type SkillSort } from '../studio/sort'
import { CapToolbarSlot } from '../studio/toolbar-slots'

import { filteredOfficial, filteredSkills, skillsQueryKey, usageOf } from './skills-data'

interface SkillsTabProps {
  /** Bot Mode's embedded surface: no chat or memory map to send the user to. */
  embedded?: boolean
  /** The scope's skill list, straight from the shell's query. */
  skills: SkillInfo[]
  /** The (connection, profile) scope every read and write routes to. */
  profile: ProfileScope
  query: string
  /** The installed list has not loaded yet (or failed): writes wait for it. */
  installedPending?: boolean
  installedError?: unknown
  /** Page-level refresh: a saved skill edit reloads the same way the refresh
   *  hotkey does, counts and slash completions included. */
  onRefresh: () => void
}

/** The Skills tab: installed skills, official optional skills, the Skills Hub
 *  sheet and learned-skill editing. Remounted on scope changes so an old
 *  profile's sheet, confirmation or pending write cannot enter another. */
export function SkillsTab(props: SkillsTabProps) {
  return <ScopedSkillsTab key={profileScopeKey(props.profile)} {...props} />
}

function ScopedSkillsTab({
  embedded = false,
  installedError,
  installedPending = false,
  onRefresh,
  profile,
  query,
  skills
}: SkillsTabProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities
  const navigate = useNavigate()
  const sort = useStore($skillsSort)
  const mounted = useRef(true)
  const mutationBusy = useRef(false)
  const [busy, setBusy] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [selectedOfficial, setSelectedOfficial] = useState<string | null>(null)

  // eslint-disable-next-line no-restricted-syntax -- lifecycle guard drops stale async completions; it does not mirror an atom
  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  const { data: officialData } = useQuery({
    queryKey: [...OFFICIAL_SKILLS_KEY, profileScopeKey(profile)],
    queryFn: () => getOfficialSkills(profile),
    staleTime: 60_000,
    retry: false
  })

  // Learned/local skills are editable + archivable from their sheet, mirroring
  // the memory graph (same /api/learning/node endpoints — delete archives,
  // restorable via `hermes curator restore`).
  const [archiveTarget, setArchiveTarget] = useState<null | string>(null)
  const [hubOpen, setHubOpen] = useState(false)

  // Optimistic write-through against the scoped Skills key: toggles/bulk/
  // archive repaint instantly; the next background refetch reconciles.
  const setSkills = useCallback(
    (fn: (cur: SkillInfo[] | undefined) => SkillInfo[] | undefined) =>
      queryClient.setQueryData<SkillInfo[]>(skillsQueryKey(profile), prev => fn(prev) ?? prev),
    [profile]
  )

  const visibleSkills = useMemo(
    () => applySkillSort(filteredSkills(skills, query, sort !== 'least'), sort),
    [query, skills, sort]
  )

  // Installed-name set stays unfiltered so search cannot make a skill look absent.
  const installedSkillNames = useMemo(() => new Set(skills.map(s => s.name)), [skills])

  const visibleOfficial = useMemo(() => {
    const catalog = (officialData?.skills ?? []).filter(
      skill => !skill.installed && !installedSkillNames.has(skill.name)
    )

    return filteredOfficial(catalog, query)
  }, [installedSkillNames, officialData, query])

  const runningInstallKey = useStoreSelector($hubActions, actions =>
    Object.keys(actions)
      .filter(key => actions[key]?.running)
      .sort()
      .join('|')
  )

  const runningInstalls = useMemo(() => new Set(runningInstallKey.split('|').filter(Boolean)), [runningInstallKey])

  // The open sheet follows the live lists: an archived or freshly installed
  // skill closes its sheet.
  const activeSkill = useMemo(() => skills.find(s => s.name === selectedSkill) ?? null, [selectedSkill, skills])

  const activeOfficial = useMemo(
    () => visibleOfficial.find(skill => skill.identifier === selectedOfficial) ?? null,
    [selectedOfficial, visibleOfficial]
  )

  function handleInstallOfficial(skill: OfficialSkillInfo) {
    notify({ kind: 'success', title: t.skills.hub.installStarted(skill.name), message: t.skills.hub.actionLog })
    void installHubSkill(skill.identifier, profile).catch(err => {
      if (mounted.current) {
        notifyHubActionFailed(err, t.skills.hub.actionFailed, skill.name, profile)
      }
    })
  }

  // The backend saves one disabled-list config value: serialize individual and
  // bulk changes together, not merely the members of a bulk action.
  async function applyEnabled(targets: SkillInfo[], enabled: boolean, bulk = false) {
    if (mutationBusy.current || installedPending || installedError || targets.length === 0) {
      return
    }

    mutationBusy.current = true
    setBusy(true)
    let done = 0

    try {
      await queryClient.cancelQueries({ queryKey: skillsQueryKey(profile), exact: true })

      for (const row of targets) {
        if (!mounted.current) {
          break
        }

        const previous =
          queryClient.getQueryData<SkillInfo[]>(skillsQueryKey(profile))?.find(skill => skill.name === row.name) ?? row

        setSkills(current => current?.map(skill => (skill.name === row.name ? { ...skill, enabled } : skill)))

        try {
          await setSkillEnabled(row.name, enabled, profile)
          done += 1
        } catch (err) {
          if (mounted.current) {
            setSkills(current =>
              current?.map(skill =>
                skill.name === row.name && skill.enabled === enabled ? { ...skill, enabled: previous.enabled } : skill
              )
            )
          }

          throw err
        }
      }

      if (bulk && mounted.current) {
        notify({ kind: 'success', title: t.skills.bulkUpdated(done), message: '' })
      }
    } catch (err) {
      if (mounted.current) {
        notifyError(err, t.skills.failedToUpdate(bulk ? t.skills.tabSkills : targets[0].name))
      }
    } finally {
      // A disabled skill loses its `/name` command, so the composer's cached
      // `/` list has to be dropped along with the repaint.
      invalidateSlashCompletions()
      void queryClient.invalidateQueries({ queryKey: skillsQueryKey(profile), exact: true })
      mutationBusy.current = false

      if (mounted.current) {
        setBusy(false)
      }
    }
  }

  const controlsDisabled = busy || installedPending || Boolean(installedError)

  // Bulk actions ("All" master switch, "Disable unused") and the master-switch
  // state target the WHOLE tab, never the search-filtered view — a tab-wide
  // control that silently scoped to the current query would be a lie.
  const bulkSwitch: CapBulkToggle = {
    checked: skills.length > 0 && skills.every(skill => skill.enabled),
    disabled: controlsDisabled || skills.length === 0,
    label: t.skills.all,
    onToggle: checked =>
      void applyEnabled(
        skills.filter(skill => skill.enabled !== checked),
        checked,
        true
      )
  }

  // "Never used" = zero recorded activity. The pruning move for a 100+ skill
  // install: keep the workhorses, shed the noise.
  const unused = skills.filter(skill => skill.enabled && usageOf(skill) === 0)

  // A pending or failed installed list stands in for the grid; the toolbar
  // (and the hub sheet behind it) stays usable.
  const body = installedError ? (
    <PanelEmpty
      action={
        <Button onClick={onRefresh} size="sm">
          {t.skills.refresh}
        </Button>
      }
      description={installedError instanceof Error ? installedError.message : undefined}
      icon="error"
      title={t.skills.skillsLoadFailed}
    />
  ) : installedPending ? (
    <PageLoader className="min-h-80" label={t.skills.loading} />
  ) : visibleSkills.length === 0 && visibleOfficial.length === 0 ? (
    <CapabilityPageEmpty none={c.skills.emptyNone} query={query} />
  ) : (
    <SkillsGrid
      busy={controlsDisabled}
      installing={runningInstalls}
      official={visibleOfficial}
      onInstallOfficial={handleInstallOfficial}
      onOpenOfficial={skill => setSelectedOfficial(skill.identifier)}
      onOpenSkill={skill => setSelectedSkill(skill.name)}
      onToggleSkill={(skill, enabled) => void applyEnabled([skill], enabled)}
      skills={visibleSkills}
    />
  )

  return (
    <>
      <CapToolbarSlot name="start">
        <PopupSelect<SkillSort>
          aria-label={c.sortLabel}
          onChange={next => $skillsSort.set(next)}
          options={SKILL_SORTS.map(id => ({ id, label: c.sort[id] }))}
          value={sort}
        />
        {embedded ? null : (
          <Button onClick={() => navigateToWorkspacePage(navigate, MEMORY_ROUTE)} size="sm" variant="ghost">
            <StudioIcon name="graph" size={14} />
            {c.viewInMemory}
          </Button>
        )}
        <CapBulkMenu
          items={[
            {
              disabled: controlsDisabled || unused.length === 0,
              label: c.disableUnused,
              onSelect: () => void applyEnabled(unused, false, true)
            }
          ]}
          label={c.bulkMenu}
          toggle={{ ...bulkSwitch, label: c.bulkAllSkills }}
        />
      </CapToolbarSlot>
      <CapToolbarSlot name="end">
        <Button onClick={() => setHubOpen(true)} variant="outline">
          <StudioIcon name="globe" size={14} />
          {c.skills.browseHub}
        </Button>
      </CapToolbarSlot>
      {body}
      <SkillSheet
        embedded={embedded}
        onArchive={setArchiveTarget}
        onOpenChange={open => {
          if (!open) {
            setSelectedSkill(null)
          }
        }}
        onSaved={onRefresh}
        profile={profile}
        skill={activeSkill}
      />
      <OfficialSkillSheet
        installing={activeOfficial ? runningInstalls.has(activeOfficial.identifier) : false}
        onInstall={handleInstallOfficial}
        onOpenChange={open => {
          if (!open) {
            setSelectedOfficial(null)
          }
        }}
        profile={profile}
        skill={activeOfficial}
      />
      <HubSheet
        installedPending={installedPending || Boolean(installedError)}
        onOpenChange={setHubOpen}
        open={hubOpen}
        profile={profile}
        renderInstalledAction={skill => (
          <Switch
            aria-label={skill.name}
            checked={skill.enabled}
            disabled={controlsDisabled}
            onCheckedChange={enabled => void applyEnabled([skill], enabled)}
            size="xs"
          />
        )}
        // An installed skill is managed in its own sheet (SKILL.md, Edit,
        // Archive, Use in chat), which opens over the hub.
        renderInstalledDetail={skill => (
          <div className="flex items-center gap-3 border-t border-(--ui-stroke-tertiary) pt-4">
            <span className="min-w-0 flex-1 text-xs text-(--ui-text-tertiary)">
              {c.usedTimes(usageOf(skill))} · {t.skills.changesApplyNewSessions}
            </span>
            <Button
              aria-label={c.skills.detailsAria(skill.name)}
              onClick={() => setSelectedSkill(skill.name)}
              size="sm"
              variant="outline"
            >
              {c.skills.details}
            </Button>
          </div>
        )}
        skills={skills}
      />
      {archiveTarget && (
        <ArchiveSkillConfirmDialog
          onApply={() => {
            const name = archiveTarget

            const snapshot =
              queryClient.getQueryData<SkillInfo[]>(skillsQueryKey(profile))?.find(skill => skill.name === name) ??
              skills.find(skill => skill.name === name)

            void queryClient.cancelQueries({ queryKey: skillsQueryKey(profile), exact: true })
            setSkills(current => current?.filter(skill => skill.name !== name))
            invalidateSlashCompletions()

            if (selectedSkill === name) {
              setSelectedSkill(null)
            }

            // Restore only this row; never clobber intervening toggles or installs.
            return () => {
              if (mounted.current) {
                setSkills(current =>
                  snapshot && current && !current.some(skill => skill.name === name) ? [...current, snapshot] : current
                )
              }

              void queryClient.invalidateQueries({ queryKey: skillsQueryKey(profile), exact: true })
            }
          }}
          onClose={() => setArchiveTarget(null)}
          onFailure={(err, name) => {
            if (mounted.current) {
              notifyError(err, name)
            }
          }}
          onSuccess={() => {
            void queryClient.invalidateQueries({ queryKey: skillsQueryKey(profile), exact: true })

            if (mounted.current) {
              onRefresh()
            }
          }}
          open
          profile={profile}
          skillId={archiveTarget}
          skillName={archiveTarget}
        />
      )}
    </>
  )
}
