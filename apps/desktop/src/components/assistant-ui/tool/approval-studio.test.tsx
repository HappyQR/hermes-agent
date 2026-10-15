import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n'
import type { ApprovalRequest } from '@/store/prompts'
import { $routeRequest } from '@/store/recovery-requests'

import { approvalAllowChoices, approvalDetails, StudioApprovalBody } from './approval-studio'

const request = (overrides: Partial<ApprovalRequest> = {}): ApprovalRequest => ({
  command: 'rm -rf build',
  description: 'recursive delete',
  sessionId: 'session-1',
  ...overrides
})

const renderBody = (req: ApprovalRequest, onRespond = vi.fn()) =>
  render(
    <I18nProvider configClient={null} initialLocale="en">
      <StudioApprovalBody
        busy={false}
        onAlwaysAllow={vi.fn()}
        onRespond={onRespond}
        position={1}
        request={req}
        submitting={null}
        total={1}
      />
    </I18nProvider>
  )

afterEach(() => {
  cleanup()
  $routeRequest.set(null)
})

describe('approval details', () => {
  it('shows the command with why it was flagged, or the description standing in for a synthetic label', () => {
    expect(approvalDetails(request())).toEqual({ details: 'rm -rf build', isCommand: true, why: 'recursive delete' })
    expect(approvalDetails(request({ command: '<terminal> (plugin approval rule)', description: 'run pwd' }))).toEqual(
      { details: 'run pwd', isCommand: false, why: '' }
    )
  })

  it('offers only what the gateway allows', () => {
    expect(approvalAllowChoices(request())).toEqual({ always: true, session: true })
    expect(approvalAllowChoices(request({ allowPermanent: false }))).toEqual({ always: false, session: true })
    expect(approvalAllowChoices(request({ smartDenied: true }))).toEqual({ always: false, session: false })
    expect(approvalAllowChoices(request({ choices: ['once', 'always', 'deny'] }))).toEqual({
      always: true,
      session: false
    })
  })
})

describe('the approval card body', () => {
  it('asks the question, allows this session in one click and reaches the approval mode setting', () => {
    const onRespond = vi.fn()
    renderBody(request(), onRespond)

    expect(screen.getByText('Allow Hermes to run this command?')).toBeTruthy()
    expect(screen.getByText('recursive delete')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Run' }).getAttribute('aria-keyshortcuts')).toBe('Enter')

    fireEvent.click(screen.getByRole('button', { name: 'Allow this session' }))
    expect(onRespond).toHaveBeenCalledWith('session')

    fireEvent.keyDown(screen.getByRole('button', { name: 'More approval options' }), { key: 'Enter' })
    fireEvent.click(screen.getByRole('menuitem', { name: 'Approval mode…' }))
    expect($routeRequest.get()?.path).toBe('/settings?tab=config:safety')
  })

  it('titles a non-command approval as an action', () => {
    renderBody(request({ command: '', description: 'Approve config change: allow SSH tunnel' }))

    expect(screen.getByText('Allow Hermes to do this?')).toBeTruthy()
    expect(screen.getByText('Approve config change: allow SSH tunnel')).toBeTruthy()
  })
})
