import { compactNumber } from '@hermes/shared'
import type { MouseEvent, ReactNode } from 'react'

import { FormGroup } from '@/app/overlays/studio/form-group'
import { Button } from '@/components/ui/button'
import { SearchField } from '@/components/ui/search-field'
import { Tip } from '@/components/ui/tooltip'
import type { SessionInfo } from '@/hermes'
import { useI18n } from '@/i18n'
import { sessionTitle } from '@/lib/chat-runtime'
import { Archive, Bookmark, BookmarkFilled, Download, Trash2 } from '@/lib/icons'
import { exportSession } from '@/lib/session-export'
import { fmtDateTime } from '@/lib/time'
import { cn } from '@/lib/utils'
import { pinSession, SIDEBAR_SESSIONS_PAGE_SIZE, unpinSession } from '@/store/layout'
import { sessionPinId } from '@/store/session'

import { SidebarLoadMoreRow } from '../chat/sidebar/load-more-row'

import { EmptyPanel } from './empty-panel'

function formatTimestamp(value?: number | null): string {
  if (!value) {
    return ''
  }

  const date = new Date(value * 1000)

  return Number.isNaN(date.getTime()) ? '' : fmtDateTime.format(date)
}

function RowIconButton({
  children,
  className,
  onClick,
  title
}: {
  children: ReactNode
  className?: string
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
  title: string
}) {
  return (
    <Tip label={title}>
      <Button
        aria-label={title}
        className={cn('text-(--ui-text-tertiary) hover:bg-(--ui-hover) hover:text-(--ui-text-primary)', className)}
        onClick={onClick}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        {children}
      </Button>
    </Tip>
  )
}

interface SessionsPanelProps {
  hasMore: boolean
  loadMorePending: boolean
  onArchive?: (sessionId: string) => void
  onDelete: (session: SessionInfo) => void
  onLoadMore?: () => void
  onOpen: (sessionId: string, session?: SessionInfo) => void
  onQueryChange: (query: string) => void
  pinnedIds: readonly string[]
  query: string
  searching: boolean
  sessions: readonly SessionInfo[]
}

/** Sessions: every loaded session, newest first, with pin / export / archive / delete. */
export function SessionsPanel({
  hasMore,
  loadMorePending,
  onArchive,
  onDelete,
  onLoadMore,
  onOpen,
  onQueryChange,
  pinnedIds,
  query,
  searching,
  sessions
}: SessionsPanelProps) {
  const { t } = useI18n()
  const cc = t.commandCenter
  const sys = t.studio.overlays.system

  return (
    <>
      <SearchField
        aria-label={sys.searchSessions}
        containerClassName="w-full shrink-0"
        onChange={onQueryChange}
        placeholder={sys.searchSessions}
        value={query}
        variant="filled"
      />
      {sessions.length === 0 ? (
        <EmptyPanel description={searching ? cc.noResults : cc.noSessions} />
      ) : (
        <FormGroup>
          {sessions.map(session => {
            const pinId = sessionPinId(session)
            const pinned = pinnedIds.includes(pinId)
            const tokens = (session.input_tokens || 0) + (session.output_tokens || 0)

            const meta = [
              formatTimestamp(session.last_active || session.started_at),
              tokens > 0 ? sys.tokens(compactNumber(tokens)) : ''
            ].filter(Boolean)

            return (
              <div
                className="group flex min-h-11 items-center gap-2 px-3.5 py-1.5 shadow-[inset_0_0.5px_0_var(--ui-line)]"
                key={session.id}
              >
                <button
                  className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-[6px] py-0.5 text-left outline-none focus-visible:ring-[0.1875rem] focus-visible:ring-ring/50"
                  onClick={() => onOpen(session.id, session)}
                  type="button"
                >
                  <span className="truncate text-[0.8125rem] font-medium text-(--ui-text-primary)">
                    {sessionTitle(session)}
                  </span>
                  <span className="truncate text-xs text-(--ui-text-tertiary)">{meta.join(' · ')}</span>
                </button>
                <div className="flex shrink-0 items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <RowIconButton
                    onClick={() => (pinned ? unpinSession(pinId) : pinSession(pinId))}
                    title={pinned ? cc.unpinSession : cc.pinSession}
                  >
                    {pinned ? <BookmarkFilled className="size-3.5" /> : <Bookmark className="size-3.5" />}
                  </RowIconButton>
                  <RowIconButton
                    onClick={() => void exportSession(session.id, { session, title: sessionTitle(session) })}
                    title={cc.exportSession}
                  >
                    <Download className="size-3.5" />
                  </RowIconButton>
                  {onArchive && (
                    <RowIconButton onClick={() => onArchive(session.id)} title={sys.archiveSession}>
                      <Archive className="size-3.5" />
                    </RowIconButton>
                  )}
                  <RowIconButton
                    className="hover:text-destructive"
                    onClick={() => onDelete(session)}
                    title={cc.deleteSession}
                  >
                    <Trash2 className="size-3.5" />
                  </RowIconButton>
                </div>
              </div>
            )
          })}
        </FormGroup>
      )}
      {hasMore && onLoadMore && !searching && (
        <div className="flex shrink-0 justify-end">
          <SidebarLoadMoreRow loading={loadMorePending} onClick={onLoadMore} step={SIDEBAR_SESSIONS_PAGE_SIZE} />
        </div>
      )}
    </>
  )
}
