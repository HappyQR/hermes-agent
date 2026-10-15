import { act, cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { $capture } from '@/store/keybinds'
import { $sendDiagnostics, dismissSendDiagnostics } from '@/store/send-diagnostics'

import type {
  ApplicationMenuModel,
  MenuCommandItem,
  MenuCommandPayload,
  MenuModelItem
} from '../../../electron/application-menu-model'

import { NativeMenu } from './native-menu-host'
import { menuCommandIds } from './native-menu-model'

// The application menu exists on macOS only; the renderer publishes nothing elsewhere.
vi.mock('@/lib/platform', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  isMacPlatform: () => true
}))

const desktopWindow = window as unknown as { hermesDesktop?: Window['hermesDesktop'] }
const initialHermesDesktop = desktopWindow.hermesDesktop

const actions = {
  onArchiveSession: vi.fn(),
  onBranchSession: vi.fn(),
  onCancel: vi.fn(),
  onDeleteSession: vi.fn(),
  onSubmit: vi.fn()
}

function flat(list: readonly MenuModelItem[]): MenuModelItem[] {
  return list.flatMap(item => (item.type === 'submenu' ? [item, ...flat(item.items)] : [item]))
}

const accelerated = (model: ApplicationMenuModel) =>
  model.sections
    .flatMap(section => flat(section.items))
    .filter((item): item is MenuCommandItem => item.type === 'command' && Boolean(item.accelerator))

describe('NativeMenu', () => {
  let published: ApplicationMenuModel[]
  let deliver: (payload: MenuCommandPayload) => void

  beforeEach(() => {
    published = []
    deliver = () => undefined
    desktopWindow.hermesDesktop = {
      ...initialHermesDesktop,
      onMenuCommand: (callback: (payload: MenuCommandPayload) => void) => {
        deliver = callback

        return () => undefined
      },
      setMenuModel: (model: ApplicationMenuModel) => published.push(model)
    } as unknown as Window['hermesDesktop']
  })

  afterEach(() => {
    cleanup()
    $capture.set(null)
    dismissSendDiagnostics()
    desktopWindow.hermesDesktop = initialHermesDesktop
  })

  const mount = () =>
    render(
      <MemoryRouter>
        <NativeMenu actions={actions} />
      </MemoryRouter>
    )

  it('publishes the whole menu on first mount, menu-only commands included', () => {
    mount()

    expect(published).toHaveLength(1)
    expect(menuCommandIds(published[0])).toEqual(
      expect.arrayContaining(['session.new', 'menu.about', 'menu.newProject', 'menu.session.rename', 'menu.help.docs'])
    )
  })

  it('republishes only when the menu changes, without key equivalents while a chord is recorded', () => {
    mount()

    expect(accelerated(published[0]).length).toBeGreaterThan(0)

    act(() => $capture.set('view.toggleSidebar'))
    expect(published).toHaveLength(2)
    expect(accelerated(published[1])).toEqual([])

    act(() => $capture.set('view.toggleSidebar'))
    expect(published).toHaveLength(2)
  })

  it('runs the commands main sends back', () => {
    mount()

    act(() => deliver({ id: 'menu.help.diagnostics' }))

    expect($sendDiagnostics.get()?.phase).toBe('consent')
  })
})
