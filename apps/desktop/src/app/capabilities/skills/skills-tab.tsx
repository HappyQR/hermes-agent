import { useStore } from '@nanostores/react'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { ArchiveSkillConfirmDialog } from '@/app/learning/archive-skill-confirm-dialog'
import { PopupSelect } from '@/components/studio/pages/controls'
import { Button } from '@/components/ui/button'
import { StudioIcon } from '@/components/ui/studio-icon'
import { getOfficialSkills, type ProfileScope, profileScopeKey, setSkillEnabled } from '@/hermes'
import { useI18n } from '@/i18n'
import { queryClient } from '@/lib/query-client'
import { invalidateSlashCompletions } from '@/lib/slash-completion-cache'
import { useStoreSelector } from '@/lib/use-session-slice'
import { $hubActions, installHubSkill, notifyHubActionFailed, OFFICIAL_SKILLS_KEY } from '@/store/hub-actions'
import { notify, notifyError } from '@/store/notifications'
import type { OfficialSkillInfo, SkillInfo } from '@/types/hermes'

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
  /** Page-level refresh: a saved skill edit reloads the same way the refresh
   *  hotkey does, counts and slash completions included. */
  onRefresh: () => void
}

/** The Skills tab: installed skills, official optional skills, and learned-skill editing. */
export function SkillsTab({ embedded = false, onRefresh, profile, query, skills }: SkillsTabProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities
  const navigate = useNavigate()
  const sort = useStore($skillsSort)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [selectedOfficial, setSelectedOfficial] = useState<string | null>(null)

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
    void installHubSkill(skill.identifier, profile).catch(err =>
      notifyHubActionFailed(err, t.skills.hub.actionFailed, skill.name, profile)
    )
  }

  async function handleToggleSkill(skill: SkillInfo, enabled: boolean) {
    setSkills(current => current?.map(row => (row.name === skill.name ? { ...row, enabled } : row)) ?? current)

    try {
      await setSkillEnabled(skill.name, enabled, profile)
      // A disabled skill loses its `/name` command, so the composer's cached
      // `/` list has to be dropped along with the row repaint.
      invalidateSlashCompletions()
    } catch (err) {
      setSkills(
        current => current?.map(row => (row.name === skill.name ? { ...row, enabled: !enabled } : row)) ?? current
      )
      notifyError(err, t.skills.failedToUpdate(skill.name))
    }
  }

  // Sequential on purpose: each toggle is a config read-modify-write on the
  // backend; parallel calls would race the disabled-list save.
  async function bulkApply(targets: SkillInfo[], enabled: boolean) {
    if (bulkBusy || targets.length === 0) {
      return
    }

    setBulkBusy(true)

    let done = 0

    try {
      for (const row of targets) {
        await setSkillEnabled(row.name, enabled, profile)
        setSkills(cur => cur?.map(r => (r.name === row.name ? { ...r, enabled } : r)) ?? cur)
        done += 1
      }

      notify({ kind: 'success', title: t.skills.bulkUpdated(done), message: '' })
    } catch (err) {
      notifyError(err, t.skills.failedToUpdate(t.skills.tabSkills))
    } finally {
      invalidateSlashCompletions()
      setBulkBusy(false)
    }
  }

  // Bulk actions ("All" master switch, "Disable unused") and the master-switch
  // state target the WHOLE tab, never the search-filtered view — a tab-wide
  // control that silently scoped to the current query would be a lie.
  const allEnabled = skills.length > 0 && skills.every(s => s.enabled)

  // One switch line covering enable-all/disable-all.
  const bulkSwitch: CapBulkToggle = {
    checked: allEnabled,
    disabled: bulkBusy,
    label: t.skills.all,
    onToggle: checked =>
      void bulkApply(
        skills.filter(row => row.enabled !== checked),
        checked
      )
  }

  // "Never used" = zero recorded activity. The pruning move for a 100+ skill
  // install: keep the workhorses, shed the noise.
  const disableUnused = () =>
    bulkApply(
      skills.filter(skill => skill.enabled && usageOf(skill) === 0),
      false
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
          items={[{ disabled: bulkBusy, label: c.disableUnused, onSelect: () => void disableUnused() }]}
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
      {visibleSkills.length === 0 && visibleOfficial.length === 0 ? (
        <CapabilityPageEmpty none={c.skills.emptyNone} query={query} />
      ) : (
        <SkillsGrid
          busy={bulkBusy}
          installing={runningInstalls}
          official={visibleOfficial}
          onInstallOfficial={handleInstallOfficial}
          onOpenOfficial={skill => setSelectedOfficial(skill.identifier)}
          onOpenSkill={skill => setSelectedSkill(skill.name)}
          onToggleSkill={(skill, enabled) => void handleToggleSkill(skill, enabled)}
          skills={visibleSkills}
        />
      )}
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
      <HubSheet installedNames={installedSkillNames} onOpenChange={setHubOpen} open={hubOpen} profile={profile} />
      {archiveTarget && (
        <ArchiveSkillConfirmDialog
          onApply={() => {
            const name = archiveTarget
            const snapshot = skills

            setSkills(current => current?.filter(skill => skill.name !== name) ?? current)
            invalidateSlashCompletions()

            if (selectedSkill === name) {
              setSelectedSkill(null)
            }

            return () => setSkills(() => snapshot)
          }}
          onClose={() => setArchiveTarget(null)}
          onFailure={(err, name) => notifyError(err, name)}
          open
          profile={profile}
          skillId={archiveTarget}
          skillName={archiveTarget}
        />
      )}
    </>
  )
}
