import { useStore } from '@nanostores/react'

import { useI18n } from '@/i18n'
import { resolveProfileColor } from '@/lib/profile-color'
import { $activeConnectionId, $connectionsRegistry } from '@/store/connections'
import {
  $activeGatewayProfile,
  $profileColors,
  $profiles,
  $showAllProfiles,
  normalizeProfileKey,
  profileLabel
} from '@/store/profile'
import { $profileRemoteOverrides } from '@/store/profile-remote-override'
import { $connection, $gatewayState } from '@/store/session'
import { $inferenceStatus } from '@/store/status-snapshot'

export type GatewayTone = 'bad' | 'good' | 'warn'

/** electron/connection-registry.ts `localEntry()`'s default label. */
const LOCAL_DEFAULT_LABEL = 'This device'

export interface GatewayIdentity {
  label: string
  status: string
  tone: GatewayTone
  remote: boolean
}

/** The gateway the window talks to: its name, how it is doing, and whether it
 *  lives off this machine (a remote connection or a profile's remote host). */
export function useGatewayIdentity(): GatewayIdentity {
  const { t } = useI18n()
  const copy = t.studio.sidebar.footer
  const registry = useStore($connectionsRegistry)
  const activeConnectionId = useStore($activeConnectionId)
  const gatewayState = useStore($gatewayState)
  const inference = useStore($inferenceStatus)
  const connection = useStore($connection)
  const overrides = useStore($profileRemoteOverrides)
  const gatewayProfile = useStore($activeGatewayProfile)
  // The legacy primary path publishes no connection id: that is the primary.
  const activeId = activeConnectionId ?? registry?.primary
  const active = registry?.connections.find(entry => entry.id === activeId)
  const open = gatewayState === 'open'

  const status = open ? copy.ready : gatewayState === 'connecting' ? copy.connecting : copy.disconnected
  const tone: GatewayTone = open ? (inference && !inference.ready ? 'warn' : 'good') : gatewayState === 'connecting' ? 'warn' : 'bad'

  // The registry names This device in English until the user renames it.
  const label = !active || (active.kind === 'local' && active.label === LOCAL_DEFAULT_LABEL) ? copy.thisDevice : active.label

  return {
    label,
    remote: connection?.mode === 'remote' || Boolean(overrides[normalizeProfileKey(gatewayProfile)]?.host),
    status,
    tone
  }
}

export interface AccountIdentity {
  /** All profiles is on: the button names the scope, not one profile. */
  all: boolean
  color: null | string
  isDefault: boolean
  name: string
}

/** Who the account button shows: the active profile (or All profiles). */
export function useAccountIdentity(): AccountIdentity {
  const { t } = useI18n()
  const profiles = useStore($profiles)
  const colors = useStore($profileColors)
  const showAll = useStore($showAllProfiles)
  const gatewayProfile = useStore($activeGatewayProfile)
  const key = normalizeProfileKey(gatewayProfile)
  const active = profiles.find(profile => normalizeProfileKey(profile.name) === key)

  if (showAll) {
    return { all: true, color: null, isDefault: false, name: t.profiles.allProfiles }
  }

  return {
    all: false,
    color: resolveProfileColor(active?.name ?? key, colors),
    isDefault: active ? active.is_default : key === 'default',
    name: active ? profileLabel(active) : key
  }
}
