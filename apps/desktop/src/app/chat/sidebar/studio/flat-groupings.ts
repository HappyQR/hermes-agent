import type { Translations } from '@/i18n'
import type { SidebarSessionEntry } from '@/lib/session-branch-tree'
import type { SidebarListRow } from '@/lib/session-date-groups'
import { groupEntriesByBuckets, groupEntriesByStatusBuckets } from '@/lib/session-status-groups'
import { calendarBucket, type SessionBucket, sessionBucketLabel, type SessionBucketLabels } from '@/lib/time'
import { type SessionDotState, sessionStatusBucket } from '@/store/session-dot-state'
import type { StudioGrouping } from '@/store/sidebar-studio'
import type { SessionInfo } from '@/types/hermes'

import { compareSourceBuckets, sessionSourceBucket, sourceBucketLabel } from './session-source'

/** The flat list's Studio groupings: five status buckets (needs input ·
 *  running · unread · draft · done) or one bucket per source. */
export function groupFlatEntries(
  grouping: 'source' | 'status',
  entries: readonly SidebarSessionEntry[],
  dotStates: Readonly<Record<string, SessionDotState>>,
  copy: Translations['studio']['sidebar']
): SidebarListRow[] {
  if (grouping === 'status') {
    const labels = copy.statusGroup

    return groupEntriesByStatusBuckets(entries, entry => sessionStatusBucket(dotStates[entry.session.id]), {
      draft: labels.draft,
      idle: labels.done,
      'needs-input': labels.needsInput,
      unread: labels.unread,
      working: labels.working
    })
  }

  return groupEntriesByBuckets(entries, entry => sessionSourceBucket(entry.session), {
    label: bucket => sourceBucketLabel(bucket, copy),
    order: compareSourceBuckets,
    prefix: 'source'
  })
}

/** The time grouping (prototype `.sb-group`): a caption over every calendar
 *  group, the newest included. Upstream's leaves the newest run and the first
 *  group unlabelled, which read as rows indented under a missing header. */
export function groupEntriesByDay(
  entries: readonly SidebarSessionEntry[],
  labels: SessionBucketLabels,
  today: string,
  nowMs = Date.now()
): SidebarListRow[] {
  const buckets = new Map<string, SessionBucket>()

  return groupEntriesByBuckets(
    entries,
    entry => {
      const bucket = calendarBucket(entry.session.last_active || entry.session.started_at || 0, nowMs)

      buckets.set(bucket.key, bucket)

      return bucket.key
    },
    {
      label: key => {
        const bucket = buckets.get(key)

        return key === 'today' || !bucket ? today : sessionBucketLabel(bucket, labels)
      },
      prefix: 'day'
    }
  )
}

/** Where a session sits in the project grouping: its project's id and caption,
 *  or null outside every project. */
export type ProjectBucketOf = (session: SessionInfo) => null | { id: string; label: string }

const NO_PROJECT = 'none'

/** The project grouping (prototype `group: project`): a caption per project
 *  over the same chronological list, in the order the projects first appear.
 *  Groups come from sessions, so a project with none draws nothing. */
export function groupEntriesByProject(
  entries: readonly SidebarSessionEntry[],
  bucketOf: ProjectBucketOf,
  noProject: string
): SidebarListRow[] {
  const labels = new Map<string, string>([[NO_PROJECT, noProject]])

  return groupEntriesByBuckets(
    entries,
    entry => {
      const bucket = bucketOf(entry.session)

      if (!bucket) {
        return NO_PROJECT
      }

      labels.set(bucket.id, bucket.label)

      return bucket.id
    },
    { label: id => labels.get(id) ?? noProject, prefix: 'project' }
  )
}

/** The flat list's divider mode for the Studio grouping. Magnitude-ranked
 *  orderings (cost, tokens) drop the dividers: "Today" above the priciest
 *  session ever would be a lie. The profile grouping renders its own groups. */
export function flatListGrouping(
  grouping: StudioGrouping,
  rankedGlobally: boolean
): 'date' | 'none' | 'project' | 'source' | 'status' {
  if (rankedGlobally || grouping === 'none') {
    return 'none'
  }

  return grouping === 'status' || grouping === 'source' || grouping === 'project' ? grouping : 'date'
}
