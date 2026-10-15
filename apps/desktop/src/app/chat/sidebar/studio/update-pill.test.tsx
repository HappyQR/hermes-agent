import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { DesktopUpdateStatus } from '@/global'
import { I18nProvider, TRANSLATIONS } from '@/i18n'
import { $connection } from '@/store/session'
import type * as UpdatesStore from '@/store/updates'
import { $backendUpdateStatus, $updateApply, $updateStatus, type UpdateApplyState } from '@/store/updates'

import { SidebarUpdatePill, updatePillState } from './update-pill'

const openUpdateOverlayFor = vi.fn()
const applyUpdates = vi.fn()

vi.mock('@/store/updates', async importOriginal => ({
  ...(await importOriginal<typeof UpdatesStore>()),
  applyUpdates: (...args: unknown[]) => applyUpdates(...args),
  openUpdateOverlayFor: (target: string) => openUpdateOverlayFor(target)
}))

const copy = TRANSLATIONS.en.studio.sidebar.footer

const idle: UpdateApplyState = {
  applying: false,
  command: null,
  error: null,
  log: [],
  message: '',
  percent: null,
  stage: 'idle'
}

const status = (patch: Partial<DesktopUpdateStatus>): DesktopUpdateStatus => ({ supported: true, ...patch })

describe('updatePillState', () => {
  it('names a stable release, and counts commits on a source branch', () => {
    expect(
      updatePillState('client', status({ channel: 'stable', latestTag: 'v0.22.2', updateAvailable: true }), idle, copy)
    ).toEqual({ detail: copy.updateView, headline: copy.updateAvailable('Hermes v0.22.2'), target: 'client' })

    expect(updatePillState('client', status({ behind: 3 }), idle, copy)).toEqual({
      detail: copy.updateBehind(3),
      headline: copy.updateGeneric,
      target: 'client'
    })
  })

  it('follows an apply through to the restart, and stays quiet otherwise', () => {
    expect(updatePillState('client', status({}), { ...idle, applying: true }, copy)?.detail).toBe(copy.updateApplying)
    expect(updatePillState('client', status({}), { ...idle, stage: 'restart' }, copy)?.detail).toBe(copy.updateRestart)
    expect(updatePillState('client', status({}), idle, copy)).toBeNull()
    // Installing would move back to an older release: nothing to announce.
    expect(updatePillState('client', status({ rollback: true, updateAvailable: true }), idle, copy)).toBeNull()
    expect(updatePillState('backend', status({ behind: 2 }), idle, copy)?.headline).toBe(copy.updateBackend)
  })
})

describe('SidebarUpdatePill', () => {
  afterEach(() => {
    cleanup()
    $updateStatus.set(null)
    $backendUpdateStatus.set(null)
    $updateApply.set(idle)
    $connection.set(null)
    vi.clearAllMocks()
  })

  it('opens the updates overlay for the waiting target and never installs', () => {
    $updateStatus.set(status({ behind: 1 }))

    render(
      <I18nProvider configClient={null} initialLocale="en">
        <SidebarUpdatePill />
      </I18nProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.updateGeneric) }))

    expect(openUpdateOverlayFor).toHaveBeenCalledWith('client')
    expect(applyUpdates).not.toHaveBeenCalled()
  })

  it("shows a remote backend's update only on a remote connection", () => {
    $backendUpdateStatus.set(status({ behind: 4 }))

    const { container, rerender } = render(
      <I18nProvider configClient={null} initialLocale="en">
        <SidebarUpdatePill />
      </I18nProvider>
    )

    expect(container.querySelector('[data-slot="sidebar-update"]')).toBeNull()

    $connection.set({ mode: 'remote' } as NonNullable<ReturnType<typeof $connection.get>>)
    rerender(
      <I18nProvider configClient={null} initialLocale="en">
        <SidebarUpdatePill />
      </I18nProvider>
    )

    expect(container.querySelector('[data-update-target="backend"]')).not.toBeNull()
  })
})
