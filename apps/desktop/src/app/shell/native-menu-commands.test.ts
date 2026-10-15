import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PALETTE_AREA } from '@/app/command-palette/contrib'
import { registry } from '@/contrib/registry'
import { enStudioMenu } from '@/i18n/en_studio_menu'
import { defaultBindings, KEYBIND_ACTION_IDS, KEYBINDS_AREA } from '@/lib/keybinds/actions'
import { menuCommandAvailable, registerMenuCommands, runMenuCommand } from '@/lib/keybinds/menu-actions'
import { registerBuiltinActionRunner } from '@/lib/keybinds/plugin-actions'

import { isMainMenuCommand } from '../../../electron/application-menu-model'

import { createMenuCommandResolver } from './native-menu-commands'
import { buildMenuModel, menuCommandIds } from './native-menu-model'

const DEFAULTS = defaultBindings()

function buildWithLiveAvailability() {
  return buildMenuModel({
    available: menuCommandAvailable,
    combos: id => DEFAULTS[id] ?? [],
    copy: enStudioMenu,
    recording: false,
    state: {
      activeProfile: 'default',
      inspectorOpen: true,
      interfaceMode: 'advanced',
      profiles: [
        { key: 'default', label: 'default' },
        { key: 'my work', label: 'My work' }
      ],
      session: { archived: false, busy: true, pinned: false, renameable: true },
      showAllProfiles: false,
      sidebarOpen: true,
      statusbarVisible: true,
      tabBar: 'auto',
      themeMode: 'light'
    }
  })
}

describe('runMenuCommand', () => {
  const ran: string[] = []
  const disposers: (() => void)[] = []

  const realResolver = createMenuCommandResolver({
    actions: () => ({
      onArchiveSession: vi.fn(),
      onBranchSession: vi.fn(),
      onCancel: vi.fn(),
      onDeleteSession: vi.fn(),
      onSubmit: vi.fn()
    }),
    navigate: vi.fn(),
    openRename: vi.fn(),
    pathname: () => '/'
  })

  beforeEach(() => {
    ran.length = 0
    // The keybind dispatcher's handler table: every built-in action id.
    disposers.push(
      registerBuiltinActionRunner(id => {
        if (!KEYBIND_ACTION_IDS.includes(id)) {
          return false
        }

        ran.push(`builtin:${id}`)

        return true
      })
    )
    // What the controller contributes: a keybind and three ⌘K rows.
    disposers.push(
      registry.registerMany([
        {
          area: KEYBINDS_AREA,
          data: {
            id: 'layout.editMode',
            label: 'Toggle layout edit mode',
            run: () => ran.push('keybind:layout.editMode')
          },
          id: 'layout.editMode'
        },
        ...['layout.reset', 'profile.export', 'profile.import'].map(id => ({
          area: PALETTE_AREA,
          data: { id, label: id, run: () => ran.push(`palette:${id}`) },
          id
        }))
      ])
    )
    // The real menu-only table decides what exists; the spy stands in for running it.
    disposers.push(registerMenuCommands(id => (realResolver(id) ? () => ran.push(`menu:${id}`) : undefined)))
  })

  afterEach(() => {
    disposers.splice(0).forEach(dispose => dispose())
  })

  it('resolves every renderer item of the menu through exactly one layer', () => {
    const ids = menuCommandIds(buildWithLiveAvailability()).filter(id => !isMainMenuCommand(id))

    // Spot-check that each layer is represented.
    expect(ids).toEqual(
      expect.arrayContaining([
        'session.new',
        'layout.editMode',
        'layout.reset',
        'profile.export',
        'menu.session.rename',
        'menu.profile:my%20work'
      ])
    )

    for (const id of ids) {
      ran.length = 0

      expect(runMenuCommand(id), id).toBe(true)
      expect(ran, id).toHaveLength(1)
      expect(ran[0].endsWith(`:${id}`), id).toBe(true)
    }
  })

  it('prefers the built-in handler, the same one the shortcut runs', () => {
    disposers.push(
      registry.register({
        area: PALETTE_AREA,
        data: {
          id: 'view.toggleStatusbar',
          label: 'Toggle status bar',
          run: () => ran.push('palette:view.toggleStatusbar')
        },
        id: 'view.toggleStatusbar'
      })
    )

    runMenuCommand('view.toggleStatusbar')

    expect(ran).toEqual(['builtin:view.toggleStatusbar'])
  })

  it('leaves out an action that has not landed yet and picks it up once it registers', () => {
    expect(menuCommandIds(buildWithLiveAvailability())).not.toContain('view.showAgents')

    disposers.push(
      registry.register({
        area: KEYBINDS_AREA,
        data: { id: 'view.showAgents', label: 'Show agents', run: () => ran.push('keybind:view.showAgents') },
        id: 'view.showAgents'
      })
    )

    expect(menuCommandIds(buildWithLiveAvailability())).toContain('view.showAgents')
    expect(runMenuCommand('view.showAgents')).toBe(true)
  })

  it('reports unknown ids instead of running anything', () => {
    expect(runMenuCommand('menu.nope')).toBe(false)
    expect(runMenuCommand('menu.profile:')).toBe(false)
    expect(ran).toEqual([])
  })
})
