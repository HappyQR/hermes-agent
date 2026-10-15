// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { atom } from 'nanostores'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProfileInfo } from '@/types/hermes'

vi.mock('@/store/gateway', () => ({
  $gateway: atom<unknown>(null),
  ensureGatewayForAgent: vi.fn(async () => undefined),
  ensureGatewayForProfile: vi.fn(async () => undefined),
  openGatewayForProfile: vi.fn(async () => undefined)
}))
vi.mock('@/hermes', () => ({
  getProfiles: vi.fn(async () => ({ profiles: [] })),
  setApiRequestProfile: vi.fn()
}))
vi.mock('@/lib/query-client', () => ({ invalidateProfileScopedQueries: vi.fn() }))
vi.mock('@/store/starmap', () => ({ resetStarmapGraph: vi.fn() }))

const { I18nProvider } = await import('@/i18n')
const { $activeGatewayProfile, $profiles } = await import('@/store/profile')
const { $settingsScopeOverride } = await import('@/store/settings-scope')
const { SettingsScopeBadge, SettingsScopeNote, SettingsScopePopup } = await import('./scope')

const profile = (name: string, isDefault = false): ProfileInfo =>
  ({ has_env: false, is_default: isDefault, model: null, name }) as ProfileInfo

const wrap = (node: React.ReactNode) =>
  render(
    <I18nProvider configClient={null} initialLocale="en">
      {node}
    </I18nProvider>
  )

beforeEach(() => {
  $activeGatewayProfile.set('default')
  $settingsScopeOverride.set(null)
  $profiles.set([profile('default', true)])
})

afterEach(cleanup)

describe('settings window scope', () => {
  it('device pages say they apply to this device only; profile pages stay quiet with one profile', () => {
    wrap(<SettingsScopeBadge page="appearance" />)
    expect(document.body.textContent).toMatch(/This (Mac|device) only/)
    cleanup()

    const { container } = wrap(<SettingsScopeBadge page="models" />)
    expect(container.textContent).toBe('')
    expect(wrap(<SettingsScopePopup />).container.textContent).toBe('')
  })

  it('with two profiles, names the edited profile and loudly states a non-default target', () => {
    $profiles.set([profile('default', true), profile('coder')])
    $settingsScopeOverride.set('coder')

    wrap(<SettingsScopeBadge page="models" />)
    expect(document.body.textContent).toContain('Applies to “coder”')

    wrap(<SettingsScopePopup />)
    expect(screen.getByRole('button', { name: /Applies to\s*coder/ })).toBeTruthy()

    wrap(<SettingsScopeNote />)
    const note = screen.getByRole('status')
    expect(note.getAttribute('data-scope-loud')).toBe('true')
    expect(note.textContent).toContain('coder')
  })
})
