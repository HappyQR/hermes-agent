import { type PointerEvent, type RefObject, useCallback } from 'react'

const INTERACTIVE =
  'button, a, input, textarea, select, label, [role="button"], [role="combobox"], [contenteditable="true"]'

// Keep at least this much of the window on screen while dragging.
const MARGIN = 96

/**
 * Drag the Settings window by its title strips (prototype settings.js drag):
 * moves the floating card inside the app window with `translate`, never the
 * OS window. The offset resets when the window closes (the card unmounts).
 */
export function useWindowDrag(rootRef: RefObject<HTMLElement | null>) {
  return useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const card = rootRef.current?.closest<HTMLElement>('[data-slot="overlay-window"]')

      if (event.button !== 0 || !card || (event.target as HTMLElement).closest(INTERACTIVE)) {
        return
      }

      event.preventDefault()

      const [x0, y0] = (card.style.translate || '0px 0px').split(' ').map(value => Number.parseFloat(value) || 0)
      const startX = event.clientX
      const startY = event.clientY
      const box = card.getBoundingClientRect()

      const move = (moveEvent: globalThis.PointerEvent) => {
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY
        // Clamp so a corner of the window always stays reachable.
        const minX = MARGIN - box.right
        const maxX = window.innerWidth - MARGIN - box.left
        const minY = -box.top + 8
        const maxY = window.innerHeight - MARGIN - box.top
        const x = Math.max(minX, Math.min(maxX, dx)) + x0
        const y = Math.max(minY, Math.min(maxY, dy)) + y0

        card.style.translate = `${x}px ${y}px`
      }

      const up = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', up)
      }

      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', up)
    },
    [rootRef]
  )
}
