import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n'
import { $hudMode } from '@/store/hud'

import { greetingFor, StudioIntro } from './empty-state'

const focus = vi.hoisted(() => ({ requestComposerFocus: vi.fn(), requestComposerInsert: vi.fn() }))

vi.mock('@/app/chat/composer/focus', () => focus)

function LocationProbe() {
  return <span data-testid="location">{useLocation().pathname}</span>
}

const renderIntro = () =>
  render(
    <I18nProvider configClient={null} initialLocale="en">
      <MemoryRouter>
        <LocationProbe />
        <div data-chat-surface="">
          <StudioIntro />
        </div>
      </MemoryRouter>
    </I18nProvider>
  )

afterEach(() => {
  cleanup()
  $hudMode.set(false)
  vi.clearAllMocks()
})

describe('the empty chat', () => {
  it('greets by the time of day', () => {
    expect([3, 9, 12, 15, 21].map(greetingFor)).toEqual(['lateNight', 'morning', 'noon', 'afternoon', 'evening'])
  })

  it('sits on the chat surface, drafts a starter into this composer and links to the import', () => {
    const { container } = renderIntro()
    const surface = container.querySelector('[data-chat-surface]')

    // Portaled onto the surface itself: the composer dock's containing block.
    expect(surface?.querySelector(':scope > .studio-empty-hello h1')?.textContent).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Fix an error/ }))
    expect(focus.requestComposerInsert).toHaveBeenCalledWith('Help me look at this error:', { target: 'main' })
    expect(focus.requestComposerFocus).toHaveBeenCalledWith('main')

    fireEvent.click(screen.getByRole('button', { name: 'Continue from Claude Code or Codex' }))
    expect(screen.getByTestId('location').textContent).toBe('/session-import')
  })

  it('keeps the classic splash in the HUD', () => {
    $hudMode.set(true)
    const { container } = renderIntro()

    expect(container.querySelector('.studio-empty-hello')).toBeNull()
    expect(container.querySelector('[data-slot="aui_intro"]')).not.toBeNull()
  })
})
