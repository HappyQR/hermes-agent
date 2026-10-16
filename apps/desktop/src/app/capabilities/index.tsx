import type * as React from 'react'
import { useCallback, useState } from 'react'

import { PageLoader } from '@/components/page-loader'
import { StudioPage, StudioToolbar, ToolbarSpacer } from '@/components/studio/pages/page'
import { Button } from '@/components/ui/button'
import { SearchField } from '@/components/ui/search-field'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { useI18n } from '@/i18n'
import { queryClient } from '@/lib/query-client'
import { invalidateSlashCompletions } from '@/lib/slash-completion-cache'
import { useStoreSelector } from '@/lib/use-session-slice'
import { cn } from '@/lib/utils'
import { $gateway } from '@/store/gateway'
import { OFFICIAL_SKILLS_KEY } from '@/store/hub-actions'

import { useRefreshHotkey } from '../hooks/use-refresh-hotkey'
import { useRouteEnumParam } from '../hooks/use-route-enum-param'
import { PanelEmpty } from '../overlays/panel'
import type { SetStatusbarItemGroup } from '../shell/statusbar-controls'

import { ConnectorsTab } from './connectors/connectors-tab'
import { PluginsTab } from './plugins/plugins-tab'
import { useCapabilityScope } from './scope-selector'
import { SKILLS_QUERY_KEY, useSkillsQuery } from './skills/skills-data'
import { SkillsTab } from './skills/skills-tab'
import { CapabilityScopePopup } from './studio/scope-popup'
import { CapToolbarSlotsProvider, CapToolbarSlotTarget } from './studio/toolbar-slots'
import { refreshToolCalls } from './toolsets/tool-calls'
import { TOOLSETS_QUERY_KEY, useToolsetsQuery } from './toolsets/toolsets-data'
import { ToolsetsTab } from './toolsets/toolsets-tab'

// Skills Hub browsing lives inside the Skills tab. Legacy `?tab=hub`
// links fall back to 'skills' via useRouteEnumParam.
const CAPABILITY_MODES = ['skills', 'toolsets', 'connectors', 'plugins'] as const

type CapabilityMode = (typeof CAPABILITY_MODES)[number]

interface CapabilitiesViewProps extends React.ComponentProps<'section'> {
  setStatusbarItemGroup?: SetStatusbarItemGroup
  /** Embedded mode (plugin dialogs — e.g. Bot Mode's Advanced section): tab
   *  state lives in local React state instead of the route's `?tab=` param,
   *  so an embedding dialog never fights the page router. */
  embedded?: boolean
  /** Pin the WHOLE view to one profile: the scope selector is hidden and
   *  every tab reads/writes THAT profile. This is the plugin door — Bot Mode
   *  renders the real Capabilities surface pinned to a bot. */
  fixedProfile?: string
  /** Pin the view to a REGISTERED gateway connection alongside `fixedProfile`:
   *  every read/write routes to that machine's backend instead of the active
   *  gateway. `''`/`'local'` mean the local pool. This is Bot Mode's
   *  remote-target door — a bot living on another registered gateway gets the
   *  live surface pointed at ITS backend. Ignored without `fixedProfile`. */
  fixedConnection?: string
}

/** The Capabilities page SHELL (Skills & Tools, prototype pages.js:21-109): the page
 *  head with the tab switch, the toolbar (search, scope, each tab's controls),
 *  the refresh hotkey, and the dispatch to one tab component per tab. Each tab
 *  owns its list, sheets and writes. */
export function CapabilitiesView({
  embedded = false,
  fixedConnection,
  fixedProfile,
  setStatusbarItemGroup: _setStatusbarItemGroup,
  ...props
}: CapabilitiesViewProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities
  // Both hooks run unconditionally (rules of hooks); embedded picks the local
  // one so tab clicks inside a dialog don't rewrite the page URL.
  const routeTab = useRouteEnumParam('tab', CAPABILITY_MODES, 'skills')
  const localTab = useState<CapabilityMode>('skills')
  const [mode, setMode] = embedded ? localTab : routeTab
  const gateway = useStoreSelector($gateway, g => (mode === 'connectors' ? g : null))

  const [query, setQuery] = useState('')

  // A tab switch starts a fresh search (each tab searches something else).
  const selectMode = (next: CapabilityMode) => {
    setMode(next)
    setQuery('')
  }

  const scope = useCapabilityScope({ fixedConnection, fixedProfile })

  // The two installed lists the search placeholders count. They are fetched
  // here, as a pair, so switching tabs paints from cache.
  const { data: skills, isError: skillsFailed, error: skillsError } = useSkillsQuery(scope.profile)
  const { data: toolsets, isError: toolsetsFailed } = useToolsetsQuery(scope.profile)

  const refreshCapabilities = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: TOOLSETS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: OFFICIAL_SKILLS_KEY })
    ])

    invalidateSlashCompletions()

    void refreshToolCalls(scope.profile)
  }, [scope.profile])

  useRefreshHotkey(refreshCapabilities)

  // MCP and Plugins load independently of the installed Skills/Tools lists.
  const gated = mode === 'toolsets' || mode === 'skills'
  const pending = gated && !(skills && toolsets)

  const loadGate = !pending ? null : skillsFailed || toolsetsFailed ? (
    <PanelEmpty
      action={
        <Button onClick={() => void refreshCapabilities()} size="sm">
          {t.skills.refresh}
        </Button>
      }
      description={skillsError instanceof Error ? skillsError.message : undefined}
      icon="error"
      title={t.skills.skillsLoadFailed}
    />
  ) : (
    <PageLoader className="min-h-80" label={t.skills.loading} />
  )

  const tabContent = {
    // The gateway instance backs ONLY the live `reload.mcp` RPC, and it is the
    // ACTIVE gateway's socket — for a scope pinned to a different backend that
    // (config edits still apply on that backend's next session).
    connectors: () => (
      <ConnectorsTab
        gateway={scope.crossBackend ? null : gateway}
        key={`connectors-${scope.key}`}
        profile={scope.profile}
      />
    ),
    // Agent plugins for the scoped profile (the toolbar's scope pop-up governs
    // the Agent column), app-level desktop plugins, and the catalog sheet.
    plugins: () => <PluginsTab key={`plugins-${scope.key}`} profile={scope.profile} scopeLabel={scope.label} />,
    skills: () => (
      <SkillsTab
        embedded={embedded}
        key={`skills-${scope.key}`}
        onRefresh={() => void refreshCapabilities()}
        profile={scope.profile}
        query={query}
        skills={skills ?? []}
      />
    ),
    toolsets: () => (
      <ToolsetsTab key={`toolsets-${scope.key}`} profile={scope.profile} query={query} toolsets={toolsets ?? []} />
    )
  } satisfies Record<CapabilityMode, () => React.ReactNode>

  const tabs = (
    <div className="flex min-w-0" data-tour="page-tabs">
      <SegmentedControl<CapabilityMode>
        aria-label={c.tabsLabel}
        onChange={selectMode}
        options={CAPABILITY_MODES.map(id => ({ dataTour: `tab-${id}`, id, label: c.tabs[id] }))}
        value={mode}
      />
    </div>
  )

  // Skills and Tools search here; Connectors and Plugins bring their own
  // field into the same spot.
  const toolbar = (
    <StudioToolbar>
      {gated ? (
        <SearchField
          aria-label={c.searchLabel}
          containerClassName="w-[16.25rem] max-w-full"
          onChange={setQuery}
          placeholder={mode === 'skills' ? c.searchSkills(skills?.length ?? 0) : c.searchTools}
          value={query}
          variant="filled"
        />
      ) : (
        <CapToolbarSlotTarget name="search" />
      )}
      <CapToolbarSlotTarget name="start" />
      <ToolbarSpacer />
      {fixedProfile ? null : <CapabilityScopePopup scope={scope} />}
      <CapToolbarSlotTarget name="end" />
    </StudioToolbar>
  )

  const body = loadGate ?? tabContent[mode]()

  // Bot Mode embeds the page in a dialog frame: no page head, one scroll.
  if (embedded) {
    return (
      <CapToolbarSlotsProvider>
        <section
          {...props}
          className={cn(
            'flex h-full min-w-0 flex-col overflow-hidden bg-(--ui-chat-surface-background)',
            props.className
          )}
          data-slot="capabilities-embedded"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-3">
            {tabs}
            {toolbar}
            {body}
          </div>
        </section>
      </CapToolbarSlotsProvider>
    )
  }

  return (
    <CapToolbarSlotsProvider>
      <StudioPage {...props} subtitle={c.subtitle} title={c.title} toolbar={toolbar} tools={tabs}>
        {body}
      </StudioPage>
    </CapToolbarSlotsProvider>
  )
}

// Feature-detection flag for plugins (Bot Mode): TRUE means this build's
// CapabilitiesView routes `fixedConnection` to the pinned connection's backend.
// Older builds export CapabilitiesView WITHOUT the prop — passing it there would
// silently read/write the ACTIVE gateway under the remote bot's profile name,
// which is exactly the wrong-machine bug the prop exists to prevent. A static
// property is probe-able without rendering.
CapabilitiesView.supportsFixedConnection = true as const
