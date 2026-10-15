import { normalizeProfileKey } from '@/store/profile'
import type { SessionInfo } from '@/types/hermes'

import { sessionRecency } from '../projects'

export interface SessionPoolInput {
  /** Local recents (desktop, CLI, TUI…), already scoped to the profile view. */
  local: readonly SessionInfo[]
  /** The messaging slice (Telegram, Slack, webhooks…), scoped likewise. */
  messaging: readonly SessionInfo[]
  /** Scheduled-job runs, scoped likewise. */
  cron: readonly SessionInfo[]
  /** Archived rows — empty unless "Show archived sessions" is on. */
  archived: readonly SessionInfo[]
  /** Rows the Pinned section shows instead (matched on either identity). */
  isPinned: (session: SessionInfo) => boolean
  /** Every narrowing filter (status, source, PR, profile, project, scope). */
  matches: (session: SessionInfo) => boolean
}

const rowKey = (session: SessionInfo) => `${normalizeProfileKey(session.profile)}::${session.id}`

/**
 * The Sessions list as ONE pool (prototype): local chats, messaging threads and
 * scheduled runs side by side, each telling where it came from with its source
 * chip, plus archived rows inline when asked for. The slices are still fetched
 * and paged separately; merging is presentation only.
 *
 * A row appears once per (profile, id) — the live slices win over a stale
 * archived copy — pinned rows stay in Pinned, and the result is newest first.
 */
export function mergeSessionPool({ archived, cron, isPinned, local, matches, messaging }: SessionPoolInput): SessionInfo[] {
  const seen = new Set<string>()
  const out: SessionInfo[] = []

  for (const session of [...local, ...messaging, ...cron, ...archived]) {
    const key = rowKey(session)

    if (seen.has(key)) {
      continue
    }

    seen.add(key)

    if (!isPinned(session) && matches(session)) {
      out.push(session)
    }
  }

  return out.sort((a, b) => sessionRecency(b) - sessionRecency(a))
}
