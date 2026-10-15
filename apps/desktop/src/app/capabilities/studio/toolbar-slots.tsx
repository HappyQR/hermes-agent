import { createContext, type ReactNode, useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

// The Capabilities toolbar (prototype pages.js:36-43) is one row under the
// page head: search · tab controls · spacer · scope · the tab's primary
// action. Each tab owns its controls (sort, bulk menu, "Add custom
// connector"…), so it renders them through a slot: inside the page they are
// portaled into the toolbar row; used standalone (Bot Mode, the SDK export,
// tests) they render inline where they were.

export type CapToolbarSlotName = 'end' | 'search' | 'start'

type SlotTargets = Record<CapToolbarSlotName, HTMLElement | null>

interface SlotsContextValue {
  register: (name: CapToolbarSlotName) => (element: HTMLElement | null) => void
  targets: SlotTargets
}

const SlotsContext = createContext<null | SlotsContextValue>(null)

export function CapToolbarSlotsProvider({ children }: { children: ReactNode }) {
  const [targets, setTargets] = useState<SlotTargets>({ end: null, search: null, start: null })

  const register = useMemo(() => {
    const refs = new Map<CapToolbarSlotName, (element: HTMLElement | null) => void>()

    return (name: CapToolbarSlotName) => {
      let ref = refs.get(name)

      if (!ref) {
        ref = element =>
          setTargets(previous => (previous[name] === element ? previous : { ...previous, [name]: element }))
        refs.set(name, ref)
      }

      return ref
    }
  }, [])

  const value = useMemo(() => ({ register, targets }), [register, targets])

  return <SlotsContext.Provider value={value}>{children}</SlotsContext.Provider>
}

/** A slot's place in the page toolbar (layout-transparent). */
export function CapToolbarSlotTarget({ name }: { name: CapToolbarSlotName }) {
  const context = useContext(SlotsContext)

  return <span className="contents" data-slot={`capabilities-toolbar-${name}`} ref={context?.register(name)} />
}

/** True inside the Capabilities page (its toolbar hosts the tab controls). */
export function useInCapabilitiesToolbar(): boolean {
  return useContext(SlotsContext) !== null
}

/** Tab controls: portaled into the page toolbar, or inline when standalone. */
export function CapToolbarSlot({ children, name }: { children: ReactNode; name: CapToolbarSlotName }) {
  const context = useContext(SlotsContext)

  if (!context) {
    return <>{children}</>
  }

  const target = context.targets[name]

  return target ? createPortal(children, target) : null
}
