import { frStudioChat } from './fr_studio_chat'
import { frStudioOverlays } from './fr_studio_overlays'
import { frStudioPages } from './fr_studio_pages'
import { frStudioSettings } from './fr_studio_settings'
// Hermes Studio copy for 'fr', composed from the per-area files.
import { frStudioShell } from './fr_studio_shell'
import { frStudioSidebar } from './fr_studio_sidebar'
import type { StudioTranslations } from './types_studio'

export const frStudio: StudioTranslations = {
  shell: frStudioShell,
  sidebar: frStudioSidebar,
  chat: frStudioChat,
  pages: frStudioPages,
  settings: frStudioSettings,
  overlays: frStudioOverlays
}
