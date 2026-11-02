import { useStore } from '@nanostores/react'
import { Fragment, useCallback, useMemo, useState } from 'react'

import { PopupSelect } from '@/components/studio/pages/controls'
import { SectionTitle } from '@/components/studio/pages/surfaces'
import { type ProfileScope, setToolsetEnabled } from '@/hermes'
import { useI18n } from '@/i18n'
import { isDesktopToolsetVisible } from '@/lib/desktop-toolsets'
import { Codecs, persistentAtom } from '@/lib/persisted'
import { queryClient } from '@/lib/query-client'
import { invalidateSlashCompletions } from '@/lib/slash-completion-cache'
import { notify, notifyError } from '@/store/notifications'
import type { ToolsetInfo } from '@/types/hermes'

import { toolsetDisplayLabel } from '../../settings/helpers'
import { CapBulkMenu, type CapBulkToggle } from '../studio/bulk-menu'
import { CapabilityPageEmpty } from '../studio/empty'
import { ToolSheet } from '../studio/tool-sheet'
import { CapToolbarSlot } from '../studio/toolbar-slots'
import { ToolsList } from '../studio/tools-list'

import { useToolCalls } from './tool-calls'
import {
  filteredToolsets,
  TOOLSET_ESSENTIALS,
  TOOLSET_FEATURE_COUNT,
  TOOLSET_FEATURE_MIN,
  TOOLSET_MORE_THEME,
  TOOLSET_THEMES,
  toolsetCalls,
  TOOLSETS_QUERY_KEY,
  toolsetsQueryKey,
  toolsetTheme
} from './toolsets-data'

// Sort direction for the Tools list — persisted so the tab remembers
// most/least-used across navigations and restarts.
const $toolsetsSortDesc = persistentAtom('hermes.desktop.capabilities.toolsetsSortDesc', true, Codecs.bool)

interface ToolsetsTabProps {
  /** The scope's toolset list, straight from the shell's query. */
  toolsets: ToolsetInfo[]
  /** The (connection, profile) scope every read and write routes to. */
  profile: ProfileScope
  query: string
}

interface ToolSection {
  id: string
  label: string
  blurb: string
  toolsets: ToolsetInfo[]
}

/** THE Tools tab: the toolsets grouped by what they let Hermes do (a feature
 *  group first on a long list), and the tool sheet that mounts each toolset's
 *  settings panels. */
export function ToolsetsTab({ profile, query, toolsets }: ToolsetsTabProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities
  const ts = t.catalog.toolsets
  const toolsetsSortDesc = useStore($toolsetsSortDesc)
  const toolCalls = useToolCalls(profile)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [selectedToolset, setSelectedToolset] = useState<string | null>(null)

  // Optimistic write-through against the scoped Tools key: toggles repaint
  // instantly; the next background refetch reconciles.
  const setToolsets = useCallback(
    (fn: (cur: ToolsetInfo[] | undefined) => ToolsetInfo[] | undefined) =>
      queryClient.setQueryData<ToolsetInfo[]>(toolsetsQueryKey(profile), prev => fn(prev) ?? prev),
    [profile]
  )

  const refreshToolsets = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: TOOLSETS_QUERY_KEY })
  }, [])

  // Absent counts sort the list A–Z until the analytics scan lands.
  const visibleToolsets = useMemo(
    () => filteredToolsets(toolsets, query, toolCalls ?? {}, toolsetsSortDesc),
    [query, toolCalls, toolsets, toolsetsSortDesc]
  )

  // The feature group is the four most-used toolsets once there is real usage
  // to rank by; before that it's the essentials. It shows only while browsing
  // a long, unsearched list. Everything else sits under what it does, in the
  // chosen order.
  const sections = useMemo((): ToolSection[] => {
    const byUse = filteredToolsets(toolsets, '', toolCalls ?? {}, true)
    const used = byUse.slice(0, TOOLSET_FEATURE_COUNT)

    const ranked =
      !!toolCalls &&
      used.length === TOOLSET_FEATURE_COUNT &&
      used.every(toolset => toolsetCalls(toolset, toolCalls) > 0)

    const featured =
      query.trim() || visibleToolsets.length <= TOOLSET_FEATURE_MIN
        ? []
        : ranked
          ? used
          : byUse.filter(toolset => TOOLSET_ESSENTIALS.includes(toolset.name))

    const rest = visibleToolsets.filter(toolset => !featured.includes(toolset))

    return [
      {
        id: 'featured',
        label: ranked ? ts.mostUsed : ts.essentials,
        blurb: ranked ? ts.mostUsedBlurb : ts.essentialsBlurb,
        toolsets: featured
      },
      ...[...TOOLSET_THEMES, TOOLSET_MORE_THEME].map(theme => ({
        id: theme.id,
        label: ts.themes[theme.id].label,
        blurb: ts.themes[theme.id].blurb,
        toolsets: rest.filter(toolset => toolsetTheme(toolset.name).id === theme.id)
      }))
    ].filter(section => section.toolsets.length > 0)
  }, [query, toolCalls, toolsets, ts, visibleToolsets])

  // Bulk actions and the master-switch state target the WHOLE tab, never the
  // search-filtered view — a tab-wide control that silently scoped to the
  // current query would be a lie.
  const bulkToolsets = useMemo(() => toolsets.filter(ts => isDesktopToolsetVisible(ts.name)), [toolsets])

  // The open sheet follows the live list (a profile switch drops it).
  const activeToolset = useMemo(
    () => toolsets.find(ts => ts.name === selectedToolset) ?? null,
    [selectedToolset, toolsets]
  )

  // Single toggles are optimistic and silent on success (the row repaints
  // immediately — a toast per flip would spam rapid customization). Errors
  // revert and notify.
  async function handleToggleToolset(toolset: ToolsetInfo, enabled: boolean) {
    setToolsets(
      current =>
        current?.map(row => (row.name === toolset.name ? { ...row, enabled, available: enabled } : row)) ?? current
    )

    try {
      await setToolsetEnabled(toolset.name, enabled, profile)
    } catch (err) {
      setToolsets(
        current =>
          current?.map(row => (row.name === toolset.name ? { ...row, enabled: !enabled, available: !enabled } : row)) ??
          current
      )
      notifyError(err, t.skills.failedToUpdate(toolsetDisplayLabel(toolset)))
    }
  }

  // Sequential on purpose: each toggle is a config read-modify-write on the
  // backend; parallel calls would race the disabled-list save.
  async function bulkApply(targets: ToolsetInfo[], enabled: boolean) {
    if (bulkBusy || targets.length === 0) {
      return
    }

    setBulkBusy(true)

    let done = 0

    try {
      for (const row of targets) {
        await setToolsetEnabled(row.name, enabled, profile)
        setToolsets(cur => cur?.map(r => (r.name === row.name ? { ...r, enabled, available: enabled } : r)) ?? cur)
        done += 1
      }

      notify({ kind: 'success', title: t.skills.bulkUpdated(done), message: '' })
    } catch (err) {
      notifyError(err, t.skills.failedToUpdate(t.skills.tabToolsets))
    } finally {
      invalidateSlashCompletions()
      setBulkBusy(false)
    }
  }

  // One switch line covering enable-all/disable-all.
  const bulkSwitch: CapBulkToggle = {
    checked: bulkToolsets.length > 0 && bulkToolsets.every(ts => ts.enabled),
    disabled: bulkBusy,
    label: t.skills.all,
    onToggle: checked =>
      void bulkApply(
        bulkToolsets.filter(row => row.enabled !== checked),
        checked
      )
  }

  const sortOptions = [
    { id: 'most' as const, label: c.sort.most },
    { id: 'least' as const, label: c.sort.least }
  ]

  return (
    <>
      <CapToolbarSlot name="start">
        <PopupSelect<'least' | 'most'>
          aria-label={c.sortLabel}
          onChange={next => $toolsetsSortDesc.set(next === 'most')}
          options={sortOptions}
          value={toolsetsSortDesc ? 'most' : 'least'}
        />
        <CapBulkMenu label={c.bulkMenu} toggle={{ ...bulkSwitch, label: c.bulkAllTools }} />
      </CapToolbarSlot>
      {visibleToolsets.length === 0 ? (
        <CapabilityPageEmpty none={c.tools.emptyNone} query={query} />
      ) : (
        <>
          {sections.map(section => (
            <Fragment key={section.id}>
              <div className="-mb-1 mt-1.5 flex flex-col gap-0.5" data-toolset-section={section.id}>
                <SectionTitle className="m-0" count={section.toolsets.length}>
                  {section.label}
                </SectionTitle>
                <p className="m-0 text-xs text-(--ui-text-tertiary)">{section.blurb}</p>
              </div>
              <ToolsList
                busy={bulkBusy}
                onOpen={toolset => setSelectedToolset(toolset.name)}
                onToggle={(toolset, enabled) => void handleToggleToolset(toolset, enabled)}
                toolCalls={toolCalls}
                toolsets={section.toolsets}
              />
            </Fragment>
          ))}
          <p className="m-0 text-xs text-(--ui-text-tertiary)">{c.tools.footnote}</p>
        </>
      )}
      <ToolSheet
        onConfiguredChange={refreshToolsets}
        onOpenChange={open => {
          if (!open) {
            setSelectedToolset(null)
          }
        }}
        profile={profile}
        toolCalls={toolCalls ?? {}}
        toolset={activeToolset}
      />
    </>
  )
}
