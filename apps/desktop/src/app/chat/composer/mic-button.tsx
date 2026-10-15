import { useStore } from '@nanostores/react'

import { Button } from '@/components/ui/button'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip, TipKeybindLabel } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { iconSize, Loader2 } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { recordAction } from '@/store/desktop-metrics'
import { $wakeWord } from '@/store/wake-word'

import { ContextDropdown } from './context-dropdown'
import { ACTIVE_ICON_BTN, GHOST_ICON_BTN, PRIMARY_ICON_BTN } from './control-classes'
import { useVoiceEngineName, VoiceEngineRows } from './voice-engine-rows'
import { VoiceMenuItems, type VoiceMenuProps } from './voice-menu'

/**
 * The composer's one voice button: a click dictates (recording → stop,
 * transcribing → spinner); a right-click (or ↓) opens every voice control —
 * start a conversation, the engine, read replies aloud, the wake word. A dot
 * stays on the mic while replies are read aloud or the wake word listens, so
 * folding those toggles away never hides that something is listening.
 */
export function MicButton(props: VoiceMenuProps) {
  const { autoSpeak, disabled, onDictate, state, voiceStatus } = props
  const { t } = useI18n()
  const c = t.composer
  const wake = useStore($wakeWord)
  const dictating = state.voice.active || voiceStatus !== 'idle'

  const label =
    voiceStatus === 'recording'
      ? c.stopDictation
      : voiceStatus === 'transcribing'
        ? c.transcribingDictation
        : c.voiceDictation

  return (
    <ContextDropdown
      content={<VoiceMenuItems {...props} />}
      contentClassName="min-w-56"
      disabled={disabled}
      label={c.voiceControls}
    >
      <Tip label={dictating ? label : `${label} · ${t.studio.chat.composer.voiceOptionsHint}`} placement="control">
        <Button
          aria-label={label}
          aria-pressed={dictating}
          className={cn(GHOST_ICON_BTN, 'relative p-0', dictating && ACTIVE_ICON_BTN)}
          data-slot="composer-mic"
          disabled={disabled || !state.voice.enabled || voiceStatus === 'transcribing'}
          onClick={() => {
            triggerHaptic(dictating ? 'close' : 'open')
            onDictate()
          }}
          size="icon"
          type="button"
          variant="ghost"
        >
          {voiceStatus === 'recording' ? (
            <StudioIcon name="stop" size={14} />
          ) : voiceStatus === 'transcribing' ? (
            <Loader2 className={cn('animate-spin', iconSize.sm)} />
          ) : (
            <StudioIcon name="mic" size={17} />
          )}
          {(autoSpeak || wake.listening) && !dictating && (
            <span aria-hidden className="composer-mic-dot" data-slot="composer-mic-dot" />
          )}
        </Button>
      </Tip>
    </ContextDropdown>
  )
}

/** The primary button while the composer is empty and idle: start a voice
 *  conversation. Right-click (or ↓) picks the engine; there is no chevron. */
export function TalkButton({ disabled, onStart }: { disabled: boolean; onStart: () => void }) {
  const { t } = useI18n()
  const c = t.composer
  const engine = useVoiceEngineName()

  const button = (
    <Tip
      label={
        <TipKeybindLabel
          actionId="composer.voice"
          text={engine ? `${c.startVoice} — ${engine} · ${t.studio.chat.composer.voiceEngineHint}` : c.startVoice}
        />
      }
      placement="control"
    >
      <Button
        aria-label={c.startVoice}
        className={PRIMARY_ICON_BTN}
        data-slot="composer-talk"
        disabled={disabled}
        onClick={() => {
          triggerHaptic('open')
          recordAction('composer.voice', 'click')
          onStart()
        }}
        size="icon"
        type="button"
      >
        <StudioIcon name="wave" size={16} stroke={2} />
      </Button>
    </Tip>
  )

  // Until the backend has answered there is no engine to choose.
  return engine ? (
    <ContextDropdown
      content={<VoiceEngineRows disabled={disabled} />}
      contentClassName="min-w-56"
      disabled={disabled}
      label={c.voiceEngine}
    >
      {button}
    </ContextDropdown>
  ) : (
    button
  )
}
