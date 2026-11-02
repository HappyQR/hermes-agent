import { Fragment } from 'react'

import { useI18n } from '@/i18n'

import type { ConfigSettingsLayoutApi } from '../../config-settings'
import { DelegationRoutingSection } from '../../delegation/routing-section'
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
        <Fragment key={id}>
          {/* How each subagent gets its model; the subagent model row below is the
              Default strategy's route and goes inert while another strategy decides. */}
          {id === 'subagents' && api.ready && <DelegationRoutingSection scope={api.writeScope ?? api.scopeProfile} />}
          <SettingsWindowSection
            aside={index === 0 ? <SettingsScopeBadge page="advanced" /> : undefined}
            id={id}
            page="advanced"
            title={s[id]}
          >
            <ConfigRows api={api} keys={placedFields(api, 'advanced', id)} skeleton={skeleton} />
          </SettingsWindowSection>
        </Fragment>
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
