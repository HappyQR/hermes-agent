import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { OverlayView } from '@/app/overlays/overlay-view'
import { SheetBody, SheetHeader } from '@/app/overlays/studio/sheet-header'
import { SETTINGS_ROUTE } from '@/app/routes'
import { settingsPageSearch } from '@/app/settings/studio/categories'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SegmentedControl } from '@/components/ui/segmented-control'
import type { SessionInfo } from '@/hermes'
import { useI18n } from '@/i18n'
import { sessionTitle } from '@/lib/chat-runtime'
import { triggerHaptic } from '@/lib/haptics'
import { useStoreSelector } from '@/lib/use-session-slice'
import { $pinnedSessionIds } from '@/store/layout'
import { $sessionProfilesTruncated, $sessions } from '@/store/session'

import { MaintenancePanel } from './maintenance'
import { SessionsPanel } from './sessions-panel'
import { SystemPanel } from './system-panel'
import { UsagePanel } from './usage-panel'

export type CommandCenterSection = 'maintenance' | 'sessions' | 'system' | 'usage'

const SECTIONS = ['sessions', 'system', 'usage', 'maintenance'] as const satisfies readonly CommandCenterSection[]

// ⌘. with no deep link lands on 系统 (the prototype's default tab).
const DEFAULT_SECTION: CommandCenterSection = 'system'

// Stable empty arrays so the selector returns the same reference when we're
// not on the Sessions tab — useStoreSelector bails out on Object.is, so the
// sheet never re-renders from $sessions ticks while on System/Usage/etc.
const EMPTY_SESSIONS: readonly never[] = []
const EMPTY_PINNED: readonly string[] = []
const EMPTY_TRUNCATED: Record<string, boolean> = {}

interface CommandCenterViewProps {
  initialSection?: CommandCenterSection
  onClose: () => void
  /** Archive a session (the sidebar's own archive). Omitted → no archive button. */
  onArchiveSession?: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => Promise<void>
  // Accepted for call-site parity; navigation lives in the global Cmd+K palette.
  onNavigateRoute?: (path: string) => void
  onOpenSession: (sessionId: string, session?: SessionInfo) => void
  /** Grows the shared session window (bumpSessionsLimit + refetch), same
   *  mechanism as the sidebar's recents "load more". Renders the Sessions
   *  list's load-more row when the backend page is capped. */
  onLoadMoreSessions?: () => Promise<void> | void
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs)

    return () => window.clearTimeout(id)
  }, [delayMs, value])

  return debounced
}

/**
 * The tab lives in `?section=` (statusbar, gateway menu and toasts deep-link
 * into it). A tab click always writes the param, so re-clicking the active tab
 * after a deep link never flips back to a default; `initialSection` only
 * answers while the URL names none.
 */
function useSection(initialSection: CommandCenterSection | undefined) {
  const [params, setParams] = useSearchParams()
  const fromUrl = SECTIONS.find(value => value === params.get('section'))
  const section = fromUrl ?? initialSection ?? DEFAULT_SECTION

  const setSection = useCallback(
    (next: CommandCenterSection) =>
      setParams(
        previous => {
          const updated = new URLSearchParams(previous)
          updated.set('section', next)

          return updated
        },
        { replace: true }
      ),
    [setParams]
  )

  return [section, setSection] as const
}

/** 系统状态 (former Command Center): a wide sheet with 会话 / 系统 / 用量 / 维护 tabs. */
export function CommandCenterView({
  initialSection,
  onArchiveSession,
  onClose,
  onDeleteSession,
  onLoadMoreSessions,
  onOpenSession
}: CommandCenterViewProps) {
  const { t } = useI18n()
  const cc = t.commandCenter
  const sys = t.studio.overlays.system
  const navigate = useNavigate()
  const [section, setSection] = useSection(initialSection)
  // $sessions ticks on every streaming token: subscribe only on the Sessions tab.
  const sessions = useStoreSelector($sessions, s => (section === 'sessions' ? s : EMPTY_SESSIONS))
  const pinnedSessionIds = useStoreSelector($pinnedSessionIds, s => (section === 'sessions' ? s : EMPTY_PINNED))

  const sessionProfilesTruncated = useStoreSelector($sessionProfilesTruncated, s =>
    section === 'sessions' ? s : EMPTY_TRUNCATED
  )

  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState<SessionInfo | null>(null)
  const [loadMorePending, setLoadMorePending] = useState(false)
  const debouncedQuery = useDebouncedValue(query.trim(), 180)

  const filteredSessions = useMemo(() => {
    const sorted = [...sessions].sort(
      (a, b) => (b.last_active || b.started_at || 0) - (a.last_active || a.started_at || 0)
    )

    const needle = debouncedQuery.toLowerCase()

    return needle ? sorted.filter(s => `${sessionTitle(s)} ${s.id}`.toLowerCase().includes(needle)) : sorted
  }, [debouncedQuery, sessions])

  const onLoadMore = useCallback(async () => {
    if (!onLoadMoreSessions || loadMorePending) {
      return
    }

    setLoadMorePending(true)

    try {
      await Promise.resolve(onLoadMoreSessions())
    } finally {
      setLoadMorePending(false)
    }
  }, [loadMorePending, onLoadMoreSessions])

  const close = () => {
    triggerHaptic('close')
    onClose()
  }

  return (
    <OverlayView
      closeLabel={sys.close}
      onClose={onClose}
      rootClassName="h-[min(42rem,100%)]"
      size="wide"
      variant="sheet"
    >
      <SheetHeader
        closeLabel={sys.close}
        glyph="pulse"
        onClose={close}
        right={
          <SegmentedControl
            aria-label={sys.sectionsLabel}
            onChange={setSection}
            options={SECTIONS.map(value => ({ id: value, label: cc.sections[value] }))}
            size="sm"
            value={section}
          />
        }
        subtitle={sys.subtitle}
        title={sys.title}
        tone="green"
      />
      <SheetBody key={section}>
        {section === 'sessions' ? (
          <SessionsPanel
            hasMore={Object.values(sessionProfilesTruncated).some(Boolean)}
            loadMorePending={loadMorePending}
            onArchive={onArchiveSession}
            onDelete={setPendingDelete}
            onLoadMore={onLoadMoreSessions ? () => void onLoadMore() : undefined}
            onOpen={onOpenSession}
            onQueryChange={setQuery}
            pinnedIds={pinnedSessionIds}
            query={query}
            searching={Boolean(debouncedQuery)}
            sessions={filteredSessions}
          />
        ) : section === 'usage' ? (
          <UsagePanel />
        ) : section === 'maintenance' ? (
          <MaintenancePanel onManageMemory={() => navigate(`${SETTINGS_ROUTE}${settingsPageSearch('memory')}`)} />
        ) : (
          <SystemPanel />
        )}
      </SheetBody>
      {pendingDelete && (
        <ConfirmDialog
          busyLabel={t.sidebar.row.deleting}
          confirmLabel={t.common.delete}
          description={t.sidebar.row.deleteDesc(sessionTitle(pendingDelete))}
          destructive
          doneLabel={t.sidebar.row.deleted}
          onClose={() => setPendingDelete(null)}
          onConfirm={() => void onDeleteSession(pendingDelete.id)}
          open
          title={t.sidebar.row.deleteTitle}
        />
      )}
    </OverlayView>
  )
}
