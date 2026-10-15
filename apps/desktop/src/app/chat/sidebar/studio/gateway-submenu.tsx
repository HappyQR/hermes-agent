import { useStore } from '@nanostores/react'
import { useNavigate } from 'react-router'

import { StatusDot } from '@/components/status-dot'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { $hasMultipleConnections } from '@/store/connections'
import { reconnectGateway } from '@/store/gateway-reconnect'
import { notifyError } from '@/store/notifications'
import { $gatewayState } from '@/store/session'
import { $inferenceStatus } from '@/store/status-snapshot'
import { runGatewayRestart } from '@/store/system-actions'

import { COMMAND_CENTER_ROUTE, SETTINGS_ROUTE } from '../../../routes'

/** The two status lines (transport, inference) heading the Gateway submenu —
 *  the statusbar health panel's header, for the bar-less default. */
function GatewayStatusLines() {
  const { t } = useI18n()
  const copy = t.shell.gatewayMenu
  const gatewayState = useStore($gatewayState)
  const inference = useStore($inferenceStatus)
  const open = gatewayState === 'open'
  const connecting = gatewayState === 'connecting'

  const transport = open ? copy.connected : connecting ? copy.connecting : copy.disconnected

  const inferenceLabel = open
    ? inference?.ready
      ? copy.inferenceReady
      : inference
        ? copy.inferenceNotReady
        : copy.checkingInference
    : copy.disconnected

  return (
    <div className="flex flex-col gap-1 px-2 pt-1 pb-1.5 text-xs" data-slot="sidebar-gateway-status">
      <span className="flex items-center gap-1.5 font-medium">
        <StatusDot tone={open ? 'good' : connecting ? 'warn' : 'bad'} />
        {transport}
      </span>
      <span className="flex items-center gap-1.5 text-(--ui-text-tertiary)">
        <StatusDot tone={open && inference?.ready ? 'good' : open ? 'warn' : 'bad'} />
        {inferenceLabel}
      </span>
      {inference?.reason ? (
        <span className="line-clamp-3 max-w-64 text-(--ui-text-tertiary)">{inference.reason}</span>
      ) : null}
    </div>
  )
}

/** Gateway ▸ — reconnect, restart, recent activity, and the gateways page. */
export function GatewaySubmenu() {
  const { t } = useI18n()
  const copy = t.studio.sidebar.footer
  const navigate = useNavigate()
  const multipleConnections = useStore($hasMultipleConnections)

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <StudioIcon name="server" size={15} />
        <span>{copy.gateway}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-56">
        <GatewayStatusLines />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => void reconnectGateway().catch(err => notifyError(err, t.shell.gatewayMenu.reconnectGateway))}
        >
          <StudioIcon name="retry" size={15} />
          <span>{copy.reconnect}</span>
        </DropdownMenuItem>
        {/* Never rejects; progress shows in the gateway indicators. */}
        <DropdownMenuItem onSelect={() => void runGatewayRestart()}>
          <StudioIcon name="pulse" size={15} />
          <span>{t.commandCenter.restartGateway}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate(`${COMMAND_CENTER_ROUTE}?section=system`)}>
          <StudioIcon name="doc" size={15} />
          <span>{copy.recentActivity}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* One gateway: the way to add a second (the rail's plug pill). */}
        <DropdownMenuItem onSelect={() => navigate(`${SETTINGS_ROUTE}?tab=gateway`)}>
          <StudioIcon name="sliders" size={15} />
          <span>{multipleConnections ? t.profiles.connectGateway : copy.connectGateway}</span>
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
