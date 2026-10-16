import { describe, expect, it } from 'vitest'

import { sidebarStripPanes } from './sessions-band'

const side = new Set(['sessions', 'hermes-bots:pane'])
const isSide = (id: string) => side.has(id)

describe('sessions column strip', () => {
  it('shows no SESSIONS | BOTS strip while the sessions list is in front', () => {
    expect(sidebarStripPanes(['sessions', 'hermes-bots:pane'], 'sessions', isSide)).toEqual([])
    expect(sidebarStripPanes(['sessions'], 'sessions', isSide)).toEqual([])
  })

  it('brings the strip back while the Bots workspace is in front, so Sessions is one click away', () => {
    expect(sidebarStripPanes(['sessions', 'hermes-bots:pane'], 'hermes-bots:pane', isSide)).toEqual([
      'sessions',
      'hermes-bots:pane'
    ])
  })

  it('keeps the strip for a zone that also stacks other panes', () => {
    expect(sidebarStripPanes(['sessions', 'files'], 'sessions', isSide)).toEqual(['sessions', 'files'])
  })
})
