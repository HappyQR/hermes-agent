import { useStore } from '@nanostores/react'

import { useI18n } from '@/i18n'
import { $hapticsMuted, setHapticsMuted } from '@/store/haptics'

import { NotificationsSettings } from '../../notifications-settings'
import { ToggleRow } from '../../primitives'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

/** Haptic feedback: the haptics mute (it also silences the completion cue). */
function HapticsRow() {
  const { t } = useI18n()
  const muted = useStore($hapticsMuted)

  return (
    <ToggleRow
      checked={!muted}
      description={t.studio.settings.rows.hapticsDesc}
      label={t.studio.settings.rows.hapticsTitle}
      onChange={on => setHapticsMuted(!on)}
    />
  )
}

/** Notifications: desktop alerts, sound and haptics (device-local). */
export function NotificationsPage() {
  const { t } = useI18n()
  const s = t.studio.settings.sections.notifications

  return (
    <>
      <SettingsWindowSection
        aside={<SettingsScopeBadge page="notifications" />}
        id="alerts"
        note={t.settings.notifications.intro}
        page="notifications"
        title={s.alerts}
      >
        <NotificationsSettings subpage="alerts" />
      </SettingsWindowSection>
      <SettingsWindowSection id="sounds" page="notifications" title={s.sounds}>
        <NotificationsSettings subpage="sounds" />
        <HapticsRow />
      </SettingsWindowSection>
    </>
  )
}
