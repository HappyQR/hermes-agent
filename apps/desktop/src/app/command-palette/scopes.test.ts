import { afterEach, describe, expect, it } from 'vitest'

import { $paletteSources, cycleScope, groupsForScope, hasPaletteSource, type ScopedGroup, setPaletteSource } from './scopes'

const group = (heading: string, scope: ScopedGroup['scope'], count = 2, typedOnly = false): ScopedGroup => ({
  heading,
  items: Array.from({ length: count }, (_, index) => `${heading}-${index}`),
  scope,
  typedOnly
})

const GROUPS = [
  group('go-to', 'pages', 3),
  group('projects', 'sessions'),
  group('commands', 'actions', 9),
  group('appearance', 'actions'),
  group('settings', 'settings'),
  group('capabilities', 'pages', 4, true),
  group('sessions', 'sessions', 5),
  group('archived', 'sessions', 2, true),
  group('fields', 'settings', 3, true)
]

describe('cycleScope', () => {
  it('walks the chips in order and wraps both ways', () => {
    expect(cycleScope('all', 1)).toBe('sessions')
    expect(cycleScope('settings', 1)).toBe('all')
    expect(cycleScope('all', -1)).toBe('settings')
  })
})

describe('groupsForScope', () => {
  it('lands 全部 on recent, the first pages group and a commands preview', () => {
    const landing = groupsForScope({
      commandsPreview: 6,
      groups: GROUPS,
      query: '',
      recent: group('recent', 'sessions', 5),
      scope: 'all'
    })

    expect(landing.map(entry => entry.heading)).toEqual(['recent', 'go-to', 'commands'])
    expect(landing[2].items).toHaveLength(6)
  })

  it('drops an empty recent block from the landing', () => {
    const landing = groupsForScope({ groups: GROUPS, query: '', recent: group('recent', 'sessions', 0), scope: 'all' })

    expect(landing[0].heading).toBe('go-to')
  })

  it('lists a scope without its typed-only groups until the user types', () => {
    expect(groupsForScope({ groups: GROUPS, query: '', scope: 'sessions' }).map(entry => entry.heading)).toEqual([
      'projects',
      'sessions'
    ])

    expect(groupsForScope({ groups: GROUPS, query: 'x', scope: 'sessions' }).map(entry => entry.heading)).toEqual([
      'projects',
      'sessions',
      'archived'
    ])
  })

  it('searches every group from 全部', () => {
    expect(groupsForScope({ groups: GROUPS, query: 'x', scope: 'all' })).toHaveLength(GROUPS.length)
  })
})

describe('palette sources', () => {
  afterEach(() => $paletteSources.set({}))

  it('registers and removes a source by id', () => {
    setPaletteSource('fts', { groups: [], scope: 'sessions' })

    expect(hasPaletteSource($paletteSources.get(), 'sessions')).toBe(true)

    setPaletteSource('fts', null)

    expect(hasPaletteSource($paletteSources.get(), 'sessions')).toBe(false)
  })
})
