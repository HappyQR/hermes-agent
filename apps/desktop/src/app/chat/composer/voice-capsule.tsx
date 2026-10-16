import { useStore } from '@nanostores/react'

import { summarizeToolRun, type ToolCallLike } from '@/components/assistant-ui/tool/run-summary'
import { Button } from '@/components/ui/button'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { type ChatMessage, chatMessageText } from '@/lib/chat-messages'
import { triggerHaptic } from '@/lib/haptics'
import { useStoreSelector } from '@/lib/use-session-slice'
import { $voicePlayback } from '@/store/voice-playback'
import { $voiceStopPhrase } from '@/store/voice-prefs'

import { WakeWordButton } from './controls'
import type { ConversationStatus } from './hooks/use-voice-conversation'
import { useComposerScope } from './scope'

// Waveform weights, centre-heavy like a voice.
const BAR_WEIGHTS = [0.45, 0.7, 0.9, 1, 0.9, 0.7, 0.45]

interface VoiceCapsuleProps {
  disabled: boolean
  level: number
  muted: boolean
  onEnd: () => void
  onStopTurn: () => void
  onToggleMute: () => void
  status: ConversationStatus
}

/** The tool Hermes is running right now, if any (the live voice engine's own
 *  progress source, read the same way). */
function runningTool(messages: readonly ChatMessage[]): ToolCallLike | null {
  const last = messages.findLast(message => message.role === 'assistant' && !message.hidden)
  const running = last?.parts.findLast(part => part.type === 'tool-call' && part.result === undefined)

  return running?.type === 'tool-call' ? running : null
}

/**
 * The line under the status — only what the conversation really knows: the
 * stop phrase while listening, the tool running while Hermes thinks, the start
 * of the reply being spoken. There is no live transcript to show (speech is
 * transcribed after each take), so nothing is invented in its place.
 */
function useVoiceDetail(status: ConversationStatus, muted: boolean): string {
  const { t } = useI18n()
  const { $messages } = useComposerScope()
  const playback = useStore($voicePlayback)
  const stopPhrase = useStore($voiceStopPhrase)
  const spokenId = status === 'speaking' && playback.source === 'voice-conversation' ? playback.messageId : null

  const spoken = useStoreSelector($messages, messages => {
    const message = spokenId ? messages.find(item => item.id === spokenId) : undefined

    return message ? chatMessageText(message).trim().split('\n')[0] : ''
  })

  // The run line for that one call ("Running npm test"), in the provider's words.
  const tool = useStoreSelector($messages, messages => {
    const running = status === 'thinking' ? runningTool(messages) : null

    return running ? summarizeToolRun([running], true, t.studio.chat.toolRun) : ''
  })

  if (muted) {
    return ''
  }

  const detail: Partial<Record<ConversationStatus, string>> = {
    listening: stopPhrase ? t.notifications.voice.sayStopToEnd(stopPhrase) : '',
    speaking: spoken,
    thinking: tool
  }

  return detail[status] ?? ''
}

function VoiceBars({ level, listening }: { level: number; listening: boolean }) {
  const normalized = Math.max(0, Math.min(level, 1))

  // Listening follows the microphone level; speaking has no meter to follow,
  // so the bars keep a steady motion instead.
  return (
    <span aria-hidden className="studio-voice-bars" data-mode={listening ? 'level' : 'speaking'}>
      {BAR_WEIGHTS.map((weight, index) => (
        <i
          key={index}
          style={listening ? { height: `${Math.round(30 + Math.min(70, normalized * weight * 100))}%` } : undefined}
        />
      ))}
    </span>
  )
}

/**
 * Hermes Studio's live voice conversation (prototype `.voice`): while one runs,
 * the composer becomes a capsule — an orb, the status with what it knows under
 * it, a waveform, the mic toggle, "Done speaking" and end. Every control is the
 * conversation's own (mute, stop the take and send, end); the wake ear stays,
 * paused, as before. The editor folds away under the capsule until it is
 * focused or holds text, so typing mid-conversation still works.
 */
export function VoiceCapsule({ disabled, level, muted, onEnd, onStopTurn, onToggleMute, status }: VoiceCapsuleProps) {
  const { t } = useI18n()
  const c = t.composer
  const listening = status === 'listening' && !muted
  const detail = useVoiceDetail(status, muted)

  // The same ladder as the classic pill: a working state names itself, else
  // the mic does (muted or listening).
  const working: Partial<Record<ConversationStatus, string>> = {
    speaking: c.speaking,
    thinking: c.thinking,
    transcribing: c.transcribing
  }

  const label = working[status] ?? (muted ? c.muted : c.listening)

  return (
    <div
      aria-label={t.studio.chat.voice.label}
      className="studio-voice"
      data-muted={muted ? '' : undefined}
      data-slot="studio-voice-capsule"
      data-status={status}
      role="group"
    >
      <span aria-hidden className="studio-voice-orb" />
      <span className="studio-voice-text">
        {/* The status is the live region: each change is announced. */}
        <b role="status">{label}</b>
        {detail && <span>{detail}</span>}
      </span>
      {(listening || status === 'speaking') && <VoiceBars level={level} listening={listening} />}
      <WakeWordButton disabled={disabled} pausedForVoice />
      <Tip label={muted ? c.unmuteMic : c.muteMic} placement="control">
        <Button
          aria-label={muted ? c.unmuteMic : c.muteMic}
          aria-pressed={muted}
          data-on={muted ? '' : undefined}
          disabled={disabled}
          onClick={() => {
            triggerHaptic('selection')
            onToggleMute()
          }}
          size="icon-toolbar"
          type="button"
          variant="ghost"
        >
          <StudioIcon name={muted ? 'mic-off' : 'mic'} size={18} />
        </Button>
      </Tip>
      {listening && (
        <Button
          aria-label={c.stopListening}
          className="rounded-full"
          disabled={disabled}
          onClick={() => {
            triggerHaptic('submit')
            onStopTurn()
          }}
          size="sm"
          type="button"
          variant="secondary"
        >
          {t.studio.chat.voice.doneSpeaking}
        </Button>
      )}
      <Tip label={c.endConversation} placement="control">
        <Button
          aria-label={c.endConversation}
          data-slot="studio-voice-end"
          disabled={disabled}
          onClick={() => {
            triggerHaptic('close')
            onEnd()
          }}
          size="icon-toolbar"
          type="button"
          variant="ghost"
        >
          <StudioIcon name="x" size={16} />
        </Button>
      </Tip>
    </div>
  )
}
