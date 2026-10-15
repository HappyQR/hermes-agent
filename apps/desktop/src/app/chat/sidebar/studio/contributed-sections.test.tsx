import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { atom } from 'nanostores'
import { afterEach, describe, expect, it } from 'vitest'

import { registry } from '@/contrib/registry'
import { I18nProvider } from '@/i18n'
import { SIDEBAR_SECTIONS_AREA, type SidebarSectionContribution } from '@/sdk/sidebar-sections'
import { $sidebarSectionCollapsed } from '@/store/sidebar-studio'

import { SidebarContributedSections } from './contributed-sections'

const renderSections = () =>
  render(
    <I18nProvider configClient={null} initialLocale="en">
      <SidebarContributedSections />
    </I18nProvider>
  )

describe('SidebarContributedSections', () => {
  let dispose: () => void = () => undefined

  afterEach(() => {
    dispose()
    cleanup()
    $sidebarSectionCollapsed.set({})
  })

  it('renders a plugin section folded by default, with its count, and opens it on demand', () => {
    const data: SidebarSectionContribution = {
      count: atom(3),
      defaultCollapsed: true,
      title: () => 'Bots',
      tools: () => <button type="button">New bot</button>
    }

    dispose = registry.register({
      area: SIDEBAR_SECTIONS_AREA,
      data,
      id: 'test:bots',
      render: () => <div>Alpha bot</div>
    })

    renderSections()

    expect(screen.getByText('Bots')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('3')
    expect(screen.queryByText('Alpha bot')).toBeNull()
    // The header tools stay mounted while folded (the plugin's "+").
    expect(screen.getByRole('button', { name: 'New bot' })).toBeTruthy()

    act(() => fireEvent.click(screen.getByRole('button', { expanded: false })))

    expect(screen.getByText('Alpha bot')).toBeTruthy()
  })

  it('keeps a broken body inside its own boundary', () => {
    dispose = registry.register({
      area: SIDEBAR_SECTIONS_AREA,
      data: { title: () => 'Broken' } satisfies SidebarSectionContribution,
      id: 'test:broken',
      render: () => {
        throw new Error('boom')
      }
    })

    renderSections()

    expect(screen.getByText('Broken')).toBeTruthy()
    expect(screen.getByText(/failed to render/)).toBeTruthy()
  })
})
