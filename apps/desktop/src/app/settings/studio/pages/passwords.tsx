import { useStore } from '@nanostores/react'

import { useI18n } from '@/i18n'
import { $activeConnectionId } from '@/store/connections'
import { $settingsScopeProfile } from '@/store/settings-scope'

import { vaultOwnerKey, VaultSettings } from '../../vault-settings'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

/** 密码与登录 Passwords & Logins: saved credentials, password managers (per profile vault). */
export function PasswordsPage() {
  const { t } = useI18n()
  const s = t.studio.settings.sections.passwords
  const scopeProfile = useStore($settingsScopeProfile)
  const activeConnectionId = useStore($activeConnectionId)
  // Keyed by owner so a profile/connection switch never shows another vault's rows.
  const key = vaultOwnerKey(activeConnectionId, scopeProfile)

  return (
    <>
      <SettingsWindowSection
        aside={<SettingsScopeBadge page="passwords" />}
        id="credentials"
        note={s.credentialsNote}
        page="passwords"
        title={s.credentials}
      >
        <VaultSettings key={key} subpage="credentials" />
      </SettingsWindowSection>
      <SettingsWindowSection id="managers" note={t.settings.vault.sources.blurb} page="passwords" title={s.managers}>
        <VaultSettings key={key} subpage="sources" />
      </SettingsWindowSection>
    </>
  )
}
