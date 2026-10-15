import { describe, expect, it } from 'vitest'

import { formatCombo } from '@/lib/keybinds/combo'

import { formatAccelerator } from './accelerator'

describe('formatAccelerator', () => {
  it('shows an Electron accelerator the way the app shows its own shortcuts', () => {
    expect(formatAccelerator('CommandOrControl+Shift+Space')).toBe(formatCombo('mod+shift+space'))
    expect(formatAccelerator('Shift+CmdOrCtrl+K')).toBe(formatCombo('mod+shift+k'))
    expect(formatAccelerator('Control+Alt+Return')).toBe(formatCombo('ctrl+alt+enter'))
    expect(formatAccelerator('Option+F5')).toBe(formatCombo('alt+F5'))
  })

  it('has nothing to show without a key', () => {
    expect(formatAccelerator('')).toBeNull()
    expect(formatAccelerator(undefined)).toBeNull()
  })
})
