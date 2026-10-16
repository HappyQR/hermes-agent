import { useI18n } from '@/i18n'

import type { ConfigSettingsLayoutApi } from '../../config-settings'
import { ConfigPage, type ConfigPageProps, ConfigRows, placedFields } from '../config-layout'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

const SECTIONS = [
  ['agent', 4],
  ['terminal', 3],
  ['subagents', 4],
  ['output', 2],
  ['updates', 1]
] as const

function AdvancedSections({ api }: { api: ConfigSettingsLayoutApi }) {
  const { t } = useI18n()
  const s = t.studio.settings.sections.advanced

  return (
    <>
      {SECTIONS.map(([id, skeleton], index) => (
        <SettingsWindowSection
          aside={index === 0 ? <SettingsScopeBadge page="advanced" /> : undefined}
          id={id}
          key={id}
          page="advanced"
          title={s[id]}
        >
          <ConfigRows api={api} keys={placedFields(api, 'advanced', id)} skeleton={skeleton} />
        </SettingsWindowSection>
      ))}
    </>
  )
}

/** Advanced: agent, terminal backend, subagents, output limits, in-app updates (profile). */
export function AdvancedPage(props: ConfigPageProps) {
  return (
    <ConfigPage legacySection="advanced" {...props}>
      {api => <AdvancedSections api={api} />}
    </ConfigPage>
  )
}
