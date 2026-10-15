import { useStore } from '@nanostores/react'
import { useMemo } from 'react'

import { normalizeSessionSource } from '@/lib/session-source'
import { messagingTotalsKey } from '@/store/profile'
import { $messagingPlatformTotals, $messagingTruncated } from '@/store/session'
import type { SessionInfo } from '@/types/hermes'

export interface MessagingPlatformPage {
  sourceId: string
  /** Rows of this platform the client holds. */
  loaded: number
  /** Older threads remain on the backend. */
  hasMore: boolean
}

/**
 * Per-platform paging state for the messaging slice, now that its rows live in
 * the one Sessions list: which platforms still have older threads to fetch. A
 * known per-platform total (once a "load more" resolved it) decides exactly,
 * discounted by the rows the Pinned section shows instead; otherwise a capped
 * seed fetch means "assume more".
 */
export function useMessagingPaging(
  messaging: readonly SessionInfo[],
  messagingProfile: string,
  isPinned: (session: SessionInfo) => boolean
): MessagingPlatformPage[] {
  const totals = useStore($messagingPlatformTotals)
  const truncated = useStore($messagingTruncated)

  return useMemo(() => {
    const loaded = new Map<string, number>()
    const pinned = new Map<string, number>()

    for (const session of messaging) {
      const sourceId = normalizeSessionSource(session.source)

      if (!sourceId) {
        continue
      }

      const counts = isPinned(session) ? pinned : loaded
      counts.set(sourceId, (counts.get(sourceId) ?? 0) + 1)
    }

    return [...new Set([...loaded.keys(), ...pinned.keys()])].map(sourceId => {
      const shown = loaded.get(sourceId) ?? 0
      const known = totals[messagingTotalsKey(messagingProfile, sourceId)]
      const unpinnedKnown = known == null ? null : Math.max(0, known - (pinned.get(sourceId) ?? 0))

      return { hasMore: unpinnedKnown != null ? unpinnedKnown > shown : truncated, loaded: shown, sourceId }
    })
  }, [isPinned, messaging, messagingProfile, totals, truncated])
}
