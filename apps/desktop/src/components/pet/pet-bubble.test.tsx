import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { en } from '@/i18n/en'
import { $petActivity } from '@/store/pet'

import { PetBubble } from './pet-bubble'

const lines = en.studio.overlays.aux.pet.lines
const bubble = () => document.querySelector('[data-slot="pet-bubble"]')

afterEach(() => {
  cleanup()
  $petActivity.set({})
})

describe('PetBubble peek (the pet was clicked)', () => {
  it('stays quiet in-window at idle until the pet is clicked, then says hello', () => {
    const { rerender } = render(<PetBubble showStatus={false} />)

    expect(bubble()).toBeNull()

    rerender(<PetBubble peek showStatus={false} />)
    expect(lines.idle).toContain(bubble()?.textContent)
  })

  it('reports the live status when clicked mid-turn', () => {
    render(<PetBubble peek showStatus={false} />)

    act(() => $petActivity.set({ awaitingInput: true }))
    expect(lines.waiting).toContain(bubble()?.textContent)
  })
})
