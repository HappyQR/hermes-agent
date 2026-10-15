import { useStore } from '@nanostores/react'
import { useMemo } from 'react'

import { useI18n } from '@/i18n'
import { sessionTitle } from '@/lib/chat-runtime'
import { type IconComponent, MessageCircle } from '@/lib/icons'
import { mergeSearchResults } from '@/lib/session-search-merge'
import { $profileScope } from '@/store/profile'
import { $cronSessions, $messagingSessions, $sessions } from '@/store/session'
import { $removedSessionIds } from '@/store/session-removal'
import type { SessionInfo } from '@/types/hermes'

import { filterSessionsByProfileScope } from '../chat/sidebar/profile-scope'
import { sessionRecency } from '../chat/sidebar/projects'
import { buildSessionByAnyId } from '../chat/sidebar/session-index'
import { useServerSessionSearch } from '../chat/sidebar/use-server-session-search'

type SelectMods = { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }

/** Structurally a palette item (see `PaletteItem` in ./index.tsx). */
export interface SessionsScopeItem {
  detail?: string
  icon: IconComponent
  id: string
  label: string
  runWithEvent: (event?: SelectMods) => void
}

export interface SessionsScope {
  /** The rows arrive ranked (the server's FTS order); the palette must not re-rank them. */
  groups: { heading: string; items: SessionsScopeItem[] }[]
  pending: boolean
}

const RECENT_LIMIT = 30
const SNIPPET_LIMIT = 72

function snippet(session: SessionInfo): string | undefined {
  const text = session.preview?.replace(/\s+/g, ' ').trim()

  if (!text) {
    return undefined
  }

  return text.length > SNIPPET_LIMIT ? `${text.slice(0, SNIPPET_LIMIT - 1)}…` : text
}

/**
 * ⌘K "Sessions" scope (the sidebar's search button, ⇧⌘F): full-text search
 * across every session on the backend, merged with the rows this window has
 * loaded. An empty query lists the most recent sessions. `query` is null while
 * the scope is not on screen, which keeps the server search idle.
 */
export function useSessionsScope(query: null | string, open: (sessionId: string) => (event?: SelectMods) => void) {
  const { t } = useI18n()
  const profileScope = useStore($profileScope)
  const sessions = useStore($sessions)
  const messaging = useStore($messagingSessions)
  const cron = useStore($cronSessions)
  const removed = useStore($removedSessionIds)
  const trimmed = query?.trim() ?? ''
  const { searchPending, serverMatches } = useServerSessionSearch(trimmed, profileScope)

  const pool = useMemo(() => {
    const scoped = [sessions, messaging, cron].flatMap(slice => filterSessionsByProfileScope(slice, profileScope))

    return scoped.filter(session => !removed.has(session.id)).sort((a, b) => sessionRecency(b) - sessionRecency(a))
  }, [cron, messaging, profileScope, removed, sessions])

  return useMemo<SessionsScope>(() => {
    if (query === null) {
      return { groups: [], pending: false }
    }

    const byAnyId = buildSessionByAnyId(sessions, cron, messaging)
    const loadedIds = new Set(pool.map(session => session.id))

    const rows = trimmed
      ? mergeSearchResults(pool, trimmed, serverMatches, byAnyId, searchPending)
      : pool.slice(0, RECENT_LIMIT)

    const items = rows.map(session => ({
      // A content hit outside the loaded page shows WHY it matched.
      detail: loadedIds.has(session.id) ? undefined : snippet(session),
      icon: MessageCircle,
      id: `session-scope-${session.profile ?? ''}-${session.id}`,
      label: sessionTitle(session),
      runWithEvent: open(session.id)
    }))

    const heading = trimmed ? t.sidebar.results : t.studio.sidebar.palette.recent

    return { groups: items.length ? [{ heading, items }] : [], pending: Boolean(trimmed) && searchPending }
  }, [cron, messaging, open, pool, query, searchPending, serverMatches, sessions, t, trimmed])
}
