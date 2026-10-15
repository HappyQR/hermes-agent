import type { TileTone } from '@/app/overlays/studio/icon-tile'
import type { StudioIconName } from '@/components/ui/studio-icon'

/**
 * The Settings window's 19 categories (macOS System Settings layout), in
 * sidebar order and grouping. Titles and hero lines live in
 * `t.studio.settings.pages[id]`. Each category composes the legacy subpages it
 * replaced (see app/settings/studio/locations.ts for the deep-link table).
 */
export type SettingsPageId =
  | 'about'
  | 'advanced'
  | 'appearance'
  | 'billing'
  | 'chat'
  | 'gateways'
  | 'general'
  | 'keyboard'
  | 'memory'
  | 'models'
  | 'notifications'
  | 'passwords'
  | 'plugins'
  | 'providers'
  | 'safety'
  | 'sessions'
  | 'tools'
  | 'voice'
  | 'workspace'

/**
 * Where a page's settings live: `device` = this computer only, `profile` = the
 * profile picked in the window header, `none` = account- or app-wide.
 */
export type SettingsPageScope = 'device' | 'none' | 'profile'

export interface SettingsPageSpec {
  /** Prototype glyph (components/ui/studio-icon) drawn on the tile. */
  glyph: StudioIconName
  id: SettingsPageId
  scope: SettingsPageScope
  tone: TileTone
}

export const SETTINGS_PAGE_GROUPS: readonly (readonly SettingsPageId[])[] = [
  ['general', 'appearance', 'chat', 'notifications', 'keyboard'],
  ['models', 'providers', 'memory', 'voice'],
  ['workspace', 'safety', 'passwords', 'tools', 'gateways'],
  ['sessions', 'plugins', 'billing', 'advanced', 'about']
]

export const SETTINGS_PAGE_IDS: readonly SettingsPageId[] = SETTINGS_PAGE_GROUPS.flat()

export const DEFAULT_SETTINGS_PAGE: SettingsPageId = 'general'

export const SETTINGS_PAGES: Record<SettingsPageId, SettingsPageSpec> = {
  general: { glyph: 'gear', id: 'general', scope: 'device', tone: 'gray' },
  appearance: { glyph: 'contrast', id: 'appearance', scope: 'device', tone: 'black' },
  chat: { glyph: 'bubbles', id: 'chat', scope: 'profile', tone: 'teal' },
  notifications: { glyph: 'bell', id: 'notifications', scope: 'device', tone: 'red' },
  keyboard: { glyph: 'keyboard', id: 'keyboard', scope: 'device', tone: 'gray' },
  models: { glyph: 'cpu', id: 'models', scope: 'profile', tone: 'purple' },
  providers: { glyph: 'key', id: 'providers', scope: 'profile', tone: 'orange' },
  memory: { glyph: 'brain', id: 'memory', scope: 'profile', tone: 'pink' },
  voice: { glyph: 'wave', id: 'voice', scope: 'profile', tone: 'indigo' },
  workspace: { glyph: 'folder', id: 'workspace', scope: 'profile', tone: 'blue' },
  safety: { glyph: 'hand', id: 'safety', scope: 'profile', tone: 'blue' },
  passwords: { glyph: 'lock', id: 'passwords', scope: 'profile', tone: 'gray' },
  tools: { glyph: 'wrench', id: 'tools', scope: 'profile', tone: 'green' },
  gateways: { glyph: 'server', id: 'gateways', scope: 'none', tone: 'teal' },
  sessions: { glyph: 'archive', id: 'sessions', scope: 'profile', tone: 'brown' },
  plugins: { glyph: 'puzzle', id: 'plugins', scope: 'profile', tone: 'green' },
  billing: { glyph: 'card', id: 'billing', scope: 'none', tone: 'green' },
  advanced: { glyph: 'sliders', id: 'advanced', scope: 'profile', tone: 'graphite' },
  about: { glyph: 'info', id: 'about', scope: 'none', tone: 'gray' }
}

export function isSettingsPageId(value: null | string | undefined): value is SettingsPageId {
  return typeof value === 'string' && (SETTINGS_PAGE_IDS as readonly string[]).includes(value)
}

/** `/settings` search for a category (and optionally a section inside it). */
export function settingsPageSearch(page: SettingsPageId, section?: string): string {
  const params = new URLSearchParams({ tab: page })

  if (section) {
    params.set('section', section)
  }

  return `?${params}`
}
