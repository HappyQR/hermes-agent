import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { type I18nContextValue, I18nProvider, TRANSLATIONS, useI18n } from '@/i18n'
import { $interfaceMode } from '@/store/interface-mode'
import { $sidebarOrdering, $sidebarShowArchived, $sidebarStatusFilter, setSidebarOrdering } from '@/store/layout'
import { $sessionListDensity } from '@/store/session-list-density'
import {
  $sidebarEffectiveGrouping,
  $sidebarGroupingOverride,
  $sidebarSourceFilter,
  resetStudioSidebarView
} from '@/store/sidebar-studio'

import { SidebarViewOptions } from './view-options'

let i18n: I18nContextValue

function Options() {
  i18n = useI18n()

  return <SidebarViewOptions sources={['desktop', 'telegram', 'cron']} />
}

const open = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

describe('SidebarViewOptions', () => {
  beforeEach(() => {
    $interfaceMode.set('advanced')
  })

  afterEach(() => {
    cleanup()
    resetStudioSidebarView()
  })

  it('groups by any of the six groupings, including source and none', () => {
    render(
      <I18nProvider configClient={null} initialLocale="en">
        <Options />
      </I18nProvider>
    )

    const copy = TRANSLATIONS.en.studio.sidebar
    open(copy.sessions.viewOptions)

    fireEvent.click(screen.getByRole('radio', { name: copy.grouping.source }))
    expect($sidebarEffectiveGrouping.get()).toBe('source')
    expect($sidebarGroupingOverride.get()).toBe('source')

    fireEvent.click(screen.getByRole('radio', { name: copy.grouping.status }))
    expect($sidebarEffectiveGrouping.get()).toBe('status')
    expect($sidebarGroupingOverride.get()).toBeNull()

    fireEvent.click(screen.getByRole('radio', { name: copy.grouping.none }))
    expect($sidebarEffectiveGrouping.get()).toBe('none')
  })

  it('writes status and source chips, keeps a hand-picked order, and restores defaults', () => {
    setSidebarOrdering('manual')
    render(
      <I18nProvider configClient={null} initialLocale="en">
        <Options />
      </I18nProvider>
    )

    const copy = TRANSLATIONS.en.studio.sidebar
    const f = TRANSLATIONS.en.sidebar.filter
    open(copy.sessions.viewOptions)

    fireEvent.click(within(screen.getByRole('group', { name: f.status })).getByRole('button', { name: f.needsInput }))
    fireEvent.click(within(screen.getByRole('group', { name: copy.view.sources })).getByRole('button', { name: 'Telegram' }))
    fireEvent.click(screen.getByRole('switch', { name: copy.view.showArchived }))
    fireEvent.click(screen.getByRole('button', { name: copy.view.detailed }))

    expect($sidebarStatusFilter.get()).toEqual(['needs-input'])
    expect($sidebarSourceFilter.get()).toEqual(['telegram'])
    expect($sidebarShowArchived.get()).toBe(true)
    expect($sessionListDensity.get()).toBe('detailed')
    // Choosing filters never drops a hand-dragged order.
    expect($sidebarOrdering.get()).toBe('manual')

    fireEvent.click(screen.getByRole('button', { name: copy.view.reset }))

    expect($sidebarStatusFilter.get()).toEqual([])
    expect($sidebarSourceFilter.get()).toEqual([])
    expect($sidebarShowArchived.get()).toBe(false)
    expect($sessionListDensity.get()).toBe('comfortable')
  })

  it('follows the app language while open', async () => {
    render(
      <I18nProvider configClient={null} initialLocale="zh">
        <Options />
      </I18nProvider>
    )

    open(TRANSLATIONS.zh.studio.sidebar.sessions.viewOptions)
    expect(screen.getByRole('radio', { name: TRANSLATIONS.zh.studio.sidebar.grouping.source })).toBeTruthy()

    await act(() => i18n.setLocale('ja'))

    expect(screen.getByRole('radio', { name: TRANSLATIONS.ja.studio.sidebar.grouping.source })).toBeTruthy()
    expect(screen.queryByRole('radio', { name: TRANSLATIONS.zh.studio.sidebar.grouping.source })).toBeNull()
  })
})
