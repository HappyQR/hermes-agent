import assert from 'node:assert/strict'

import type { MenuItemConstructorOptions } from 'electron'
import { describe, test } from 'vitest'

import { applicationMenuTemplate, defaultApplicationMenuModel, type MenuCommandRequest } from './application-menu'
import {
  acceleratorKeyInput,
  type ApplicationMenuModel,
  comboToAccelerator,
  MENU_APP_NAME_TOKEN,
  sanitizeMenuModel
} from './application-menu-model'

type Item = MenuItemConstructorOptions

function render(model: ApplicationMenuModel, opts: { quickAsk?: boolean } = {}) {
  const commands: MenuCommandRequest[] = []

  const template = applicationMenuTemplate(model, {
    appName: 'Hermes Studio',
    isMainCommandEnabled: id => (id === 'main.quickAsk' ? opts.quickAsk !== false : true),
    onCommand: request => commands.push(request)
  })

  return { commands, template }
}

const submenu = (item: Item | undefined): Item[] => (Array.isArray(item?.submenu) ? item.submenu : [])
const section = (template: Item[], label: string): Item[] => submenu(template.find(entry => entry.label === label))
const byId = (items: Item[], id: string): Item | undefined => items.find(entry => entry.id === id)
const roles = (items: Item[]) => items.filter(entry => entry.role).map(entry => entry.role)

function click(item: Item | undefined, triggeredByAccelerator = false) {
  assert.ok(item?.click, 'item is clickable')
  const menuItem = { checked: !item.checked } as never
  item.click(menuItem, undefined, { triggeredByAccelerator } as never)

  return menuItem as { checked: boolean }
}

function modelWith(items: ApplicationMenuModel['sections'][number]['items']): ApplicationMenuModel {
  return { sections: [{ id: 'view', label: 'View', items }] }
}

describe('default model (before any renderer publishes)', () => {
  test('keeps the long-standing native roles', () => {
    const { template } = render(defaultApplicationMenuModel())

    assert.equal(template[0].label, 'Hermes Studio')
    assert.deepEqual(roles(submenu(template[0])), ['services', 'hide', 'hideOthers', 'unhide', 'quit'])
    assert.deepEqual(roles(section(template, 'Edit')), [
      'undo',
      'redo',
      'cut',
      'copy',
      'paste',
      'pasteAndMatchStyle',
      'delete',
      'selectAll'
    ])

    const windowMenu = template.find(entry => entry.label === 'Window')

    assert.equal(windowMenu?.role, 'windowMenu')
    assert.deepEqual(roles(submenu(windowMenu)), ['minimize', 'zoom', 'front'])
    assert.equal(template.find(entry => entry.label === 'Help')?.role, 'help')
  })

  test('fills the app name and keeps main-owned accelerators only', () => {
    const { template } = render(defaultApplicationMenuModel())
    const app = submenu(template[0])
    const view = section(template, 'View')

    assert.equal(byId(app, 'main.about')?.label, 'About Hermes Studio')
    assert.equal(byId(view, 'main.zoomIn')?.accelerator, 'CommandOrControl+Plus')
    assert.equal(byId(view, 'main.actualSize')?.accelerator, 'CommandOrControl+0')
    assert.equal(byId(view, 'main.toggleDevTools')?.accelerator, 'Alt+Command+I')
    // ⌘W and ⌘R stay with before-input-event so a focused surface can claim them.
    assert.equal(byId(view, 'main.reload')?.accelerator, undefined)
    assert.equal(byId(section(template, 'File'), 'main.closeTab')?.accelerator, undefined)
  })
})

describe('model → template', () => {
  test('substitutes the app name token in labels, role labels included', () => {
    const { template } = render({
      sections: [
        {
          id: 'app',
          label: MENU_APP_NAME_TOKEN,
          items: [
            { type: 'command', id: 'menu.about', label: `关于 ${MENU_APP_NAME_TOKEN}` },
            { type: 'role', role: 'quit', label: `退出 ${MENU_APP_NAME_TOKEN}` }
          ]
        }
      ]
    })

    const items = submenu(template[0])

    assert.equal(items[0].label, '关于 Hermes Studio')
    assert.deepEqual({ label: items[1].label, role: items[1].role }, { label: '退出 Hermes Studio', role: 'quit' })
  })

  test('accelerators come only from allow-listed actions and never from reserved or unmodified chords', () => {
    const { template } = render(
      modelWith([
        { type: 'command', id: 'view.toggleSidebar', label: 'Sidebar', accelerator: 'Command+B' },
        // Not allow-listed: the find bar owns ⌘F while it is open.
        { type: 'command', id: 'view.findInPage', label: 'Find', accelerator: 'Command+F' },
        // Allow-listed but rebound onto a chord the menu already owns.
        { type: 'command', id: 'session.new', label: 'New', accelerator: 'Command+W' },
        // Allow-listed but no Command/Control: it would steal typing.
        { type: 'command', id: 'session.newTab', label: 'Tab', accelerator: 'Shift+T' },
        // A second item on the same chord loses it.
        { type: 'command', id: 'view.flipPanes', label: 'Flip', accelerator: 'Command+B' },
        // Disabled items never carry one (the chord reaches the renderer as before).
        { type: 'command', id: 'view.toggleStatusbar', label: 'Status', accelerator: 'Command+Shift+S', enabled: false }
      ])
    )

    const items = submenu(template[0])

    assert.deepEqual(
      items.map(item => [item.id, item.accelerator]),
      [
        ['view.toggleSidebar', 'Command+B'],
        ['view.findInPage', undefined],
        ['session.new', undefined],
        ['session.newTab', undefined],
        ['view.flipPanes', undefined],
        ['view.toggleStatusbar', undefined]
      ]
    )
    assert.equal(byId(items, 'view.toggleStatusbar')?.enabled, false)
  })

  test('a disabled session item stays disabled', () => {
    const { template } = render({
      sections: [
        {
          id: 'session',
          label: 'Session',
          items: [
            { type: 'command', id: 'session.rename', label: 'Rename…', enabled: false },
            { type: 'command', id: 'composer.modelPicker', label: 'Switch Model…', accelerator: 'Command+Shift+M' }
          ]
        }
      ]
    })

    const items = submenu(template[0])

    assert.equal(byId(items, 'session.rename')?.enabled, false)
    assert.equal(byId(items, 'composer.modelPicker')?.enabled, true)
    assert.equal(byId(items, 'composer.modelPicker')?.accelerator, 'Command+Shift+M')
  })

  test('checkmark items report clicks and leave the mark to the next model', () => {
    const { commands, template } = render(
      modelWith([{ type: 'command', id: 'menu.appearance.dark', label: 'Dark', checked: false }])
    )

    const item = submenu(template[0])[0]

    assert.equal(item.type, 'checkbox')
    // Electron already flipped it to true before calling click.
    assert.equal(click(item).checked, false)
    assert.deepEqual(commands, [
      { accelerator: undefined, id: 'menu.appearance.dark', triggeredByAccelerator: false, window: undefined }
    ])
  })

  test('tells clicks and key equivalents apart', () => {
    const { commands, template } = render(
      modelWith([{ type: 'command', id: 'session.new', label: 'New Session', accelerator: 'Command+N' }])
    )

    click(submenu(template[0])[0], true)

    assert.equal(commands[0].triggeredByAccelerator, true)
    assert.equal(commands[0].accelerator, 'Command+N')
  })

  test('main can veto its own commands (Quick Ask follows the Quick Entry setting)', () => {
    const model: ApplicationMenuModel = {
      sections: [
        { id: 'window', label: 'Window', items: [{ type: 'command', id: 'main.quickAsk', label: 'Quick Ask' }] }
      ]
    }

    assert.equal(submenu(render(model, { quickAsk: false }).template[0])[0].enabled, false)
    assert.equal(submenu(render(model).template[0])[0].enabled, true)
  })

  test('tidies separators and drops empty submenus', () => {
    const { template } = render(
      modelWith([
        { type: 'separator' },
        { type: 'command', id: 'a', label: 'A' },
        { type: 'separator' },
        { type: 'separator' },
        { type: 'submenu', label: 'Empty', items: [{ type: 'separator' }] },
        { type: 'command', id: 'b', label: 'B' },
        { type: 'separator' }
      ])
    )

    assert.deepEqual(
      submenu(template[0]).map(item => item.id ?? item.type),
      ['a', 'separator', 'b']
    )
  })
})

describe('sanitizeMenuModel', () => {
  test('drops unknown roles, malformed items and duplicate sections; keeps the rest', () => {
    const model = sanitizeMenuModel({
      sections: [
        {
          id: 'edit',
          label: 'Edit',
          items: [
            { type: 'role', role: 'undo', label: 'Undo' },
            { type: 'role', role: 'toggleDevTools' },
            { type: 'command', id: 'bad id!', label: 'x' },
            { type: 'command', id: 'view.findInPage', label: 'Find…', accelerator: 'Cmd+f', checked: 'yes' },
            { type: 'submenu', label: 'Spelling', items: [{ type: 'role', role: 'toggleSpellChecker' }] },
            'junk'
          ]
        },
        { id: 'edit', label: 'Edit again', items: [] },
        { id: 'nope', label: 'Nope', items: [] }
      ]
    })

    assert.deepEqual(model, {
      sections: [
        {
          id: 'edit',
          label: 'Edit',
          items: [
            { type: 'role', role: 'undo', label: 'Undo' },
            { type: 'command', id: 'view.findInPage', label: 'Find…', accelerator: 'Command+F' },
            { type: 'submenu', label: 'Spelling', items: [{ type: 'role', role: 'toggleSpellChecker' }] }
          ]
        }
      ]
    })
  })

  test('rejects anything without a usable section', () => {
    assert.equal(sanitizeMenuModel(null), null)
    assert.equal(sanitizeMenuModel({ sections: [] }), null)
    assert.equal(sanitizeMenuModel({ sections: [{ id: 'view' }] }), null)
  })
})

describe('accelerators', () => {
  test('keybind combos map to macOS accelerators', () => {
    assert.equal(comboToAccelerator('mod+b'), 'Command+B')
    assert.equal(comboToAccelerator('mod+shift+l'), 'Command+Shift+L')
    assert.equal(comboToAccelerator('mod+\\'), 'Command+\\')
    assert.equal(comboToAccelerator('mod+shift+\\'), 'Command+Shift+\\')
    assert.equal(comboToAccelerator('mod+,'), 'Command+,')
    assert.equal(comboToAccelerator('mod+.'), 'Command+.')
    assert.equal(comboToAccelerator('mod+/'), 'Command+/')
    assert.equal(comboToAccelerator('mod+shift+0'), 'Command+Shift+0')
    assert.equal(comboToAccelerator('ctrl+alt+k'), 'Control+Alt+K')
  })

  test('refuses chords that would steal typing or that the menu already owns', () => {
    assert.equal(comboToAccelerator('shift+x'), null)
    assert.equal(comboToAccelerator('/'), null)
    assert.equal(comboToAccelerator('mod+w'), null)
    assert.equal(comboToAccelerator('mod+q'), null)
    assert.equal(comboToAccelerator('mod+c'), null)
    assert.equal(comboToAccelerator('mod+0'), null)
    assert.equal(comboToAccelerator('mod+`'), null)
    assert.equal(comboToAccelerator('mod+nonsense'), null)
  })

  test('a fired accelerator replays as the same keystroke', () => {
    assert.deepEqual(acceleratorKeyInput('Command+B'), { keyCode: 'b', modifiers: ['meta'] })
    assert.deepEqual(acceleratorKeyInput('Command+Shift+\\'), { keyCode: '\\', modifiers: ['meta', 'shift'] })
    assert.deepEqual(acceleratorKeyInput('Control+Alt+Space'), { keyCode: 'Space', modifiers: ['control', 'alt'] })
    assert.equal(acceleratorKeyInput('Command+'), null)
  })
})
