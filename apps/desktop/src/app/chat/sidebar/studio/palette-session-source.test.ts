import { describe, expect, it } from 'vitest'

import { makeSessionInfo } from '@/test/session-info'
import type { SessionSearchResult } from '@/types/hermes'

import { contentMatches } from './palette-session-source'

const hit = (session_id: string, snippet = 'said >>>deploy<<< twice'): SessionSearchResult =>
  ({ session_id, snippet, title: null }) as SessionSearchResult

describe('contentMatches', () => {
  it('keeps the server order and leaves loaded title matches to the palette', () => {
    const titled = makeSessionInfo({ id: 'a', title: 'Deploy checklist' })
    const quoting = makeSessionInfo({ id: 'b', title: 'Release notes' })

    const byAnyId = new Map([
      ['a', titled],
      ['b', quoting]
    ])

    const rows = contentMatches('deploy', [hit('b'), hit('a'), hit('c')], byAnyId)

    expect(rows.map(row => row.session.id)).toEqual(['b', 'c'])
    // A hit outside the loaded page still renders as a session row.
    expect(rows[1].session.preview).toBe('said deploy twice')
  })

  it('lists one row per session when lineage aliases resolve to the same tip', () => {
    const tip = makeSessionInfo({ id: 'tip', title: 'Notes' })

    const byAnyId = new Map([
      ['tip', tip],
      ['root', tip]
    ])

    expect(contentMatches('deploy', [hit('root'), hit('tip')], byAnyId).map(row => row.session.id)).toEqual(['tip'])
  })
})
