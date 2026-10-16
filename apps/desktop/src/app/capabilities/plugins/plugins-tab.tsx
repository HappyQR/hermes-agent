import { useStore } from '@nanostores/react'
import { memo, type ReactNode, useEffect, useMemo, useState } from 'react'

import { getToolsets, setToolsetEnabled } from '@/api/toolsets'
import { useGatewayRequest } from '@/app/gateway/hooks/use-gateway-request'
import { pickRevealLabel } from '@/app/right-sidebar/file-actions'
import { StudioToolbar, ToolbarSpacer } from '@/components/studio/pages/page'
import { ListGroup } from '@/components/studio/pages/surfaces'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SearchField } from '@/components/ui/search-field'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Switch } from '@/components/ui/switch'
import { Tip } from '@/components/ui/tooltip'
import { $pluginRecords, enablePackageDesktopHalf, type PluginRecord, setPluginEnabled } from '@/contrib/plugins-store'
import { useContributions } from '@/contrib/react/use-contributions'
import { discoverRuntimePlugins, uninstallDiskPlugin } from '@/contrib/runtime-loader'
import { pluginSettingsRouteHref, SETTINGS_PLUGINS_AREA } from '@/contrib/settings-pages'
import type { ProfileScope } from '@/hermes'
import { useI18n } from '@/i18n'
import { DESKTOP_PLUGIN_TOOLSETS } from '@/lib/desktop-toolsets'
import { triggerHaptic } from '@/lib/haptics'
import { Loader2 } from '@/lib/icons'
import { queryClient } from '@/lib/query-client'
import { cn } from '@/lib/utils'
import {
  $agentPluginBusy,
  $agentPlugins,
  $agentPluginsError,
  $agentPluginsStatus,
  type AgentPluginRow,
  type AgentPluginServerState,
  type AgentPluginUpdateOutcome,
  type GatewayRequest,
  isDesktopRelevantPlugin,
  loadAgentPlugins,
  removeAgentPlugin,
  toggleAgentPlugin,
  updateAgentPlugin
} from '@/store/agent-plugins'
import { confirm } from '@/store/confirm'
import { notify, notifyError } from '@/store/notifications'
import { openPluginInstallRequest } from '@/store/plugin-install-request'
import { $connection } from '@/store/session'

import { PanelEmpty } from '../../overlays/panel'
import { Pill } from '../../settings/primitives'
import { useDeepLinkHighlight } from '../../settings/use-deep-link-highlight'
import { PluginCatalogSheet } from '../studio/plugin-catalog-sheet'
import { CapToolbarSlot, useInCapabilitiesToolbar } from '../studio/toolbar-slots'
import { TOOLSETS_QUERY_KEY } from '../toolsets/toolsets-data'

import { mergePluginPackages, type PackageKind, type PluginPackage } from './plugin-packages'

// Plugins (prototype pages.js:93-107): one table row per package with its
// Desktop half (this app) and Agent half (the page's profile). Discovery lives
// in the toolbar: the catalog sheet and Install from Git.

/** Deep-link anchor for a package row (`/capabilities?tab=plugins&plugin=<key>`).
 *  Accepts the agent key, the agent name, or the desktop record id. */
export const pluginElementId = (target: string) => `plugin-${target}`

/** Derive the bare profile name a `plugins.manage` call should target. */
function profileParam(scope: ProfileScope): null | string {
  if (!scope) {
    return null
  }

  return typeof scope === 'string' ? scope : (scope.profile ?? null)
}

function reveal(file: string) {
  void window.hermesDesktop?.revealPath?.(file)?.catch(() => undefined)
}

async function revealPluginsDir() {
  try {
    // Electron owns the app-level plugin root — deriving it from the backend's
    // hermes_home breaks against a remote backend (#66899).
    const dir = await window.hermesDesktop?.desktopPluginsRoot?.()

    if (!dir) {
      notifyError('Desktop plugins are unavailable', 'Could not resolve the plugins folder')

      return
    }

    const result = await window.hermesDesktop?.openDir?.(dir)

    if (result && !result.ok) {
      notifyError(result.error ?? 'unknown error', 'Could not open the plugins folder')
    }
  } catch (err) {
    notifyError(err, 'Could not resolve the plugins folder')
  }
}

/** Copy any changed unified desktop halves into the app root FIRST, then
 *  rescan the root — a concurrent scan would read the pre-copy state. */
async function rescanAll(requestGateway: GatewayRequest, scope: null | string) {
  await window.hermesDesktop?.reconcileDesktopPlugins?.().catch(() => undefined)
  await discoverRuntimePlugins()
  await loadAgentPlugins(requestGateway, scope)
}

/** Open the dual-target install modal pre-filled to install ONLY the agent
 *  half of a unified package into the scoped profile (the desktop half is
 *  already here). Provenance comes from the package marker Electron stamped
 *  when it copied the half out (catalog sidecar or git remote). */
function installAgentHalfHere(record: PluginRecord, profile: null | string) {
  const origin = record.packageOrigin

  if (!origin?.repo) {
    return
  }

  openPluginInstallRequest({
    catalogName: origin.catalogName,
    legacyHint: 'agent',
    profile,
    repo: origin.repo,
    sha: origin.sha
  })
}

const SERVER_TONE = {
  connected: 'success',
  app_not_running: 'warn',
  hermes_not_connected: 'warn',
  endpoint_unavailable: 'warn',
  no_interactive_session: 'warn',
  unknown: 'warn',
  version_too_old: 'destructive',
  missing_app: 'destructive',
  unsupported_gpu: 'destructive'
} as const satisfies Record<AgentPluginServerState, 'destructive' | 'success' | 'warn'>

function KindBadge({ kind }: { kind: PackageKind }) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities.plugins

  return <Pill>{kind === 'both' ? c.kindBoth : kind === 'agent' ? c.columnAgent : c.columnDesktop}</Pill>
}

/** Where an agent half was installed from, in words. */
function agentSourceLabel(source: string, labels: { bundled: string; local: string }): string {
  if (source === 'bundled') {
    return labels.bundled
  }

  if (source === 'user') {
    return labels.local
  }

  return source === 'git' ? 'Git' : source
}

/** Provenance pill: where the package came from. */
function ProvenancePill({ pkg }: { pkg: PluginPackage }) {
  const { t } = useI18n()
  const p = t.skills.plugins

  if (pkg.agent?.catalog_name) {
    return (
      <Tip label={p.catalogProvenance(pkg.agent.installed_sha?.slice(0, 8) ?? '')}>
        <span>
          <Pill>{pkg.agent.catalog_tier === 'official' ? p.tierOfficial : p.tierCommunity}</Pill>
        </span>
      </Tip>
    )
  }

  if (pkg.agent?.pinned_sha) {
    return (
      <Tip label={p.pinnedProvenance(pkg.agent.pinned_sha.slice(0, 8))}>
        <span>
          <Pill>
            <span className="font-mono">{p.pinnedBadge(pkg.agent.pinned_sha.slice(0, 8))}</span>
          </Pill>
        </span>
      </Tip>
    )
  }

  if (pkg.agent) {
    return <Pill>{agentSourceLabel(pkg.agent.source, t.studio.pages.capabilities.skills.source)}</Pill>
  }

  if (pkg.desktop) {
    return <Pill>{t.settings.plugins.kinds[pkg.desktop.kind]}</Pill>
  }

  return null
}

/** Column widths shared by the header and every row so the two control
 *  columns line up down the page like a table. */
const HALF_COL = 'flex w-32 shrink-0 items-center justify-center gap-1.5'
const ACTIONS_COL = 'flex w-[3.75rem] shrink-0 items-center justify-end gap-0.5'

/** One control cell; `label` is the accessible name for screen readers only
 *  (the visible column label lives once, in the header). */
function HalfCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div aria-label={label} className={HALF_COL} role="cell">
      {children}
    </div>
  )
}

function Dash() {
  return (
    <span aria-hidden className="w-9 text-center text-(--ui-text-quaternary)">
      —
    </span>
  )
}

interface PackageRowMenuProps {
  busy: boolean
  name: string
  onRescan: () => void
  onReveal?: () => void
  onUninstall: (() => void) | null
}

/** The row's ⋯ menu: reveal the folder, check for updates (a rescan), uninstall. */
function PackageRowMenu({ busy, name, onRescan, onReveal, onUninstall }: PackageRowMenuProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities.plugins
  const m = t.fileMenu

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={`${t.studio.pages.common.moreActions}: ${name}`} size="icon-xs" variant="ghost">
          <StudioIcon name="more" size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {onReveal ? (
          <DropdownMenuItem onSelect={onReveal}>
            <StudioIcon name="reveal" size={14} />
            {pickRevealLabel(m.revealFinder, m.revealExplorer, m.revealFileManager)}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onSelect={onRescan}>
          <StudioIcon name="update" size={14} />
          {c.checkUpdates}
        </DropdownMenuItem>
        {onUninstall ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={busy} onSelect={onUninstall} variant="destructive">
              <StudioIcon name="trash" size={14} />
              {c.uninstallEllipsis}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PackageRow({
  pkg,
  scope,
  profile,
  scopeLabel,
  busy,
  onAgentToggle,
  onAgentUpdate,
  onAgentRemove,
  onDesktopRemove,
  onRescan
}: {
  pkg: PluginPackage
  scope: null | string
  profile: ProfileScope
  scopeLabel: string
  busy: boolean
  onAgentToggle: (row: AgentPluginRow, enable: boolean) => void
  onAgentUpdate: (row: AgentPluginRow) => void
  onAgentRemove: (row: AgentPluginRow) => void
  onDesktopRemove: (record: PluginRecord) => void
  onRescan: () => void
}) {
  const { t } = useI18n()
  const p = t.skills.plugins
  const d = t.settings.plugins
  const desktop = pkg.desktop
  const agent = pkg.agent
  // Settings live in Settings ▸ Plugins: a manifest `config_schema` gets an
  // automatic page there, a desktop half may register its own. The gear is
  // the shortcut to that page (#46600, #87934).
  const settingsPages = useContributions(SETTINGS_PLUGINS_AREA)
  const desktopSettings = Boolean(desktop && settingsPages.some(page => page.source === `plugin:${desktop.id}`))
  const agentSettings = Boolean(agent?.key) && Boolean(agent?.settings_schema?.length)
  const hasSettings = desktopSettings || agentSettings

  const openSettings = () => {
    // A desktop page absorbs the package's schema form as a sub-page, so its
    // plugin id is the one entry that covers both halves. The link carries
    // the profile THIS page has selected: Settings keeps its own scope, and
    // without the hand-off the page would open (and save) that one instead.
    const route = desktopSettings ? { plugin: desktop!.id } : { agent: agent!.key! }

    window.location.hash = `#${pluginSettingsRouteHref(route, scope)}`
  }

  const [desktopBusy, setDesktopBusy] = useState(false)
  const desktopOn = desktop ? desktop.status !== 'disabled' : false
  const agentOn = agent?.status === 'enabled'
  const agentToggleable = Boolean(agent?.key)
  // Only what lives under the profile's plugins dir ("user", or "git" when it
  // was cloned there) can be uninstalled here: bundled plugins are refused by
  // the backend and entrypoint (pip-installed) ones go with their package.
  const agentRemovable = agent?.source === 'user' || agent?.source === 'git'
  const unavailableServers = agent?.servers?.filter(server => server.state !== 'connected') ?? []
  // A STANDALONE desktop plugin (a folder in <HERMES_HOME>/desktop-plugins with
  // no agent package behind it) is deleted by Electron. A unified package's
  // desktop half is not offered here: uninstalling the agent half prunes it.
  const desktopRemovable = desktop?.kind === 'disk' && !desktop.packageName && !agent
  // Electron's desktop-half reconcile only walks THIS machine's homes, so a
  // package installed on a remote backend can never materialize here (#114079).
  const remoteBackend = useStore($connection)?.mode === 'remote'

  // #96969: when the feature's agent-side tools live in a toolset (the
  // built-in Kanban board has no agent-plugin half), the Desktop switch flips
  // that per-profile opt-in with the panel, through the same
  // PUT /api/tools/toolsets/{name} the Toolsets tab uses. The backend write
  // goes first and the panel follows what the backend actually holds, so a
  // failed write can't leave the two halves disagreeing. A rejected PUT may
  // still have committed (a timeout leaves it unknown), so re-read instead of
  // assuming a rollback; if even that fails the panel stays put and the
  // switch is live again for a retry.
  const toggleDesktop = async (id: string, on: boolean) => {
    const toolset = DESKTOP_PLUGIN_TOOLSETS[id]

    if (!toolset) {
      return setPluginEnabled(id, on)
    }

    setDesktopBusy(true)

    try {
      let toolsetOn: boolean | undefined

      try {
        await setToolsetEnabled(toolset, on, profile)
        toolsetOn = on
      } catch (err) {
        toolsetOn = await getToolsets(profile).then(
          list => list.find(row => row.name === toolset)?.enabled,
          () => undefined
        )

        if (toolsetOn !== on) {
          notifyError(err, p.toolsetToggleFailed(pkg.name))
        }
      }

      void queryClient.invalidateQueries({ queryKey: TOOLSETS_QUERY_KEY })

      if (toolsetOn === on) {
        await setPluginEnabled(id, on)
        notify({
          kind: 'success',
          message: on ? p.toolsetOn(pkg.name, scopeLabel) : p.toolsetOff(pkg.name, scopeLabel)
        })
      }
    } finally {
      setDesktopBusy(false)
    }
  }

  // Uninstall: only what lives under the profile's plugins dir, or a
  // standalone desktop folder (see agentRemovable / desktopRemovable).
  const uninstall =
    agent && agentRemovable
      ? () => onAgentRemove(agent)
      : desktop && desktopRemovable
        ? () => onDesktopRemove(desktop)
        : null

  const failedDesktop = desktop?.status === 'error'
  const detail = failedDesktop ? desktop.error : pkg.description

  return (
    <div
      className="flex min-h-11 items-center gap-3 px-3.5 py-2 text-[0.8125rem]"
      data-slot="studio-list-row"
      data-testid={`plugin-row-${pkg.key}`}
      id={pluginElementId(agent?.key ?? agent?.name ?? desktop?.id ?? pkg.key)}
      role="row"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5" role="cell">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <b className="font-medium text-(--ui-text-primary)">{pkg.name}</b>
          <ProvenancePill pkg={pkg} />
          {agent?.version && (
            <span className="font-mono text-[0.71875rem] text-(--ui-text-tertiary)">v{agent.version}</span>
          )}
          <KindBadge kind={pkg.kind} />
          {agent?.portable && <Pill>{p.portableBadge}</Pill>}
          {agent?.servers?.map(server => (
            <Pill data-testid={`server-pill-${server.name}`} key={server.name} tone={SERVER_TONE[server.state]}>
              {server.name}: {p.serverStates[server.state]}
            </Pill>
          ))}
          {failedDesktop && <Pill tone="primary">{d.failed}</Pill>}
        </div>
        {detail ? (
          <span
            className={cn(
              'text-xs leading-[1.4] break-words',
              failedDesktop ? 'text-(--ui-red)' : 'pg-clamp-2 text-(--ui-text-tertiary)'
            )}
          >
            {detail}
          </span>
        ) : null}
        {unavailableServers.map(server =>
          server.sentence ? (
            <span className="text-xs leading-[1.4] break-words text-(--ui-text-secondary)" key={server.name}>
              {server.sentence}
            </span>
          ) : null
        )}
      </div>

      {/* The two halves. Desktop is app-level and reads the same whichever
          profile is selected; Agent follows the selector. A half the package
          lacks shows a dash; a half it has but which is missing on this side
          shows the install affordance. */}
      <HalfCell label={p.halfDesktop}>
        {desktop ? (
          <Switch
            aria-label={`${p.halfDesktop}: ${pkg.name}`}
            checked={desktopOn}
            disabled={desktopBusy}
            onCheckedChange={on => {
              triggerHaptic('selection')
              void toggleDesktop(desktop.id, on)
            }}
            size="xs"
          />
        ) : pkg.desktopMissing ? (
          <Tip label={remoteBackend ? p.desktopHalfRemoteTip : p.desktopHalfPendingTip}>
            <span className="text-[0.65rem] text-(--ui-text-tertiary)">
              {remoteBackend ? p.desktopHalfRemote : p.desktopHalfPending}
            </span>
          </Tip>
        ) : (
          <Dash />
        )}
      </HalfCell>

      <HalfCell label={p.halfAgentIn(scopeLabel)}>
        {agent ? (
          <>
            {agent.update_available && (
              <Button
                className="h-5 px-1.5 text-[0.65rem]"
                disabled={busy}
                onClick={() => onAgentUpdate(agent)}
                size="xs"
                variant="outline"
              >
                {p.updateToPin(agent.catalog_version ?? agent.catalog_sha?.slice(0, 8) ?? '')}
              </Button>
            )}
            {busy && <Loader2 className="size-3.5 animate-spin text-(--ui-text-tertiary)" />}
            {agentToggleable ? (
              <Switch
                aria-label={`${p.halfAgent}: ${pkg.name}`}
                checked={agentOn}
                disabled={busy}
                onCheckedChange={on => onAgentToggle(agent, on)}
                size="xs"
              />
            ) : (
              <Tip label={p.legacyBackend}>
                <span>
                  <Switch aria-label={`${p.halfAgent}: ${pkg.name}`} checked={agentOn} disabled size="xs" />
                </span>
              </Tip>
            )}
          </>
        ) : pkg.agentMissingInProfile && desktop ? (
          <Tip label={desktop.packageOrigin?.repo ? p.installAgentHereTip(scopeLabel) : p.installAgentHereNoOrigin}>
            <span>
              <Button
                className="h-5 px-1.5 text-[0.65rem]"
                disabled={!desktop.packageOrigin?.repo}
                onClick={() => installAgentHalfHere(desktop, scope)}
                size="xs"
                variant="outline"
              >
                {p.installAgentHere}
              </Button>
            </span>
          </Tip>
        ) : (
          <Dash />
        )}
      </HalfCell>

      <div className={ACTIONS_COL} role="cell">
        {/* Settings live in Settings ▸ Plugins; the gear is the shortcut. */}
        {hasSettings ? (
          <Tip label={p.settingsToggle(pkg.name)}>
            <Button aria-label={p.settingsToggle(pkg.name)} onClick={openSettings} size="icon-xs" variant="ghost">
              <StudioIcon name="gear" size={14} />
            </Button>
          </Tip>
        ) : null}
        <PackageRowMenu
          busy={busy}
          name={pkg.name}
          onRescan={onRescan}
          onReveal={desktop?.file ? () => reveal(desktop.file!) : undefined}
          onUninstall={uninstall}
        />
      </div>
    </div>
  )
}

/** THE plugins surface: one row per package. Each row shows its Desktop half
 *  (this app — the same for every profile, gateway, or machine) and its Agent
 *  half (the selected profile's backend). Discovery sits underneath: the live
 *  catalog picker plus Install from Git for anything not in the catalog. */
export const PluginsTab = memo(function PluginsTab({
  profile,
  scopeSelector,
  scopeLabel
}: {
  profile: ProfileScope
  /** The Capabilities profile selector; rendered in the Agent column header so
   *  it visibly governs only that column. */
  scopeSelector?: ReactNode
  /** Display name of the selected profile for the Agent column label. */
  scopeLabel?: string
}) {
  const { t } = useI18n()
  const p = t.skills.plugins
  const d = t.settings.plugins
  const c = t.studio.pages.capabilities
  const { requestGateway } = useGatewayRequest()

  const desktopRecords = useStore($pluginRecords)
  const agentRows = useStore($agentPlugins)
  const status = useStore($agentPluginsStatus)
  const error = useStore($agentPluginsError)
  const busyKey = useStore($agentPluginBusy)

  const scope = profileParam(profile)
  const label = scopeLabel ?? scope ?? t.skills.plugins.defaultProfile

  useEffect(() => {
    void loadAgentPlugins(requestGateway, scope)
  }, [requestGateway, scope])

  const packages = useMemo(
    () => mergePluginPackages(Object.values(desktopRecords), agentRows.filter(isDesktopRelevantPlugin)),
    [agentRows, desktopRecords]
  )

  useDeepLinkHighlight({ param: 'plugin', ready: () => true, elementId: pluginElementId })

  const [query, setQuery] = useState('')
  const [catalogOpen, setCatalogOpen] = useState(false)
  const inPage = useInCapabilitiesToolbar()

  const shownPackages = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return needle
      ? packages.filter(
          pkg => pkg.name.toLowerCase().includes(needle) || (pkg.description ?? '').toLowerCase().includes(needle)
        )
      : packages
  }, [packages, query])

  const rescan = () => {
    triggerHaptic('selection')
    void rescanAll(requestGateway, scope)
  }

  const agentBusy = (row: AgentPluginRow) => busyKey === (row.key ?? row.name) || busyKey === row.name

  // Search, the catalog and Install from Git live in the page toolbar; used
  // standalone they form this tab's own toolbar row.
  const controls = (
    <>
      <CapToolbarSlot name="search">
        <SearchField
          aria-label={c.searchPlugins}
          containerClassName="w-[16.25rem] max-w-full"
          onChange={setQuery}
          placeholder={c.searchPlugins}
          value={query}
          variant="filled"
        />
      </CapToolbarSlot>
      <CapToolbarSlot name="start">
        <Button onClick={() => setCatalogOpen(true)} size="sm" variant="ghost">
          <StudioIcon name="puzzle" size={14} />
          {c.plugins.browseCatalog}
        </Button>
      </CapToolbarSlot>
      {inPage ? null : <ToolbarSpacer />}
      <CapToolbarSlot name="end">
        <Button onClick={() => openPluginInstallRequest({ profile: scope, repo: '' })} type="button" variant="outline">
          <StudioIcon name="download" size={14} />
          {d.installModal.installFromGit}
        </Button>
      </CapToolbarSlot>
    </>
  )

  const filtered = query.trim()

  return (
    <div className="flex min-w-0 flex-col gap-3" data-slot="capabilities-plugins">
      {inPage ? controls : <StudioToolbar>{controls}</StudioToolbar>}

      {status === 'error' ? (
        <PanelEmpty
          action={
            <Button onClick={() => void loadAgentPlugins(requestGateway, scope)} size="sm">
              {t.skills.refresh}
            </Button>
          }
          description={error ?? undefined}
          icon="error"
          title={p.loadFailed}
        />
      ) : packages.length === 0 && status === 'ready' ? (
        <p className="m-0 px-1 text-xs text-(--ui-text-tertiary)">
          {p.emptyAll} {p.emptyHint}
        </p>
      ) : shownPackages.length === 0 && filtered ? (
        <p className="m-0 px-1 text-xs text-(--ui-text-tertiary)">{c.plugins.noMatch(filtered)}</p>
      ) : (
        <ListGroup role="table">
          {/* Column header: the visible labels for the two control columns,
              aligned with the cells below. */}
          <div
            className="flex min-h-8 items-center gap-3 px-3.5 text-[0.71875rem] font-semibold text-(--ui-text-tertiary)"
            data-slot="studio-list-row"
            role="row"
          >
            <div className="min-w-0 flex-1" role="columnheader">
              {c.plugins.columnPlugin}
            </div>
            <div className={HALF_COL} role="columnheader">
              <Tip label={p.halfDesktopHint}>
                <span>{c.plugins.columnDesktop}</span>
              </Tip>
            </div>
            <div className={HALF_COL} role="columnheader">
              {scopeSelector ?? (
                <Tip label={p.halfAgentIn(label)}>
                  <span className="truncate">{c.plugins.columnAgent}</span>
                </Tip>
              )}
            </div>
            <div className={ACTIONS_COL} role="columnheader" />
          </div>
          {shownPackages.map(pkg => (
            <PackageRow
              busy={pkg.agent ? agentBusy(pkg.agent) : false}
              key={pkg.key}
              onAgentRemove={row => {
                void confirm({
                  confirmLabel: p.uninstall,
                  description: p.uninstallConfirmBody(row.name, label),
                  destructive: true,
                  title: p.uninstallConfirmTitle(row.name)
                }).then(async ok => {
                  if (!ok) {
                    return
                  }

                  if (await removeAgentPlugin(requestGateway, row.name, p.uninstallFailed(row.name), scope)) {
                    notify({ kind: 'success', message: p.uninstalled(row.name) })
                    // Prunes the app-level desktop half whose source package just went away.
                    void rescanAll(requestGateway, scope)
                  }
                })
              }}
              onAgentToggle={(row, enable) => {
                if (!row.key) {
                  return
                }

                void toggleAgentPlugin(requestGateway, row.key, enable, p.toggleFailed(row.name), scope).then(ok => {
                  // Turning a unified package on turns its desktop half on too
                  // (unless the user switched that half off on purpose).
                  // Off stays per half: the desktop half is app-wide, and
                  // another profile may still run the agent half.
                  const half = pkg.desktop?.packageName

                  if (ok && enable && half) {
                    void enablePackageDesktopHalf(half, { keepUserChoice: true })
                  }
                })
              }}
              onAgentUpdate={row => {
                const finish = (outcome: AgentPluginUpdateOutcome) => {
                  if (outcome.kind === 'applied') {
                    notify({ kind: 'success', message: p.updated(row.name) })
                    void rescanAll(requestGateway, scope)
                  }
                }

                void updateAgentPlugin(requestGateway, row.name, p.updateFailed(row.name), scope).then(
                  async outcome => {
                    if (outcome.kind !== 'consent') {
                      finish(outcome)

                      return
                    }

                    // The new pin widens the plugin (tools, hooks, deps, capabilities, a Desktop
                    // half); the backend changed nothing until the user confirms the delta.
                    const ok = await confirm({
                      confirmLabel: p.updateConsentConfirm,
                      description: [p.updateConsentBody(row.name, outcome.sha), ...outcome.deltaLines].join('\n'),
                      title: p.updateConsentTitle(row.name)
                    })

                    if (ok) {
                      finish(await updateAgentPlugin(requestGateway, row.name, p.updateFailed(row.name), scope, true))
                    }
                  }
                )
              }}
              onDesktopRemove={record => {
                void confirm({
                  confirmLabel: p.uninstall,
                  description: p.uninstallDesktopConfirmBody(record.name),
                  destructive: true,
                  title: p.uninstallConfirmTitle(record.name)
                }).then(async ok => {
                  if (!ok) {
                    return
                  }

                  const result = await uninstallDiskPlugin(record.id)

                  if (result.ok) {
                    notify({ kind: 'success', message: p.uninstalledDesktop(record.name) })
                  } else {
                    notifyError(result.error, p.uninstallFailed(record.name))
                  }
                })
              }}
              onRescan={rescan}
              pkg={pkg}
              profile={profile}
              scope={scope}
              scopeLabel={label}
            />
          ))}
        </ListGroup>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void revealPluginsDir()} size="sm" variant="outline">
          {d.openFolder}
        </Button>
        <Button onClick={rescan} size="sm" variant="outline">
          {d.rescan}
        </Button>
      </div>

      <PluginCatalogSheet onOpenChange={setCatalogOpen} open={catalogOpen} scope={scope} />
    </div>
  )
})
