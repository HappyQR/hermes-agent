import { useStore } from '@nanostores/react'
import { useEffect, useState } from 'react'

import { getPairing } from '@/hermes'
import { $changeEventsAvailable, $pairingChangeTick } from '@/store/live-sync'
import { $gatewayState } from '@/store/session'
import { $settingsRequestProfile } from '@/store/settings-scope'

/**
 * Pending messaging pairing requests, for the Messaging nav row's count. The
 * same request (and profile scope) the Messaging page makes. Refreshed when the
 * gateway connects, on `pairing.changed`, and when the window comes back —
 * never on a timer. An older backend without the endpoint just shows nothing.
 */
export function usePendingPairingCount(): number {
  const profile = useStore($settingsRequestProfile)
  const gatewayOpen = useStore($gatewayState) === 'open'
  const changeEventsAvailable = useStore($changeEventsAvailable)
  const pairingTick = useStore($pairingChangeTick)
  // The tick only matters where the backend emits pairing.changed.
  const pairingSignal = changeEventsAvailable ? pairingTick : 0
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!gatewayOpen) {
      return
    }

    let cancelled = false

    const refresh = () => {
      if (document.visibilityState === 'hidden') {
        return
      }

      getPairing(profile)
        .then(result => {
          if (!cancelled) {
            setCount(result.pending?.length ?? 0)
          }
        })
        .catch(() => undefined)
    }

    refresh()
    window.addEventListener('focus', refresh)

    return () => {
      cancelled = true
      window.removeEventListener('focus', refresh)
    }
  }, [gatewayOpen, profile, pairingSignal])

  return gatewayOpen ? count : 0
}
