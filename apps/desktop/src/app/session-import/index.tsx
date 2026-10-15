import {
  type InfiniteData,
  useInfiniteQuery,
  type UseInfiniteQueryResult,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import { MarkdownTextContent } from '@/components/assistant-ui/markdown-text'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Loader } from '@/components/ui/loader'
import { SearchField } from '@/components/ui/search-field'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { setSessionOwnerHint } from '@/store/session'
import type { SessionOwnerRoute } from '@/store/session-request-router'

import { OverlayView } from '../overlays/overlay-view'
import { PanelEmpty } from '../overlays/panel'
import { SheetFooter, SheetHeader } from '../overlays/studio/sheet-header'
import { CARD_SURFACE_CLASS } from '../overlays/studio/stat-card'

import { type ForeignImportResult, type ForeignPage, type ForeignPreview, foreignRequest } from './api'

interface SessionImportViewProps {
  owner: SessionOwnerRoute
  onClose: () => void
  onOpenSession: (id: string) => void
}

export function SessionImportView({ owner, onClose, onOpenSession }: SessionImportViewProps) {
  const { t, locale } = useI18n()
  const copy = t.sessionImport
  const studio = t.studio.overlays.import
  const queryClient = useQueryClient()
  const [source, setSource] = useState<'all' | 'claude' | 'codex'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const lifetime = useRef<AbortController | null>(null)
  // eslint-disable-next-line no-restricted-syntax -- lifetime cancellation, not a mirrored reactive value
  useEffect(() => {
    const controller = new AbortController()
    lifetime.current = controller

    return () => controller.abort()
  }, [])
  const scope = [owner.connectionId, owner.profile]

  const sessions = useInfiniteQuery({
    queryKey: ['foreign-sessions', ...scope, source],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      foreignRequest<ForeignPage>(
        owner,
        'list',
        {
          source: source === 'all' ? null : source,
          offset: pageParam
        },
        signal
      ),
    getNextPageParam: page => page.next_offset,
    retry: false
  })

  const rows = [
    ...new Map((sessions.data?.pages.flatMap(page => page.sessions) ?? []).map(row => [row.id, row])).values()
  ]

  const visible = rows.filter(row =>
    `${row.title} ${row.cwd ?? ''} ${row.excerpt}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  )

  const current = rows.find(row => row.id === selected)

  const preview = useQuery({
    queryKey: ['foreign-preview', ...scope, selected],
    queryFn: ({ signal }) => foreignRequest<ForeignPreview>(owner, 'preview', { id: selected }, signal),
    enabled: Boolean(current),
    retry: false
  })

  const host = sessions.data?.pages[0]?.host
  const unreadable = sessions.data?.pages.reduce((sum, page) => sum + page.unreadable, 0) ?? 0

  async function continueSession() {
    if (!current || pending) {
      return
    }

    const signal = lifetime.current?.signal
    setPending(true)
    setError('')

    try {
      const result = await foreignRequest<ForeignImportResult>(owner, 'import', { id: current.id }, signal)
      setSessionOwnerHint(result.session_id, owner)
      void queryClient.invalidateQueries({ queryKey: ['foreign-preview', ...scope] })
      void queryClient.invalidateQueries({ queryKey: ['sessions'] })

      if (!signal?.aborted) {
        onOpenSession(result.session_id)
      }
    } catch (cause) {
      if (!signal?.aborted) {
        setError(cause instanceof Error ? cause.message : copy.importError)
      }
    } finally {
      if (!signal?.aborted) {
        setPending(false)
      }
    }
  }

  const profileName = owner.targetProfile ?? owner.profile

  return (
    <OverlayView onClose={onClose} rootClassName="h-[min(40rem,100%)]" size="wide" variant="sheet">
      <section aria-label={copy.title} className="session-import flex min-h-0 flex-1 flex-col">
        <SheetHeader
          closeLabel={t.common.close}
          glyph="import"
          onClose={onClose}
          right={
            <Button
              aria-label={t.common.refresh}
              className="size-7 text-(--ui-text-tertiary) hover:bg-(--ui-hover) hover:text-(--ui-text-primary)"
              disabled={sessions.isFetching}
              onClick={() => {
                void sessions.refetch()

                if (current) {
                  void preview.refetch()
                }
              }}
              size="icon-sm"
              variant="ghost"
            >
              <StudioIcon name="retry" size={14} />
            </Button>
          }
          subtitle={studio.subtitle(host ?? copy.connectedComputer)}
          title={copy.title}
          tone="blue"
        />
        <div className="flex min-h-0 flex-1 gap-3.5 px-[1.125rem] pb-1 pt-1">
          <aside className={cn('flex w-[15.625rem] shrink-0 flex-col gap-1.5 max-[760px]:w-full', selected && 'max-[760px]:hidden')}>
            <SegmentedControl
              aria-label={studio.sourceLabel}
              onChange={value => {
                setSource(value)
                setSelected(null)
                setError('')
              }}
              options={[
                { id: 'all', label: copy.all },
                { id: 'claude', label: 'Claude Code' },
                { id: 'codex', label: 'Codex' }
              ]}
              size="sm"
              value={source}
            />
            {rows.length > 0 && (
              <SearchField
                aria-label={copy.search}
                containerClassName="w-full shrink-0"
                onChange={setSearch}
                placeholder={copy.search}
                value={search}
                variant="filled"
              />
            )}
            <ImportList
              onPick={id => {
                setSelected(id)
                setError('')
              }}
              rows={visible}
              searching={Boolean(search)}
              selected={selected}
              sessions={sessions}
              unreadable={unreadable}
            />
          </aside>
          <main
            className={cn(
              'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-3.5 py-3',
              CARD_SURFACE_CLASS,
              !selected && 'max-[760px]:hidden'
            )}
          >
            {!current ? (
              <PanelEmpty description={copy.chooseHelp} icon="comment-discussion" title={copy.choose} />
            ) : (
              <>
                <div className="hidden pb-2 max-[760px]:block">
                  <Button onClick={() => setSelected(null)} size="sm" variant="ghost">
                    {t.common.back}
                  </Button>
                </div>
                <div aria-live="polite" className="min-h-0 flex-1 overflow-y-auto" key={current.id}>
                  {preview.isPending && <Loader className="mx-auto my-12" label={copy.previewLoading} />}
                  {preview.isError && (
                    <ErrorState description={copy.previewHelp} title={copy.previewError}>
                      <Button onClick={() => void preview.refetch()} variant="secondary">
                        {t.common.retry}
                      </Button>
                    </ErrorState>
                  )}
                  {preview.data && (
                    <div className="flex flex-col gap-3 text-[0.8125rem] leading-[1.6]">
                      {preview.data.truncated && (
                        <p className="m-0 text-xs text-(--ui-text-tertiary)">{copy.previewLimit}</p>
                      )}
                      {preview.data.messages.map((message, index) => (
                        <article className="min-w-0" key={index}>
                          <p className="m-0 font-semibold text-(--ui-text-primary)">
                            {message.role === 'user' ? copy.you : current.label}
                          </p>
                          <div className="wrap-anywhere text-(--ui-text-primary)">
                            <MarkdownTextContent isRunning={false} previewOnly text={message.content} />
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2.5 flex shrink-0 gap-2.5 rounded-[10px] bg-(--ui-accent-softer) px-3 py-2.5 text-xs leading-relaxed text-(--ui-text-secondary)">
                  <StudioIcon className="mt-0.5 text-(--ui-accent-text)" name="info" size={15} />
                  <span>{preview.data?.already_imported ? copy.snapshot : copy.copyNotice}</span>
                </div>
              </>
            )}
          </main>
        </div>
        <SheetFooter>
          <span className="truncate text-xs text-(--ui-text-tertiary)">{studio.importInto(profileName)}</span>
          <span className="flex-1" />
          {error && (
            <span className="min-w-0 truncate text-xs text-destructive" role="alert">
              {copy.importError} {error}
            </span>
          )}
          <Button onClick={onClose} size="sm" variant="secondary">
            {t.common.cancel}
          </Button>
          <Button
            disabled={!current || pending || !preview.data || preview.isError}
            onClick={() => void continueSession()}
            size="sm"
          >
            {pending ? copy.importing : preview.data?.already_imported ? copy.open : copy.continue}
          </Button>
        </SheetFooter>
      </section>
    </OverlayView>
  )
}

type ForeignSessionsQuery = UseInfiniteQueryResult<InfiniteData<ForeignPage>>

/** The left column: loading / error / empty states, date-grouped rows, skipped note and Load more. */
function ImportList({
  onPick,
  rows,
  searching,
  selected,
  sessions,
  unreadable
}: {
  onPick: (id: string) => void
  rows: ForeignPage['sessions']
  searching: boolean
  selected: null | string
  sessions: ForeignSessionsQuery
  unreadable: number
}) {
  const { t, locale } = useI18n()
  const copy = t.sessionImport

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain">
      {sessions.isPending && <Loader className="mx-auto my-12" label={copy.scanning} />}
      {sessions.isError && (
        <ErrorState className="p-5" description={copy.scanHelp} title={copy.scanError}>
          <Button onClick={() => void sessions.refetch()} variant="secondary">
            {t.common.retry}
          </Button>
        </ErrorState>
      )}
      {!sessions.isPending && !sessions.isError && rows.length === 0 && (
        <div className="p-3">
          <EmptyState
            description={searching ? copy.searchHelp : copy.emptyHelp}
            title={searching ? copy.noMatches : copy.empty}
          />
        </div>
      )}
      {rows.map((row, index) => {
        const date = new Date(row.mtime * 1000).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
        const previous = rows[index - 1]

        const newDate =
          !previous ||
          new Date(previous.mtime * 1000).toDateString() !== new Date(row.mtime * 1000).toDateString()

        return (
          <div key={row.id}>
            {newDate && (
              <p className="m-0 px-1 pb-1 pt-2 text-[0.6875rem] font-semibold text-(--ui-text-tertiary)">{date}</p>
            )}
            <button
              aria-pressed={selected === row.id}
              className={cn(
                'flex w-full cursor-pointer flex-col gap-0.5 rounded-[9px] px-2.5 py-[7px] text-start transition-colors hover:bg-(--ui-hover) focus-visible:outline-2 focus-visible:outline-(--ui-accent)',
                selected === row.id && 'bg-(--ui-selected) hover:bg-(--ui-selected)'
              )}
              onClick={() => onPick(row.id)}
              type="button"
            >
              <span className="line-clamp-2 text-[0.8125rem] font-semibold leading-5 text-(--ui-text-primary)">
                {row.title}
              </span>
              <span className="block truncate text-[0.71875rem] leading-4 text-(--ui-text-tertiary)">
                {row.label} · {row.turn_count} {copy.messages}
                {row.cwd || row.excerpt ? ` · ${row.cwd || row.excerpt}` : ''}
              </span>
            </button>
          </div>
        )
      })}
      {unreadable > 0 && <p className="m-0 px-1 py-3 text-xs text-(--ui-text-tertiary)">{copy.skipped}</p>}
      {sessions.hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            disabled={sessions.isFetchingNextPage}
            onClick={() => void sessions.fetchNextPage()}
            size="sm"
            variant="ghost"
          >
            {copy.more}
          </Button>
        </div>
      )}
    </div>
  )
}
