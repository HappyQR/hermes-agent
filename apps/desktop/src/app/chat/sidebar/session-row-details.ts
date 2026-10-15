import type { SessionListDensity } from '@/store/session-list-density'
import type { SessionInfo } from '@/types/hermes'

export interface SessionRowDetails {
  /** Detailed density's second line: project · branch · model. */
  detail: string
  /** The first-message preview line (the Preview option). */
  preview: null | string
}

export interface SessionRowDetailContext {
  /** The project the row belongs to, when it resolves. */
  projectLabel: null | string
  /** Where the session came from — the line's fallback when it has none of
   *  project, branch or model (a Telegram thread, a scheduled run). */
  sourceLabel: null | string
}

const modelLabel = (model: null | string) => model?.split('/').pop()?.trim() || null
const oneLine = (value: null | string | undefined) => value?.replace(/\s+/g, ' ').trim() || null

/** Rows: compact keeps the tight pre-density line, comfortable is the 30px
 *  Studio row, detailed adds the project · branch · model line. */
export const sessionRowEstimate = (density: SessionListDensity) =>
  ({ compact: 26, comfortable: 30, detailed: 46 })[density]

/** What the Preview option's extra line adds to a row's height. */
export const SESSION_PREVIEW_LINE_PX = 16

/** Virtual-list placement estimate for the Inbox-style card. A full card
 *  stacks four text lines (header, title, preview, model/size) where the
 *  tallest inline density stacks three, plus the card's own padding — and a
 *  title that wraps to two lines on a narrow sidebar adds one more title
 *  line (#88473). Deliberately at or ABOVE that worst case: an oversized
 *  estimate paints a brief gap that self-measurement closes, while an
 *  undersized one paints rows over their neighbours (and the divider below)
 *  on a cold start, before any measurement can correct it. */
export const SESSION_CARD_ROW_ESTIMATE_PX = 96

export function sessionRowDetails(session: SessionInfo, context: SessionRowDetailContext): SessionRowDetails {
  const preview = oneLine(session.preview)
  const hasOwnTitle = Boolean(session.title?.trim())

  const detail = [oneLine(context.projectLabel), oneLine(session.git_branch), modelLabel(session.model)]
    .filter(Boolean)
    .join(' · ')

  return {
    detail: detail || oneLine(context.sourceLabel) || '',
    // An untitled row already shows its first message as the title.
    preview: hasOwnTitle ? preview : null
  }
}
