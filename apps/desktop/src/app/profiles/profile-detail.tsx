import { useStore } from '@nanostores/react'
import { useRef } from 'react'
import { useNavigate } from 'react-router'

import { FormGroup, FormRow, FormSection } from '@/app/overlays/studio/form-group'
import { CAPABILITIES_ROUTE, navigateToWorkspacePage, SETTINGS_ROUTE } from '@/app/routes'
import { settingsPageSearch } from '@/app/settings/studio/categories'
import { CodeEditor } from '@/components/chat/code-editor'
import { PageLoader } from '@/components/page-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { displayPath } from '@/lib/display-path'
import { AlertTriangle } from '@/lib/icons'
import { formatCombo } from '@/lib/keybinds/combo'
import { $defaultProfileRoute, setDefaultProfile } from '@/store/default-profile'
import { notify, notifyError } from '@/store/notifications'
import { profileLabel } from '@/store/profile'
import { $profileRemoteOverrides } from '@/store/profile-remote-override'
import { setSettingsScope } from '@/store/settings-scope'
import type { ProfileInfo } from '@/types/hermes'

import { ProfileActionsMenu, useProfileRoute } from './profile-actions-menu'
import { ProfileAvatar } from './profile-avatar'
import type { SoulEditorState } from './use-soul-editor'

/** The selected profile in the Profiles sheet: head, model/skills/default rows and its SOUL.md. */
export function ProfileDetail({
  onDelete,
  onRename,
  profile,
  soul
}: {
  onDelete: () => void
  onRename: () => void
  profile: ProfileInfo
  soul: SoulEditorState
}) {
  const { t } = useI18n()
  const p = t.profiles
  const sp = t.studio.overlays.profiles
  const navigate = useNavigate()
  const remote = useStore($profileRemoteOverrides)[profile.name]
  const defaultRoute = useStore($defaultProfileRoute)
  const route = useProfileRoute(profile)
  const editorRef = useRef<HTMLDivElement>(null)
  const label = profileLabel(profile)
  const isLaunchDefault = defaultRoute?.connectionId === route.connectionId && defaultRoute?.profile === route.profile

  const makeDefault = async () => {
    try {
      await setDefaultProfile(route)
      notify({ kind: 'success', message: p.defaultDescription, title: p.defaultSet(label) })
    } catch (error) {
      notifyError(error, p.failedSetDefault)
    }
  }

  const focusSoul = () => {
    const editor = editorRef.current

    editor?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    editor?.querySelector<HTMLElement>('.cm-content, textarea')?.focus()
  }

  return (
    <>
      <header className="flex items-center gap-3">
        <ProfileAvatar profile={profile} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="m-0 truncate text-[1.1875rem] font-[650] tracking-tight text-(--ui-text-primary)">{label}</h3>
            {profile.is_default && <Badge variant="success">{p.defaultBadge}</Badge>}
            {profile.has_env && <Badge variant="muted">.env</Badge>}
          </div>
          <p className="m-0 mt-0.5 truncate font-mono text-[0.75rem] text-(--ui-text-tertiary)">
            {displayPath(profile.path)}
            {remote ? ` · ${p.remoteOverride.badge(remote.host)}` : ''}
          </p>
        </div>
        <ProfileActionsMenu onDelete={onDelete} onEditSoul={focusSoul} onRename={onRename} profile={profile} />
      </header>

      <FormGroup>
        <FormRow
          description={
            profile.model ? (
              <span className="font-mono">
                {profile.model}
                {profile.provider ? ` · ${profile.provider}` : ''}
              </span>
            ) : (
              p.notSet
            )
          }
          title={p.modelLabel}
        >
          <Button
            onClick={() => {
              setSettingsScope(profile.name)
              navigate(`${SETTINGS_ROUTE}${settingsPageSearch('models')}`)
            }}
            size="sm"
            variant="ghost"
          >
            {sp.changeModel}
          </Button>
        </FormRow>
        <FormRow description={sp.skillsEnabled(profile.skill_count)} title={p.skillsLabel}>
          <Button
            onClick={() => navigateToWorkspacePage(navigate, `${CAPABILITIES_ROUTE}?tab=skills`)}
            size="sm"
            variant="ghost"
          >
            {sp.manage}
          </Button>
        </FormRow>
        <FormRow description={p.defaultDescription} title={p.setAsDefault}>
          {isLaunchDefault ? (
            <Badge variant="success">{p.defaultProfile}</Badge>
          ) : (
            <Button
              disabled={!window.hermesDesktop?.profile?.setDefault}
              onClick={() => void makeDefault()}
              size="sm"
              variant="secondary"
            >
              {p.setAsDefault}
            </Button>
          )}
        </FormRow>
      </FormGroup>

      <FormSection
        aside={soul.dirty ? sp.soulUnsaved(formatCombo('mod+s')) : sp.soulHint}
        className="min-h-[13rem] flex-1"
        note={soul.missing ? p.soulMissing : undefined}
        title="SOUL.md"
      >
        <div className="flex min-h-[9.5rem] flex-1 flex-col" ref={editorRef}>
          {soul.loading ? (
            <PageLoader className="min-h-36" label={p.loadingSoul} />
          ) : (
            <CodeEditor
              filePath="SOUL.md"
              framed
              initialValue={soul.content}
              key={profile.name}
              onChange={soul.setContent}
              onSave={() => void soul.save()}
            />
          )}
        </div>
        {soul.error && (
          <div className="flex items-start gap-2 rounded-[0.625rem] bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>{soul.error}</span>
          </div>
        )}
      </FormSection>
    </>
  )
}
