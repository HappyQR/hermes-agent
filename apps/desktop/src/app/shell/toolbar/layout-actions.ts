import { requestCloseSessionTile } from '@/app/chat/session-tile'
import { $selectedStoredSessionId, $sessions } from '@/store/session'
import { $sessionTiles, openSessionTile } from '@/store/session-states'

/** "Single pane" (Layout ▾ and View › Layout): close the split tiles — quiet
 *  ones at once, a busy one through the tab ✕'s own confirmation. */
export function closeSplitTiles() {
  for (const tile of $sessionTiles.get()) {
    requestCloseSessionTile(tile.storedSessionId)
  }
}

/** Recent chats not already on screen (main or a tile), newest first. */
export function splitCandidates(limit: number) {
  const open = new Set([$selectedStoredSessionId.get(), ...$sessionTiles.get().map(tile => tile.storedSessionId)])

  return $sessions
    .get()
    .filter(session => !open.has(session.id))
    .slice(0, limit)
}

/** "Split side by side": open a chat beside the current one (the most
 *  recent other chat when none is named). */
export function openSplit(storedSessionId?: string) {
  const id = storedSessionId ?? splitCandidates(1)[0]?.id

  if (id) {
    openSessionTile(id, 'right')
  }
}
