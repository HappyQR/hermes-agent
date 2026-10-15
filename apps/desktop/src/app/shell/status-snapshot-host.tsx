import { useStore } from '@nanostores/react'
import { memo, useEffect } from 'react'

import type { WiringActions } from '@/app/contrib/types'
import { $activeConnectionId } from '@/store/connections'
import { $activeGatewayProfile } from '@/store/profile'
import { $freshDraftReady, $gatewayState } from '@/store/session'
import { $inferenceStatus, $statusSnapshot } from '@/store/status-snapshot'

import { useStatusSnapshot } from './hooks/use-status-snapshot'

/** Runs the ambient status poll once per window, whatever chrome is showing,
 *  and publishes it for every reader ($statusSnapshot / $inferenceStatus). */
export const StatusSnapshotHost = memo(function StatusSnapshotHost({
  requestGateway
}: {
  requestGateway: WiringActions['requestGateway']
}) {
  const activeConnectionId = useStore($activeConnectionId)
  const activeGatewayProfile = useStore($activeGatewayProfile)
  const gatewayState = useStore($gatewayState)
  const gatewayScope = `${activeConnectionId ?? ''}\0${activeGatewayProfile}`
  const { inferenceStatus, statusSnapshot } = useStatusSnapshot(gatewayState, requestGateway, gatewayScope)

  useEffect(() => $statusSnapshot.set(statusSnapshot), [statusSnapshot])
  useEffect(() => $inferenceStatus.set(inferenceStatus), [inferenceStatus])

  return null
})

/** What the status-bar item hook needs from the shared poll. */
export function useSharedStatus() {
  return {
    freshDraftReady: useStore($freshDraftReady),
    gatewayState: useStore($gatewayState),
    inferenceStatus: useStore($inferenceStatus),
    statusSnapshot: useStore($statusSnapshot)
  }
}
