import assert from 'node:assert/strict'

import type { MenuItemConstructorOptions } from 'electron'
import { test } from 'vitest'

import { createApplicationMenuHost, type MenuWebContents } from './application-menu-host'
import { type ApplicationMenuModel, MENU_COMMAND_CHANNEL } from './application-menu-model'

interface FakeContents extends MenuWebContents {
  destroy: () => void
  inputs: unknown[]
  sent: unknown[][]
}

function contents(id: number): FakeContents {
  let destroyed = false
  const listeners: (() => void)[] = []

  const fake: FakeContents = {
    id,
    inputs: [],
    sent: [],
    destroy: () => {
      destroyed = true
      listeners.forEach(listener => listener())
    },
    isDestroyed: () => destroyed,
    once: (_event, listener) => listeners.push(listener),
    send: (...args) => fake.sent.push(args),
    sendInputEvent: event => fake.inputs.push(event)
  }

  return fake
}

function model(label: string, extra: ApplicationMenuModel['sections'][number]['items'] = []): ApplicationMenuModel {
  return {
    sections: [
      {
        id: 'view',
        label,
        items: [
          { type: 'command', id: 'view.toggleSidebar', label: 'Sidebar', accelerator: 'Command+B' },
          { type: 'command', id: 'main.zoomIn', label: 'Zoom In' },
          ...extra
        ]
      }
    ]
  }
}

function harness({ isMac = true } = {}) {
  const installed: MenuItemConstructorOptions[][] = []
  const mainCommands: string[] = []

  const state = {
    focusedWindow: null as FakeContents | null,
    focused: null as FakeContents | null,
    main: null as FakeContents | null
  }

  const host = createApplicationMenuHost<MenuItemConstructorOptions[]>({
    isMac,
    appName: 'Hermes Studio',
    buildMenu: template => template,
    setApplicationMenu: menu => installed.push(menu),
    focusedWebContents: () => state.focused,
    focusedWindowContents: () => state.focusedWindow,
    mainContents: () => state.main,
    runMainCommand: id => mainCommands.push(id)
  })

  return { host, installed, mainCommands, state }
}

const labels = (menu: MenuItemConstructorOptions[] | undefined) => (menu ?? []).map(entry => entry.label)

test('nothing is installed before the first-window installer builds the menu (#115332)', () => {
  const { host, installed } = harness()
  const win = contents(1)

  host.acceptModel(win, model('显示'))
  assert.equal(installed.length, 0)

  // The installer then builds from the model it already has.
  assert.deepEqual(labels(host.buildMenu()), ['显示'])
})

test('rebuilds only when the shown model actually changes', () => {
  const { host, installed } = harness()
  const win = contents(1)

  assert.deepEqual(labels(host.buildMenu()), ['Hermes Studio', 'File', 'Edit', 'View', 'Window', 'Help'])

  host.acceptModel(win, model('View'))
  host.acceptModel(win, model('View'))
  host.acceptModel(win, JSON.parse(JSON.stringify(model('View'))))
  assert.equal(installed.length, 1)

  host.acceptModel(win, model('显示'))
  assert.equal(installed.length, 2)
  assert.deepEqual(labels(installed.at(-1)), ['显示'])

  host.refresh()
  assert.equal(installed.length, 3)
})

test('the menu follows the focused window and falls back when its owner goes away', () => {
  const { host, installed, state } = harness()
  const first = contents(1)
  const second = contents(2)

  host.buildMenu()
  host.acceptModel(first, model('One'))
  // A background window's model is kept but not shown.
  host.acceptModel(second, model('Two'))
  assert.deepEqual(labels(installed.at(-1)), ['One'])

  state.focusedWindow = second
  host.windowFocused(second)
  assert.deepEqual(labels(installed.at(-1)), ['Two'])

  // A window without a model (Quick Entry, the pet) leaves the menu alone.
  host.windowFocused(contents(9))
  assert.deepEqual(labels(installed.at(-1)), ['Two'])

  second.destroy()
  assert.deepEqual(labels(installed.at(-1)), ['One'])
})

test('non-mac never installs a menu', () => {
  const { host, installed } = harness({ isMac: false })

  host.buildMenu()
  host.acceptModel(contents(1), model('View'))
  host.refresh()

  assert.equal(installed.length, 0)
})

test('clicks go to the window whose menu is shown; main commands stay in main', () => {
  const { host, mainCommands, state } = harness()
  const win = contents(1)

  host.buildMenu()
  host.acceptModel(win, model('View'))
  state.focusedWindow = win

  host.dispatch({ id: 'view.toggleSidebar', triggeredByAccelerator: false })
  host.dispatch({ id: 'main.zoomIn', triggeredByAccelerator: true })

  assert.deepEqual(win.sent, [[MENU_COMMAND_CHANNEL, { id: 'view.toggleSidebar' }]])
  assert.deepEqual(mainCommands, ['main.zoomIn'])
})

test('a fired key equivalent is replayed into whatever has focus, not run directly', () => {
  const { host, state } = harness()
  const win = contents(1)
  const guest = contents(7)

  host.buildMenu()
  host.acceptModel(win, model('View'))
  state.focusedWindow = win
  // A preview page has keyboard focus inside the window.
  state.focused = guest

  host.dispatch({ accelerator: 'Command+B', id: 'view.toggleSidebar', triggeredByAccelerator: true })

  assert.deepEqual(guest.inputs, [
    { keyCode: 'b', modifiers: ['meta'], type: 'keyDown' },
    { keyCode: 'b', modifiers: ['meta'], type: 'keyUp' }
  ])
  assert.deepEqual(win.sent, [])
})

test('with nothing focused a key equivalent runs like a click on the last window', () => {
  const { host, state } = harness()
  const win = contents(1)
  const main = contents(2)

  host.buildMenu()
  host.acceptModel(win, model('View'))
  state.main = main

  host.dispatch({ accelerator: 'Command+B', id: 'view.toggleSidebar', triggeredByAccelerator: true })
  assert.deepEqual(win.sent, [[MENU_COMMAND_CHANNEL, { id: 'view.toggleSidebar' }]])

  win.destroy()
  host.dispatch({ id: 'view.toggleSidebar', triggeredByAccelerator: false })
  assert.deepEqual(main.sent, [[MENU_COMMAND_CHANNEL, { id: 'view.toggleSidebar' }]])
})

test('a malformed model is ignored', () => {
  const { host, installed } = harness()

  host.buildMenu()
  host.acceptModel(contents(1), { sections: 'nope' })

  assert.equal(installed.length, 0)
})
