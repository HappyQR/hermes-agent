import type { TileTone } from '@/app/overlays/studio/icon-tile'
import type { IconComponent } from '@/lib/icons'
import {
  ArchiveBox,
  BellIcon,
  BrainIcon,
  Bubbles,
  Card,
  Chip,
  Contrast,
  Folder,
  Gear,
  Hand,
  InfoCircle,
  Key,
  KeyboardIcon,
  LockIcon,
  Puzzle,
  Server,
  Sliders,
  Wave,
  WrenchIcon
} from '@/lib/icons-studio-overlays'

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
  icon: IconComponent
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
  general: { icon: Gear, id: 'general', scope: 'device', tone: 'gray' },
  appearance: { icon: Contrast, id: 'appearance', scope: 'device', tone: 'black' },
  chat: { icon: Bubbles, id: 'chat', scope: 'profile', tone: 'teal' },
  notifications: { icon: BellIcon, id: 'notifications', scope: 'device', tone: 'red' },
  keyboard: { icon: KeyboardIcon, id: 'keyboard', scope: 'device', tone: 'gray' },
  models: { icon: Chip, id: 'models', scope: 'profile', tone: 'purple' },
  providers: { icon: Key, id: 'providers', scope: 'profile', tone: 'orange' },
  memory: { icon: BrainIcon, id: 'memory', scope: 'profile', tone: 'pink' },
  voice: { icon: Wave, id: 'voice', scope: 'profile', tone: 'indigo' },
  workspace: { icon: Folder, id: 'workspace', scope: 'profile', tone: 'blue' },
  safety: { icon: Hand, id: 'safety', scope: 'profile', tone: 'blue' },
  passwords: { icon: LockIcon, id: 'passwords', scope: 'profile', tone: 'gray' },
  tools: { icon: WrenchIcon, id: 'tools', scope: 'profile', tone: 'green' },
  gateways: { icon: Server, id: 'gateways', scope: 'none', tone: 'teal' },
  sessions: { icon: ArchiveBox, id: 'sessions', scope: 'profile', tone: 'brown' },
  plugins: { icon: Puzzle, id: 'plugins', scope: 'profile', tone: 'green' },
  billing: { icon: Card, id: 'billing', scope: 'none', tone: 'green' },
  advanced: { icon: Sliders, id: 'advanced', scope: 'profile', tone: 'graphite' },
  about: { icon: InfoCircle, id: 'about', scope: 'none', tone: 'gray' }
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
