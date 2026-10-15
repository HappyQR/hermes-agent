import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ChatBarState } from '@/app/chat/composer/types'
import { I18nProvider } from '@/i18n'
import { $approvalModes } from '@/store/approval-mode'
import { $hudMode } from '@/store/hud'
import { $activeSessionId, $currentUsage, $gatewayState } from '@/store/session'

import { ApprovalModePill } from './approval-mode-controls'
import { StudioComposerControls } from './composer-row'
import { ContextRingPill } from './context-ring'
import { MicButton } from './mic-button'
import { SendCluster } from './send-cluster'

vi.mock('./model-pill', () => ({ ModelPill: () => null }))

const state: ChatBarState = {
  model: { canSwitch: false, model: '', provider: '' },
  tools: { enabled: true, label: 'Add context' },
  voice: { active: false, enabled: true }
}

const wrap = (node: React.ReactNode) =>
  render(
    <I18nProvider configClient={null} initialLocale="en">
      <MemoryRouter>{node}</MemoryRouter>
    </I18nProvider>
  )

const send = (overrides: Partial<ComponentProps<typeof SendCluster>> = {}) =>
  wrap(
    <SendCluster
      busy={false}
      busyAction="stop"
      canSubmit
      cardWaiting={false}
      disabled={false}
      hasComposerPayload={false}
      onQueue={vi.fn()}
      onStartVoice={vi.fn()}
      {...overrides}
    />
  )

afterEach(() => {
  cleanup()
  $approvalModes.set({})
  $hudMode.set(false)
  $activeSessionId.set(null)
  $currentUsage.set({ calls: 0, input: 0, output: 0, total: 0 })
})

describe('the primary button', () => {
  it('talks while empty and idle, sends a draft, and stops an empty running turn', () => {
    const onStartVoice = vi.fn()
    const view = send({ onStartVoice })

    fireEvent.click(screen.getByRole('button', { name: 'Start voice conversation' }))
    expect(onStartVoice).toHaveBeenCalledOnce()
    expect(document.querySelector('button[type="submit"]')).toBeNull()

    view.unmount()
    send({ hasComposerPayload: true })
    expect(screen.getByRole('button', { name: 'Send' }).getAttribute('type')).toBe('submit')

    cleanup()
    send({ busy: true, busyAction: 'stop' })
    expect(document.querySelector('button[type="submit"]')?.getAttribute('aria-label')).toBe('Stop')
    expect(screen.queryByRole('button', { name: 'More send options' })).toBeNull()
  })

  it('follows the busy mode mid-turn and offers the other modes behind the chevron', () => {
    const onQueue = vi.fn()
    const onSteer = vi.fn()
    send({ busy: true, busyAction: 'interrupt', hasComposerPayload: true, onQueue, onRedirect: vi.fn(), onSteer })

    expect(document.querySelector('button[type="submit"]')?.getAttribute('aria-label')).toBe('Redirect the current run')
    fireEvent.keyDown(screen.getByRole('button', { name: 'More send options' }), { key: 'Enter' })

    const menu = screen.getByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: /Queue message/ })).toBeTruthy()
    expect(within(menu).queryByRole('menuitem', { name: /Redirect/ })).toBeNull()

    fireEvent.click(within(menu).getByRole('menuitem', { name: /Steer the current run/ }))
    expect(onSteer).toHaveBeenCalledOnce()
    expect(onQueue).not.toHaveBeenCalled()
  })

  it('answers a waiting card through Send, without other modes', () => {
    send({ busy: true, busyAction: 'queue', cardWaiting: true, hasComposerPayload: true, onSteer: vi.fn() })

    expect(screen.getByRole('button', { name: 'Send' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'More send options' })).toBeNull()
  })
})

describe('the mic', () => {
  const mic = (overrides: Partial<ComponentProps<typeof MicButton>> = {}) =>
    wrap(
      <MicButton
        autoSpeak={false}
        disabled={false}
        onDictate={vi.fn()}
        onStartConversation={vi.fn()}
        onToggleAutoSpeak={vi.fn()}
        state={state}
        voiceStatus="idle"
        {...overrides}
      />
    )

  it('dictates on click and keeps every voice control one right-click away', () => {
    const onDictate = vi.fn()
    const onStartConversation = vi.fn()
    mic({ onDictate, onStartConversation })

    const button = screen.getByRole('button', { name: 'Voice dictation' })
    fireEvent.click(button)
    expect(onDictate).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menu')).toBeNull()

    fireEvent.contextMenu(button)
    const menu = screen.getByRole('menu')
    expect(within(menu).getByRole('menuitemcheckbox', { name: /Read replies aloud/ })).toBeTruthy()
    expect(within(menu).getByRole('menuitemcheckbox', { name: /Wake word/ })).toBeTruthy()
    fireEvent.click(within(menu).getByRole('menuitem', { name: /Start voice conversation/ }))
    expect(onStartConversation).toHaveBeenCalledOnce()
  })

  it('marks the mic while replies are read aloud, and reports a recording', () => {
    const view = mic({ autoSpeak: true })
    expect(document.querySelector('[data-slot="composer-mic-dot"]')).not.toBeNull()

    view.unmount()
    mic({ voiceStatus: 'recording' })
    expect(screen.getByRole('button', { name: 'Stop dictation' }).getAttribute('aria-pressed')).toBe('true')
  })
})

describe('the row', () => {
  const controls = () =>
    wrap(
      <StudioComposerControls
        autoSpeak={false}
        busy={false}
        busyAction="stop"
        canSubmit
        conversation={{
          active: false,
          level: 0,
          muted: false,
          onEnd: vi.fn(),
          onStart: vi.fn(),
          onStopTurn: vi.fn(),
          onToggleMute: vi.fn(),
          status: 'idle'
        }}
        disabled={false}
        hasComposerPayload
        onDictate={vi.fn()}
        onQueue={vi.fn()}
        onToggleAutoSpeak={vi.fn()}
        requestGateway={vi.fn()}
        state={state}
        voiceStatus="idle"
      />
    )

  it('keeps the HUD bar on upstream controls (folded voice menu)', () => {
    $hudMode.set(true)
    controls()
    expect(screen.getByRole('button', { name: 'Voice' })).toBeTruthy()
    expect(document.querySelector('[data-slot="composer-mic"]')).toBeNull()
  })

  it('shows the single mic outside the HUD', () => {
    controls()
    expect(document.querySelector('[data-slot="composer-mic"]')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Send' })).toBeTruthy()
  })
})

describe('the auto-approve pill', () => {
  it('appears only while approvals are off and opens the mode menu', () => {
    $gatewayState.set('closed')
    $approvalModes.set({ default: 'smart' })
    const view = wrap(<ApprovalModePill />)
    expect(screen.queryByRole('button', { name: /Auto-approve/ })).toBeNull()

    view.unmount()
    $approvalModes.set({ default: 'off' })
    wrap(<ApprovalModePill />)
    fireEvent.keyDown(screen.getByRole('button', { name: /Auto-approve/ }), { key: 'Enter' })
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(3)
  })
})

describe('the context gauge', () => {
  it('stays hidden without a session, then opens the panel with its actions', async () => {
    const requestGateway = vi.fn().mockRejectedValue(new Error('offline'))
    const onCompress = vi.fn()
    const view = wrap(<ContextRingPill onCompress={onCompress} requestGateway={requestGateway} />)
    expect(screen.queryByRole('button', { name: /Context usage/ })).toBeNull()
    view.unmount()

    act(() => {
      $activeSessionId.set('session-1')
      $currentUsage.set({
        cache_hit_pct: 86,
        calls: 3,
        context_max: 200_000,
        context_percent: 12,
        context_used: 24_000,
        input: 10,
        output: 10,
        total: 20
      })
    })
    wrap(<ContextRingPill onCompress={onCompress} requestGateway={requestGateway} />)

    const ring = screen.getByRole('button', { name: 'Context usage 12%' })
    expect(ring.textContent).toContain('12%')
    fireEvent.click(ring)

    await waitFor(() => expect(screen.getByText('Cache hit')).toBeTruthy())
    expect(screen.getByText('86%')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Compress context' }))
    expect(onCompress).toHaveBeenCalledOnce()
  })
})
