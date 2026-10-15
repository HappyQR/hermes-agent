import { formatCombo } from '@/lib/keybinds/combo'

// Electron accelerator modifiers → the app's canonical combo tokens
// (lib/keybinds/combo.ts), so the Quick Ask hint shows the chord the same way
// every other shortcut in the app is shown (⌘⇧Space on macOS, Ctrl+Shift+Space
// elsewhere).
const MODIFIERS: Record<string, 'alt' | 'ctrl' | 'mod' | 'shift'> = {
  alt: 'alt',
  altgr: 'alt',
  cmd: 'mod',
  cmdorctrl: 'mod',
  command: 'mod',
  commandorcontrol: 'mod',
  control: 'ctrl',
  ctrl: 'ctrl',
  meta: 'mod',
  option: 'alt',
  shift: 'shift',
  super: 'mod'
}

const KEYS: Record<string, string> = {
  esc: 'escape',
  escape: 'escape',
  enter: 'enter',
  return: 'enter',
  space: 'space',
  tab: 'tab'
}

// Canonical modifier order (comboFromEvent): mod, ctrl, alt, shift.
const ORDER = ['mod', 'ctrl', 'alt', 'shift'] as const

/** Display label for an Electron accelerator, or null when it has no key. */
export function formatAccelerator(accelerator: string | null | undefined): null | string {
  const parts = (accelerator ?? '')
    .split('+')
    .map(part => part.trim())
    .filter(Boolean)

  const key = parts.pop()

  if (!key) {
    return null
  }

  const mods = new Set(parts.map(part => MODIFIERS[part.toLowerCase()]).filter(Boolean))
  const lower = key.toLowerCase()
  const base = KEYS[lower] ?? (key.length === 1 ? lower : key)

  return formatCombo([...ORDER.filter(mod => mods.has(mod)), base].join('+'))
}
