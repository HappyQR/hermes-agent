import { createContext, type ReactNode } from 'react'

/**
 * How a `StatusSection` presents itself. The composer status stack (default)
 * shows each group as a collapsible header; the Studio activity tray opens ONE
 * group at a time in a panel whose chip already carries the group's count, so
 * there the header is a static title row and the body is always shown.
 *
 * `title` replaces the section's own label when the chip already shows that
 * label (the tray's queue chip reads "1 Queued"; the panel heading says
 * "Queue"), so the same text never appears twice on screen.
 */
export interface StatusSectionPresentationValue {
  caption?: ReactNode
  panel: boolean
  title?: ReactNode
}

export const StatusSectionPresentation = createContext<StatusSectionPresentationValue>({ panel: false })
