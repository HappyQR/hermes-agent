import { describe, expect, it } from 'vitest'

import { recentConversations } from './use-palette-sessions'

const row = (id: string, last_active: number, source: null | string = null) => ({ id, last_active, source })

describe('recentConversations', () => {
  it('lists the newest conversations first, capped at the count', () => {
    const rows = [row('a', 10), row('b', 30, 'desktop'), row('c', 20, 'telegram'), row('d', 5, 'cli')]

    expect(recentConversations(rows, 3).map(r => r.id)).toEqual(['b', 'c', 'a'])
  })

  it('leaves out board workers, delegated runs and scheduled runs', () => {
    const rows = [
      row('chat', 1, 'local'),
      row('worker', 9, 'kanban'),
      row('child', 8, 'subagent'),
      row('tool', 7, 'tool'),
      row('job', 6, 'cron'),
      row('once', 5, 'oneshot'),
      row('editor', 4, 'acp'),
      row('upper', 3, 'Kanban')
    ]

    expect(recentConversations(rows).map(r => r.id)).toEqual(['chat'])
  })

  it('does not reorder the rows it was given', () => {
    const rows = [row('old', 1), row('new', 2)]

    recentConversations(rows)

    expect(rows.map(r => r.id)).toEqual(['old', 'new'])
  })
})
