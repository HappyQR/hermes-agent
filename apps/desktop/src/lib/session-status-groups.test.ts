import { describe, expect, it } from 'vitest'

import type { SidebarSessionEntry } from '@/lib/session-branch-tree'
import type { SessionStatusBucket } from '@/store/session-dot-state'
import { makeSessionInfo } from '@/test/session-info'

import { groupEntriesByStatusBuckets } from './session-status-groups'

const labels = { draft: 'Draft', idle: 'Done', 'needs-input': 'Needs input', unread: 'Unread', working: 'Running' }

const entry = (id: string, branchStem?: string): SidebarSessionEntry => ({
  branchStem,
  session: makeSessionInfo({ id, title: id })
})

const shape = (rows: ReturnType<typeof groupEntriesByStatusBuckets>) =>
  rows.map(row => (row.kind === 'divider' ? `# ${'label' in row ? row.label : row.key}` : row.entry.session.id))

describe('groupEntriesByStatusBuckets', () => {
  it('orders the buckets loudest first and drops empty ones', () => {
    const status: Record<string, SessionStatusBucket> = { a: 'idle', b: 'working', c: 'needs-input', d: 'idle' }

    const rows = groupEntriesByStatusBuckets(
      ['a', 'b', 'c', 'd'].map(id => entry(id)),
      e => status[e.session.id],
      labels
    )

    expect(shape(rows)).toEqual(['# Needs input', 'c', '# Running', 'b', '# Done', 'a', 'd'])
  })

  it('keeps branch children with their parent', () => {
    const status: Record<string, SessionStatusBucket> = { parent: 'unread', child: 'working' }

    const rows = groupEntriesByStatusBuckets(
      [entry('parent'), entry('child', '└─ ')],
      e => status[e.session.id],
      labels
    )

    expect(shape(rows)).toEqual(['# Unread', 'parent', 'child'])
  })
})
