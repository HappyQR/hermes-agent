import { useEffect, useState } from 'react'

/** Live ⌘/⌃-held state while the palette is open: rows with a modifier
 *  variant (projects) preview it by swapping their label. Window-level
 *  listeners because focus sits in the search input; blur clears so a
 *  ⌘-Tab away doesn't strand the preview on. */
export function useModifierHeld(): boolean {
  const [modHeld, setModHeld] = useState(false)

  useEffect(() => {
    const sync = (event: KeyboardEvent) => setModHeld(event.metaKey || event.ctrlKey)
    const clear = () => setModHeld(false)

    window.addEventListener('keydown', sync, { capture: true })
    window.addEventListener('keyup', sync, { capture: true })
    window.addEventListener('blur', clear)

    return () => {
      window.removeEventListener('keydown', sync, { capture: true })
      window.removeEventListener('keyup', sync, { capture: true })
      window.removeEventListener('blur', clear)
    }
  }, [])

  return modHeld
}
