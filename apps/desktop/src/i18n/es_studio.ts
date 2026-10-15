import { esStudioChat } from './es_studio_chat'
import { esStudioMenu } from './es_studio_menu'
import { esStudioOverlays } from './es_studio_overlays'
import { esStudioPages } from './es_studio_pages'
import { esStudioSettings } from './es_studio_settings'
// Hermes Studio copy for 'es', composed from the per-area files.
import { esStudioShell } from './es_studio_shell'
import { esStudioSidebar } from './es_studio_sidebar'
import type { StudioTranslations } from './types_studio'

export const esStudio: StudioTranslations = {
  shell: esStudioShell,
  sidebar: esStudioSidebar,
  chat: esStudioChat,
  pages: esStudioPages,
  settings: esStudioSettings,
  overlays: esStudioOverlays,
  menu: esStudioMenu
}
