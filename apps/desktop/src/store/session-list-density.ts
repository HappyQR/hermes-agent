import { type Codec, persistentAtom } from '@/lib/persisted'

export type SessionListDensity = 'compact' | 'comfortable' | 'detailed'

const STORAGE_KEY = 'hermes.desktop.sessionListDensity'

// Hermes Studio: Comfortable (one 30px line) is the shipped row; Compact keeps
// the tighter pre-density row and Detailed adds the project · branch · model
// line. An explicit choice persists as before (#68119).
const densityCodec: Codec<SessionListDensity> = {
  decode: raw => (raw === 'compact' || raw === 'detailed' ? raw : 'comfortable'),
  encode: value => value
}

export const $sessionListDensity = persistentAtom<SessionListDensity>(STORAGE_KEY, 'comfortable', densityCodec)

export function setSessionListDensity(density: SessionListDensity) {
  $sessionListDensity.set(density)
}
