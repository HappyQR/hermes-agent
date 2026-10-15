import { type Codec, persistentAtom } from '@/lib/persisted'
import { DEFAULT_INTERFACE_MODE, type InterfaceMode, shownInMode, type Tiered } from '@/store/interface-mode'

export type TitlebarAppActionsSide = 'left' | 'right'

const STORAGE_KEY = 'hermes.desktop.titlebarAppActions'

/** Right is the original titlebar: Settings / Layout / HUD stay off the tab strip. */
export const TITLEBAR_APP_ACTIONS_DEFAULT: TitlebarAppActionsSide = 'right'

const codec: Codec<TitlebarAppActionsSide> = {
  decode: raw => (raw === 'left' || raw === 'right' ? raw : TITLEBAR_APP_ACTIONS_DEFAULT),
  encode: value => value
}

export const $titlebarAppActionsSide = persistentAtom<TitlebarAppActionsSide>(
  STORAGE_KEY,
  TITLEBAR_APP_ACTIONS_DEFAULT,
  codec
)

export function setTitlebarAppActionsSide(side: TitlebarAppActionsSide) {
  $titlebarAppActionsSide.set(side)
}

/**
 * The fixed titlebar tools. ONE table: the buttons spread their entry to
 * render, the width reservation counts the same entries. Studio keeps only
 * the pair beside the traffic lights ([show sidebar][new chat], shown while
 * the sidebar's own band is gone); app actions moved to the toolbar capsule,
 * the account menu and the menu bar, so the side preference no longer moves
 * anything (kept for settings/merge compatibility).
 */
export const TITLEBAR_FIXED_TOOLS = {
  'new-chat': {},
  sidebar: {}
} satisfies Record<string, Tiered>

export type TitlebarFixedToolId = keyof typeof TITLEBAR_FIXED_TOOLS

/** Button counts for the two titlebar clusters (the left pair at most). */
export function titlebarAppActionsClusterCounts(
  _side: TitlebarAppActionsSide,
  leftExtras = 0,
  rightExtras = 0,
  mode: InterfaceMode = DEFAULT_INTERFACE_MODE
): { left: number; right: number } {
  const shown = shownInMode(mode)
  const fixed = Object.values(TITLEBAR_FIXED_TOOLS).filter(tool => shown(tool)).length

  return { left: fixed + leftExtras, right: rightExtras }
}
