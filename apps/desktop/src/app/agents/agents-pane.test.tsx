// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import * as gateway from '@/store/gateway'
import { $activeSessionId, _resetSessionOwnerHintsForTests, setSessionOwnerHint } from '@/store/session'
import { $subagentsBySession, upsertSubagent } from '@/store/subagents'

import { AgentsPane } from './index'

Element.prototype.animate = vi.fn(() => ({ cancel() {} }) as Animation)

afterEach(() => {
  cleanup()
  $subagentsBySession.set({})
  $activeSessionId.set(null)
  _resetSessionOwnerHintsForTests()
  vi.restoreAllMocks()
})

it('shows the empty state when no turn has delegated work', () => {
  render(<AgentsPane />)

  expect(screen.getByText('No live subagents')).toBeTruthy()
  expect(screen.queryByText('Tool calls')).toBeNull()
})

it('summarizes the agents and expands the running one with steer and stop', async () => {
  const request = vi.spyOn(gateway, 'requestGatewayForAgent').mockResolvedValue({ found: true, status: 'queued' })

  setSessionOwnerHint('parent', { connectionId: 'local', profile: 'default' })
  $activeSessionId.set('parent')
  upsertSubagent('parent', { goal: 'Run the gateway tests', subagent_id: 'worker', tool_count: 3 })
  upsertSubagent('parent', { goal: 'Check contrast', status: 'completed', subagent_id: 'done', tool_count: 2 })

  render(<AgentsPane />)

  const summary = screen.getByText('Tool calls').closest<HTMLElement>('[data-slot="agents-summary"]')!
  expect(within(summary).getByText('Agents').previousElementSibling?.textContent).toBe('2')
  expect(within(summary).getByText('Running').previousElementSibling?.textContent).toBe('1')
  expect(within(summary).getByText('Tool calls').previousElementSibling?.textContent).toBe('5')

  // The running agent opens by default; the finished one stays collapsed.
  const running = screen.getByRole('button', { name: /Run the gateway tests/ })
  expect(running.getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByRole('button', { name: /Check contrast/ }).getAttribute('aria-expanded')).toBe('false')

  fireEvent.change(screen.getByRole('textbox', { name: 'Steer this subagent' }), { target: { value: 'Retry once' } })
  fireEvent.click(screen.getByRole('button', { name: 'Steer' }))
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith('local', 'default', 'subagent.steer', {
      session_id: 'parent',
      subagent_id: 'worker',
      text: 'Retry once'
    })
  )

  fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith('local', 'default', 'subagent.interrupt', {
      session_id: 'parent',
      subagent_id: 'worker'
    })
  )

  // One card open at a time.
  fireEvent.click(screen.getByRole('button', { name: /Check contrast/ }))
  expect(screen.getByRole('button', { name: /Check contrast/ }).getAttribute('aria-expanded')).toBe('true')
  expect(running.getAttribute('aria-expanded')).toBe('false')
})
