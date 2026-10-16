import { useStore } from '@nanostores/react'
import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import { getHermesConfigDefaults, getHermesConfigRecord, saveHermesConfig } from '@/hermes'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { isMacPlatform } from '@/lib/platform'
import { confirm } from '@/store/confirm'
import { notifyError } from '@/store/notifications'
import { $profiles } from '@/store/profile'
import { requestSendDiagnostics } from '@/store/send-diagnostics'
import { $settingsRequestProfile } from '@/store/settings-scope'

import { AboutSettings } from '../../about-settings'
import { ConfigSettings } from '../../config-settings'
import { ListRow } from '../../primitives'
import type { SettingsPageProps } from '../../types'
import { SettingsWindowSection } from '../section'

/**
 * Configuration: export / import / reset (the old rail-footer icons), all on the profile
 * the Settings window edits. Import keeps the classic path — the hidden file
 * input of a ConfigSettings draft, with its toolsets-wipe confirm and autosave.
 */
function ConfigFileRows({
  onConfigSaved,
  onMainModelChanged
}: Pick<SettingsPageProps, 'onConfigSaved' | 'onMainModelChanged'>) {
  const { t } = useI18n()
  const r = t.studio.settings.rows
  const scopeProfile = useStore($settingsRequestProfile)
  const importRef = useRef<HTMLInputElement | null>(null)

  const exportConfig = async () => {
    try {
      const cfg = await getHermesConfigRecord(scopeProfile)
      const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'hermes-config.json'
      a.click()
      URL.revokeObjectURL(url)
      triggerHaptic('success')
    } catch (err) {
      notifyError(err, t.settings.exportFailed)
    }
  }

  const resetConfig = async () => {
    triggerHaptic('warning')

    const ok = await confirm({
      confirmLabel: t.settings.resetToDefaults,
      destructive: true,
      title: t.settings.resetConfirm
    })

    if (!ok) {
      return
    }

    try {
      await saveHermesConfig(await getHermesConfigDefaults(), scopeProfile)
      triggerHaptic('success')
      onConfigSaved?.()
    } catch (err) {
      notifyError(err, t.settings.resetFailed)
    }
  }

  return (
    <>
      <ListRow
        action={
          <Button onClick={() => void exportConfig()} size="sm" variant="secondary">
            {r.exportAction}
          </Button>
        }
        description={r.exportDesc}
        title={t.settings.exportConfig}
      />
      <ListRow
        action={
          <Button
            onClick={() => {
              triggerHaptic('open')
              importRef.current?.click()
            }}
            size="sm"
            variant="secondary"
          >
            {r.importAction}
          </Button>
        }
        title={t.settings.importConfig}
      />
      <ListRow
        action={
          <Button onClick={() => void resetConfig()} size="sm" variant="destructive">
            {r.resetConfigAction}
          </Button>
        }
        description={r.resetConfigDesc}
        title={t.settings.resetToDefaults}
      />
      {/* Owns the hidden <input type=file> and the import → draft → autosave path. */}
      <ConfigSettings
        activeSectionId="advanced"
        importInputRef={importRef}
        layout={() => null}
        onConfigSaved={onConfigSaved}
        onMainModelChanged={onMainModelChanged}
      />
    </>
  )
}

function DiagnosticsRows() {
  const { t } = useI18n()
  const r = t.studio.settings.rows
  const canReveal = Boolean(window.hermesDesktop?.revealLogs)

  return (
    <>
      <ListRow
        action={
          <Button
            onClick={() => {
              triggerHaptic('open')
              requestSendDiagnostics()
            }}
            size="sm"
            variant="secondary"
          >
            {r.diagnosticsAction}
          </Button>
        }
        description={r.diagnosticsDesc}
        title={r.diagnosticsTitle}
      />
      {canReveal && (
        <ListRow
          action={
            <Button
              onClick={() => void window.hermesDesktop?.revealLogs()?.catch(() => undefined)}
              size="sm"
              variant="secondary"
            >
              {isMacPlatform() ? r.logsActionMac : r.logsActionOther}
            </Button>
          }
          title={r.logsTitle}
        />
      )}
    </>
  )
}

/** About Hermes: version hero, updates, configuration, diagnostics, uninstall. */
export function AboutPage(props: Pick<SettingsPageProps, 'onConfigSaved' | 'onMainModelChanged'>) {
  const { t } = useI18n()
  const s = t.studio.settings.sections.about
  const profiles = useStore($profiles)
  const scopeProfile = useStore($settingsRequestProfile)

  return (
    <>
      <AboutSettings subpage="updates" />
      <SettingsWindowSection
        aside={
          profiles.length > 1 && scopeProfile ? t.studio.settings.window.appliesToProfile(scopeProfile) : undefined
        }
        id="config"
        page="about"
        title={s.config}
      >
        <ConfigFileRows {...props} />
      </SettingsWindowSection>
      <SettingsWindowSection id="diagnostics" page="about" title={s.diagnostics}>
        <DiagnosticsRows />
      </SettingsWindowSection>
      <SettingsWindowSection bare id="uninstall" page="about" title={s.uninstall}>
        <AboutSettings subpage="uninstall" />
      </SettingsWindowSection>
    </>
  )
}
