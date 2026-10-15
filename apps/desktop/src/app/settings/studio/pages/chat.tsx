import { useRef } from 'react'

import { useI18n } from '@/i18n'

import { AppearanceSettings } from '../../appearance-settings'
import { AttachmentSizeSetting, ConfigSettings, type ConfigSettingsLayoutApi } from '../../config-settings'
import type { SettingsPageProps } from '../../types'
import { ConfigRows, placedFields } from '../config-layout'
import { ThinkingRow, TimestampsRow } from '../rows/chat-rows'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

// Rendered by ThinkingRow / TimestampsRow, never as plain config rows.
const OWN_ROWS = ['display.show_reasoning', 'display.timestamps']

function ChatSections({ api }: { api: ConfigSettingsLayoutApi }) {
  const { t } = useI18n()
  const s = t.studio.settings.sections.chat

  return (
    <>
      <SettingsWindowSection aside={<SettingsScopeBadge page="chat" />} id="replies" page="chat" title={s.replies}>
        <ConfigRows api={api} keys={placedFields(api, 'chat', 'replies', OWN_ROWS)} />
        <ThinkingRow api={api} />
        <AppearanceSettings rows={['toolView', 'hideCodeDiffs']} />
      </SettingsWindowSection>
      <SettingsWindowSection id="messages" page="chat" title={s.messages}>
        <AppearanceSettings rows={['userBubble', 'textDirection', 'hideThreadTimeline']} />
        <TimestampsRow api={api} />
        <AppearanceSettings rows={['reactions', 'vibeHearts']} />
      </SettingsWindowSection>
      <SettingsWindowSection id="media" page="chat" title={s.media}>
        <AppearanceSettings rows={['embeds']} />
        <AttachmentSizeSetting />
        <ConfigRows api={api} keys={placedFields(api, 'chat', 'media')} skeleton={1} />
      </SettingsWindowSection>
    </>
  )
}

/** 对话 Chat: replies, messages, embeds and attachments (profile config + device rows, one draft). */
export function ChatPage({ onConfigSaved, onMainModelChanged }: Pick<SettingsPageProps, 'onConfigSaved' | 'onMainModelChanged'>) {
  const importRef = useRef<HTMLInputElement | null>(null)

  return (
    <ConfigSettings
      activeSectionId="chat"
      importInputRef={importRef}
      layout={api => <ChatSections api={api} />}
      onConfigSaved={onConfigSaved}
      onMainModelChanged={onMainModelChanged}
    />
  )
}
