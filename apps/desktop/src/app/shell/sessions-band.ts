import { SidebarTopBar } from '@/app/chat/sidebar/studio/top-bar'
import { paneChrome } from '@/components/pane-shell/tree/renderer/track-model'
import { registerZoneBand } from '@/components/pane-shell/tree/renderer/zone-band'
import { registry } from '@/contrib/registry'

const hideOnly = (id: string) => paneChrome(registry.getArea('panes').find(pane => pane.id === id)).hideOnly === true

/**
 * Studio's sessions column (prototype `.sb`): its top bar in the band and no
 * SESSIONS | BOTS strip — the sidebar's Bots section is the door to bots. The
 * strip returns only while another side pane (the Bots workspace) is in front,
 * so Sessions stays one click away; a zone that also stacks tiles or tools
 * keeps its strip.
 */
export function sidebarStripPanes(
  shown: readonly string[],
  activeId: string,
  isSideChrome: (id: string) => boolean = hideOnly
): string[] {
  return activeId === 'sessions' && shown.every(isSideChrome) ? [] : [...shown]
}

export function registerSessionsBand() {
  return registerZoneBand({
    Band: SidebarTopBar,
    matches: panes => panes.includes('sessions'),
    stripPanes: (shown, activeId) => sidebarStripPanes(shown, activeId)
  })
}
