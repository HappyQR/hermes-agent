import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n'
import type { ChatMessage } from '@/lib/chat-messages'
import { $messages } from '@/store/session'
import { $voicePlayback } from '@/store/voice-playback'

import { VoiceCapsule } from './voice-capsule'

const capsule = (overrides: Partial<ComponentProps<typeof VoiceCapsule>> = {}) => {
  const props = {
    disabled: false,
    level: 0.6,
    muted: false,
    onEnd: vi.fn(),
    onStopTurn: vi.fn(),
    onToggleMute: vi.fn(),
    status: 'listening' as const,
    ...overrides
  }

  render(
    <I18nProvider configClient={null} initialLocale="en">
      <VoiceCapsule {...props} />
    </I18nProvider>
  )

  return props
}

const assistant = (id: string, parts: unknown[]) => ({ id, parts, role: 'assistant' }) as unknown as ChatMessage

afterEach(() => {
  cleanup()
  $messages.set([])
  $voicePlayback.set({ audioElement: null, messageId: null, sequence: 0, source: null, status: 'idle' })
})

describe('the voice capsule', () => {
  it('listens with the stop phrase under it, and ends the take, mutes or ends the conversation', () => {
    const props = capsule()

    expect(screen.getByText('Listening')).toBeTruthy()
    expect(screen.getByText('Say "stop" to end the voice chat.')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Stop listening and send' }))
    expect(props.onStopTurn).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Mute microphone' }))
    expect(props.onToggleMute).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'End voice conversation' }))
    expect(props.onEnd).toHaveBeenCalledOnce()
  })

  it('reads muted, with no take to end', () => {
    capsule({ muted: true })

    expect(screen.getByText('Muted')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Unmute microphone' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.queryByRole('button', { name: 'Stop listening and send' })).toBeNull()
  })

  it('shows the tool running while Hermes thinks and the reply it is speaking', () => {
    $messages.set([
      assistant('a1', [{ type: 'tool-call', toolCallId: 't1', toolName: 'terminal', args: { command: 'npm test' } }])
    ])
    capsule({ status: 'thinking' })

    expect(screen.getByText('Thinking')).toBeTruthy()
    expect(screen.getByText('Running npm test')).toBeTruthy()

    cleanup()
    $messages.set([assistant('a2', [{ type: 'text', text: 'Sure — reminder set for Monday 10 am.' }])])
    $voicePlayback.set({
      audioElement: null,
      messageId: 'a2',
      sequence: 1,
      source: 'voice-conversation',
      status: 'speaking'
    })
    capsule({ status: 'speaking' })

    expect(screen.getByText('Speaking')).toBeTruthy()
    expect(screen.getByText('Sure — reminder set for Monday 10 am.')).toBeTruthy()
  })
})
