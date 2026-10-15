import { describe, expect, it } from 'vitest'

import type { SessionInfo } from '@/types/hermes'

import { sessionRowDetails } from './session-row-details'

const session = (overrides: Partial<SessionInfo> = {}): SessionInfo => ({
  ended_at: null,
  id: 's1',
  input_tokens: 0,
  is_active: false,
  last_active: 1,
  message_count: 26,
  model: 'google/gemini-3.1-pro',
  output_tokens: 0,
  preview: '  Explore\nGmail-like density tiers for session rows.  ',
  source: 'desktop',
  started_at: 1,
  title: 'Session density exploration',
  tool_call_count: 8,
  ...overrides
})

const context = { projectLabel: 'hermes-agent', sourceLabel: 'Desktop' }

describe('session row details', () => {
  it('reads project · branch · model for the detailed line', () => {
    expect(sessionRowDetails(session({ git_branch: 'feature/menu' }), context)).toEqual({
      detail: 'hermes-agent · feature/menu · gemini-3.1-pro',
      preview: 'Explore Gmail-like density tiers for session rows.'
    })
  })

  it('omits unavailable fields and falls back to the source when nothing else is known', () => {
    expect(sessionRowDetails(session({ git_branch: null }), { projectLabel: null, sourceLabel: 'Telegram' })).toEqual(
      { detail: 'gemini-3.1-pro', preview: 'Explore Gmail-like density tiers for session rows.' }
    )
    expect(
      sessionRowDetails(session({ git_branch: null, model: null }), { projectLabel: null, sourceLabel: 'Telegram' })
        .detail
    ).toBe('Telegram')
  })

  it('normalizes whitespace-only branch and preview values', () => {
    expect(sessionRowDetails(session({ git_branch: '   ', preview: '  ' }), context)).toEqual({
      detail: 'hermes-agent · gemini-3.1-pro',
      preview: null
    })
  })

  it('omits the preview when it already supplies the displayed title', () => {
    expect(sessionRowDetails(session({ title: null }), context).preview).toBeNull()
  })
})
