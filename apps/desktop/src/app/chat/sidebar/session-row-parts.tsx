import { compactNumber } from '@hermes/shared'
import { useStore } from '@nanostores/react'
import type * as React from 'react'

import { PrTag } from '@/app/chat/pr-tag'
import { ProfileTag } from '@/app/chat/profile-tag'
import { formatMessageTimestamp } from '@/components/assistant-ui/thread/timestamp'
import { Codicon } from '@/components/ui/codicon'
import { RowButton } from '@/components/ui/row-button'
import { OverflowTip, Tip } from '@/components/ui/tooltip'
import type { HermesBranchPullRequest } from '@/global'
import type { SessionInfo } from '@/hermes'
import { useI18n } from '@/i18n'
import { sessionProjectLabel } from '@/lib/session-project-label'
import { sessionTimeLabel } from '@/lib/session-time-label'
import { useStoreSelector } from '@/lib/use-session-slice'
import { cn } from '@/lib/utils'
import { $sidebarRowMeta } from '@/store/layout'
import { normalizeProfileKey } from '@/store/profile'
import { $projects } from '@/store/projects'
import { $pullRequestsByBranch, sessionPrKey } from '@/store/pull-requests'
import { sessionCostUsd } from '@/store/sidebar-archive'
import { $sidebarPreviewLine } from '@/store/sidebar-studio'

import { SessionStatusDot } from '../session-status-dot'

import { SIDEBAR_TRUNCATED_LEADING, SidebarRowGrab, SidebarRowLabel, SidebarRowLead, SidebarRowLeadGlyph } from './chrome'
import { sessionRowDetails } from './session-row-details'
import { sessionSourceBucket, sourceBucketLabel } from './studio/session-source'
import { SessionSourceBadge } from './studio/session-source-badge'

// The last thing in the trailing slot hands its place to the ⋯ button on hover,
// and is never narrower than the button that has to cover it. A PR chip is the
// exception while the pointer is on it: it's a link, and the kebab sits
// absolute over this space, so it has to stop taking clicks too, not just fade.
export const TAIL_HIDES = 'session-row-tail min-w-5 transition-opacity group-hover:opacity-0'
export const KEBAB_YIELDS = 'session-row-kebab'

// Hover marquee (title): measure the actual overflow on pointerenter and arm
// the CSS animation only when there is some — CSS can't detect overflow on its
// own, and animating a non-overflowing title would wiggle for nothing.
// Distance-proportional duration keeps the scroll speed constant across short
// and long overflows. State lives in DOM attributes, not React state: hover
// must not re-render a memoized row.
const MARQUEE_PX_PER_SECOND = 80

export function armMarquee(event: React.PointerEvent<HTMLElement>) {
  const el = event.currentTarget
  const distance = el.scrollWidth - el.clientWidth

  if (distance > 2) {
    // The keyframes spend 65% of the cycle travelling (10%→75%); scale the
    // duration so the travel segment itself moves at the target speed.
    el.style.setProperty('--marquee-d', `${distance}px`)
    el.style.setProperty('--marquee-t', `${Math.max(1, distance / MARQUEE_PX_PER_SECOND / 0.65)}s`)
    el.dataset.marquee = 'true'
  }
}

export function disarmMarquee(event: React.PointerEvent<HTMLElement>) {
  delete event.currentTarget.dataset.marquee
}

export interface RowTrailingItem {
  key: string
  node: React.ReactNode
}

/**
 * Everything the View options put after the title shares ONE right-aligned
 * slot, in reading order: identity chips, then the figures (tokens · cost ·
 * time). The kebab covers the END of that slot on hover, so only the last
 * thing in it steps aside — with tokens and time both on you lose the time
 * and keep the number you switched on, and a PR keeps its place (and its
 * click) unless it IS the last thing.
 */
export function useSessionRowTrailing(
  session: SessionInfo,
  { card, showProfile }: { card: boolean; showProfile: boolean }
): { chipEndsSlot: boolean; pr: HermesBranchPullRequest | undefined; trailing: RowTrailingItem[] } {
  const { locale, t } = useI18n()
  // Read from the store rather than threaded as props: the subscription
  // re-renders past the row's memo, and a toggle repaints every row at once.
  const rowMeta = useStore($sidebarRowMeta)
  // The default profile has no mark worth spending a row slot on.
  const hasProfileTag = normalizeProfileKey(session.profile) !== 'default'
  const pinnedProfile = hasProfileTag && rowMeta.includes('profile')
  // A selector, not a plain useStore: a repo's PRs land as a single map write,
  // and only the rows on those branches should repaint.
  const prKey = sessionPrKey(session)
  const pr = useStoreSelector($pullRequestsByBranch, prs => (rowMeta.includes('pr') && prKey ? prs[prKey] : undefined))
  const timestamp = session.last_active || session.started_at
  const timestampDate = new Date(timestamp * 1000)
  const totalTokens = session.input_tokens + session.output_tokens
  const cost = sessionCostUsd(session)
  const showTime = rowMeta.includes('updated') || card

  const figures = [
    rowMeta.includes('tokens') && totalTokens > 0 ? compactNumber(totalTokens) : null,
    // Sub-cent spend rounds to "$0.00", which reads as a bug rather than as a
    // cheap session — below a cent the row says nothing at all.
    rowMeta.includes('cost') && cost >= 0.01 ? `$${cost.toFixed(2)}` : null
  ].filter(Boolean) as string[]

  const trailing: RowTrailingItem[] = []

  if ((showProfile || pinnedProfile) && hasProfileTag) {
    trailing.push({ key: 'profile', node: <ProfileTag profile={session.profile} /> })
  }

  if (pr) {
    trailing.push({ key: 'pr', node: <PrTag pr={pr} /> })
  }

  if (figures.length || showTime) {
    // The card's meta lines separate by spacing alone, so its header figures
    // match (non-breaking pair — plain spaces collapse to one); the one-line
    // row keeps the interpunct between joined figures.
    const sep = card ? '  ' : ' · '
    const head = (showTime ? figures : figures.slice(0, -1)).join(sep)
    const time = sessionTimeLabel(timestampDate.getTime(), t.studio.sidebar.row, locale)
    const absolute = formatMessageTimestamp(timestampDate, t.assistant.thread)

    trailing.push({
      key: 'figures',
      node: (
        <span className="pointer-events-none whitespace-nowrap text-[0.71875rem] leading-none tabular-nums text-(--ui-text-tertiary)">
          {head}
          {/* The figures own their tail: the separator goes with it. */}
          <span className={cn('inline-block text-right', TAIL_HIDES)}>
            {head && sep}
            {showTime ? (
              <Tip label={absolute} side="top">
                <time
                  aria-label={`${time}, ${absolute}`}
                  className="pointer-events-auto focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring"
                  dateTime={timestampDate.toISOString()}
                  tabIndex={0}
                >
                  {time}
                </time>
              </Tip>
            ) : (
              figures.at(-1)
            )}
          </span>
        </span>
      )
    })
  }

  // A chip that ends the slot hides whole; the figures handle their own tail.
  const chipEndsSlot = trailing.length > 0 && !figures.length && !rowMeta.includes('updated')

  return { chipEndsSlot, pr, trailing }
}

interface SessionRowLeadProps {
  session: SessionInfo
  reorderable: boolean
  dragging: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
  handleLabel: string
}

/** The status lead (or the archive glyph), inside the reorder grabber when the
 *  row can be dragged. */
export function SessionRowLead({ session, reorderable, dragging, dragHandleProps, handleLabel }: SessionRowLeadProps) {
  // An archived session has no live status to paint, so the archive glyph
  // takes the lead slot the status would occupy.
  const lead = session.archived ? (
    <SidebarRowLeadGlyph className="text-(--ui-text-quaternary)">
      <Codicon name="archive" size="0.75rem" />
    </SidebarRowLeadGlyph>
  ) : null

  if (reorderable) {
    return (
      <SidebarRowGrab ariaLabel={handleLabel} dragging={dragging} dragHandleProps={dragHandleProps}>
        {lead ?? (
          <SessionStatusDot
            className="transition-opacity group-hover/handle:opacity-0 group-focus-within/handle:opacity-0"
            session={session}
            storedSessionId={session.id}
          />
        )}
      </SidebarRowGrab>
    )
  }

  return (
    <SidebarRowLead className="overflow-hidden">
      {lead ?? <SessionStatusDot session={session} storedSessionId={session.id} />}
    </SidebarRowLead>
  )
}

/** A branch hangs off its parent: one stem glyph after the lead (prototype .stem). */
export function SessionRowStem() {
  return (
    <span aria-hidden="true" className="-mx-0.5 shrink-0 font-mono text-[0.6875rem] leading-none text-(--ui-text-quaternary)">
      └
    </span>
  )
}

/** Where the row came from (source / handoff chip) and the compression
 *  continuation mark. */
export function SessionRowBadges({ session }: { session: SessionInfo }) {
  const { t } = useI18n()

  return (
    <>
      <SessionSourceBadge session={session} />
      {/* A projected continuation renders as a plain top-level row, which
          reads as a brand-new conversation that "appeared by itself" — and the
          sealed predecessor it replaced once nested like a branch users deleted
          as accidents (#121148). Label the provenance. */}
      {session.continuation_kind === 'compression' ? (
        <Tip label={t.sidebar.row.continuationOrigin}>
          <Codicon
            aria-hidden="true"
            className="size-3.5 shrink-0 text-(--ui-text-quaternary)"
            name="layers"
            size="0.75rem"
          />
        </Tip>
      ) : null}
    </>
  )
}

/**
 * The one-line row's title column (prototype `.sb-label` / `.sb-two`): the
 * title — the row's real button (#38072) — then the detailed density's
 * project · branch · model line and the Preview option's first-message line.
 */
export function SessionRowTitle({ detailed, session, title, unread }: {
  detailed: boolean
  session: SessionInfo
  title: string
  unread: boolean
}) {
  const { t } = useI18n()
  const previewLine = useStore($sidebarPreviewLine)
  // Selectors, not useStore($projects): the projects atom refreshes on the tree
  // poll with fresh identity; a row only repaints when its own label changes.
  const projectLabel = useStoreSelector($projects, projects => (detailed ? sessionProjectLabel(session, projects) : null))
  const sourceLabel = detailed ? sourceBucketLabel(sessionSourceBucket(session), t.studio.sidebar) : null
  const details = detailed || previewLine ? sessionRowDetails(session, { projectLabel, sourceLabel }) : null

  return (
    <span className="flex min-w-0 flex-1 flex-col justify-center gap-px self-center">
      {/* No onClick of its own: the click bubbles to the body's resolver, so
          modifier-clicks and plain clicks behave as on the old full-row button. */}
      <RowButton className="block w-full text-left">
        <OverflowTip label={title} placement="row">
          <SidebarRowLabel
            className={cn('hover-marquee block', unread ? 'font-semibold' : 'font-normal')}
            onPointerEnter={armMarquee}
            onPointerLeave={disarmMarquee}
          >
            <span className="hover-marquee-inner">{title}</span>
          </SidebarRowLabel>
        </OverflowTip>
      </RowButton>
      {detailed && details?.detail ? (
        <span className={cn('block truncate text-[0.71875rem] text-(--ui-text-tertiary)', SIDEBAR_TRUNCATED_LEADING)}>
          {details.detail}
        </span>
      ) : null}
      {previewLine && details?.preview ? (
        <span className={cn('block truncate text-[0.71875rem] text-(--ui-text-quaternary)', SIDEBAR_TRUNCATED_LEADING)}>
          {details.preview}
        </span>
      ) : null}
    </span>
  )
}
