import { useStore } from '@nanostores/react'
import { memo } from 'react'
import type * as React from 'react'

import { startSessionDrag } from '@/app/chat/session-drag'
import { openSession } from '@/app/open-session'
import { Button } from '@/components/ui/button'
import { RowButton } from '@/components/ui/row-button'
import { StudioIcon } from '@/components/ui/studio-icon'
import { OverflowTip } from '@/components/ui/tooltip'
import type { SessionInfo } from '@/hermes'
import { useI18n } from '@/i18n'
import { sessionTitle } from '@/lib/chat-runtime'
import { pathLeaf } from '@/lib/display-path'
import { triggerHaptic } from '@/lib/haptics'
import { middleClickHandlers } from '@/lib/middle-click'
import { displayModelName } from '@/lib/model-status-label'
import { sessionProjectLabel } from '@/lib/session-project-label'
import { SESSION_ROW_AREAS } from '@/lib/session-row-slots'
import { useStoreSelector } from '@/lib/use-session-slice'
import { cn } from '@/lib/utils'
import { $sidebarRowMeta } from '@/store/layout'
import { $projects } from '@/store/projects'
import { sessionPinId } from '@/store/session'
import { $sessionDotStateById, hasLiveTurn } from '@/store/session-dot-state'
import { $sessionListDensity } from '@/store/session-list-density'
import { $openStoredSessionIds } from '@/store/session-states'
import { $todoProgressBySession } from '@/store/todos'

import {
  SIDEBAR_ROW_CARD_MIN_H,
  SIDEBAR_TRUNCATED_LEADING,
  SidebarRowCluster,
  SidebarRowLabel,
  SidebarRowShell
} from './chrome'
import { shellOwnsPress } from './reorderable-list'
import { SessionActionsMenu, SessionContextMenu } from './session-actions-menu'
import { resolveSessionRowClick } from './session-row-gesture'
import {
  armMarquee,
  disarmMarquee,
  KEBAB_YIELDS,
  SessionRowBadges,
  SessionRowLead,
  SessionRowStem,
  SessionRowTitle,
  TAIL_HIDES,
  useSessionRowTrailing
} from './session-row-parts'
import { SessionRowSlot } from './session-row-slots'
import { useProfilePrewarm } from './use-profile-prewarm'

interface SidebarSessionRowProps extends React.ComponentProps<'div'> {
  session: SessionInfo
  /** TUI-style tree stem for branched sessions (`└─ ` / `├─ `). */
  branchStem?: string
  isPinned: boolean
  isSelected: boolean
  /** Backend-derived read state — same value the lead paints. */
  unread: boolean
  onArchive: () => void
  onBranch?: () => void
  onDelete: () => void
  onPin: () => void
  /** Toggle the persisted read-state watermark. */
  onToggleUnread: () => void
  onResume: () => void
  reorderable?: boolean
  dragging?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
  /** Tag the row with its owning profile (initial chip + tooltip). Used by
   *  flat cross-profile lists — Pinned and search results in the All-profiles
   *  view — where no group header communicates ownership (#66003). */
  showProfile?: boolean
  /** Inbox-style card: workspace header, title + last-message preview, and a
   *  model · size footer. */
  card?: boolean
}

/** Modifier-click gestures on a row (see `resolveSessionRowClick`):
 *  ⇧ pin · ⌘/⌃ new tab · ⌘/⌃+⇧ own window · ⌥+⇧ archive; a plain click
 *  resumes. `openSession`'s 'window' intent falls back to 'tab' when the
 *  bridge lacks standalone windows, so the window action is always offered. */
function handleRowClick(
  event: React.MouseEvent,
  session: SessionInfo,
  { onArchive, onPin, onResume }: Pick<SidebarSessionRowProps, 'onArchive' | 'onPin' | 'onResume'>
) {
  const action = resolveSessionRowClick(event, { canOpenWindow: true })

  if (action === 'resume') {
    onResume()

    return
  }

  event.preventDefault()
  event.stopPropagation()
  triggerHaptic('selection')

  if (action === 'archive') {
    onArchive()
  } else if (action === 'pin') {
    onPin()
  } else {
    openSession(session.id, () => undefined, action === 'newTab' ? 'tab' : 'window')
  }
}

function SidebarSessionRowImpl({
  session,
  branchStem,
  isPinned,
  isSelected,
  unread,
  onArchive,
  onBranch,
  onDelete,
  onPin,
  onToggleUnread,
  onResume,
  reorderable = false,
  dragging = false,
  dragHandleProps,
  showProfile = false,
  card = false,
  className,
  style,
  ref,
  ...rest
}: SidebarSessionRowProps) {
  const { t } = useI18n()
  const r = t.sidebar.row
  const { cancelPrewarm, notePointerMove, startPrewarm } = useProfilePrewarm(session.profile)
  const title = sessionTitle(session)
  const density = useStore($sessionListDensity)
  const handleLabel = `Reorder ${title}`
  const rowMeta = useStore($sidebarRowMeta)
  const { chipEndsSlot, pr, trailing } = useSessionRowTrailing(session, { card, showProfile })
  // Open in a pane, but not the focused one. A selector rather than a prop:
  // it reaches all four row render paths at once, and the boolean bails every
  // unaffected row out.
  const openUnfocused = useStoreSelector($openStoredSessionIds, open => !isSelected && open.has(session.id))
  // The same resolved state the lead paints. A selector: the map is rebuilt
  // whenever any session's status changes, but a row only repaints on its own.
  const dotState = useStoreSelector($sessionDotStateById, states => states[session.id] ?? 'idle')
  const liveTurn = hasLiveTurn(dotState)

  // Card header line: the project (same resolver the session color reads), else
  // the bare cwd leaf, else the synthetic "Home". A selector: only rows whose
  // own label changes repaint on the tree poll; one-line rows select null.
  const context = useStoreSelector($projects, projects =>
    card ? (sessionProjectLabel(session, projects) ?? (pathLeaf(session.cwd) || t.sidebar.projects.home)) : null
  )

  // Card footer: model, size and live plan progress ("3/7").
  const model = card && session.model ? displayModelName(session.model) : ''
  const size = card && session.message_count > 0 ? r.messageCount(session.message_count) : ''
  const todoProgress = useStoreSelector($todoProgressBySession, progress => (card ? progress[session.id] : undefined))

  // The trailing metadata sits in normal flow and the kebab lifts out of it,
  // so this cluster's intrinsic width IS the metadata's. In the one-line row it
  // rides the shell's `auto` actions column; in the card it renders INSIDE the
  // header row so the lines below span the card's full width.
  const actionsNode = (
    <div
      className="relative z-2 flex shrink-0 items-center justify-end gap-1"
      data-row-actions
      // Radix portals the menu content, but React still bubbles its events
      // through this logical parent (#85163): in card mode this cluster sits
      // inside the row body whose onClick resumes. Every action owns its
      // gesture instead of inheriting row resume/drag semantics.
      onClick={event => event.stopPropagation()}
      onPointerDown={event => event.stopPropagation()}
    >
      {trailing.map(({ key, node }, index) => (
        <span
          className={
            chipEndsSlot && index === trailing.length - 1 ? cn('inline-flex justify-end', TAIL_HIDES) : undefined
          }
          key={key}
        >
          {node}
        </span>
      ))}
      <SessionActionsMenu
        archived={Boolean(session.archived)}
        onArchive={onArchive}
        onBranch={onBranch}
        onDelete={onDelete}
        onPin={onPin}
        onToggleUnread={onToggleUnread}
        pinned={isPinned}
        profile={session.profile}
        sessionId={session.id}
        title={title}
        unread={unread}
      >
        <Button
          aria-label={r.sessionActions}
          className={cn(
            'size-5.5 rounded-[6px] bg-transparent text-transparent transition-colors duration-100 hover:bg-(--ui-press) hover:text-foreground focus-visible:bg-(--ui-press) focus-visible:text-foreground focus-visible:ring-0 data-[state=open]:bg-(--ui-press) data-[state=open]:text-foreground group-hover:text-(--ui-text-secondary)',
            trailing.length > 0 && 'absolute right-0',
            pr && KEBAB_YIELDS
          )}
          size="icon"
          variant="ghost"
        >
          <StudioIcon name="more" size={14} />
        </Button>
      </SessionActionsMenu>
    </div>
  )

  const leadNode = (
    <SessionRowLead
      dragging={dragging}
      dragHandleProps={dragHandleProps}
      handleLabel={handleLabel}
      reorderable={reorderable && !branchStem}
      session={session}
    />
  )

  return (
    <SessionContextMenu
      archived={Boolean(session.archived)}
      onArchive={onArchive}
      onBranch={onBranch}
      onDelete={onDelete}
      onPin={onPin}
      onToggleUnread={onToggleUnread}
      pinned={isPinned}
      profile={session.profile}
      sessionId={session.id}
      title={title}
      unread={unread}
    >
      <SidebarRowShell
        actions={card ? undefined : actionsNode}
        className={cn(
          'group row-hover relative',
          // The row stays lit while its ⋯ or right-click menu is open.
          'data-[state=open]:bg-(--ui-row-hover-background) has-[[data-state=open]]:bg-(--ui-row-hover-background)',
          card && SIDEBAR_ROW_CARD_MIN_H,
          !card && density === 'compact' && 'min-h-[1.625rem]',
          isSelected && 'bg-(--ui-row-active-background)',
          // Open in another pane: the SAME band, just weaker.
          openUnfocused && 'bg-(--ui-row-open-background)',
          liveTurn && 'text-foreground',
          // Opaque surface while lifted so the dragged row erases what's under it.
          dragging && 'z-10 cursor-grabbing bg-(--ui-sidebar-surface-background)',
          className
        )}
        data-glass-opaque={dragging ? '' : undefined}
        data-working={liveTurn ? 'true' : undefined}
        // The row runs BOTH drags off one press, and each declines outside its
        // own region — so neither can steal the other's gesture.
        onPointerDown={event => {
          // The rename dialog and the ⋯ menu portal out of this row's React
          // subtree, so their presses land here with a target outside the row.
          if (!shellOwnsPress(event)) {
            return
          }

          // The grabber already carries these listeners; the ⋯ cluster keeps its own.
          if ((event.target as HTMLElement).closest('[data-reorder-handle], [data-row-actions]')) {
            return
          }

          // A POINTER drag on the shared drag session (never native HTML5 DnD).
          // Sub-threshold releases stay ordinary clicks.
          startSessionDrag({ id: session.id, profile: session.profile || 'default', title }, event)
          dragHandleProps?.onPointerDown?.(event)
        }}
        // Cross-profile hover pre-warms that backend; the dwell starts on a real
        // pointermove, not on enter — see useProfilePrewarm (#100548).
        onPointerEnter={startPrewarm}
        onPointerLeave={cancelPrewarm}
        onPointerMove={notePointerMove}
        ref={ref}
        style={style}
        {...rest}
      >
        {/* #38072 finding 3: the row's body is a DIV, not a button — the
            reorder grabber and the ⋯ trigger are SIBLINGS of the row's primary
            action (the title's RowButton), never nested inside it. */}
        <SidebarRowCluster
          className={cn(
            // cursor-pointer: the body is a div (see #38072 note above).
            'z-0 w-full cursor-pointer',
            card && 'pr-0',
            branchStem && 'pl-3.5',
            // The card is a grid with ONE spacing knob: --card-gap.
            card && 'flex-col items-stretch justify-center py-1.5 [--card-gap:0.4rem] gap-(--card-gap)'
          )}
          // Middle-click = open in a new tab (browser muscle memory).
          {...middleClickHandlers(() => {
            triggerHaptic('selection')
            openSession(session.id, () => undefined, 'tab')
          })}
          onClick={event => handleRowClick(event, session, { onArchive, onPin, onResume })}
        >
          {card ? (
            <>
              {/* Header row — ONE div: lead, context, then the time/kebab
                  cluster in flow at its right edge. */}
              <div className="flex min-w-0 items-center gap-1.5">
                {leadNode}
                {branchStem ? <SessionRowStem /> : null}
                <SessionRowSlot area={SESSION_ROW_AREAS.leading} sessionId={sessionPinId(session)} />
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-[0.6875rem] text-(--ui-text-tertiary)',
                    SIDEBAR_TRUNCATED_LEADING
                  )}
                >
                  {context}
                </span>
                <SessionRowBadges session={session} />
                <SessionRowSlot area={SESSION_ROW_AREAS.trailing} sessionId={sessionPinId(session)} />
                {actionsNode}
              </div>
              {/* Title + preview: ONE grouped cell with its own tight gap. */}
              <div className="flex min-w-0 flex-col gap-[0.15rem]">
                <RowButton className="block w-full text-left">
                  <OverflowTip label={title} placement="row">
                    <SidebarRowLabel
                      className={cn(
                        'hover-marquee text-[0.8125rem] text-(--ui-text-primary)',
                        unread ? 'font-semibold' : 'font-medium',
                        SIDEBAR_TRUNCATED_LEADING
                      )}
                      onPointerEnter={armMarquee}
                      onPointerLeave={disarmMarquee}
                    >
                      <span className="hover-marquee-inner">{title}</span>
                    </SidebarRowLabel>
                  </OverflowTip>
                </RowButton>
                {session.preview && rowMeta.includes('preview') ? (
                  <span
                    className={cn(
                      'min-w-0 truncate text-[0.6875rem] text-(--ui-text-quaternary)',
                      SIDEBAR_TRUNCATED_LEADING
                    )}
                  >
                    {session.preview}
                  </span>
                ) : null}
              </div>
              {model || size || todoProgress ? (
                <span
                  className={cn(
                    'flex min-w-0 items-baseline gap-2 text-[0.6875rem] text-(--ui-text-tertiary)',
                    SIDEBAR_TRUNCATED_LEADING
                  )}
                >
                  {model ? <span className="min-w-0 truncate">{model}</span> : null}
                  {size ? <span className="shrink-0 tabular-nums">{size}</span> : null}
                  {todoProgress ? (
                    <span className="ml-auto shrink-0 tabular-nums" title={r.todoProgress}>
                      {todoProgress}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </>
          ) : (
            <>
              {leadNode}
              {branchStem ? <SessionRowStem /> : null}
              <SessionRowSlot area={SESSION_ROW_AREAS.leading} sessionId={sessionPinId(session)} />
              <SessionRowTitle detailed={density === 'detailed'} session={session} title={title} unread={unread} />
              <SessionRowBadges session={session} />
              <SessionRowSlot area={SESSION_ROW_AREAS.trailing} sessionId={sessionPinId(session)} />
            </>
          )}
        </SidebarRowCluster>
      </SidebarRowShell>
    </SessionContextMenu>
  )
}

// The sidebar re-renders on every stream tick ($sessions/$workingSessionIds
// churn), and it stays mounted beneath every overlay — so an unmemoized row
// re-rendered the whole list on each delta.
//
// The callback props (onArchive/onResume/…) are fresh closures every render by
// design (they close over the row's session id), so a default memo never bails.
// They're pure id-forwarders, though, so the comparator deliberately ignores
// them and compares only the DATA that changes what the row paints. A row's own
// status arrives through a store subscription, which re-renders it past this.
function rowPropsEqual(a: SidebarSessionRowProps, b: SidebarSessionRowProps): boolean {
  return (
    a.session === b.session &&
    a.isPinned === b.isPinned &&
    a.isSelected === b.isSelected &&
    a.unread === b.unread &&
    a.branchStem === b.branchStem &&
    a.reorderable === b.reorderable &&
    a.dragging === b.dragging &&
    a.showProfile === b.showProfile &&
    a.card === b.card &&
    a.dragHandleProps === b.dragHandleProps &&
    a.className === b.className &&
    a.style === b.style
  )
}

export const SidebarSessionRow = memo(SidebarSessionRowImpl, rowPropsEqual)
