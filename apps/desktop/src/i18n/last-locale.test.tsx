import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type I18nConfigClient, I18nProvider, useI18n } from './context'

const KEY = 'hermes.desktop.lastLocale'

function Probe() {
  const { locale, setLocale } = useI18n()

  return (
    <div>
      <p data-testid="locale">{locale}</p>
      <button onClick={() => void setLocale('ja').catch(() => undefined)} type="button">
        switch
      </button>
    </div>
  )
}

describe('remembered locale', () => {
  beforeEach(() => window.localStorage.setItem(KEY, 'zh'))

  afterEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('starts the app window in the last settled language', () => {
    render(
      <I18nProvider configClient={null} persistLocale>
        <Probe />
      </I18nProvider>
    )

    expect(screen.getByTestId('locale').textContent).toBe('zh')
  })

  it('leaves other providers on the default', () => {
    render(
      <I18nProvider configClient={null}>
        <Probe />
      </I18nProvider>
    )

    expect(screen.getByTestId('locale').textContent).toBe('en')
  })

  it('remembers what the user picks', async () => {
    render(
      <I18nProvider configClient={null} persistLocale>
        <Probe />
      </I18nProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'switch' }))

    await waitFor(() => expect(window.localStorage.getItem(KEY)).toBe('ja'))
  })

  it('never remembers the English fallback of a failed config read', async () => {
    const configClient: I18nConfigClient = {
      getConfig: vi.fn().mockRejectedValue(new Error('backend not up')),
      saveConfig: vi.fn()
    }

    render(
      <I18nProvider configClient={configClient} persistLocale>
        <Probe />
      </I18nProvider>
    )

    await waitFor(() => expect(screen.getByTestId('locale').textContent).toBe('en'))
    expect(window.localStorage.getItem(KEY)).toBe('zh')
  })
})
