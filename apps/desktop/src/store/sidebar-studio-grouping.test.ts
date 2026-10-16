import { afterEach, describe, expect, it } from 'vitest'

import { setSidebarAgentsGrouped } from './layout'
import { $sidebarEffectiveGrouping, setStudioGrouping } from './sidebar-studio'

describe('Studio sidebar grouping', () => {
  afterEach(() => setStudioGrouping('time'))

  // Creating a project, ⌘K "go to project" and opening a folder all turn
  // upstream's project overview on, which repeats the Projects section.
  it('stays chronological when upstream turns its project overview on by itself', () => {
    setStudioGrouping('time')
    setSidebarAgentsGrouped(true)

    expect($sidebarEffectiveGrouping.get()).toBe('time')
  })

  it('groups by project only when that grouping is picked', () => {
    setStudioGrouping('project')
    expect($sidebarEffectiveGrouping.get()).toBe('project')

    setStudioGrouping('time')
    expect($sidebarEffectiveGrouping.get()).toBe('time')
  })
})
