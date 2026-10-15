import { describe, expect, it } from 'vitest'

import type { KeybindActionMeta, KeybindReadonly } from '@/lib/keybinds/actions'

import { buildShortcutGroups, parseSlotCombo, type ShortcutModelInput } from './model'

const slot = (prefix: string, category: KeybindActionMeta['category'], count: number): KeybindActionMeta[] =>
  Array.from({ length: count }, (_, i) => ({ category, defaults: [], id: `${prefix}${i + 1}` }))

function input(overrides: Partial<ShortcutModelInput>): ShortcutModelInput {
  return {
    actions: [],
    bindings: {},
    categories: ['composer', 'profiles', 'session', 'navigation', 'view'],
    familyLabel: (key, first, last) => `${key} ${first}-${last}`,
    format: combo => combo,
    label: (id, fallback) => fallback ?? id,
    query: '',
    readonly: [],
    ...overrides
  }
}

describe('parseSlotCombo', () => {
  it('splits a digit slot into its modifier prefix', () => {
    expect(parseSlotCombo('mod+alt+3')).toEqual({ digit: 3, prefix: 'mod+alt' })
    expect(parseSlotCombo('mod+k')).toBeNull()
    expect(parseSlotCombo('7')).toBeNull()
    expect(parseSlotCombo(undefined)).toBeNull()
  })
})

describe('buildShortcutGroups', () => {
  it('collapses consecutive numbered slots into one range row per shared prefix', () => {
    const actions = slot('profile.switch.', 'profiles', 18)

    const bindings = Object.fromEntries(
      actions.map((action, i) => [action.id, [i < 9 ? `mod+${i + 1}` : `mod+alt+${i - 8}`]])
    )

    const [group] = buildShortcutGroups(input({ actions, bindings }))

    expect(group.rows.map(row => [row.label, row.combos])).toEqual([
      ['slotProfiles 1-9', ['mod+1…9']],
      ['slotProfiles 10-18', ['mod+alt+1…9']]
    ])
  })

  it('keeps a rebound slot as its own row instead of folding it into a false range', () => {
    const actions = slot('session.slot.', 'session', 3)
    const bindings = { 'session.slot.1': ['ctrl+1'], 'session.slot.2': ['mod+shift+j'], 'session.slot.3': ['ctrl+3'] }

    const [group] = buildShortcutGroups(input({ actions, bindings }))

    expect(group.rows.map(row => row.combos[0])).toEqual(['ctrl+1', 'mod+shift+j', 'ctrl+3'])
  })

  it('lists bound actions and fixed shortcuts, leaves unbound actions out, and filters by query', () => {
    const actions: KeybindActionMeta[] = [
      { category: 'navigation', defaults: [], id: 'nav.settings' },
      { category: 'navigation', defaults: [], id: 'nav.agents' }
    ]

    const readonly: KeybindReadonly[] = [{ category: 'composer', id: 'composer.send', keys: ['enter'] }]
    const bindings = { 'nav.agents': [], 'nav.settings': ['mod+,'] }

    const all = buildShortcutGroups(input({ actions, bindings, readonly }))

    expect(all.map(group => [group.category, group.rows.map(row => row.label)])).toEqual([
      ['composer', ['composer.send']],
      ['navigation', ['nav.settings']]
    ])

    const filtered = buildShortcutGroups(input({ actions, bindings, query: 'SETT', readonly }))

    expect(filtered.map(group => group.category)).toEqual(['navigation'])
  })
})
