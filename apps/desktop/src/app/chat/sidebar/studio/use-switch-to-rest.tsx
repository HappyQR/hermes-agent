import { useState } from 'react'

import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { selectConnection } from '@/store/connections'
import { notifyError } from '@/store/notifications'

import { type FleetAgent, fleetRouteKey } from '../fleet-rail'
import { useLocalDeviceSwitch } from '../local-device-switch'

/**
 * Switch to a profile on another gateway (the fleet's at-rest agents), the way
 * the rail and the statusbar picker do: a remote gateway dials straight away;
 * This device first confirms (install, or a fresh session replacing the
 * center). `pendingRoute` names the row whose switch is dialing.
 */
export function useSwitchToRest() {
  const { t } = useI18n()
  const [pendingRoute, setPendingRoute] = useState<null | string>(null)
  const { dialog, request } = useLocalDeviceSwitch()

  const settle = (key: string) => setPendingRoute(current => (current === key ? null : current))

  const commit = (agent: FleetAgent) => {
    const key = fleetRouteKey(agent.connectionId, agent.profile)
    triggerHaptic('selection')
    setPendingRoute(key)

    void selectConnection(agent.connectionId, { profile: agent.profile })
      .catch((error: unknown) => notifyError(error, t.profiles.switchConnectionFailed(agent.connectionLabel)))
      .finally(() => settle(key))
  }

  const switchToRest = (agent: FleetAgent) => {
    if (agent.connectionKind !== 'local') {
      commit(agent)

      return
    }

    const key = fleetRouteKey(agent.connectionId, agent.profile)
    setPendingRoute(key)

    void request({
      connectionId: agent.connectionId,
      label: agent.connectionLabel,
      profile: agent.profile,
      replaceCenter: agent.profile === 'default'
    }).then(accepted => {
      settle(key)

      if (accepted) {
        commit(agent)
      }
    })
  }

  return { dialog, pendingRoute, switchToRest }
}
