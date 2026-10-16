import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type * as ReactRouter from 'react-router'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider, TRANSLATIONS } from '@/i18n'
import type * as ProfileStore from '@/store/profile'
import { $activeGatewayProfile, $profiles, $showAllProfiles } from '@/store/profile'
import type * as ProjectsStore from '@/store/projects'
import { $projectTree } from '@/store/projects'
import { $currentCwd, $newChatWorkspaceTarget } from '@/store/session'
import type { ProfileInfo } from '@/types/hermes'

import type { SidebarProjectTree } from '../projects/workspace-groups'

import { DraftProfileChip, DraftProjectChip } from './draft-chips'

const { requestDetachedSession, requestStartWorkSession, selectProfile } = vi.hoisted(() => ({
  requestDetachedSession: vi.fn(),
  requestStartWorkSession: vi.fn(),
  selectProfile: vi.fn()
}))

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof ReactRouter>()),
  useNavigate: () => vi.fn()
}))

vi.mock('@/store/projects', async importOriginal => ({
  ...(await importOriginal<typeof ProjectsStore>()),
  requestDetachedSession,
  requestStartWorkSession
}))

vi.mock('@/store/profile', async importOriginal => ({
  ...(await importOriginal<typeof ProfileStore>()),
  refreshActiveProfile: vi.fn().mockResolvedValue(undefined),
  selectProfile
}))

vi.mock('../use-fleet-roster', () => ({ useFleetRoster: () => undefined }))

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
})

const en = TRANSLATIONS.en
const copy = en.studio.sidebar.draft

const project = (id: string, label: string, path: string) =>
  ({ id, isAuto: false, label, path, repos: [], sessionCount: 1 }) as unknown as SidebarProjectTree

const profile = (name: string, isDefault = false) =>
  ({ has_env: false, is_default: isDefault, model: null, name, path: `/p/${name}`, provider: null, skill_count: 0 }) as ProfileInfo

const renderChip = (chip: React.ReactNode) =>
  render(
    <MemoryRouter>
      <I18nProvider configClient={null} initialLocale="en">
        {chip}
      </I18nProvider>
    </MemoryRouter>
  )

async function openChip(name: RegExp) {
  const trigger = screen.getByRole('button', { name })

  await act(async () => {
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' })
    await Promise.resolve()
  })

  return screen.findByRole('menu')
}

describe('DraftProjectChip', () => {
  beforeEach(() => {
    $projectTree.set([project('agent', 'Hermes Agent', '/repos/agent'), project('docs', 'Studio Docs', '/repos/docs')])
    $newChatWorkspaceTarget.set(undefined)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    $projectTree.set([])
    $currentCwd.set('')
  })

  it('reads No project for a draft outside every project, and the project it sits in otherwise', () => {
    $currentCwd.set('/Users/me')
    const { unmount } = renderChip(<DraftProjectChip />)

    expect(screen.getByRole('button', { name: copy.projectAria(copy.noProject) }).textContent).toContain(copy.noProject)
    unmount()

    $currentCwd.set('/repos/docs/src')
    renderChip(<DraftProjectChip />)

    expect(screen.getByRole('button', { name: copy.projectAria('Studio Docs') })).toBeTruthy()
  })

  it('starts the draft in the picked project, or detached for No project', async () => {
    $currentCwd.set('/repos/agent')
    renderChip(<DraftProjectChip />)

    let menu = await openChip(/Hermes Agent/)
    await act(async () => fireEvent.click(within(menu).getByText('Studio Docs')))
    expect(requestStartWorkSession).toHaveBeenCalledWith('/repos/docs')

    menu = await openChip(/Hermes Agent/)
    await act(async () => fireEvent.click(within(menu).getByText(copy.noProject)))
    expect(requestDetachedSession).toHaveBeenCalledTimes(1)
  })
})

describe('DraftProfileChip', () => {
  beforeEach(() => {
    $profiles.set([profile('default', true), profile('clippy')])
    $activeGatewayProfile.set('default')
    $showAllProfiles.set(false)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('names the active profile and switches through the account menu rows', async () => {
    renderChip(<DraftProfileChip />)

    const menu = await openChip(new RegExp(copy.profileAria('default')))

    expect(within(menu).getByText(en.profiles.manageProfiles)).toBeTruthy()

    await act(async () => fireEvent.click(within(menu).getByText('clippy')))
    expect(selectProfile).toHaveBeenCalledWith('clippy')
  })
})
