import type { StudioIconName } from '@/components/ui/studio-icon'
import type { IconComponent } from '@/lib/icons'

import type { PaletteScopeId } from './scopes'

export interface PaletteItem {
  /** Keybind action id — its live combo renders as a hotkey hint. */
  action?: string
  /** Renders a trailing check: this row IS the current setting (theme, mode). */
  active?: boolean
  /** Static trailing combo hint for a modifier-variant select (e.g. `mod+enter`). */
  comboHint?: string
  /** Short note beside the label — state the row acts on (a version, a count). */
  detail?: string
  /** `state` when the row will change what `detail` says (a toggle's on/off). */
  detailVariant?: 'muted' | 'state'
  /** Prototype glyph for the row's icon tile (preferred over `icon`). */
  glyph?: StudioIconName
  icon?: IconComponent
  id: string
  /** Keep the palette open after running (live-preview pickers like theme/mode). */
  keepOpen?: boolean
  keywords?: string[]
  label: string
  /** Label shown while ⌘/⌃ is held — previews the modifier-variant action. */
  modLabel?: string
  /**
   * Runs when the row becomes the cmdk highlight (arrow keys or hover). When
   * a row has no onHighlight, a highlight on it clears the live preview.
   */
  onHighlight?: () => void
  /**
   * When set, ⌘/⌃-select (or ⌘-Enter) opens a new tab and ⇧⌘-select pops a
   * window — matching sidebar session rows. Plain select stays in-place.
   * Receives the last selector event so the modifiers can be read.
   */
  runWithEvent?: (event?: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }) => void
  /** Action to run when selected. Mutually exclusive with `to`. */
  run?: () => void
  /** Open a nested palette page (VS Code-style "choose X → options"). */
  to?: string
}

export interface PaletteGroup {
  /** Optional: a headingless group renders as a bare action row (e.g. the
   *  "Install theme…" entry pinned atop the theme picker). */
  heading?: string
  items: PaletteItem[]
  /** Render key when the heading alone may repeat (external sources). */
  key?: string
  /** The ⌘K scope chip this group belongs to. */
  scope: PaletteScopeId
  /** Long, granular lists that only surface once the user types. */
  typedOnly?: boolean
  /** Already ranked by its source (server search): shown as given, after the ranked groups. */
  unranked?: boolean
}

/** A nested page reachable from a root item via `to`. */
export interface PalettePage {
  groups: PaletteGroup[]
  placeholder: string
  title: string
}
