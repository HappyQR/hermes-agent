// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { atom } from 'nanostores'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Keep store/profile's side-effecting imports inert (same seam as profile-scope.test.tsx).
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
vi.mock('@/store/desktop-metrics', () => ({ recordFeatureUse: vi.fn(), settingsArea: (view: string) => view }))

// The pages compose the real settings components; this suite covers the shell:
// navigation, legacy-link rewriting, search and close.
vi.mock('./page-view', () => ({
  SettingsPageView: ({ page }: { page: string }) => <div data-testid="page">{page}</div>
}))

// Sidebar search over a small fixed catalog (no gateway, no schema fetch).
vi.mock('../use-settings-search', () => ({
  useSettingsSearchCatalog: () => ({
    configEntries: [],
    credentialEntries: [],
    pluginEntries: [],
    settingEntries: [
      {
        context: 'Appearance',
        icon: () => null,
        id: 'setting:appearance.ui-scale',
        keywords: ['zoom'],
        label: 'UI Scale',
        target: { setting: 'appearance.ui-scale', view: 'config:appearance' }
      }
    ],
    subpageEntries: []
  })
}))

const { I18nProvider } = await import('@/i18n')
const { SettingsWindow } = await import('./settings-window')

function LocationProbe() {
  const location = useLocation()

  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
}

function renderWindow(entry: string, onClose = vi.fn()) {
  render(
    <I18nProvider configClient={null} initialLocale="en">
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route
            element={
              <>
                <SettingsWindow onClose={onClose} />
                <LocationProbe />
              </>
            }
            path="/settings"
          />
        </Routes>
      </MemoryRouter>
    </I18nProvider>
  )

  return { onClose }
}

afterEach(cleanup)

describe('Settings window', () => {
  it('opens on General with every category in the sidebar', () => {
    renderWindow('/settings')

    expect(screen.getByTestId('page').textContent).toBe('general')
    expect(document.querySelector('[data-tour="nav-general"]')?.getAttribute('aria-current')).toBe('page')
    expect(document.querySelectorAll('[data-tour^="nav-"]')).toHaveLength(19)
  })

  it('rewrites a legacy deep link to the page that hosts it now', async () => {
    renderWindow('/settings?tab=config:model&page=auxiliary&aux=vision')

    expect(screen.getByTestId('page').textContent).toBe('models')
    await act(async () => undefined)
    expect(screen.getByTestId('location').textContent).toBe('/settings?tab=models&section=auxiliary&aux=vision')
  })

  it('switches pages from the sidebar', () => {
    renderWindow('/settings?tab=general')

    fireEvent.click(document.querySelector('[data-tour="nav-voice"]')!)

    expect(screen.getByTestId('page').textContent).toBe('voice')
    expect(screen.getByTestId('location').textContent).toBe('/settings?tab=voice')
  })

  it('searches categories, sections and settings, and Esc clears the query first', () => {
    renderWindow('/settings?tab=general')

    const search = screen.getByRole('textbox', { name: 'Search settings' })
    fireEvent.change(search, { target: { value: 'ui scale' } })

    const hits = screen.getAllByRole('option')
    expect(hits[0].textContent).toContain('UI Scale')
    expect(hits[0].textContent).toContain('Appearance › Fonts & Scaling')

    fireEvent.keyDown(search, { key: 'Enter' })
    expect(screen.getByTestId('page').textContent).toBe('appearance')

    fireEvent.change(search, { target: { value: 'nothing-matches-this' } })
    expect(screen.getByText('No results for “nothing-matches-this”')).toBeTruthy()

    const escape = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' })
    act(() => {
      search.dispatchEvent(escape)
    })
    expect(escape.defaultPrevented).toBe(true)
    expect((search as HTMLInputElement).value).toBe('')
  })

  it('closes from the window control', () => {
    const { onClose } = renderWindow('/settings')

    fireEvent.click(screen.getByRole('button', { name: 'Close settings' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
