import { useI18n } from '@/i18n'

import { AppearanceSettings } from '../../appearance-settings'
import { DisableF12Setting, ExternalLinksSetting, KeepAwakeSetting } from '../../config-settings'
import { OnboardingSettings } from '../../onboarding-settings'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

/** 通用 General: language and startup, tips, window and system (device-local). */
export function GeneralPage() {
  const { t } = useI18n()
  const s = t.studio.settings.sections.general

  return (
    <>
      <SettingsWindowSection
        aside={<SettingsScopeBadge page="general" />}
        id="language"
        page="general"
        title={s.language}
      >
        <AppearanceSettings rows={['language']} />
        <AppearanceSettings rows={['resumeLastSession']} />
        <AppearanceSettings rows={['introSplash', 'modelPricing']} />
      </SettingsWindowSection>
      <SettingsWindowSection id="tips" page="general" title={s.tips}>
        <AppearanceSettings rows={['tips', 'tours']} />
        <OnboardingSettings />
      </SettingsWindowSection>
      <SettingsWindowSection id="system" page="general" title={s.system}>
        <AppearanceSettings rows={['minimizeToTray']} />
        <KeepAwakeSetting />
        <ExternalLinksSetting />
        <DisableF12Setting />
      </SettingsWindowSection>
    </>
  )
}
