import { type ThreadMessage } from '@assistant-ui/react'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { I18nProvider, setRuntimeI18nLocale, useI18n } from '@/i18n'
import type { Locale } from '@/i18n/types'
import { clearAllPrompts, setApprovalRequest } from '@/store/prompts'
import { $activeSessionId } from '@/store/session'
import { $toolDisclosureStates } from '@/store/tool-view'

import { stubThreadEnvironment, stubThreadViewportSize, ThreadRuntime } from '../test-utils'
import { Thread } from '../thread'

// Summaries are cached in assistant-ui selectors keyed on message state. The
// run's words come from the provider and are part of those keys, so switching
// the language re-words what is on screen without the thread changing — even
// when the module-level runtime locale lags the provider, as it did on the
// boot-time switch to the saved display.language.

stubThreadEnvironment()
stubThreadViewportSize()

const createdAt = new Date('2026-06-03T00:00:00.000Z')
const at = (offset: number) => createdAt.getTime() / 1000 + offset

const metadata = { unstable_state: null, unstable_annotations: [], unstable_data: [], steps: [], custom: {} }

function settledRun(): ThreadMessage {
  return {
    id: 'assistant-settled-run',
    role: 'assistant',
    content: [
      {
        type: 'tool-call',
        toolCallId: 'read-1',
        toolName: 'read_file',
        args: { path: '/repo/src/wiring.tsx' },
        argsText: JSON.stringify({ path: '/repo/src/wiring.tsx' }),
        timestamp: at(20),
        completedAt: at(21),
        result: { content: 'export const Wiring = () => null' }
      },
      {
        type: 'tool-call',
        toolCallId: 'term-1',
        toolName: 'terminal',
        args: { command: 'ls -la' },
        argsText: JSON.stringify({ command: 'ls -la' }),
        timestamp: at(22),
        completedAt: at(23),
        result: { exit_code: 0, stdout: 'wiring.tsx' }
      }
    ],
    status: { type: 'complete', reason: 'stop' },
    createdAt,
    metadata
  } as unknown as ThreadMessage
}

function awaitingApproval(): ThreadMessage {
  return {
    id: 'assistant-awaiting-approval',
    role: 'assistant',
    content: [
      {
        type: 'tool-call',
        toolCallId: 'term-2',
        toolName: 'terminal',
        args: { command: 'rm -rf /tmp/x' },
        argsText: JSON.stringify({ command: 'rm -rf /tmp/x' })
      }
    ],
    status: { type: 'running' },
    createdAt,
    metadata
  } as unknown as ThreadMessage
}

let switchLocale: (next: Locale) => Promise<void> = async () => {}

function LocaleSwitch() {
  switchLocale = useI18n().setLocale

  return null
}

// Holds the runtime locale on English while the tree renders (it consumes the
// provider, so it re-renders first on every switch): whatever reads
// runtimeTranslations() during render stays English; the provider's copy does not.
function LaggingRuntimeLocale() {
  useI18n()
  setRuntimeI18nLocale('en')

  return null
}

const renderThread = (message: ThreadMessage) =>
  render(
    <I18nProvider configClient={null} initialLocale="en">
      <LocaleSwitch />
      <LaggingRuntimeLocale />
      <ThreadRuntime messages={[message]}>
        <Thread />
      </ThreadRuntime>
    </I18nProvider>
  )

beforeEach(() => {
  clearAllPrompts()
  $activeSessionId.set('sess-1')
  $toolDisclosureStates.set({})
})

afterEach(() => {
  cleanup()
  clearAllPrompts()
  $activeSessionId.set(null)
  setRuntimeI18nLocale('en')
})

describe('tool-run summaries follow the provider language', () => {
  it('re-words a settled run when the language switches', async () => {
    const { container } = renderThread(settledRun())
    const summary = () => container.querySelector('[data-tool-summary]')?.textContent

    await waitFor(() => expect(summary()).toBe('Explored wiring.tsx, ran 1 command'))

    await act(async () => switchLocale('zh'))

    await waitFor(() => expect(summary()).toBe('探索了 wiring.tsx，运行了 1 条命令'))
  })

  it('re-words the approval activity line when the language switches', async () => {
    setApprovalRequest({ command: 'rm -rf /tmp/x', description: 'dangerous command', sessionId: 'sess-1' })
    const { container } = renderThread(awaitingApproval())
    const activity = () => container.querySelector('[data-approval-activity]')?.textContent

    await waitFor(() => expect(activity()).toBe('Running rm -rf /tmp/x'))

    await act(async () => switchLocale('zh'))

    await waitFor(() => expect(activity()).toBe('正在运行 rm -rf /tmp/x'))
  })
})
