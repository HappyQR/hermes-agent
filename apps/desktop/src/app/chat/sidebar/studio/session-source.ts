import type { Translations } from '@/i18n'
import { isMessagingSource, normalizeSessionSource, sessionSourceLabel } from '@/lib/session-source'
import type { SessionInfo } from '@/types/hermes'

export const DESKTOP_SOURCE = 'desktop'
export const CRON_SOURCE = 'cron'

/** The bucket a row files under for the source filter and source grouping:
 *  `cron`, a messaging platform id (webhooks included), or `desktop` for every
 *  local surface (desktop, CLI, TUI…) and rows with no recorded source. */
export function sessionSourceBucket(session: Pick<SessionInfo, 'source'>): string {
  const source = normalizeSessionSource(session.source)

  if (source === CRON_SOURCE) {
    return CRON_SOURCE
  }

  return source && isMessagingSource(source) ? source : DESKTOP_SOURCE
}

export function sourceBucketLabel(bucket: string, copy: Translations['studio']['sidebar']): string {
  if (bucket === DESKTOP_SOURCE) {
    return copy.source.desktop
  }

  if (bucket === CRON_SOURCE) {
    return copy.source.cron
  }

  return sessionSourceLabel(bucket) ?? bucket
}

/** Desktop first, scheduled jobs last, platforms by name in between. */
export function compareSourceBuckets(a: string, b: string): number {
  const rank = (bucket: string) => (bucket === DESKTOP_SOURCE ? 0 : bucket === CRON_SOURCE ? 2 : 1)

  return rank(a) - rank(b) || a.localeCompare(b)
}
