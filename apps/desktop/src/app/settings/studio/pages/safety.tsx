import { useI18n } from '@/i18n'

import type { ConfigSettingsLayoutApi } from '../../config-settings'
import { SharedMetricsSettings } from '../../shared-metrics-settings'
import { ConfigPage, type ConfigPageProps, ConfigRows, placedFields } from '../config-layout'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

function SafetySections({ api }: { api: ConfigSettingsLayoutApi }) {
  const { t } = useI18n()
  const s = t.studio.settings.sections.safety

  return (
    <>
      <SettingsWindowSection aside={<SettingsScopeBadge page="safety" />} id="approvals" page="safety" title={s.approvals}>
        <ConfigRows api={api} keys={placedFields(api, 'safety', 'approvals')} skeleton={4} />
      </SettingsWindowSection>
      <SettingsWindowSection id="privacy" page="safety" title={s.privacy}>
        <SharedMetricsSettings />
        <ConfigRows api={api} keys={placedFields(api, 'safety', 'privacy')} skeleton={1} />
      </SettingsWindowSection>
      <SettingsWindowSection id="browser" page="safety" title={s.browser}>
        <ConfigRows api={api} keys={placedFields(api, 'safety', 'browser')} skeleton={3} />
      </SettingsWindowSection>
    </>
  )
}

/** 安全与隐私 Safety & Privacy: command approval, privacy, browser and network (profile). */
export function SafetyPage(props: ConfigPageProps) {
  return (
    <ConfigPage legacySection="safety" {...props}>
      {api => <SafetySections api={api} />}
    </ConfigPage>
  )
}
