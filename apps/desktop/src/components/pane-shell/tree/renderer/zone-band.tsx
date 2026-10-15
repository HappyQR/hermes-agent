import type { ComponentType } from 'react'

import { TITLEBAR_HEIGHT } from '@/app/shell/titlebar'
import type { Contribution } from '@/contrib/types'

import { paneChrome, type ZoneBandContext } from './track-model'

/**
 * Hermes Studio: what a top-edge zone paints in its titlebar band — the
 * sidebar's top bar above the sessions column, the toolbar above the chat, the
 * inspector's segmented header. A zone with a band keeps its tab strip on the
 * row below the band.
 */
export interface ZoneBand {
  Band: ComponentType<ZoneBandContext>
  /** The band's surface; absent keeps the header's sidebar surface. */
  surface?: string
  /** The panes the strip below lists (default: every shown pane); a rule that
   *  supplies this also decides visibility — the strip shows while it lists any. */
  stripPanes?: (shown: readonly string[], activeId: string) => string[]
  /** Look of that strip (`data-zone-strip` on it; styled by the app). */
  stripVariant?: string
}

interface ZoneBandRule extends ZoneBand {
  /** Tested against the zone's whole pane set, hidden panes included. */
  matches: (panes: readonly string[]) => boolean
}

const rules = new Set<ZoneBandRule>()

/** App seam: give every zone whose panes match a band of its own. */
export function registerZoneBand(rule: ZoneBandRule): () => void {
  rules.add(rule)

  return () => rules.delete(rule)
}

/** A registered zone band first; else the active pane's band, else the first
 *  shown pane that declares one (the sessions top bar stays put while the Bots
 *  tab is active). */
export function zoneBand(
  panes: readonly string[],
  shown: readonly string[],
  activeId: string,
  paneFor: (id: string) => Contribution | undefined
): ZoneBand | null {
  for (const rule of rules) {
    if (rule.matches(panes)) {
      return rule
    }
  }

  const owner = [activeId, ...shown].find(id => paneChrome(paneFor(id)).band)
  const chrome = owner ? paneChrome(paneFor(owner)) : null

  return chrome?.band ? { Band: chrome.band, surface: chrome.bandSurface } : null
}

/** The tab row under a band (prototype .tabs: 28px tabs on a 34px row). */
export const ZONE_TABS_ROW_HEIGHT = 34

/** Band reservations: at least the toolbar gutters, more where window chrome sits. */
export const ZONE_BAND_LEFT = 'max(16px, var(--panel-titlebar-left, 0px))'
export const ZONE_BAND_RIGHT = 'max(12px, var(--panel-titlebar-right, 0px))'

/** The band row. It moves the window; its controls opt out (studio/shell.css). */
export function ZoneBandRow({ band, context }: { band: ZoneBand; context: ZoneBandContext }) {
  const { Band } = band

  return (
    <div
      className="flex min-w-0 flex-1 items-center self-start [-webkit-app-region:drag]"
      data-zone-band=""
      style={{ height: TITLEBAR_HEIGHT }}
    >
      <Band {...context} />
    </div>
  )
}
