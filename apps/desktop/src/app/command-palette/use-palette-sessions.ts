import { useStore } from '@nanostores/react'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { listAllProfileSessions } from '@/hermes'
import { sessionTitle } from '@/lib/chat-runtime'
import { $pinnedSessionIds } from '@/store/layout'
import { $cronSessions, $messagingSessions, $sessions } from '@/store/session'
import { $unconfirmedPinWrites } from '@/store/session-pin-sync'
import { $removedSessionIds } from '@/store/session-removal'

import { buildSessionByAnyId, resolvePinnedSessions } from '../chat/sidebar/session-index'

export interface SessionEntry {
  git_branch?: null | string
  id: string
  /** Unix seconds of the last activity — the recent rows' age note. */
  lastActive?: number
  preview?: string
  title: string
}

type SessionRow = Awaited<ReturnType<typeof listAllProfileSessions>>['sessions'][number]

const RECENT_COUNT = 5

const toSessionEntry = (session: SessionRow): SessionEntry => ({
  git_branch: session.git_branch ?? null,
  id: session.id,
  lastActive: session.last_active,
  preview: session.preview ?? undefined,
  title: sessionTitle(session)
})

/**
 * The palette's session lists: the recent-200 page (minus pins), the pinned
 * set, the archived page, and the five most recent rows for the ⌘K landing.
 *
 * This hook only runs while the palette is open, so the queries are inherently
 * lazy. staleTime 0 (not the 60s client default): renames, pins, and archives
 * happen in the sidebar while the palette is unmounted, so nothing can
 * invalidate these keys — every open must revalidate. The cached page still
 * paints instantly; the live-store overlay below covers the gap.
 */
export function usePaletteSessions() {
  const sessionsQuery = useQuery({
    queryKey: ['command-palette', 'sessions'],
    queryFn: () => listAllProfileSessions(200, 1, 'exclude'),
    staleTime: 0
  })

  const archivedQuery = useQuery({
    queryKey: ['command-palette', 'archived'],
    queryFn: () => listAllProfileSessions(200, 0, 'only'),
    staleTime: 0
  })

  const liveSessions = useStore($sessions)
  const liveCronSessions = useStore($cronSessions)
  const liveMessagingSessions = useStore($messagingSessions)
  const pinnedSessionIds = useStore($pinnedSessionIds)
  const unconfirmedPinWrites = useStore($unconfirmedPinWrites)
  const removedSessionIds = useStore($removedSessionIds)

  // The sidebar's stores are where a rename / pin / archive lands first (the
  // server page confirms later). Overlay them on the fetched 200-row page so
  // the palette says what the sidebar says: same title, same pin, and no row
  // the user just archived or deleted.
  const liveRows = useMemo(() => {
    const byId = new Map(
      [...liveCronSessions, ...liveMessagingSessions, ...liveSessions].map(row => [row.id, row] as const)
    )

    return (sessionsQuery.data?.sessions ?? [])
      .filter(session => !removedSessionIds.has(session.id))
      .map(session => {
        const live = byId.get(session.id)

        return live ? { ...session, pinned: live.pinned, title: live.title } : session
      })
  }, [liveCronSessions, liveMessagingSessions, liveSessions, removedSessionIds, sessionsQuery.data])

  // Same resolution as the sidebar's Pinned section: local pin order first,
  // then server-flagged pins, minus our own in-flight unpins.
  const pinnedSessions = useMemo(() => {
    const byAnyId = buildSessionByAnyId(liveRows, [], [])

    return resolvePinnedSessions(pinnedSessionIds, byAnyId, liveRows, unconfirmedPinWrites).map(toSessionEntry)
  }, [liveRows, pinnedSessionIds, unconfirmedPinWrites])

  const sessions = useMemo(() => {
    const pinned = new Set(pinnedSessions.map(session => session.id))

    return liveRows.filter(session => !pinned.has(session.id)).map(toSessionEntry)
  }, [liveRows, pinnedSessions])

  const recentSessions = useMemo(
    () =>
      [...liveRows]
        .sort((a, b) => (b.last_active ?? 0) - (a.last_active ?? 0))
        .slice(0, RECENT_COUNT)
        .map(toSessionEntry),
    [liveRows]
  )

  const archivedSessions = useMemo(() => (archivedQuery.data?.sessions ?? []).map(toSessionEntry), [archivedQuery.data])

  return { archivedSessions, pinnedSessions, recentSessions, sessions }
}
