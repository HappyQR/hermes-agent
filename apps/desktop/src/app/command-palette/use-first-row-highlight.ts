import { type RefObject, useEffect } from 'react'

/**
 * Keeps a row highlighted whenever the palette's rows change.
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
 */
export function useFirstRowHighlight(listRef: RefObject<HTMLElement | null>, setValue: (value: string) => void) {
  useEffect(() => {
    const list = listRef.current

    if (!list) {
      return
    }

    const repair = () => {
      if (list.querySelector('[cmdk-item][aria-selected="true"]')) {
        return
      }

      const value = list.querySelector('[cmdk-item]:not([aria-disabled="true"])')?.getAttribute('data-value')

      if (value) {
        setValue(value)
        list.scrollTop = 0
      }
    }

    const observer = new MutationObserver(repair)

    observer.observe(list, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [listRef, setValue])
}
