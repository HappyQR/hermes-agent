import type { ReadableAtom } from 'nanostores'
import type { ReactNode } from 'react'

import type { InterfaceTier } from '@/store/interface-mode'

// ── `sidebar.sections` — sections a plugin adds to the sidebar (Hermes Studio) ─
// A RENDER contribution that adds a collapsible section after Sessions: the
// contribution's `render` is the section body (mounted only while the section
// is open) and its `data` (a `SidebarSectionContribution`) names it and adds
// header tools. Each section's fold persists under its contribution id. First
// consumer: the Bots plugin's compact roster.

export const SIDEBAR_SECTIONS_AREA = 'sidebar.sections'

/** Payload of a `sidebar.sections` render contribution. */
export interface SidebarSectionContribution {
  /** Header title, read on every paint so it follows the app language. */
  title: () => string
  /** Start folded until the user opens it (their choice then persists). */
  defaultCollapsed?: boolean
  /** How many rows the section holds — shown in the header while folded. */
  count?: ReadableAtom<number>
  /** Header hover tools (a "+" or "⋯"), mounted as a component inside the
   *  section's error boundary — whether or not the section is open. */
  tools?: () => ReactNode
  /** `'advanced'` keeps the section out of Simple mode. */
  tier?: InterfaceTier
}

/** What a section's rows and header tools draw with: Hermes Studio's icon set
 *  (prefer it over Codicon where it has the glyph, so plugin chrome matches
 *  the sidebar around it) and the menu's checkbox row. */
export { DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
export { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
