import { settingDefinition } from '../settings-manifest'
import type { SettingsView } from '../types'

import { DEFAULT_SETTINGS_PAGE, isSettingsPageId, type SettingsPageId } from './categories'

/**
 * The Settings window's URL contract.
 *
 * Canonical: `/settings?tab=<page>[&section=<id>]` plus the target params the
 * pages consume (`field`, `setting`, `key`, `aux`, `session`, `kind|label|
 * origin`, `plugin|ppage|agent|profile`, `bview`, `pview=local`). Every
 * pre-window deep link — `?tab=config:model&page=auxiliary`,
 * `?tab=keys&kview=settings&key=X`, `?tab=connections`, … — resolves through
 * the legacy table below and is rewritten to the canonical form in place.
 */

export interface SettingsLocation {
  page: SettingsPageId
  section?: string
}

/** Section ids per page, in page order (scroll targets of `?section=`). */
export const SETTINGS_SECTIONS: Record<SettingsPageId, readonly string[]> = {
  general: ['language', 'tips', 'system'],
  appearance: ['look', 'theme', 'window', 'typography', 'pet'],
  chat: ['replies', 'messages', 'media'],
  notifications: ['alerts', 'sounds'],
  keyboard: ['shortcuts', 'quick-ask', 'hud'],
  models: ['main', 'fallbacks', 'auxiliary', 'moa'],
  providers: ['accounts', 'api-keys', 'endpoints', 'local'],
  memory: ['memory', 'context', 'maintenance'],
  voice: ['conversation', 'stt', 'tts', 'wake'],
  workspace: ['projects', 'execution', 'checkpoints'],
  safety: ['approvals', 'privacy', 'browser'],
  passwords: ['credentials', 'managers'],
  tools: ['tool-keys', 'server-env', 'toolsets'],
  gateways: ['connection', 'saved', 'remote-updates'],
  sessions: ['retention', 'archived'],
  plugins: ['pages', 'manage'],
  billing: ['overview'],
  advanced: ['agent', 'terminal', 'subagents', 'output', 'updates'],
  about: ['updates', 'config', 'diagnostics', 'uninstall']
}

const at = (page: SettingsPageId, section?: string): SettingsLocation => (section ? { page, section } : { page })

/** Legacy `tab` (+ its sub-page) → page/section. `''` keys the tab with no sub-page. */
const LEGACY: Record<string, Record<string, SettingsLocation>> = {
  'config:model': {
    '': at('models'),
    main: at('models', 'main'),
    fallbacks: at('models', 'fallbacks'),
    auxiliary: at('models', 'auxiliary'),
    moa: at('models', 'moa')
  },
  'config:chat': { '': at('chat'), behavior: at('chat', 'replies'), attachments: at('chat', 'media') },
  'config:appearance': {
    '': at('appearance'),
    general: at('general', 'language'),
    theme: at('appearance', 'theme'),
    typography: at('appearance', 'typography'),
    'window-layout': at('appearance', 'window'),
    'chat-display': at('chat', 'replies'),
    pet: at('appearance', 'pet')
  },
  'config:workspace': {
    '': at('workspace'),
    projects: at('workspace', 'projects'),
    shell: at('workspace', 'execution'),
    files: at('workspace', 'execution')
  },
  'config:safety': {
    '': at('safety'),
    approvals: at('safety', 'approvals'),
    privacy: at('safety', 'privacy'),
    checkpoints: at('workspace', 'checkpoints')
  },
  'config:browser': { '': at('safety', 'browser'), profile: at('safety', 'browser'), network: at('safety', 'browser') },
  'config:memory': { '': at('memory'), persistent: at('memory', 'memory'), context: at('memory', 'context') },
  'config:voice': {
    '': at('voice'),
    conversation: at('voice', 'conversation'),
    transcription: at('voice', 'stt'),
    speech: at('voice', 'tts')
  },
  'config:advanced': {
    '': at('advanced'),
    desktop: at('general', 'system'),
    runtime: at('advanced', 'agent'),
    tools: at('advanced', 'agent'),
    terminal: at('advanced', 'terminal'),
    delegation: at('advanced', 'subagents'),
    output: at('advanced', 'output')
  },
  providers: {
    '': at('providers'),
    accounts: at('providers', 'accounts'),
    keys: at('providers', 'api-keys'),
    'custom-endpoints': at('providers', 'endpoints'),
    local: at('providers', 'local')
  },
  gateway: {
    '': at('gateways'),
    connection: at('gateways', 'connection'),
    devices: at('gateways', 'saved'),
    'managed-updates': at('gateways', 'remote-updates')
  },
  connections: { '': at('gateways', 'saved') },
  keybinds: {
    '': at('keyboard'),
    shortcuts: at('keyboard', 'shortcuts'),
    'hud-gesture': at('keyboard', 'hud'),
    'screen-capture': at('keyboard', 'hud')
  },
  keys: { '': at('tools'), tools: at('tools', 'tool-keys'), settings: at('tools', 'server-env') },
  vault: { '': at('passwords'), credentials: at('passwords', 'credentials'), sources: at('passwords', 'managers') },
  notifications: { '': at('notifications'), alerts: at('notifications', 'alerts'), sounds: at('notifications', 'sounds') },
  billing: { '': at('billing') },
  sessions: {
    '': at('sessions'),
    archived: at('sessions', 'archived'),
    'default-directory': at('workspace', 'projects')
  },
  plugins: { '': at('plugins') },
  about: { '': at('about'), updates: at('about', 'updates'), uninstall: at('about', 'uninstall') }
}

/** Manifest rows whose legacy sub-page moved somewhere else than its siblings. */
const SETTING_OVERRIDES: Record<string, SettingsLocation> = {
  'advanced.quick-entry': at('keyboard', 'quick-ask'),
  'advanced.quick-entry-shortcut': at('keyboard', 'quick-ask'),
  'appearance.minimize-to-tray': at('general', 'system'),
  'appearance.tips': at('general', 'tips'),
  'appearance.tours': at('general', 'tips'),
  'appearance.theme': at('appearance', 'theme'),
  'appearance.interface-mode': at('appearance', 'window'),
  'appearance.user-bubble': at('chat', 'messages'),
  'appearance.text-direction': at('chat', 'messages'),
  'appearance.hide-thread-timeline': at('chat', 'messages'),
  'appearance.reactions': at('chat', 'messages'),
  'appearance.vibe-hearts': at('chat', 'messages'),
  'appearance.embeds': at('chat', 'media'),
  'chat.attachment-size': at('chat', 'media'),
  'gateway.keychain-encryption': at('gateways', 'connection'),
  'gateway.diagnostics': at('gateways', 'connection'),
  'sessions.auto-archive': at('sessions', 'retention')
}

/** Config field → page/section (prefix rules; first match wins). */
const FIELD_RULES: readonly [test: (key: string) => boolean, location: SettingsLocation][] = [
  [key => key === 'auxiliary.compression.timeout', at('memory', 'context')],
  [key => key === 'fallback_providers', at('models', 'fallbacks')],
  [key => key.startsWith('auxiliary.'), at('models', 'auxiliary')],
  [key => key.startsWith('moa.'), at('models', 'moa')],
  [
    key => key === 'model' || key.startsWith('model.') || key === 'model_context_length' || key === 'agent.reasoning_effort',
    at('models', 'main')
  ],
  [key => ['display.personality', 'timezone', 'display.show_reasoning'].includes(key), at('chat', 'replies')],
  [key => key === 'display.timestamps', at('chat', 'messages')],
  [key => key === 'agent.image_input_mode', at('chat', 'media')],
  [key => key === 'terminal.cwd' || key.startsWith('desktop.repo_scan_'), at('workspace', 'projects')],
  [
    key => ['code_execution.mode', 'file_read_max_chars', 'terminal.env_passthrough', 'terminal.persistent_shell'].includes(key),
    at('workspace', 'execution')
  ],
  [key => key.startsWith('checkpoints.'), at('workspace', 'checkpoints')],
  [key => key.startsWith('approvals.') || key === 'command_allowlist', at('safety', 'approvals')],
  [key => key === 'security.allow_private_urls' || key.startsWith('browser.'), at('safety', 'browser')],
  [key => key.startsWith('security.'), at('safety', 'privacy')],
  [key => key.startsWith('memory.'), at('memory', 'memory')],
  [key => key.startsWith('context.') || key.startsWith('compression.'), at('memory', 'context')],
  [key => key.startsWith('stt.'), at('voice', 'stt')],
  [key => key === 'voice.auto_tts' || key.startsWith('tts.'), at('voice', 'tts')],
  [key => key.startsWith('voice.'), at('voice', 'conversation')],
  [key => key === 'toolsets', at('tools', 'toolsets')],
  [key => key.startsWith('agent.'), at('advanced', 'agent')],
  [key => key.startsWith('terminal.'), at('advanced', 'terminal')],
  [key => key.startsWith('delegation.'), at('advanced', 'subagents')],
  [key => key.startsWith('tool_output.'), at('advanced', 'output')],
  [key => key.startsWith('updates.'), at('advanced', 'updates')]
]

/** Where a config field renders in the window; `undefined` = no explicit home (placed by its legacy section). */
export function configLocationForField(key: string): SettingsLocation | undefined {
  return FIELD_RULES.find(([test]) => test(key))?.[1]
}

/** Legacy config section → the page that hosts its unplaced (future) fields. */
export const LEGACY_SECTION_FALLBACK: Record<string, SettingsLocation> = {
  model: at('models', 'main'),
  chat: at('chat', 'replies'),
  workspace: at('workspace', 'execution'),
  safety: at('safety', 'approvals'),
  browser: at('safety', 'browser'),
  memory: at('memory', 'memory'),
  voice: at('voice', 'conversation'),
  advanced: at('advanced', 'agent')
}

/** A config field's page/section: its explicit rule, else its legacy section's fallback. */
export function configFieldLocation(key: string, legacySection: string): SettingsLocation {
  return configLocationForField(key) ?? LEGACY_SECTION_FALLBACK[legacySection] ?? at('advanced', 'agent')
}

function legacyLocation(tab: string, subpage: null | string): SettingsLocation | undefined {
  const table = LEGACY[tab]

  return table ? (table[subpage ?? ''] ?? table['']) : undefined
}

/** The legacy sub-page a request names: `page`, or the provider/keys sub-view params. */
function legacySubpage(tab: string, params: URLSearchParams): null | string {
  if (tab === 'providers') {
    return params.get('pview') ?? params.get('page')
  }

  if (tab === 'keys') {
    return params.get('kview') ?? params.get('page')
  }

  return params.get('page')
}

function settingLocation(tab: string, id: string): SettingsLocation | undefined {
  if (SETTING_OVERRIDES[id]) {
    return SETTING_OVERRIDES[id]
  }

  // The id's first segment names the manifest view (`appearance.tips`).
  const viewKey = id.split('.')[0] ?? ''
  const views = [tab, viewKey, `config:${viewKey}`] as SettingsView[]

  for (const view of views) {
    const definition = settingDefinition(view, id)

    if (definition) {
      return legacyLocation(view, definition.subpage ?? null)
    }
  }

  return undefined
}

function itemLocation(tab: string, params: URLSearchParams): SettingsLocation | undefined {
  if (params.get('aux')) {
    return at('models', 'auxiliary')
  }

  if (params.get('session')) {
    return at('sessions', 'archived')
  }

  if (params.get('kind') || params.get('label') || params.get('origin')) {
    return at('passwords', 'credentials')
  }

  if (params.get('key')) {
    if (tab === 'providers') {
      return at('providers', 'api-keys')
    }

    return at('tools', params.get('kview') === 'settings' ? 'server-env' : 'tool-keys')
  }

  if (params.get('plugin') || params.get('ppage') || params.get('agent')) {
    return at('plugins')
  }

  return undefined
}

/**
 * Resolve any Settings query (canonical or legacy) to a page and section.
 * Precedence: manifest `setting` → config `field` → item params (aux,
 * session, credentials, key, plugin) → legacy tab + sub-page → page tab →
 * the default page.
 */
export function resolveSettingsLocation(params: URLSearchParams): SettingsLocation {
  const tab = params.get('tab') ?? ''
  const setting = params.get('setting')
  const field = params.get('field')

  const fromTarget =
    (setting ? settingLocation(tab, setting) : undefined) ??
    (field ? configLocationForField(field) : undefined) ??
    itemLocation(tab, params)

  if (fromTarget) {
    return fromTarget
  }

  const subpage = legacySubpage(tab, params)

  if (isSettingsPageId(tab) && !(subpage && LEGACY[tab]?.[subpage])) {
    const section = params.get('section')

    return section && SETTINGS_SECTIONS[tab].includes(section) ? at(tab, section) : at(tab)
  }

  return legacyLocation(tab, subpage) ?? at(DEFAULT_SETTINGS_PAGE)
}

/** Params a page needs after the rewrite; everything else legacy is dropped. */
const KEPT_PARAMS = [
  'field',
  'setting',
  'key',
  'aux',
  'session',
  'kind',
  'label',
  'origin',
  'plugin',
  'ppage',
  'agent',
  'profile',
  'bview'
] as const

/**
 * The canonical query for a (possibly legacy) Settings query, or `null` when
 * it already is canonical. `pview=local` survives (the local-models drill-in).
 */
export function canonicalSettingsSearch(search: string): null | string {
  const params = new URLSearchParams(search)
  const location = resolveSettingsLocation(params)
  const next = new URLSearchParams({ tab: location.page })

  if (location.section) {
    next.set('section', location.section)
  }

  for (const key of KEPT_PARAMS) {
    const value = params.get(key)

    if (value !== null) {
      next.set(key, value)
    }
  }

  if (location.page === 'providers' && params.get('pview') === 'local') {
    next.set('pview', 'local')
  }

  const before = params.toString()
  const after = next.toString()

  return before === after ? null : `?${after}`
}

/** The legacy view a page reports to feature-use metrics (store/desktop-metrics SETTINGS_AREAS). */
export const PAGE_METRICS_VIEW: Record<SettingsPageId, string> = {
  general: 'config:appearance',
  appearance: 'config:appearance',
  chat: 'config:chat',
  notifications: 'notifications',
  keyboard: 'keybinds',
  models: 'config:model',
  providers: 'providers',
  memory: 'config:memory',
  voice: 'config:voice',
  workspace: 'config:workspace',
  safety: 'config:safety',
  passwords: 'vault',
  tools: 'keys',
  gateways: 'gateway',
  sessions: 'sessions',
  plugins: 'plugins',
  billing: 'billing',
  advanced: 'config:advanced',
  about: 'about'
}
