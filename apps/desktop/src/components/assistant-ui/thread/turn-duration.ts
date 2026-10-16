import { threadMessageIndex } from './thread-message-index'

// A span longer than this is not one turn's work (a resumed day-old draft, a
// clock jump) — no time beats a wrong one.
const MAX_TURN_S = 86_400

interface TurnRow {
  readonly content: readonly unknown[]
  readonly id: string
  readonly metadata?: { readonly custom?: Record<string, unknown> }
  readonly role: string
  readonly status?: { readonly type: string }
}

const seconds = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined

/** When the user's message was persisted (unix seconds), if known. */
function startedAt(row: TurnRow): number | undefined {
  return seconds(row.metadata?.custom?.timelineTimestamp)
}

/** The latest moment an assistant row records: its parts' completion or
 *  persisted times, and its own. */
function endedAt(row: TurnRow): number | undefined {
  const custom = row.metadata?.custom
  const times = [seconds(custom?.timelineCompletedAt), seconds(custom?.timelineTimestamp)]

  for (const part of row.content) {
    const record = part as { completedAt?: unknown; timestamp?: unknown }
    times.push(seconds(record.completedAt), seconds(record.timestamp))
  }

  const known = times.filter((time): time is number => time !== undefined)

  return known.length ? Math.max(...known) : undefined
}

/**
 * The turn time a reply's footer shows. The live-measured `durationS` (the
 * desktop watched message.start → message.complete) wins; a reloaded turn —
 * history never stores it — falls back to its persisted span: the user message
 * that started the turn to the turn's last assistant content, the same span the
 * live value measures, approval waits included. Nothing when either end is
 * unknown or the span isn't sane (positive, under a day).
 */
export function replyTurnDurationS(messages: readonly TurnRow[], message: TurnRow): number | undefined {
  const live = message.metadata?.custom?.durationS

  if (typeof live === 'number') {
    return live
  }

  const index = threadMessageIndex(messages, message.id)

  if (message.role !== 'assistant' || message.status?.type === 'running' || index < 0) {
    return undefined
  }

  let start: number | undefined
  let end: number | undefined

  for (let i = index - 1; i >= 0 && start === undefined; i--) {
    if (messages[i].role === 'user') {
      start = startedAt(messages[i]) ?? Number.NaN
    }
  }

  for (let i = index; i < messages.length && messages[i].role !== 'user'; i++) {
    const rowEnd = endedAt(messages[i])

    end = rowEnd === undefined ? end : Math.max(end ?? rowEnd, rowEnd)
  }

  const span = start === undefined || end === undefined ? Number.NaN : end - start

  // Rounded like the live value (whole seconds, at least one).
  return span > 0 && span < MAX_TURN_S ? Math.max(1, Math.round(span)) : undefined
}
