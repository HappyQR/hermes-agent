import { FormCell } from '@/app/overlays/studio/form-group'
import { useI18n } from '@/i18n'

import { GatewaySettings } from '../../gateway-settings'
import { SettingsWindowSection } from '../section'

/** 网关与连接 Gateways & Connections: this window's connection, saved connections, remote updates (machine-level). */
export function GatewaysPage() {
  const { t } = useI18n()
  const s = t.studio.settings.sections.gateways

  return (
    <>
      <SettingsWindowSection id="connection" note={t.settings.gateway.intro} page="gateways" title={s.connection}>
        <FormCell>
          <GatewaySettings subpage="connection" />
        </FormCell>
      </SettingsWindowSection>
      <SettingsWindowSection id="saved" page="gateways" title={s.saved}>
        <FormCell>
          <GatewaySettings subpage="devices" />
        </FormCell>
      </SettingsWindowSection>
      <SettingsWindowSection id="remote-updates" page="gateways" title={s.remoteUpdates}>
        <FormCell>
          <GatewaySettings subpage="managed-updates" />
        </FormCell>
      </SettingsWindowSection>
    </>
  )
}
