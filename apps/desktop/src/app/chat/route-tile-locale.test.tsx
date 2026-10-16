import { act, cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { registry } from '@/contrib/registry'
import { I18nProvider } from '@/i18n/context'
import type { Locale } from '@/i18n/types'
import { closeRouteTile, openRouteTile } from '@/store/route-tiles'

import { ARTIFACTS_ROUTE, AUTOMATIONS_ROUTE } from '../routes'

import { watchRouteTiles } from './route-tile'

const paneFor = (path: string) => registry.getArea('panes').find(pane => pane.id === `route-tile:${path}`)

function TabTitle({ path }: { path: string }) {
  const tabTitle = (paneFor(path)?.data as { tabTitle?: () => ReactNode } | undefined)?.tabTitle

  return <span data-testid="tab">{tabTitle?.()}</span>
}

function tabIn(locale: Locale, path: string) {
  const view = render(
    <I18nProvider configClient={null} initialLocale={locale}>
      <TabTitle path={path} />
    </I18nProvider>
  )

  const text = screen.getByTestId('tab').textContent
  view.unmount()

  return text
}

describe('route tile tab titles', () => {
  beforeAll(() => watchRouteTiles())

  afterEach(() => {
    cleanup()

    for (const path of [ARTIFACTS_ROUTE, AUTOMATIONS_ROUTE]) {
      act(() => closeRouteTile(path))
    }
  })

  it.each([
    [ARTIFACTS_ROUTE, '产物', 'Artifacts'],
    [AUTOMATIONS_ROUTE, '自动化', 'Automations']
  ])('names the built-in page %s in the UI language', (path, zh, en) => {
    act(() => openRouteTile(path))

    expect(tabIn('zh', path)).toBe(zh)
    expect(tabIn('en', path)).toBe(en)
  })
})
