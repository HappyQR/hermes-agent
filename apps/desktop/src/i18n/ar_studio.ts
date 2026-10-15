import { arStudioChat } from './ar_studio_chat'
import { arStudioOverlays } from './ar_studio_overlays'
import { arStudioPages } from './ar_studio_pages'
import { arStudioSettings } from './ar_studio_settings'
// Hermes Studio copy for 'ar', composed from the per-area files.
import { arStudioShell } from './ar_studio_shell'
import { arStudioSidebar } from './ar_studio_sidebar'
import type { StudioTranslations } from './types_studio'

export const arStudio: StudioTranslations = {
  shell: arStudioShell,
  sidebar: arStudioSidebar,
  chat: arStudioChat,
  pages: arStudioPages,
  settings: arStudioSettings,
  overlays: arStudioOverlays
}
