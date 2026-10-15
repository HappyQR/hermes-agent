import { createContext, type ReactNode } from 'react'

/**
 * Rows a host adds to the composer's model menu, rendered at the head of the
 * catalog's footer — after the model list, before "Follow default" / "Refresh
 * models". Hermes Studio's merged "model · effort" pill puts the active
 * model's Thinking / Fast / Effort rows here, so one panel holds both.
 */
export const ModelMenuExtras = createContext<ReactNode>(null)
