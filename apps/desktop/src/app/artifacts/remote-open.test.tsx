import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'

import { $connection } from '@/store/session'

import { ArtifactsView } from './index'

const paths = vi.hoisted(() => [
  '~/.hermes/memories/USER.md',
  './report.md',
  '../parent.md',
  String.raw`~\home.txt`,
  String.raw`.\child.txt`,
  String.raw`..\ancestor.txt`,
  'file:///C:/output/drive.txt',
  'file://server/share/unc.txt',
  '/srv/absolute.txt'
])

const getSessionMessages = vi.hoisted(() => vi.fn())

// Quick Look previews files through the Inspector's preview; this test is about
// opening/downloading, so the preview body is out of the way.
vi.mock('@/app/chat/right-rail/preview-file', () => ({ LocalFilePreview: () => null }))

vi.mock('@/hermes', async () => ({
  ...(await vi.importActual('@/hermes')),
  listAllProfileSessions: async () => ({
    sessions: [{ id: 'artifact-session', title: 'Fixture', profile: 'origin-profile' }]
  }),
  getSessionMessages
}))

/** Radix menus open on the full pointer gesture. */
function press(element: HTMLElement) {
  fireEvent.pointerDown(element, { button: 0, pointerType: 'mouse' })
  fireEvent.pointerUp(element, { button: 0, pointerType: 'mouse' })
  fireEvent.click(element)
}

afterEach(() => {
  cleanup()
  $connection.set(null)
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

it('keeps discovered file paths and originating session scope intact through remote opening', async () => {
  getSessionMessages.mockResolvedValue({
    messages: [
      {
        role: 'assistant',
        timestamp: 1000,
        content: paths.map(path => `MEDIA:${path}`).join(' ') + ' https://example.com/report.txt'
      }
    ],
    session_id: 'artifact-session'
  })
  const saveGatewayFile = vi.fn().mockResolvedValue({ saved: true })
  const openExternal = vi.fn()
  vi.stubGlobal('hermesDesktop', { saveGatewayFile, openExternal })
  $connection.set({
    isFullscreen: false,
    nativeOverlayWidth: 0,
    logs: [],
    windowButtonPosition: null,
    mode: 'remote',
    connectionId: 'remote-fixture',
    profile: 'writer',
    baseUrl: 'http://localhost',
    token: '',
    wsUrl: ''
  })

  const { container } = render(
    <MemoryRouter>
      <ArtifactsView />
    </MemoryRouter>
  )

  // Each tile opens Quick Look; in remote mode its ⋯ menu downloads the file
  // through the gateway, scoped to the session that produced it.
  for (const name of [
    'USER.md',
    'report.md',
    'parent.md',
    'home.txt',
    'child.txt',
    'ancestor.txt',
    'drive.txt',
    'unc.txt',
    'absolute.txt'
  ]) {
    fireEvent.click(await screen.findByRole('button', { name }))
    const more = await screen.findByRole('button', { name: 'More actions' })
    press(more)
    press(await screen.findByRole('menuitem', { name: 'Download' }))
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  }

  await waitFor(() => expect(saveGatewayFile).toHaveBeenCalledTimes(paths.length))
  expect(saveGatewayFile.mock.calls.map(([request]) => request)).toEqual(
    paths.map(path => ({
      connectionId: 'remote-fixture',
      profile: 'origin-profile',
      sessionId: 'artifact-session',
      path,
      suggestedName: path.split(/[\\/]/).pop()
    }))
  )
  // A link opens in Quick Look as a real link to its URL; nothing is opened behind the user's back.
  fireEvent.click(container.querySelector<HTMLElement>('[data-artifact-kind="link"]')!)
  expect((await screen.findByRole('link')).getAttribute('href')).toBe('https://example.com/report.txt')
  expect(openExternal).not.toHaveBeenCalled()
  expect(getSessionMessages).toHaveBeenCalledWith('artifact-session', 'origin-profile', {
    includeCompacted: true,
    limit: expect.any(Number),
    offset: 0,
    order: 'oldest'
  })
})
