import type { SidebarSessionEntry } from '@/lib/session-branch-tree'
import { type SidebarListRow, toSessionRows } from '@/lib/session-date-groups'
import type { SessionStatusBucket } from '@/store/session-dot-state'

/** The status grouping's buckets, loudest first (prototype: needs input ·
 *  running · unread · draft · done). */
export const STATUS_GROUP_ORDER: readonly SessionStatusBucket[] = ['needs-input', 'working', 'unread', 'draft', 'idle']

export type StatusGroupLabels = Record<SessionStatusBucket, string>

interface BucketOptions<K extends string> {
  /** Divider key prefix (`status`, `source`) — keys collapse state. */
  prefix: string
  label: (bucket: K) => string
  /** Bucket order; buckets missing from it follow, in first-seen order. */
  order?: readonly K[] | ((a: K, b: K) => number)
}

/**
 * Split ordered entries into labelled buckets under their own dividers. Branch
 * children ride with their parent, as they do under the date dividers, and
 * each bucket keeps the entries' order. Empty buckets draw nothing.
 */
export function groupEntriesByBuckets<K extends string>(
  entries: readonly SidebarSessionEntry[],
  bucketOf: (entry: SidebarSessionEntry) => K,
  { label, order, prefix }: BucketOptions<K>
): SidebarListRow[] {
  const buckets = new Map<K, SidebarSessionEntry[]>()
  let cluster: K | null = null

  for (const entry of entries) {
    if (!entry.branchStem || cluster === null) {
      cluster = bucketOf(entry)
    }

    const list = buckets.get(cluster) ?? []
    list.push(entry)
    buckets.set(cluster, list)
  }

  const keys = [...buckets.keys()]

  const sorted =
    typeof order === 'function'
      ? keys.sort(order)
      : order
        ? [...order.filter(key => buckets.has(key)), ...keys.filter(key => !order.includes(key))]
        : keys

  return sorted.flatMap(bucket => [
    { key: `${prefix}:${bucket}`, kind: 'divider' as const, label: label(bucket) },
    ...toSessionRows(buckets.get(bucket) ?? [])
  ])
}

export function groupEntriesByStatusBuckets(
  entries: readonly SidebarSessionEntry[],
  bucketOf: (entry: SidebarSessionEntry) => SessionStatusBucket,
  labels: StatusGroupLabels
): SidebarListRow[] {
  return groupEntriesByBuckets(entries, bucketOf, {
    label: bucket => labels[bucket],
    order: STATUS_GROUP_ORDER,
    prefix: 'status'
  })
}
