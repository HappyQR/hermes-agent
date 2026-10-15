import { Codecs, persistentAtom } from '@/lib/persisted'
import { modeBound } from '@/store/interface-mode'

// The colored profile strip at the sidebar foot. Hermes Studio's account button
// (the sidebar footer's profile & gateway menu) is the profile door, so the
// rail is opt-in — the account menu's "Show profile rail" (Advanced) brings it
// back for drag-ordering and dense fleets. Off by default; the key is versioned
// so an install that had the rail on starts from the Studio default. Simple
// mode rests it hidden without touching this preference.
const $profileRailVisiblePref = persistentAtom('hermes.desktop.profileRailVisible.v2', false, Codecs.bool)

export const $profileRailVisible = modeBound('profileRailVisible', $profileRailVisiblePref, value =>
  $profileRailVisiblePref.set(value)
)

export function toggleProfileRailVisible() {
  $profileRailVisible.set(!$profileRailVisible.get())
}
