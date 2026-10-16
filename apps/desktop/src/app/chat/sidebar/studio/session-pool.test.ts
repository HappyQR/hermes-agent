import { describe, expect, it } from 'vitest'

import { makeSessionInfo } from '@/test/session-info'

import { mergeSessionPool } from './session-pool'

const row = (id: string, last_active: number, extra: Parameters<typeof makeSessionInfo>[0] = {}) =>
  makeSessionInfo({ id, last_active, profile: 'default', started_at: last_active, title: id, ...extra })

const base = {
  archived: [],
  isPinned: () => false,
  local: [],
  matches: () => true,
  messaging: []
}

describe('mergeSessionPool', () => {
  it('lists local and messaging rows together, newest first', () => {
    const pool = mergeSessionPool({
      ...base,
      local: [row('desk', 10)],
      messaging: [row('tg', 20, { source: 'telegram' })]
    })

    expect(pool.map(session => session.id)).toEqual(['tg', 'desk'])
  })

  it('keeps scheduled runs out, archived ones included', () => {
    const pool = mergeSessionPool({
      ...base,
      archived: [row('old-run', 30, { archived: true, source: 'cron' })],
      local: [row('desk', 10)]
    })

    expect(pool.map(session => session.id)).toEqual(['desk'])
  })

  it('keeps one row per profile and id, the live copy winning over a stale archived one', () => {
    const live = row('same', 5)
    const pool = mergeSessionPool({ ...base, archived: [row('same', 9, { archived: true })], local: [live] })

    expect(pool).toEqual([live])
  })

  it('keeps twins that share an id across profiles apart', () => {
    const pool = mergeSessionPool({
      ...base,
      local: [row('twin', 2, { profile: 'default' }), row('twin', 1, { profile: 'work' })]
    })

    expect(pool.map(session => session.profile)).toEqual(['default', 'work'])
  })

  it('leaves pinned rows to the Pinned section and applies the filters', () => {
    const pool = mergeSessionPool({
      ...base,
      isPinned: session => session.id === 'pinned',
      local: [row('pinned', 3), row('kept', 2), row('filtered', 1)],
      matches: session => session.id !== 'filtered'
    })

    expect(pool.map(session => session.id)).toEqual(['kept'])
  })

  it('shows archived rows inline when they are passed in', () => {
    const pool = mergeSessionPool({ ...base, archived: [row('old', 1, { archived: true })], local: [row('new', 2)] })

    expect(pool.map(session => session.id)).toEqual(['new', 'old'])
  })
})
