import { act, cleanup, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider, useI18n } from '@/i18n'

import { useComposerPlaceholder } from './use-composer-placeholder'

function Wrapper({ children }: PropsWithChildren) {
  return (
    <I18nProvider configClient={null} initialLocale="en">
      {children}
    </I18nProvider>
  )
}

const renderPlaceholder = (sessionId: null | string) =>
  renderHook(
    ({ id }: { id: null | string }) => ({
      i18n: useI18n(),
      placeholder: useComposerPlaceholder({ disabled: false, reconnecting: false, sessionId: id })
    }),
    { initialProps: { id: sessionId }, wrapper: Wrapper }
  )

const slotOf = (pool: readonly string[], text: string) => pool.indexOf(text)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('useComposerPlaceholder', () => {
  it('follows a language switch with the same line', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const { result } = renderPlaceholder(null)
    const en = result.current.i18n.t.composer.newSessionPlaceholders
    const slot = slotOf(en, result.current.placeholder)

    expect(slot).toBeGreaterThanOrEqual(0)

    await act(() => result.current.i18n.setLocale('zh'))

    const zh = result.current.i18n.t.composer.newSessionPlaceholders

    expect(result.current.placeholder).toBe(zh[slot])
    expect(en).not.toContain(result.current.placeholder)
  })

  it('keeps the starter when the new session gets its id', () => {
    const { rerender, result } = renderPlaceholder(null)
    const starter = result.current.placeholder

    rerender({ id: 'session-1' })

    expect(result.current.placeholder).toBe(starter)
  })

  it('offers a follow-up line in an existing session', () => {
    const { result } = renderPlaceholder('session-1')

    expect(result.current.i18n.t.composer.followUpPlaceholders).toContain(result.current.placeholder)
  })
})
