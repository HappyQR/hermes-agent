// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'

// Pin a Mac before the store evaluates, so glass is supported (see translucency.test.ts).
vi.hoisted(() => {
  Object.defineProperty(globalThis.navigator, 'platform', { configurable: true, value: 'MacIntel' })
})

import { setTranslucency, setTranslucencyMode, setTranslucencyScope } from './translucency'

const edge = () => document.documentElement.style.getPropertyValue('--glass-rail-edge')
const settle = () => new Promise(resolve => setTimeout(resolve, 60))

afterEach(() => {
  setTranslucencyMode('clear')
  document.querySelectorAll('[data-slot="sidebar"]').forEach(rail => rail.remove())
})

function mountRail(right: number) {
  const rail = document.createElement('div')
  rail.setAttribute('data-slot', 'sidebar')
  rail.getBoundingClientRect = () => ({ bottom: 0, height: 0, left: 0, right, top: 0, width: right, x: 0, y: 0, toJSON: () => ({}) })
  document.body.append(rail)

  return rail
}

it('publishes the rail edge once the sidebar mounts after glass tracking began', async () => {
  setTranslucency(50)
  setTranslucencyScope('sidebar')
  setTranslucencyMode('glass')
  expect(edge()).toBe('0px')

  mountRail(260)
  await settle()

  expect(edge()).toBe('260px')
})

it('finds a remounted rail', async () => {
  setTranslucency(50)
  setTranslucencyScope('sidebar')
  setTranslucencyMode('glass')
  const first = mountRail(240)
  await settle()
  first.remove()
  window.dispatchEvent(new Event('resize'))
  expect(edge()).toBe('0px')

  mountRail(300)
  await settle()

  expect(edge()).toBe('300px')
})
