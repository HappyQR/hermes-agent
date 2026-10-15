import type { StudioTranslations } from './types_studio'
import { zhStudioChat } from './zh_studio_chat'
import { zhStudioOverlays } from './zh_studio_overlays'
import { zhStudioPages } from './zh_studio_pages'
import { zhStudioSettings } from './zh_studio_settings'
// Hermes Studio copy for 'zh', composed from the per-area files.
import { zhStudioShell } from './zh_studio_shell'
import { zhStudioSidebar } from './zh_studio_sidebar'

export const zhStudio: StudioTranslations = {
  shell: zhStudioShell,
  sidebar: zhStudioSidebar,
  chat: zhStudioChat,
  pages: zhStudioPages,
  settings: zhStudioSettings,
  overlays: zhStudioOverlays
}
