import { useI18n } from '@/i18n'

import type { ConfigSettingsLayoutApi } from '../../config-settings'
import { SessionsSettings } from '../../sessions-settings'
import { ConfigPage, type ConfigPageProps, ConfigRows, placedFields } from '../config-layout'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

function WorkspaceSections({ api }: { api: ConfigSettingsLayoutApi }) {
  const { t } = useI18n()
  const s = t.studio.settings.sections.workspace

  return (
    <>
      <SettingsWindowSection
        aside={<SettingsScopeBadge page="workspace" />}
        id="projects"
        page="workspace"
        title={s.projects}
      >
        {/* This computer's default folder for new chats, then the profile's terminal cwd and repo discovery. */}
        <SessionsSettings subpage="default-directory" />
        <ConfigRows api={api} keys={placedFields(api, 'workspace', 'projects')} skeleton={3} />
      </SettingsWindowSection>
      <SettingsWindowSection id="execution" page="workspace" title={s.execution}>
        <ConfigRows api={api} keys={placedFields(api, 'workspace', 'execution')} skeleton={3} />
      </SettingsWindowSection>
      <SettingsWindowSection id="checkpoints" note={s.checkpointsNote} page="workspace" title={s.checkpoints}>
        <ConfigRows api={api} keys={placedFields(api, 'workspace', 'checkpoints')} skeleton={2} />
      </SettingsWindowSection>
    </>
  )
}

/** Workspace: projects, execution, checkpoints (profile). */
export function WorkspacePage(props: ConfigPageProps) {
  return (
    <ConfigPage legacySection="workspace" {...props}>
      {api => <WorkspaceSections api={api} />}
    </ConfigPage>
  )
}
