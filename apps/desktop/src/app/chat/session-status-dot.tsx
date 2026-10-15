import { useStore } from '@nanostores/react'

import { StudioIcon } from '@/components/ui/studio-icon'
import { type Translations, useI18n } from '@/i18n'
import { useStoreSelector } from '@/lib/use-session-slice'
import { cn } from '@/lib/utils'
import { $sessionColorById, sessionColorFor } from '@/store/session-color'
import { $sessionDotStateById, type SessionDotState } from '@/store/session-dot-state'
import type { SessionInfo } from '@/types/hermes'

// One table, one mark per state — no priority resolution here
// ($sessionDotStateById already picked one). Labels resolve from
// sidebar.row translations, keyed by name.
type LeadVariant = {
  ariaLabel?: (r: Translations['sidebar']['row']) => string
  /** The state's dot, for surfaces that describe a status without a session
   *  (filter chips, profile status dots). */
  dot: string
  role?: 'status'
  title?: (r: Translations['sidebar']['row']) => string
}

// Hermes Studio's status leads (prototype HP.StatusLead): running and needs
// input and unread read the same on every surface. A running turn is the
// spinning accent ring — the one moving mark, so the row needs no arc of its
// own; needs input is the amber dot with a halo, the only "act now" color;
// unread is the accent dot; a draft is a pencil; a settled session shows
// nothing unless it carries a color. Stalled keeps the ring, still; a
// background process outliving the turn is a hollow muted circle.
const LEADS: Record<SessionDotState, LeadVariant> = {
  'needs-input': {
    ariaLabel: r => r.needsInput,
    dot: 'size-2 rounded-full bg-[var(--ui-dot-orange,var(--color-amber-500))]',
    role: 'status',
    title: r => r.waitingForAnswer
  },
  working: {
    ariaLabel: r => r.sessionRunning,
    dot: 'size-2 rounded-full bg-(--ui-accent)',
    role: 'status'
  },
  stalled: {
    ariaLabel: r => r.sessionRunning,
    dot: 'size-2 rounded-full border border-(--ui-accent)',
    role: 'status',
    title: r => r.sessionRunning
  },
  background: {
    ariaLabel: r => r.backgroundRunning,
    dot: 'size-2 rounded-full border-[1.5px] border-(--ui-text-tertiary)',
    role: 'status',
    title: r => r.backgroundRunning
  },
  unread: {
    ariaLabel: r => r.finishedUnread,
    dot: 'size-2 rounded-full bg-(--ui-accent)',
    role: 'status',
    title: r => r.finishedUnread
  },
  draft: {
    ariaLabel: r => r.draftSession,
    dot: 'size-2 rounded-full border border-(--ui-text-quaternary)',
    title: r => r.draftSession
  },
  idle: {
    dot: 'size-1.5 rounded-full'
  }
}

/** The dot a state paints, for surfaces that describe a status rather than
 *  render a session — the status filter, the profile status dots. Idle carries
 *  no color of its own (it inherits the project's), so callers supply one. */
export const sessionDotClassName = (state: SessionDotState): string => LEADS[state].dot

/** The mark itself (decorative; the wrapper carries the accessible name). */
function LeadMark({ color, state }: { color: null | string; state: SessionDotState }) {
  switch (state) {
    case 'working':
      return <span className="studio-ring-run size-3.5" />

    case 'stalled':
      return <span className="studio-ring-run size-3.5 animate-none" />

    case 'needs-input':
      return (
        <span
          className={cn(
            LEADS['needs-input'].dot,
            'shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-dot-orange,var(--color-amber-500))_22%,transparent)]'
          )}
        />
      )

    case 'draft':
      return <StudioIcon className="text-(--ui-text-tertiary)" name="pencil" size={12} />

    case 'idle':
      // Nothing to say — unless the session wears a color (its own or its
      // project's), which is the only place that color shows.
      return color ? <span className={LEADS.idle.dot} style={{ backgroundColor: color }} /> : null

    default:
      return <span className={LEADS[state].dot} />
  }
}

export interface SessionStatusDotProps {
  /** The STORED session id — the key every live-state atom (working /
   *  attention / stalled / unread / background) is keyed by, on BOTH surfaces:
   *  the sidebar row's `session.id` and a pane tile's `storedSessionId` are the
   *  same stored id (`$workingSessionIds` et al. map `storedSessionId`).
   *
   *  Null on a new chat that has yet to reach the backend — no id to key by,
   *  and no turn behind it, which is the draft state by definition. */
  storedSessionId: null | string
  /** The session row for color resolution — recents OR the project tree. Both
   *  call sites already hold it; passing it lets the idle mark inherit the
   *  project color even for a session older than the paginated recents page
   *  (which has no `$sessionColorById` entry). */
  session?: null | SessionInfo
  /** TUI-style tree stem for a branched session (`└─ ` / `├─ `). */
  branchStem?: string
  /** Applied to the OUTER wrapper (stem + mark) — e.g. hover-fade on the
   *  reorder handle. */
  className?: string
}

/**
 * SESSION STATUS LEAD — the ONE primitive the sidebar row, the pane tabs, and
 * the session switcher render, so a session's status can never disagree
 * between surfaces. It resolves everything itself from the stored session id:
 * the live state (via `$sessionDotStateById`, already reduced to one mutually
 * exclusive answer) and the color (override → project, via `sessionColorFor`).
 * The active states own the mark with their semantic look so an attention cue
 * is never masked by a tint.
 */
export function SessionStatusDot({ storedSessionId, session, branchStem, className }: SessionStatusDotProps) {
  const { t } = useI18n()
  const r = t.sidebar.row

  // Subscribe to the shared color map for reactivity; sessionColorFor falls
  // back to the resolver for a session outside the recents page.
  useStore($sessionColorById)
  const color = sessionColorFor(session) ?? null

  // Selector, not a plain useStore: the map is rebuilt whenever any session's
  // status changes, but a given lead only repaints when ITS OWN state flips.
  const dotState = useStoreSelector($sessionDotStateById, states =>
    storedSessionId ? (states[storedSessionId] ?? 'idle') : 'draft'
  )

  const variant = LEADS[dotState]

  return (
    <span className={cn('flex items-center gap-1', className)}>
      <span
        aria-hidden={variant.ariaLabel ? undefined : true}
        aria-label={variant.ariaLabel?.(r)}
        className="grid size-3.5 shrink-0 place-items-center"
        data-status-lead={dotState}
        role={variant.role}
        title={variant.title?.(r)}
      >
        <LeadMark color={color} state={dotState} />
      </span>
      {/* A branch hangs off its parent: one stem glyph after the lead (prototype .stem). */}
      {branchStem ? (
        <span aria-hidden className="-mr-0.5 shrink-0 font-mono text-[0.6875rem] leading-none text-(--ui-text-quaternary)">
          └
        </span>
      ) : null}
    </span>
  )
}
