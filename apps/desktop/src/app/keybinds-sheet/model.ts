import type { KeybindActionMeta, KeybindCategory, KeybindReadonly } from '@/lib/keybinds/actions'

export type SlotFamilyKey = 'slotProfiles' | 'slotSessions' | 'slotTabs'

export interface ShortcutRow {
  /** Display strings, one per bound combo (or per fixed key). */
  combos: string[]
  id: string
  label: string
}

export interface ShortcutGroup {
  category: KeybindCategory
  rows: ShortcutRow[]
}

// Numbered slot actions (profile 1…18, tab 1…9, session 1…9) read as one row
// per run of consecutive digits on a shared modifier prefix ("⌘1…9").
const SLOT_FAMILIES: ReadonlyArray<{ key: SlotFamilyKey; prefix: string }> = [
  { key: 'slotProfiles', prefix: 'profile.switch.' },
  { key: 'slotTabs', prefix: 'view.tabSlot.' },
  { key: 'slotSessions', prefix: 'session.slot.' }
]

export interface ShortcutModelInput {
  actions: readonly KeybindActionMeta[]
  bindings: Record<string, readonly string[] | undefined>
  categories: readonly KeybindCategory[]
  /** Label of a collapsed run, from its first and last slot number. */
  familyLabel: (key: SlotFamilyKey, first: number, last: number) => string
  format: (combo: string) => string
  label: (id: string, fallback?: string) => string
  query: string
  readonly: readonly KeybindReadonly[]
}

interface SlotCombo {
  digit: number
  id: string
  prefix: string
  /** The action's own slot number (`profile.switch.12` → 12). */
  slot: number
}

/** `mod+alt+3` → { prefix: 'mod+alt', digit: 3 }; anything else → null. */
export function parseSlotCombo(combo: string | undefined): null | { digit: number; prefix: string } {
  if (!combo) {
    return null
  }

  const parts = combo.split('+')
  const last = parts.pop() ?? ''

  if (!/^[1-9]$/.test(last) || parts.length === 0) {
    return null
  }

  return { digit: Number(last), prefix: parts.join('+') }
}

function familyRows(
  members: readonly KeybindActionMeta[],
  input: ShortcutModelInput,
  family: { key: SlotFamilyKey; prefix: string }
): ShortcutRow[] {
  const rows: ShortcutRow[] = []
  let run: SlotCombo[] = []

  const flush = () => {
    if (run.length >= 2) {
      const first = run[0]
      const last = run[run.length - 1]

      rows.push({
        combos: [`${input.format(`${first.prefix}+${first.digit}`)}…${last.digit}`],
        id: `${family.prefix}${first.id}`,
        label: input.familyLabel(family.key, first.slot, last.slot)
      })
    } else {
      for (const slot of run) {
        rows.push({ combos: [input.format(`${slot.prefix}+${slot.digit}`)], id: slot.id, label: input.label(slot.id) })
      }
    }

    run = []
  }

  for (const action of members) {
    const combos = input.bindings[action.id] ?? []
    const parsed = parseSlotCombo(combos[0])

    if (!parsed) {
      flush()

      if (combos.length > 0) {
        rows.push({ combos: combos.map(input.format), id: action.id, label: input.label(action.id, action.label) })
      }

      continue
    }

    const previous = run[run.length - 1]

    if (previous && (previous.prefix !== parsed.prefix || parsed.digit !== previous.digit + 1)) {
      flush()
    }

    run.push({ ...parsed, id: action.id, slot: Number(action.id.slice(family.prefix.length)) })
  }

  flush()

  return rows
}

function matches(row: ShortcutRow, needle: string): boolean {
  return !needle || row.label.toLowerCase().includes(needle) || row.id.toLowerCase().includes(needle)
}

/**
 * The read-only shortcut map: bound actions (slot families collapsed into
 * ranges) then the fixed shortcuts, grouped by category in panel order. Unbound
 * actions are left out — they are assigned in Settings, not read here.
 */
export function buildShortcutGroups(input: ShortcutModelInput): ShortcutGroup[] {
  const needle = input.query.trim().toLowerCase()

  return input.categories
    .map(category => {
      const inCategory = input.actions.filter(action => action.category === category)
      const rows: ShortcutRow[] = []
      const seenFamilies = new Set<string>()

      for (const action of inCategory) {
        const family = SLOT_FAMILIES.find(candidate => action.id.startsWith(candidate.prefix))

        if (family) {
          if (!seenFamilies.has(family.prefix)) {
            seenFamilies.add(family.prefix)
            rows.push(...familyRows(inCategory.filter(member => member.id.startsWith(family.prefix)), input, family))
          }

          continue
        }

        const combos = input.bindings[action.id] ?? []

        if (combos.length > 0) {
          rows.push({ combos: combos.map(input.format), id: action.id, label: input.label(action.id, action.label) })
        }
      }

      for (const shortcut of input.readonly) {
        if (shortcut.category === category) {
          rows.push({
            combos: shortcut.keys.map(input.format),
            id: `readonly:${shortcut.id}:${shortcut.keys.join(',')}`,
            label: input.label(shortcut.id)
          })
        }
      }

      return { category, rows: rows.filter(row => matches(row, needle)) }
    })
    .filter(group => group.rows.length > 0)
}
