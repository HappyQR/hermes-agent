import { beforeEach, describe, expect, it } from 'vitest'

import {
  $titlebarAppActionsSide,
  setTitlebarAppActionsSide,
  TITLEBAR_APP_ACTIONS_DEFAULT,
  titlebarAppActionsClusterCounts
} from './titlebar-app-actions'

describe('titlebarAppActionsClusterCounts', () => {
  it('adds extras to the cluster they belong to', () => {
    for (const side of ['left', 'right'] as const) {
      const base = titlebarAppActionsClusterCounts(side)
      expect(titlebarAppActionsClusterCounts(side, 1, 2)).toEqual({ left: base.left + 1, right: base.right + 2 })
    }
  })

  it('reserves only the Studio pair beside the traffic lights, in every mode and on either side', () => {
    // [show sidebar][new chat]; app actions live in the toolbar capsule and menus.
    for (const mode of ['simple', 'advanced'] as const) {
      expect(titlebarAppActionsClusterCounts('right', 0, 0, mode)).toEqual({ left: 2, right: 0 })
      expect(titlebarAppActionsClusterCounts('left', 0, 0, mode)).toEqual({ left: 2, right: 0 })
    }
  })
})

describe('$titlebarAppActionsSide', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setTitlebarAppActionsSide(TITLEBAR_APP_ACTIONS_DEFAULT)
  })

  it('persists left', () => {
    setTitlebarAppActionsSide('left')
    expect($titlebarAppActionsSide.get()).toBe('left')
    expect(window.localStorage.getItem('hermes.desktop.titlebarAppActions')).toBe('left')
  })
})
