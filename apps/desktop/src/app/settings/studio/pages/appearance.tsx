import { useContributions } from '@/contrib'
import { useI18n } from '@/i18n'

import { APPEARANCE_AREAS, AppearanceExtraSlot } from '../../appearance-contrib'
import { AppearanceSettings } from '../../appearance-settings'
import { AccentColorRow, ColorModeCards } from '../rows/appearance-look'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

/** Plugin `appearance.extra` controls, after the built-in sections (never rendered by the classic subpages). */
function AppearanceExtras() {
  const contributions = useContributions(APPEARANCE_AREAS.extra)

  return contributions.length > 0 ? (
    <section className="flex flex-col gap-2" data-slot="form-section">
      <AppearanceExtraSlot />
    </section>
  ) : null
}

/** 外观 Appearance: mode + accent, themes, window, fonts and scaling, pet (device-local). */
export function AppearancePage() {
  const { t } = useI18n()
  const s = t.studio.settings.sections.appearance

  return (
    <>
      <SettingsWindowSection
        aside={<SettingsScopeBadge page="appearance" />}
        id="look"
        page="appearance"
        title={s.look}
      >
        <ColorModeCards />
        <AccentColorRow />
      </SettingsWindowSection>
      <SettingsWindowSection id="theme" note={s.themeNote} page="appearance" title={s.theme}>
        <AppearanceSettings rows={['theme']} />
      </SettingsWindowSection>
      <SettingsWindowSection id="window" page="appearance" title={s.window}>
        <AppearanceSettings rows={['interfaceMode', 'translucency']} />
        <AppearanceSettings rows={['sessionDensity', 'tabStrip', 'backdrop', 'fileBrowser', 'composerPopout']} />
      </SettingsWindowSection>
      <SettingsWindowSection id="typography" page="appearance" title={s.typography}>
        <AppearanceSettings rows={['uiScale', 'chatTextScale', 'chatFont', 'terminalFont']} />
      </SettingsWindowSection>
      <SettingsWindowSection id="pet" note={t.settings.appearance.pet.intro} page="appearance" title={s.pet}>
        <AppearanceSettings rows={['pet']} />
      </SettingsWindowSection>
      <AppearanceExtras />
    </>
  )
}
