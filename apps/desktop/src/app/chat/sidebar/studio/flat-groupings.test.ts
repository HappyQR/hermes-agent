import { describe, expect, it } from 'vitest'

import type { SidebarSessionEntry } from '@/lib/session-branch-tree'
import type { SidebarListRow } from '@/lib/session-date-groups'
import type { SessionInfo } from '@/types/hermes'

import { groupEntriesByDay, groupEntriesByProject } from './flat-groupings'

const NOW = new Date(2026, 9, 16, 15, 0).getTime()
const HOUR = 3_600_000

const LABELS = {
  lastWeek: 'Last week',
  thisMonth: 'Earlier this month',
  thisWeek: 'Earlier this week',
  today: 'Earlier today',
  yesterday: 'Yesterday'
}

function entry(id: string, atMs: number): SidebarSessionEntry {
  return { session: { id, last_active: atMs / 1000, started_at: atMs / 1000 } as SessionInfo }
}

const outline = (rows: SidebarListRow[]) =>
  rows.map(row => (row.kind === 'session' ? row.entry.session.id : `# ${'label' in row ? row.label : row.key}`))

describe('groupEntriesByDay', () => {
  it('captions every day, the newest included', () => {
    const rows = groupEntriesByDay(
      [entry('a', NOW - 60_000), entry('b', NOW - 2 * 60_000), entry('c', NOW - 26 * HOUR)],
      LABELS,
      'Today',
      NOW
    )

    expect(outline(rows)).toEqual(['# Today', 'a', 'b', '# Yesterday', 'c'])
  })
})

describe('groupEntriesByProject', () => {
  it('captions each project as it first appears and keeps project-less sessions together', () => {
    const bucketOf = (session: SessionInfo) => (session.id.startsWith('trip') ? { id: 'p_trip', label: 'Trip' } : null)

    const rows = groupEntriesByProject(
      [entry('trip-1', NOW), entry('loose', NOW - HOUR), entry('trip-2', NOW - 2 * HOUR)],
      bucketOf,
      'Not in a project'
    )

    expect(outline(rows)).toEqual(['# Trip', 'trip-1', 'trip-2', '# Not in a project', 'loose'])
  })
})
