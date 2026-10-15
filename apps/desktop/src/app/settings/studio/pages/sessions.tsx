import { useI18n } from '@/i18n'

import { AutoArchiveSetting, SessionsSettings } from '../../sessions-settings'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

/** 会话与归档 Sessions & Archive: auto-archive, then the archived sessions with Unarchive / Delete. */
export function SessionsPage() {
  const { t } = useI18n()
  const s = t.studio.settings.sections.sessions

  return (
    <>
      <SettingsWindowSection aside={<SettingsScopeBadge page="sessions" />} id="retention" page="sessions" title={s.retention}>
        <AutoArchiveSetting />
      </SettingsWindowSection>
      <SettingsWindowSection id="archived" note={t.settings.sessions.archivedIntro} page="sessions" title={s.archived}>
        <SessionsSettings subpage="archived" />
      </SettingsWindowSection>
    </>
  )
}
