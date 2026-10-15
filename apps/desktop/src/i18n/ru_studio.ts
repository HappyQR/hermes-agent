import { ruStudioChat } from './ru_studio_chat'
import { ruStudioOverlays } from './ru_studio_overlays'
import { ruStudioPages } from './ru_studio_pages'
import { ruStudioSettings } from './ru_studio_settings'
// Hermes Studio copy for 'ru', composed from the per-area files.
import { ruStudioShell } from './ru_studio_shell'
import { ruStudioSidebar } from './ru_studio_sidebar'
import type { StudioTranslations } from './types_studio'

export const ruStudio: StudioTranslations = {
  shell: ruStudioShell,
  sidebar: ruStudioSidebar,
  chat: ruStudioChat,
  pages: ruStudioPages,
  settings: ruStudioSettings,
  overlays: ruStudioOverlays
}
