/**
 * The sidebar's compact Bots section: which bots it lists, and that a row
 * click hands its exact roster row to `openRosterBot` — the one canonical-chat
 * door (src/AGENTS.md) — and does nothing else.
 */

import type * as HermesSdk from '@hermes/plugin-sdk'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as BotsData from './data'
import { translateBotsIn } from './i18n-test-helper'
import type { BotMeta, RosterRow } from './types'

const { openRosterBot, roster } = vi.hoisted(() => ({
  openRosterBot: vi.fn(),
  roster: { profiles: [] as RosterRow[] }
}))

vi.mock('@hermes/plugin-sdk', async importOriginal => ({
  ...(await importOriginal<typeof HermesSdk>()),
  usePluginI18n: () => translateBotsIn('en')
}))

vi.mock('./data', async importOriginal => ({
  ...(await importOriginal<typeof BotsData>()),
  useRoster: () => ({ data: roster, error: null })
}))

vi.mock('./roster-actions', async importOriginal => ({
  ...(await importOriginal<object>()),
  openRosterBot
}))

const { BotsSidebarSection, BotsSidebarTools, botsSidebarSectionContribution, sidebarBots } =
  await import('./sidebar-section')

const { SIDEBAR_SECTIONS_AREA } = await import('@hermes/plugin-sdk')

const alpha: RosterRow = { connectionId: 'local', name: 'alpha' }
const beta: RosterRow = { connectionId: 'local', name: 'beta' }
const ghost: RosterRow = { connectionId: 'remote', ghost: true, name: 'gamma' }

beforeEach(() => {
  vi.clearAllMocks()
  openRosterBot.mockResolvedValue(true)
})

describe('sidebarBots', () => {
  it('drops offline ghosts and hidden bots unless asked to show them', () => {
    const meta: Record<string, BotMeta> = { beta: { hidden: true } as BotMeta }

    expect(sidebarBots([alpha, beta, ghost], meta, false).map(bot => bot.name)).toEqual(['alpha'])
    expect(
      sidebarBots([alpha, beta, ghost], meta, true)
        .map(bot => bot.name)
        .sort()
    ).toEqual(['alpha', 'beta'])
  })
})

describe('BotsSidebarSection', () => {
  it('opens a bot through openRosterBot with its exact roster row', () => {
    roster.profiles = [alpha]
    render(<BotsSidebarSection />)

    fireEvent.click(screen.getByRole('button', { name: /^alpha/i }))

    expect(openRosterBot).toHaveBeenCalledTimes(1)
    expect(openRosterBot).toHaveBeenCalledWith(alpha)
  })

  it('offers the first bot when the roster is empty', () => {
    roster.profiles = []
    render(<BotsSidebarSection />)

    expect(screen.getByText('No bots yet')).toBeTruthy()
  })
})

describe('BotsSidebarTools', () => {
  it('offers a group chat from the live roster, with the Bots pane never opened', async () => {
    roster.profiles = [alpha, beta]
    render(<BotsSidebarTools />)

    const trigger = screen.getByRole('button', { name: 'New bot or group chat' })
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' })

    const item = await screen.findByRole('menuitem', { name: 'New group chat' })
    expect(item.getAttribute('aria-disabled')).not.toBe('true')
  })

  it('keeps a group chat out of reach with a single bot', async () => {
    roster.profiles = [alpha]
    render(<BotsSidebarTools />)

    fireEvent.pointerDown(screen.getByRole('button', { name: 'New bot or group chat' }), {
      button: 0,
      ctrlKey: false,
      pointerType: 'mouse'
    })

    const item = await screen.findByRole('menuitem', { name: 'New group chat' })
    expect(item.getAttribute('aria-disabled')).toBe('true')
  })
})

describe('botsSidebarSectionContribution', () => {
  it('registers a folded section in the sidebar sections area', () => {
    const contribution = botsSidebarSectionContribution()

    expect(contribution.area).toBe(SIDEBAR_SECTIONS_AREA)
    expect(contribution.data.defaultCollapsed).toBe(true)
    expect(typeof contribution.data.tools).toBe('function')
  })
})
