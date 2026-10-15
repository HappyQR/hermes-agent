import type { Translations } from '@/i18n'
import type { SidebarSessionEntry } from '@/lib/session-branch-tree'
import type { SidebarListRow } from '@/lib/session-date-groups'
import { groupEntriesByBuckets, groupEntriesByStatusBuckets } from '@/lib/session-status-groups'
import { type SessionDotState, sessionStatusBucket } from '@/store/session-dot-state'
import type { StudioGrouping } from '@/store/sidebar-studio'

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

/** The flat list's divider mode for the Studio grouping. Magnitude-ranked
 *  orderings (cost, tokens) drop the dividers: "Today" above the priciest
 *  session ever would be a lie. Project/profile render their own groups. */
export function flatListGrouping(grouping: StudioGrouping, rankedGlobally: boolean): 'date' | 'none' | 'source' | 'status' {
  if (rankedGlobally || grouping === 'none') {
    return 'none'
  }

  return grouping === 'status' || grouping === 'source' ? grouping : 'date'
}
