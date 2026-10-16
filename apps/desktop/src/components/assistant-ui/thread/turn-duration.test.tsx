import { type ThreadMessage } from '@assistant-ui/react'
import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { I18nProvider } from '@/i18n'

import { assistantMessage, stubThreadEnvironment, stubThreadViewportSize, ThreadRuntime, userMessage } from '../test-utils'

import { Thread } from '.'

// The reply footer's turn time: the live-measured `durationS` when the desktop
// watched the turn, else the persisted span a reloaded turn still carries.

stubThreadEnvironment()
stubThreadViewportSize()

const SENT = Date.parse('2026-06-03T09:00:00.000Z') / 1000

function sent(timestamp?: number): ThreadMessage {
  const message = userMessage()

  return { ...message, metadata: { custom: timestamp ? { timelineTimestamp: timestamp } : {} } } as ThreadMessage
}

function reply(custom: Record<string, unknown>, finishedAt?: number): ThreadMessage {
  const message = assistantMessage()

  return {
    ...message,
    content: [{ type: 'text', text: 'done', ...(finishedAt ? { timestamp: finishedAt } : {}) }],
    metadata: { ...message.metadata, custom }
  } as ThreadMessage
}

const renderTurn = (messages: ThreadMessage[]) =>
  render(
    <I18nProvider configClient={null} initialLocale="en">
      <ThreadRuntime messages={messages}>
        <Thread />
      </ThreadRuntime>
    </I18nProvider>
  )

afterEach(cleanup)

describe('the reply footer turn time', () => {
  it('shows a reloaded turn its persisted span', async () => {
    const { container } = renderTurn([sent(SENT), reply({ timelineTimestamp: SENT + 2 }, SENT + 48)])

    await waitFor(() =>
      expect(container.querySelector('[data-slot="aui_turn-duration"]')?.textContent).toBe('48s')
    )
  })

  it('shows only the clock time when the turn carries no timestamps', async () => {
    const { container } = renderTurn([sent(), reply({})])

    await waitFor(() => expect(container.querySelector('[data-slot="aui_msg-footer"] time')).not.toBeNull())
    expect(container.querySelector('[data-slot="aui_turn-duration"]')).toBeNull()
  })

  it('prefers the live-measured time', async () => {
    const { container } = renderTurn([sent(SENT), reply({ durationS: 12 }, SENT + 48)])

    await waitFor(() =>
      expect(container.querySelector('[data-slot="aui_turn-duration"]')?.textContent).toBe('12s')
    )
  })

  it('rounds a sub-second turn up to a second, as the live time does', async () => {
    const { container } = renderTurn([sent(SENT), reply({}, SENT + 0.4)])

    await waitFor(() =>
      expect(container.querySelector('[data-slot="aui_turn-duration"]')?.textContent).toBe('1s')
    )
  })

  it('shows nothing for a span that is not one turn', async () => {
    const { container } = renderTurn([sent(SENT), reply({}, SENT + 2 * 86_400)])

    await waitFor(() => expect(container.querySelector('[data-slot="aui_msg-footer"]')).not.toBeNull())
    expect(container.querySelector('[data-slot="aui_turn-duration"]')).toBeNull()
  })
})
