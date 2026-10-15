import { useCallback } from 'react'

/**
 * Keeps a row highlighted whenever the palette's rows change. Returns the ref
 * for the cmdk list element.
 *
 * cmdk 1.1 loses its highlight when a list swap unmounts the highlighted row:
 * every removed row schedules the same re-select callback, so only the LAST
 * removed row's check survives — it re-selects only when that row happened to
 * be the highlighted one. A row relabelled in place (a locale switch) also
 * keeps a value nothing matches. Either way Enter would do nothing until an
 * arrow key. The palette controls cmdk's value instead, and this observer
 * hands the highlight to the first row whenever rows are added or removed and
 * none is highlighted — after cmdk's own effects have run, so it only fills a
 * gap and never fights a highlight cmdk (or the pointer) chose.
 *
 * A callback ref, not an effect: the list mounts inside the dialog portal a
 * commit after the frame, so an effect in the frame would find no element.
 */
export function useFirstRowHighlight(setValue: (value: string) => void) {
  return useCallback(
    (list: HTMLElement | null) => {
      if (!list) {
        return
      }

      const observer = new MutationObserver(() => {
        if (list.querySelector('[cmdk-item][aria-selected="true"]')) {
          return
        }

        const value = list.querySelector('[cmdk-item]:not([aria-disabled="true"])')?.getAttribute('data-value')

        if (value) {
          setValue(value)
          list.scrollTop = 0
        }
      })

      observer.observe(list, { childList: true, subtree: true })

      return () => observer.disconnect()
    },
    [setValue]
  )
}
