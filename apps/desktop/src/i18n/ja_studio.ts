import { jaStudioChat } from './ja_studio_chat'
import { jaStudioMenu } from './ja_studio_menu'
import { jaStudioOverlays } from './ja_studio_overlays'
import { jaStudioPages } from './ja_studio_pages'
import { jaStudioSettings } from './ja_studio_settings'
// Hermes Studio copy for 'ja', composed from the per-area files.
import { jaStudioShell } from './ja_studio_shell'
import { jaStudioSidebar } from './ja_studio_sidebar'
import type { StudioTranslations } from './types_studio'

export const jaStudio: StudioTranslations = {
  shell: jaStudioShell,
  sidebar: jaStudioSidebar,
  chat: jaStudioChat,
  pages: jaStudioPages,
  settings: jaStudioSettings,
  overlays: jaStudioOverlays,
  menu: jaStudioMenu
}
