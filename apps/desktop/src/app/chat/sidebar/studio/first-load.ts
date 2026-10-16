import { atom, type ReadableAtom } from 'nanostores'

import { $projectTreeLoading, $reposScanning } from '@/store/projects'
import { $sessionsLoading } from '@/store/session'

/**
 * Latches true the first time `$loading` finishes a load, and stays true.
 *
 * The sidebar's loading states stand in for a list's FIRST fetch only. Empty
 * lists keep refreshing in the background (window focus, change events, a
 * finished turn), and trading their empty state for skeletons or a spinner and
 * back on every pass reads as the sidebar flickering. Module-level, so a
 * remounted sidebar does not replay the first-load state.
 */
export function settledAfterFirstLoad($loading: ReadableAtom<boolean>): ReadableAtom<boolean> {
  const $settled = atom(false)
  let sawLoading = $loading.get()

  $loading.listen(loading => {
    if (loading) {
      sawLoading = true
    } else if (sawLoading) {
      $settled.set(true)
    }
  })

  return $settled
}

export const $sessionsSettled = settledAfterFirstLoad($sessionsLoading)
export const $projectTreeSettled = settledAfterFirstLoad($projectTreeLoading)
export const $reposScanSettled = settledAfterFirstLoad($reposScanning)
