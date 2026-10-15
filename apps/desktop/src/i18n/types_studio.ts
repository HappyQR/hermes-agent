import type { StudioChatTranslations } from './types_studio_chat'
import type { StudioMenuTranslations } from './types_studio_menu'
import type { StudioOverlaysTranslations } from './types_studio_overlays'
import type { StudioPagesTranslations } from './types_studio_pages'
import type { StudioSettingsTranslations } from './types_studio_settings'
import type { StudioShellTranslations } from './types_studio_shell'
import type { StudioSidebarTranslations } from './types_studio_sidebar'

/** All Hermes Studio copy, one sub-namespace per redesign area (one file per locale and area). */
export interface StudioTranslations {
  shell: StudioShellTranslations
  sidebar: StudioSidebarTranslations
  chat: StudioChatTranslations
  pages: StudioPagesTranslations
  settings: StudioSettingsTranslations
  overlays: StudioOverlaysTranslations
  menu: StudioMenuTranslations
}
