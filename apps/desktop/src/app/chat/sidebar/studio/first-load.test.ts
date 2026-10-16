import { atom } from 'nanostores'
import { describe, expect, it } from 'vitest'

import { settledAfterFirstLoad } from './first-load'

describe('settledAfterFirstLoad', () => {
  it('stays unsettled until a load it saw has finished', () => {
    const $loading = atom(false)
    const $settled = settledAfterFirstLoad($loading)

    $loading.set(false)
    expect($settled.get()).toBe(false)

    $loading.set(true)
    expect($settled.get()).toBe(false)

    $loading.set(false)
    expect($settled.get()).toBe(true)
  })

  it('counts a load already running when it starts watching', () => {
    const $loading = atom(true)
    const $settled = settledAfterFirstLoad($loading)

    $loading.set(false)
    expect($settled.get()).toBe(true)
  })

  it('does not unsettle when later background loads run', () => {
    const $loading = atom(true)
    const $settled = settledAfterFirstLoad($loading)

    $loading.set(false)
    $loading.set(true)
    expect($settled.get()).toBe(true)
  })
})
