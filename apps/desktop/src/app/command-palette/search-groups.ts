import type { StudioIconName } from '@/components/ui/studio-icon'
import type { Translations } from '@/i18n'
import { formatAgo } from '@/lib/time'
import { openFolderAsProject } from '@/store/projects'

import { CAPABILITIES_ROUTE, SETTINGS_ROUTE } from '../routes'
import { SECTIONS } from '../settings/constants'
import { type SettingsSearchEntry, settingsSearchTargetQuery } from '../settings/settings-search'
import type { useSettingsSearchCatalog } from '../settings/use-settings-search'

import { hasPaletteSource, type PaletteScopeId, type PaletteSource } from './scopes'
import { modeItems, themeItems, type ThemeRowsContext } from './theme-rows'
import type { PaletteGroup, PaletteItem } from './types'
import type { SessionEntry, usePaletteSessions } from './use-palette-sessions'

type SelectMods = { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }

export interface SearchGroupsContext {
  go: (path: string) => () => void
  goSession: (sessionId: string) => (event?: SelectMods) => void
  t: Translations
}

// Hermes session ids: <YYYYMMDD>_<HHMMSS>_<6 hex>. Used to offer a direct
// "Go to session ‹id›" jump for ids that aren't in the recent-200 list.
const SESSION_ID_RE = /^\d{8}_\d{6}_[a-f0-9]{6}$/

// A typed/pasted folder path: absolute (`/…`) or a Windows drive (`C:\…`).
// Deliberately NOT `~/…`: the upsert's membership check (projectIdForCwd)
// compares literal strings against the tree's absolute paths, so an unexpanded
// home path would always miss and double-create.
const FOLDER_PATH_RE = /^(\/|[A-Za-z]:[/\\]).+/

// Search terms beyond the label: the preview and branch, so a session is
// findable by what it's about, not only what it's called.
const sessionKeywords = (session: SessionEntry, ...tags: string[]): string[] =>
  [...tags, 'chat', 'session', session.preview, session.git_branch].filter((word): word is string => !!word)

/**
 * Rows the query itself asks for: a pasted session id jumps straight to it
 * (even past the recent-200 window), and a pasted absolute folder path opens
 * as a project (the ⌘O upsert without the native picker).
 */
export function directGroups(query: string, { goSession, t }: SearchGroupsContext): PaletteGroup[] {
  const direct = query.trim()
  const result: PaletteGroup[] = []

  if (SESSION_ID_RE.test(direct)) {
    result.push({
      items: [
        {
          glyph: 'bubbles',
          id: `goto-${direct}`,
          keywords: ['session', 'id', 'go to', direct],
          label: `${t.commandCenter.goToSession} ${direct}`,
          runWithEvent: goSession(direct)
        }
      ],
      scope: 'sessions'
    })
  }

  if (FOLDER_PATH_RE.test(direct)) {
    result.push({
      items: [
        {
          glyph: 'folder-plus',
          id: `open-folder-${direct}`,
          keywords: ['open', 'folder', 'project', direct],
          label: t.commandCenter.openFolderAt(direct),
          run: () => void openFolderAsProject(direct)
        }
      ],
      scope: 'sessions'
    })
  }

  return result
}

type PaletteSessions = ReturnType<typeof usePaletteSessions>

/** The five most recent sessions — the ⌘K landing's first block. Note: age · branch. */
export function recentGroup(recent: readonly SessionEntry[], { goSession, t }: SearchGroupsContext): PaletteGroup {
  return {
    heading: t.studio.overlays.palette.recent,
    scope: 'sessions',
    items: recent.map(session => ({
      detail:
        [session.lastActive ? formatAgo(session.lastActive * 1000, t.agents) : null, session.git_branch]
          .filter(Boolean)
          .join(' · ') || undefined,
      glyph: 'bubbles',
      id: `recent-${session.id}`,
      keywords: sessionKeywords(session, 'recent'),
      label: session.title,
      runWithEvent: goSession(session.id)
    }))
  }
}

/**
 * Pinned, recent-200 and archived sessions. Pinned sits before Sessions:
 * rankGroups' stable sort keeps source order on equal scores, so a pin wins a
 * tie with an unpinned row of the same name. Archived only surfaces on type.
 */
export function sessionGroups(
  { archivedSessions, pinnedSessions, sessions }: PaletteSessions,
  { go, goSession, t }: SearchGroupsContext
): PaletteGroup[] {
  const result: PaletteGroup[] = []

  if (pinnedSessions.length > 0) {
    result.push({
      heading: t.sidebar.pinned,
      scope: 'sessions',
      items: pinnedSessions.map(session => ({
        glyph: 'pin',
        id: `pinned-${session.id}`,
        keywords: sessionKeywords(session, 'pinned'),
        label: session.title,
        runWithEvent: goSession(session.id)
      }))
    })
  }

  if (sessions.length > 0) {
    result.push({
      heading: t.commandCenter.sections.sessions,
      scope: 'sessions',
      items: sessions.map(session => ({
        glyph: 'bubbles',
        id: `session-${session.id}`,
        keywords: sessionKeywords(session),
        label: session.title,
        runWithEvent: goSession(session.id)
      }))
    })
  }

  if (archivedSessions.length > 0) {
    result.push({
      heading: t.commandCenter.archivedChats,
      scope: 'sessions',
      typedOnly: true,
      items: archivedSessions.map(session => ({
        glyph: 'archive',
        id: `archived-${session.id}`,
        keywords: sessionKeywords(session, 'archived'),
        label: session.title,
        run: go(`${SETTINGS_ROUTE}?tab=sessions&session=${encodeURIComponent(session.id)}`)
      }))
    })
  }

  return result
}

/**
 * Deep links straight to a Capabilities sub-tab and to each configured MCP
 * server. The Go to row only lands on the top-level Skills view; typing
 * "mcp"/"tools"/"skills" should jump to the exact tab.
 */
export function capabilityGroups(mcpServers: readonly string[], { go, t }: SearchGroupsContext): PaletteGroup[] {
  const capLabel = t.commandCenter.nav.capabilities.title
  const tab = (id: string) => go(`${CAPABILITIES_ROUTE}?tab=${id}`)

  const result: PaletteGroup[] = [
    {
      heading: capLabel,
      scope: 'pages',
      typedOnly: true,
      items: [
        {
          glyph: 'cube',
          id: 'cap-skills',
          keywords: ['skills', 'capabilities'],
          label: `${capLabel}: ${t.skills.tabSkills}`,
          run: tab('skills')
        },
        {
          glyph: 'wrench',
          id: 'cap-toolsets',
          keywords: ['tools', 'toolsets', 'capabilities'],
          label: `${capLabel}: ${t.skills.tabToolsets}`,
          run: tab('toolsets')
        },
        {
          glyph: 'plug',
          id: 'cap-connectors',
          keywords: ['connectors', 'apps', 'mcp', 'servers', 'tools', 'capabilities', 'model context protocol'],
          label: `${capLabel}: ${t.connectorsPage.title}`,
          run: tab('connectors')
        },
        {
          glyph: 'puzzle',
          id: 'cap-plugins',
          keywords: ['plugins', 'extensions', 'desktop plugins', 'agent plugins', 'catalog', 'addon', 'add-on'],
          label: `${capLabel}: ${t.skills.tabPlugins}`,
          run: tab('plugins')
        }
      ]
    }
  ]

  if (mcpServers.length > 0) {
    result.push({
      heading: t.commandCenter.mcpServers,
      scope: 'pages',
      typedOnly: true,
      items: mcpServers.map(name => ({
        glyph: 'server',
        id: `mcp-${name}`,
        keywords: ['mcp', 'server', 'tool'],
        label: name,
        run: go(`${CAPABILITIES_ROUTE}?tab=connectors&server=${encodeURIComponent(name)}`)
      }))
    })
  }

  return result
}

/** Apply a theme or switch light/dark/system straight from the search (live preview, palette stays open). */
export function appearanceSearchGroups(ctx: ThemeRowsContext): PaletteGroup[] {
  return [
    { heading: ctx.t.settings.appearance.themeTitle, items: themeItems(ctx, 'search-theme'), scope: 'actions', typedOnly: true },
    { heading: ctx.t.settings.appearance.colorMode, items: modeItems(ctx, 'search-mode'), scope: 'actions', typedOnly: true }
  ]
}

type NonConfigSettingsLabel =
  | 'about'
  | 'archivedChats'
  | 'gateway'
  | 'keysSettings'
  | 'keysTools'
  | 'plugins'
  | 'providerAccounts'
  | 'providerApiKeys'

// Pre-Studio settings deep links: still typeable (the settings window maps the
// legacy `tab=` values onto its categories), listed with the granular entries.
const NON_CONFIG_SETTINGS: ReadonlyArray<{
  glyph: StudioIconName
  keywords?: string[]
  labelKey: NonConfigSettingsLabel
  tab: string
}> = [
  {
    glyph: 'bolt',
    keywords: ['accounts', 'sign in', 'oauth', 'login', 'subscription', 'models', 'anthropic', 'openai'],
    labelKey: 'providerAccounts',
    tab: 'providers&pview=accounts'
  },
  {
    glyph: 'key',
    keywords: ['providers', 'api key', 'keys', 'secrets', 'tokens', 'egress', 'iron proxy', 'sandbox proxy'],
    labelKey: 'providerApiKeys',
    tab: 'providers&pview=keys'
  },
  {
    glyph: 'server',
    // The Connections registry merged into the unified Gateways page.
    keywords: ['connection', 'connections', 'messaging', 'remote', 'multi', 'instances', 'ssh', 'cloud', 'add gateway', 'registry'],
    labelKey: 'gateway',
    tab: 'gateway'
  },
  {
    glyph: 'key',
    keywords: ['api', 'secrets', 'tokens', 'credentials', 'browser', 'search'],
    labelKey: 'keysTools',
    tab: 'keys&kview=tools'
  },
  {
    glyph: 'sliders',
    keywords: ['gateway', 'proxy', 'server', 'webhook', 'env', 'egress proxy', 'iron proxy'],
    labelKey: 'keysSettings',
    tab: 'keys&kview=settings'
  },
  { glyph: 'archive', keywords: ['history', 'archived'], labelKey: 'archivedChats', tab: 'sessions' },
  {
    glyph: 'puzzle',
    keywords: ['plugins', 'plugin settings', 'plugin options', 'addons', 'add-ons', 'extensions'],
    labelKey: 'plugins',
    tab: 'plugins'
  },
  { glyph: 'info', keywords: ['version', 'about'], labelKey: 'about', tab: 'about' }
]

type SettingsCatalog = ReturnType<typeof useSettingsSearchCatalog>

/**
 * The deep settings catalog (schema-driven config fields, appearance controls,
 * stored credentials, plugin settings — the same entries the Settings window
 * serves) plus the legacy section links. ⌘K is the de-facto settings search
 * everywhere, so the palette and the settings window must agree.
 */
export function settingsSearchGroups(catalog: SettingsCatalog, { go, t }: SearchGroupsContext): PaletteGroup[] {
  const settingsTab = (tab: string) => go(`${SETTINGS_ROUTE}?tab=${tab}`)

  const entryItem = (entry: SettingsSearchEntry, glyph: StudioIconName): PaletteItem => ({
    detail: entry.context,
    glyph,
    id: `sp-${entry.id}`,
    keywords: [entry.context, entry.description ?? '', ...entry.keywords],
    label: entry.label,
    run: go(`${SETTINGS_ROUTE}?${settingsSearchTargetQuery(entry.target)}`)
  })

  const fields: PaletteItem[] = [
    ...SECTIONS.map(section => ({
      glyph: 'sliders' as const,
      id: `set-config-${section.id}`,
      keywords: ['settings', section.label],
      label: t.settings.sections[section.id] ?? section.label,
      run: settingsTab(`config:${section.id}`)
    })),
    ...NON_CONFIG_SETTINGS.map(entry => ({
      glyph: entry.glyph,
      id: `set-${entry.tab}`,
      keywords: ['settings', ...(entry.keywords ?? [])],
      label: t.settings.nav[entry.labelKey],
      run: settingsTab(entry.tab)
    })),
    ...[...catalog.subpageEntries, ...catalog.settingEntries, ...catalog.configEntries].map(entry =>
      entryItem(entry, 'sliders')
    )
  ]

  const result: PaletteGroup[] = [{ heading: t.commandCenter.settingsFields, items: fields, scope: 'settings', typedOnly: true }]

  if (catalog.pluginEntries.length > 0) {
    result.push({
      heading: t.skills.tabPlugins,
      scope: 'settings',
      typedOnly: true,
      items: catalog.pluginEntries.map(entry => ({
        detail: entry.context,
        glyph: 'puzzle',
        id: `sp-${entry.id}`,
        keywords: [entry.context, entry.description ?? '', ...entry.keywords],
        label: entry.label,
        run: go(`${CAPABILITIES_ROUTE}?tab=plugins&plugin=${encodeURIComponent(entry.plugin)}`)
      }))
    })
  }

  if (catalog.credentialEntries.length > 0) {
    result.push({
      heading: t.settings.nav.apiKeys,
      scope: 'settings',
      typedOnly: true,
      items: catalog.credentialEntries.map(entry => entryItem(entry, 'key'))
    })
  }

  return result
}

/**
 * Groups published by external sources (see scopes.ts), shown as the source
 * ordered them after the palette's own ranked rows. While a sessions source is
 * registered, All offers a row that hands the query to it.
 */
export function externalGroups({
  onSearchContent,
  query,
  scope,
  sources,
  t
}: {
  onSearchContent: () => void
  query: string
  scope: PaletteScopeId
  sources: Record<string, PaletteSource>
  t: Translations
}): PaletteGroup[] {
  const pal = t.studio.overlays.palette

  const result: PaletteGroup[] = Object.entries(sources).flatMap(([sourceId, source]) =>
    source.groups.map(group => ({
      heading: group.heading,
      key: `ext:${sourceId}:${group.heading}`,
      scope: source.scope,
      unranked: true,
      items: group.items.map(item => ({
        detail: item.detail,
        glyph: item.glyph ?? 'bubbles',
        id: `ext:${sourceId}:${item.id}`,
        keywords: item.keywords,
        label: item.label,
        runWithEvent: item.run
      }))
    }))
  )

  if (scope === 'all' && query.trim() && hasPaletteSource(sources, 'sessions')) {
    result.push({
      heading: pal.contentGroup,
      scope: 'all',
      unranked: true,
      items: [
        {
          detail: pal.searchContentDetail,
          glyph: 'search',
          id: 'search-session-content',
          keepOpen: true,
          label: pal.searchContent(query.trim()),
          run: onSearchContent
        }
      ]
    })
  }

  return result
}
