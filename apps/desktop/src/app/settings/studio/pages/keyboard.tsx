import { useI18n } from '@/i18n'
import { canUseQuickEntry } from '@/store/quick-entry'

import { HudModifierSettings } from '../../hud-modifier-settings'
import { KeybindSettings } from '../../keybind-settings'
import { QuickEntrySettings } from '../../quick-entry-settings'
import { ScreenshotSettings } from '../../screenshot-settings'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

/** 键盘与快捷操作 Keyboard: shortcuts, Quick Ask, HUD gesture and window capture (device-local). */
export function KeyboardPage() {
  const { t } = useI18n()
  const s = t.studio.settings.sections.keyboard
  const hud = Boolean(window.hermesDesktop?.hudModifier)
  const capture = Boolean(window.hermesDesktop?.screenshot)

  return (
    <>
      <SettingsWindowSection
        aside={<SettingsScopeBadge page="keyboard" />}
        id="shortcuts"
        note={s.shortcutsNote}
        page="keyboard"
        title={s.shortcuts}
      >
        <KeybindSettings subpage="shortcuts" />
      </SettingsWindowSection>
      {canUseQuickEntry() && (
        <SettingsWindowSection id="quick-ask" page="keyboard" title={s.quickAsk}>
          <QuickEntrySettings />
        </SettingsWindowSection>
      )}
      {/* Neither bridge on this platform: no empty section (the classic page was empty on Windows/Linux). */}
      {(hud || capture) && (
        <SettingsWindowSection id="hud" page="keyboard" title={s.hud}>
          {hud && <HudModifierSettings />}
          {capture && <ScreenshotSettings />}
        </SettingsWindowSection>
      )}
    </>
  )
}
