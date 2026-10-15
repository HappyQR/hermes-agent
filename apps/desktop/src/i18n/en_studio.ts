import { enStudioChat } from './en_studio_chat'
import { enStudioMenu } from './en_studio_menu'
import { enStudioOverlays } from './en_studio_overlays'
import { enStudioPages } from './en_studio_pages'
import { enStudioSettings } from './en_studio_settings'
// Hermes Studio copy for 'en', composed from the per-area files.
import { enStudioShell } from './en_studio_shell'
import { enStudioSidebar } from './en_studio_sidebar'
import type { StudioTranslations } from './types_studio'

export const enStudio: StudioTranslations = {
  shell: enStudioShell,
  sidebar: enStudioSidebar,
  chat: enStudioChat,
  pages: enStudioPages,
  settings: enStudioSettings,
  overlays: enStudioOverlays,
  menu: enStudioMenu
}
