import { useStore } from '@nanostores/react'
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'

import { $paletteQuery, $paletteScope, type PaletteExternalItem, setPaletteSource } from '@/app/command-palette/scopes'
import { openSessionFromPicker, openSessionIntentFromModifiers } from '@/app/open-session'
import { useI18n } from '@/i18n'
import { sessionTitle } from '@/lib/chat-runtime'
import { searchResultToSession, stripFtsMarkers } from '@/lib/session-search-merge'
import { $commandPaletteOpen } from '@/store/command-palette'
import { $profileScope } from '@/store/profile'
import { $cronSessions, $messagingSessions, $sessions } from '@/store/session'
import { $removedSessionIds } from '@/store/session-removal'
import type { SessionInfo, SessionSearchResult } from '@/types/hermes'

import { filterSessionsByProfileScope } from '../profile-scope'
import { buildSessionByAnyId } from '../session-index'
import { useServerSessionSearch } from '../use-server-session-search'

const SOURCE_ID = 'sidebar-session-content'
const SNIPPET_LIMIT = 80

function snippet(match: SessionSearchResult): string | undefined {
  const text = stripFtsMarkers(match.snippet ?? '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) {
    return undefined
  }

  return text.length > SNIPPET_LIMIT ? `${text.slice(0, SNIPPET_LIMIT - 1)}…` : text
}

/**
 * The content hits worth listing: every server match, in the backend's ranked
 * order, except a session this window already holds whose TITLE matches — the
 * palette's own session list shows that one.
 */
export function contentMatches(
  query: string,
  matches: readonly SessionSearchResult[],
  byAnyId: ReadonlyMap<string, SessionInfo>
): { match: SessionSearchResult; session: SessionInfo }[] {
  const needle = query.trim().toLocaleLowerCase()
  const seen = new Set<string>()

  return matches.flatMap(match => {
    const loaded = byAnyId.get(match.session_id)
    const session = loaded ?? searchResultToSession(match)

    if (seen.has(session.id) || (loaded && sessionTitle(loaded).toLocaleLowerCase().includes(needle))) {
      return []
    }

    seen.add(session.id)

    return [{ match, session }]
  })
}

/**
 * The sidebar's server full-text session search, answered inside ⌘K through
 * the palette's source seam (command-palette/scopes.ts): registered while the
 * palette is open, so All offers "Search all session content", and in the
 * Sessions & Projects scope it lists the sessions whose content matches the
 * query — ranked by the backend, with the matching snippet.
 */
export function usePaletteSessionSource(): void {
  const { t } = useI18n()
  const navigate = useNavigate()
  const open = useStore($commandPaletteOpen)
  const query = useStore($paletteQuery)
  const scope = useStore($paletteScope)
  const profileScope = useStore($profileScope)
  const sessions = useStore($sessions)
  const messaging = useStore($messagingSessions)
  const cron = useStore($cronSessions)
  const removed = useStore($removedSessionIds)
  // The server search stays idle until the scope is on screen with a query.
  const active = open && scope === 'sessions' ? query.trim() : ''
  const { searchPending, serverMatches } = useServerSessionSearch(active, profileScope)

  const groups = useMemo(() => {
    if (!active || searchPending) {
      return []
    }

    const byAnyId = buildSessionByAnyId(
      filterSessionsByProfileScope(sessions, profileScope),
      filterSessionsByProfileScope(cron, profileScope),
      filterSessionsByProfileScope(messaging, profileScope)
    )

    const items: PaletteExternalItem[] = contentMatches(active, serverMatches, byAnyId)
      .filter(({ session }) => !removed.has(session.id))
      .map(({ match, session }) => ({
        detail: snippet(match),
        glyph: 'bubbles',
        id: session.id,
        keywords: [active],
        label: sessionTitle(session),
        run: event => openSessionFromPicker(session.id, navigate, openSessionIntentFromModifiers(event, 'stack'))
      }))

    return items.length ? [{ heading: t.studio.overlays.palette.contentGroup, items }] : []
  }, [active, cron, messaging, navigate, profileScope, removed, searchPending, serverMatches, sessions, t])

  useEffect(() => setPaletteSource(SOURCE_ID, open ? { groups, scope: 'sessions' } : null), [groups, open])
  useEffect(() => () => setPaletteSource(SOURCE_ID, null), [])
}
