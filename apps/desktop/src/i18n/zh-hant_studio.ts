import type { StudioTranslations } from './types_studio'
import { zhHantStudioChat } from './zh-hant_studio_chat'
import { zhHantStudioMenu } from './zh-hant_studio_menu'
import { zhHantStudioOverlays } from './zh-hant_studio_overlays'
import { zhHantStudioPages } from './zh-hant_studio_pages'
import { zhHantStudioSettings } from './zh-hant_studio_settings'
// Hermes Studio copy for 'zh-hant', composed from the per-area files.
import { zhHantStudioShell } from './zh-hant_studio_shell'
import { zhHantStudioSidebar } from './zh-hant_studio_sidebar'

export const zhHantStudio: StudioTranslations = {
  shell: zhHantStudioShell,
  sidebar: zhHantStudioSidebar,
  chat: zhHantStudioChat,
  pages: zhHantStudioPages,
  settings: zhHantStudioSettings,
  overlays: zhHantStudioOverlays,
  menu: zhHantStudioMenu
}
