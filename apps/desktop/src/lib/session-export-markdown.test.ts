import { describe, expect, it } from 'vitest'

import type { ChatMessage } from '@/lib/chat-messages/types'

import { sessionMarkdown } from './session-export'

const message = (role: ChatMessage['role'], parts: ChatMessage['parts'], extra: Partial<ChatMessage> = {}) =>
  ({ id: `${role}-${parts.length}`, parts, role, ...extra }) as ChatMessage

describe('sessionMarkdown', () => {
  it('writes the title and each visible turn under its speaker, text only', () => {
    const markdown = sessionMarkdown(
      'Deploy plan',
      [
        message('user', [{ text: 'Ship it?', type: 'text' }]),
        message('assistant', [
          { text: 'thinking…', type: 'reasoning' },
          { text: 'Yes — after the tests.', type: 'text' }
        ]),
        message('assistant', [{ text: 'hidden', type: 'text' }], { hidden: true }),
        message('system', [{ text: 'compacted', type: 'text' }])
      ] as ChatMessage[],
      { assistant: 'Hermes', user: 'You' }
    )

    expect(markdown).toBe('# Deploy plan\n\n## You\n\nShip it?\n\n## Hermes\n\nYes — after the tests.\n')
  })
})
