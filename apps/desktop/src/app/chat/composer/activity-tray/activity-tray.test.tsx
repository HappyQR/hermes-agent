import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'

import { $billingBlock, setBillingBlock } from '@/store/billing-block'
import { $parkedQueueSessions, $queuedPromptsBySession, type QueuedPromptEntry } from '@/store/composer-queue'
import { $backgroundStatusBySession } from '@/store/composer-status'
import { $collapsedStatusDrawers } from '@/store/composer-status-drawer'
import { $goalsBySession } from '@/store/goals'
import { $previewStatusBySession } from '@/store/preview-status'
import { clearAllPrompts, setApprovalRequest } from '@/store/prompts'
import { $sessionControlBySession } from '@/store/session-control'
import { $subagentsBySession, upsertSubagent } from '@/store/subagents'
import { $retainedTodosBySession, $todosBySession } from '@/store/todos'

import { QueuePanel } from '../queue-panel'
import { ComposerStatusStack, type StatusStackSection } from '../status-stack'

import { NOTICE_SECTIONS, SECTION_CHIP } from './chips'

import { ActivityTray } from './index'

const noop = () => {}

const ENTRY: QueuedPromptEntry = { attachments: [], id: 'queued', queuedAt: 1, text: 'Queued request' }

const queue = (entries: QueuedPromptEntry[] = [ENTRY], parked = false) =>
  entries.length ? (
    <QueuePanel
      busy
      editingId={null}
      entries={entries}
      onDelete={noop}
      onEdit={noop}
      onResume={noop}
      onSendNow={noop}
      parked={parked}
    />
  ) : null

const wrap = (node: ReactNode) => <MemoryRouter>{node}</MemoryRouter>

const tray = (queueNode: ReactNode = null, sessionKey = 'owner') =>
  wrap(
    <ComposerStatusStack
      layout={sections => <ActivityTray coding={null} sections={sections} sessionId="owner" sessionKey={sessionKey} />}
      queue={queueNode}
      sessionId="owner"
    />
  )

const chip = (name: RegExp | string) => screen.getByRole('button', { name })

afterEach(() => {
  cleanup()
  clearAllPrompts()
  $backgroundStatusBySession.set({})
  $billingBlock.set(null)
  $collapsedStatusDrawers.set([])
  $goalsBySession.set({})
  $parkedQueueSessions.set({})
  $previewStatusBySession.set({})
  $queuedPromptsBySession.set({})
  $retainedTodosBySession.set({})
  $sessionControlBySession.set({})
  $subagentsBySession.set({})
  $todosBySession.set({})
})

it('shows one chip per kind of activity and opens only the clicked group', () => {
  $todosBySession.set({
    owner: [
      { id: 'a', content: 'Find the grouping', status: 'completed' },
      { id: 'b', content: 'Write the preview', status: 'in_progress' }
    ]
  })
  $backgroundStatusBySession.set({
    owner: [{ id: 'dev', state: 'running', title: 'npm run dev', type: 'background' }]
  })
  $queuedPromptsBySession.set({ owner: [ENTRY] })
  render(tray(queue()))

  const todo = chip('Tasks 1/2')
  const background = chip('1 Background')
  const queued = chip('1 Queued')

  // Every group is mounted, none is shown until asked for.
  expect(todo.getAttribute('aria-expanded')).toBe('false')
  expect(screen.getByText('Write the preview').closest('[hidden]')).not.toBeNull()

  fireEvent.click(todo)
  expect(todo.getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByText('Write the preview').closest('[hidden]')).toBeNull()
  expect(screen.getByText('npm run dev').closest('[hidden]')).not.toBeNull()

  fireEvent.click(queued)
  expect(queued.getAttribute('aria-expanded')).toBe('true')
  expect(todo.getAttribute('aria-expanded')).toBe('false')
  expect(screen.getByText('Queued request').closest('[hidden]')).toBeNull()

  fireEvent.click(queued)
  expect(screen.getByRole('region', { hidden: true }).hidden).toBe(true)
  expect(background.getAttribute('aria-expanded')).toBe('false')
})

it('keeps the queue label on the chip alone, so "1 Queued" is on screen exactly once', () => {
  $queuedPromptsBySession.set({ owner: [ENTRY] })
  const view = render(tray(queue()))

  fireEvent.click(chip('1 Queued'))
  expect(screen.getAllByText('1 Queued')).toHaveLength(1)
  expect(screen.getByText('Queue')).toBeTruthy()

  act(() => $parkedQueueSessions.set({ owner: true }))
  view.rerender(tray(queue([ENTRY], true)))
  expect(screen.getAllByText('1 Queued — paused')).toHaveLength(1)
})

it('never opens a panel because activity arrived, and forgets a chip that went away', () => {
  const view = render(tray())
  expect(screen.queryByRole('toolbar')).toBeNull()

  act(() => upsertSubagent('owner', { goal: 'Check contrast', subagent_id: 'worker' }))
  view.rerender(tray())

  const subagents = chip('1 Subagent')
  expect(subagents.getAttribute('aria-expanded')).toBe('false')
  fireEvent.click(subagents)
  expect(screen.getByText('Check contrast').closest('[hidden]')).toBeNull()

  act(() => $subagentsBySession.set({}))
  view.rerender(tray())
  expect(screen.queryByRole('button', { name: '1 Subagent' })).toBeNull()

  act(() => upsertSubagent('owner', { goal: 'Second run', subagent_id: 'worker-2' }))
  view.rerender(tray())
  expect(chip('1 Subagent').getAttribute('aria-expanded')).toBe('false')
})

it('closes on Esc from inside the panel and hands focus back to its chip', () => {
  $todosBySession.set({ owner: [{ id: 'a', content: 'Only task', status: 'pending' }] })
  render(tray())

  const todo = chip('Tasks 0/1')
  fireEvent.click(todo)
  const close = screen.getByRole('button', { name: 'Close' })
  close.focus()

  const escape = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' })
  act(() => {
    close.dispatchEvent(escape)
  })

  expect(escape.defaultPrevented).toBe(true)
  expect(todo.getAttribute('aria-expanded')).toBe('false')
  expect(document.activeElement).toBe(todo)
})

it('hides behind one chip, persisted per conversation, with sections still mounted', () => {
  $todosBySession.set({ owner: [{ id: 'a', content: 'Kept mounted', status: 'pending' }] })
  const view = render(tray(null, 'stored-1'))

  fireEvent.click(chip('Hide activity'))
  expect(screen.queryByRole('button', { name: 'Tasks 0/1' })).toBeNull()
  expect(screen.getByText('Kept mounted')).toBeTruthy()
  expect($collapsedStatusDrawers.get().length).toBe(1)

  view.rerender(tray(null, 'stored-2'))
  expect(chip('Tasks 0/1')).toBeTruthy()

  view.rerender(tray(null, 'stored-1'))
  fireEvent.click(chip('Show activity (1)'))
  expect(chip('Tasks 0/1')).toBeTruthy()
})

it('jumps to the pending approval instead of opening a panel', () => {
  setApprovalRequest({ command: 'rm -rf /tmp/x', description: 'cleanup', sessionId: 'owner' })
  const stack = document.createElement('section')
  stack.setAttribute('data-approval-stack', '')
  stack.setAttribute('data-session-id', 'owner')
  stack.scrollIntoView = vi.fn()
  document.body.append(stack)

  render(tray())
  const approval = chip('Approval needed')
  expect(approval.getAttribute('aria-expanded')).toBeNull()
  fireEvent.click(approval)
  expect(stack.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
  stack.remove()
})

it('renders notices above the chips and puts an unknown future section behind "More"', () => {
  const sections: StatusStackSection[] = [
    { key: 'billing', node: <p>Out of credits</p> },
    { key: 'future-group', node: <p>Something new</p> }
  ]

  render(wrap(<ActivityTray coding={null} sections={sections} sessionId="owner" sessionKey="owner" />))

  expect(screen.getByText('Out of credits').closest('[data-tray-notice]')).not.toBeNull()
  expect(screen.getByText('Something new').closest('[hidden]')).not.toBeNull()
  fireEvent.click(chip('More'))
  expect(screen.getByText('Something new').closest('[hidden]')).toBeNull()
})

// Tripwire for upstream merges: a section key the chip table does not know
// still reaches the tray (behind "More"), but it deserves a real chip.
it('claims every section the status stack emits with a chip or the notice strip', () => {
  let emitted: string[] = []
  $todosBySession.set({ owner: [{ id: 'a', content: 'Live', status: 'in_progress' }] })
  $goalsBySession.set({ owner: { status: 'active', title: 'Legacy goal', updatedAt: 1 } })
  $backgroundStatusBySession.set({ owner: [{ id: 'p', state: 'running', title: 'server', type: 'background' }] })
  $previewStatusBySession.set({ owner: [{ cwd: '/tmp', id: 'file', label: 'index.html', target: '/tmp/index.html' }] })
  upsertSubagent('owner', { goal: 'Helper', subagent_id: 'worker' })
  setBillingBlock('owner', {
    billing_url: null,
    is_nous: false,
    message: 'Out of credits',
    model: 'mock',
    provider: 'custom',
    provider_label: 'Custom'
  })

  render(
    wrap(
      <ComposerStatusStack
        layout={sections => {
          emitted = sections.map(section => section.key)

          return null
        }}
        queue={queue()}
        sessionId="owner"
      />
    )
  )

  expect(emitted.length).toBeGreaterThan(5)

  for (const key of emitted) {
    expect(key in SECTION_CHIP || NOTICE_SECTIONS.has(key), key).toBe(true)
  }
})
