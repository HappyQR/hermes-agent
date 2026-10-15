import { useNavigate } from 'react-router'

import { CAPABILITIES_ROUTE, navigateToWorkspacePage } from '@/app/routes'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'

import type { ConfigSettingsLayoutApi } from '../../config-settings'
import { KeysSettings } from '../../keys-settings'
import { ListRow } from '../../primitives'
import { ConfigPage, type ConfigPageProps, ConfigRows, placedFields } from '../config-layout'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

function ToolsetsRow() {
  const { t } = useI18n()
  const r = t.studio.settings.rows
  const navigate = useNavigate()

  return (
    <ListRow
      action={
        <Button
          onClick={() => navigateToWorkspacePage(navigate, `${CAPABILITIES_ROUTE}?tab=tools`)}
          size="sm"
          variant="secondary"
        >
          {r.openAction}
        </Button>
      }
      description={r.toolsetsDesc(t.sidebar.nav.capabilities)}
      title={r.toolsetsTitle}
    />
  )
}

function ToolsSections({ api }: { api: ConfigSettingsLayoutApi }) {
  const { t } = useI18n()
  const s = t.studio.settings.sections.tools

  return (
    <>
      <SettingsWindowSection aside={<SettingsScopeBadge page="tools" />} id="tool-keys" page="tools" title={s.toolKeys}>
        <KeysSettings view="tools" />
      </SettingsWindowSection>
      <SettingsWindowSection id="server-env" page="tools" title={s.serverEnv}>
        <KeysSettings view="settings" />
      </SettingsWindowSection>
      <SettingsWindowSection id="toolsets" page="tools" title={s.toolsets}>
        <ToolsetsRow />
        {/* The raw enabled-toolsets list (with the confirm before clearing all). */}
        <ConfigRows api={api} keys={placedFields(api, 'tools', 'toolsets')} skeleton={1} />
      </SettingsWindowSection>
    </>
  )
}

/** 工具与密钥 Tools & Keys: tool service keys, server environment, toolsets (profile). */
export function ToolsPage(props: ConfigPageProps) {
  return (
    <ConfigPage legacySection="advanced" {...props}>
      {api => <ToolsSections api={api} />}
    </ConfigPage>
  )
}
