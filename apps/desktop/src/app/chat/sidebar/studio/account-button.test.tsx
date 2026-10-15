import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type * as ReactRouter from 'react-router'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider, TRANSLATIONS } from '@/i18n'
import { $connectionsRegistry } from '@/store/connection-registry-state'
import type * as ProfileStore from '@/store/profile'
import { $activeGatewayProfile, $profileCreateRequest, $profiles, $showAllProfiles } from '@/store/profile'
import { $profileRailVisible } from '@/store/profile-rail-prefs'
import type * as RemoteOverrideStore from '@/store/profile-remote-override'
import { $gatewayState } from '@/store/session'
import type { ProfileInfo } from '@/types/hermes'

import { SidebarAccount } from './account-button'

const selectProfile = vi.fn()
const navigate = vi.fn()

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof ReactRouter>()),
  useNavigate: () => navigate
}))

vi.mock('@/store/profile', async importOriginal => ({
  ...(await importOriginal<typeof ProfileStore>()),
  refreshActiveProfile: vi.fn().mockResolvedValue(undefined),
  selectProfile: (name: string) => selectProfile(name)
}))

vi.mock('@/store/profile-remote-override', async importOriginal => ({
  ...(await importOriginal<typeof RemoteOverrideStore>()),
  refreshProfileRemoteOverrides: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('../use-fleet-roster', () => ({ useFleetRoster: () => undefined }))

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
})

const profile = (name: string, isDefault = false): ProfileInfo => ({
  has_env: false,
  is_default: isDefault,
  model: null,
  name,
  path: `/profiles/${name}`,
  provider: null,
  skill_count: 0
})

const en = TRANSLATIONS.en
const copy = en.studio.sidebar.footer

function renderAccount() {
  return render(
    <MemoryRouter>
      <I18nProvider configClient={null} initialLocale="en">
        <SidebarAccount />
      </I18nProvider>
    </MemoryRouter>
  )
}

async function openMenu() {
  const trigger = screen.getByRole('button', { name: new RegExp(copy.account) })

  await act(async () => {
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' })
    await Promise.resolve()
  })

  return screen.findByRole('menu')
}

describe('SidebarAccount', () => {
  beforeEach(() => {
    $profiles.set([profile('default', true), profile('clippy')])
    $activeGatewayProfile.set('default')
    $showAllProfiles.set(false)
    $gatewayState.set('open')
    $profileRailVisible.set(false)
    $connectionsRegistry.set({
      version: 2,
      primary: 'local',
      secureTokenStorage: true,
      connections: [{ id: 'local', label: 'This computer', kind: 'local', tokenSet: false, tokenPreview: null }]
    } as NonNullable<typeof $connectionsRegistry.value>)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('names the active profile and the gateway it is on', () => {
    renderAccount()

    const button = screen.getByRole('button', { name: new RegExp(copy.account) })

    expect(button.textContent).toContain('default')
    expect(button.textContent).toContain(`This computer · ${copy.ready}`)
  })

  it("lists this gateway's profiles and switches from a row", async () => {
    renderAccount()

    const menu = await openMenu()

    expect(within(menu).getByText(en.profiles.allProfiles)).toBeTruthy()
    expect(within(menu).getByText(`default${copy.defaultSuffix}`)).toBeTruthy()

    await act(async () => {
      fireEvent.click(within(menu).getByText('clippy'))
      await Promise.resolve()
    })

    expect(selectProfile).toHaveBeenCalledWith('clippy')
  })

  it('keeps Settings, System status and the gateway one click away', async () => {
    renderAccount()

    const menu = await openMenu()

    expect(within(menu).getByRole('menuitem', { name: copy.gateway })).toBeTruthy()
    expect(within(menu).getByRole('menuitem', { name: copy.systemStatus })).toBeTruthy()

    await act(async () => {
      fireEvent.click(within(menu).getByRole('menuitem', { name: copy.settings }))
      await Promise.resolve()
    })

    expect(navigate).toHaveBeenCalledWith('/settings')
  })

  it('answers the new-profile shortcut while the rail is hidden, and leaves it to the rail otherwise', async () => {
    renderAccount()

    await act(async () => $profileCreateRequest.set($profileCreateRequest.get() + 1))
    expect(screen.getByRole('dialog', { name: en.profiles.newProfile })).toBeTruthy()

    cleanup()
    $profileRailVisible.set(true)
    renderAccount()

    await act(async () => $profileCreateRequest.set($profileCreateRequest.get() + 1))
    expect(screen.queryByRole('dialog', { name: en.profiles.newProfile })).toBeNull()
  })
})
