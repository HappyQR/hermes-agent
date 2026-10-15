import { deStudioChat } from './de_studio_chat'
import { deStudioOverlays } from './de_studio_overlays'
import { deStudioPages } from './de_studio_pages'
import { deStudioSettings } from './de_studio_settings'
// Hermes Studio copy for 'de', composed from the per-area files.
import { deStudioShell } from './de_studio_shell'
import { deStudioSidebar } from './de_studio_sidebar'
import type { StudioTranslations } from './types_studio'

export const deStudio: StudioTranslations = {
  shell: deStudioShell,
  sidebar: deStudioSidebar,
  chat: deStudioChat,
  pages: deStudioPages,
  settings: deStudioSettings,
  overlays: deStudioOverlays
}
