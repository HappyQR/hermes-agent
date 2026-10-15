import type { ReactNode } from 'react'

import { TITLEBAR_HEIGHT } from '@/app/shell/titlebar'
import { ContribRender } from '@/contrib/react/boundary'
import type { Contribution } from '@/contrib/types'

import { paneChrome } from './track-model'

/**
 * Hermes Studio: what a top-edge zone paints in its titlebar band — the
 * sidebar's top bar above the sessions column, the toolbar above the chat.
 * A zone with a band keeps its tab strip on the row below the band.
 */
export interface ZoneBand {
  render: () => ReactNode
  /** The band's surface; absent keeps the header's sidebar surface. */
  surface?: string
}

/** The active pane's band, else the first shown pane that declares one (the
 *  sessions top bar stays put while the Bots tab is active). */
export function zoneBand(
  shown: readonly string[],
  activeId: string,
  paneFor: (id: string) => Contribution | undefined
): ZoneBand | null {
  const owner = [activeId, ...shown].find(id => paneChrome(paneFor(id)).band)
  const chrome = owner ? paneChrome(paneFor(owner)) : null

  return chrome?.band ? { render: chrome.band, surface: chrome.bandSurface } : null
}

/** Band reservations: at least the toolbar gutters, more where window chrome sits. */
export const ZONE_BAND_LEFT = 'max(16px, var(--panel-titlebar-left, 0px))'
export const ZONE_BAND_RIGHT = 'max(12px, var(--panel-titlebar-right, 0px))'

/** The band row. It moves the window; its controls opt out (studio/shell.css). */
export function ZoneBandRow({ band }: { band: ZoneBand }) {
  return (
    <div
      className="flex min-w-0 flex-1 items-center self-start [-webkit-app-region:drag]"
      data-zone-band=""
      style={{ height: TITLEBAR_HEIGHT }}
    >
      <ContribRender render={band.render} />
    </div>
  )
}
