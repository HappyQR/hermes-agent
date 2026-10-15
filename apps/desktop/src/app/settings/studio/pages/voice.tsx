import { useStore } from '@nanostores/react'

import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { $wakeWord, toggleWakeWord } from '@/store/wake-word'

import type { ConfigSettingsLayoutApi } from '../../config-settings'
import { ListRow } from '../../primitives'
import { ConfigPage, type ConfigPageProps, ConfigRows, placedFields } from '../config-layout'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

/** The voice shortcut lives in Keyboard; say so once (the classic page repeated it on every voice subpage). */
function VoiceShortcutHintRow() {
  const { t } = useI18n()
  const c = t.settings.config

  return <ListRow description={c.voiceShortcutHintDesc} title={c.voiceShortcutHintTitle} />
}

/**
 * 唤醒词: the gateway's wake-word listener (the composer's ear toggle, same
 * store and RPC). The phrase is read-only: no config key edits it.
 */
function WakeWordRows() {
  const { t } = useI18n()
  const r = t.studio.settings.rows
  const wake = useStore($wakeWord)

  return (
    <>
      <ListRow
        action={
          <Switch
            aria-label={r.wakeTitle}
            checked={wake.listening}
            disabled={wake.pending || !wake.available}
            onCheckedChange={() => {
              triggerHaptic(wake.listening ? 'close' : 'open')
              void toggleWakeWord()
            }}
          />
        }
        description={wake.notice || r.wakeDesc}
        title={r.wakeTitle}
      />
      {wake.phrase ? (
        <ListRow action={<span className="text-(--ui-text-secondary)">{wake.phrase}</span>} title={r.wakePhrase} />
      ) : null}
    </>
  )
}

function VoiceSections({ api }: { api: ConfigSettingsLayoutApi }) {
  const { t } = useI18n()
  const s = t.studio.settings.sections.voice
  const wake = useStore($wakeWord)

  return (
    <>
      <SettingsWindowSection aside={<SettingsScopeBadge page="voice" />} id="conversation" page="voice" title={s.conversation}>
        <ConfigRows api={api} keys={placedFields(api, 'voice', 'conversation')} skeleton={3} />
        <VoiceShortcutHintRow />
      </SettingsWindowSection>
      <SettingsWindowSection id="stt" page="voice" title={s.stt}>
        <ConfigRows api={api} keys={placedFields(api, 'voice', 'stt')} skeleton={3} />
      </SettingsWindowSection>
      <SettingsWindowSection id="tts" page="voice" title={s.tts}>
        <ConfigRows api={api} keys={placedFields(api, 'voice', 'tts')} skeleton={2} />
      </SettingsWindowSection>
      {/* Hidden where the listener cannot run at all (no deps, mic or key) — like the composer's ear. */}
      {(wake.available || wake.enabled) && (
        <SettingsWindowSection id="wake" page="voice" title={s.wake}>
          <WakeWordRows />
        </SettingsWindowSection>
      )}
    </>
  )
}

/** 语音 Voice: conversation, speech to text, read aloud, wake word (profile). */
export function VoicePage(props: ConfigPageProps) {
  return (
    <ConfigPage legacySection="voice" {...props}>
      {api => <VoiceSections api={api} />}
    </ConfigPage>
  )
}
