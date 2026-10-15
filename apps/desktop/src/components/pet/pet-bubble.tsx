import { useStore } from '@nanostores/react'
import { useEffect, useState } from 'react'

import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { $petActivity, $petState, type PetState } from '@/store/pet'
import { $petPluginMessage, type PetMessageTone } from '@/store/pet-plugin-messages'

/**
 * Speech bubble + status glyph for the pet — the "notification" half of the
 * mascot. It externalizes what the agent is doing (Codex-style) so a glance at
 * the desktop pet replaces switching back to the window. The core status lines
 * show only in the popped-out overlay (`showStatus`); in-window the app itself
 * is the surface, so the in-window pet renders the bubble for plugin lines only.
 *
 * Plugin lines (`ctx.pet.say`, see store/pet-plugin-messages) share the bubble:
 * the newest live line shows with its plugin's name as a small label, unless
 * the agent is in an error or waiting-on-you state — those keep the bubble.
 *
 * Text is derived purely from the same `$petState` / `$petActivity` the sprite
 * already reacts to, so it never drifts from the animation. The bubble is shown
 * only when there's something worth saying (working / reviewing / a transient
 * done/error beat / waiting on the user) and is hidden at plain idle.
 */

type Tone = PetMessageTone

/** The moods that speak. `idle` only speaks when the pet is clicked (`peek`). */
type Mood = 'failed' | 'idle' | 'review' | 'run' | 'waiting'

interface Spec {
  glyph?: StudioIconName
  tone?: Tone
}

// Phrasings per mood live in i18n (t.studio.overlays.aux.pet.lines), picked at
// random (no immediate repeat) for a bit of life. Keep them short — the
// bubble is tiny and never wraps.
const SPECS: Record<Mood, Spec> = {
  run: {},
  review: {},
  failed: { glyph: 'warn', tone: 'error' },
  waiting: { glyph: 'clock', tone: 'wait' },
  idle: {}
}

const SPEAKING_STATES: ReadonlySet<PetState> = new Set(['run', 'review', 'failed', 'waiting'])

const TONE_COLOR: Record<Tone, string> = {
  error: 'var(--ui-red)',
  info: 'currentColor',
  wait: 'var(--ui-yellow)'
}

const TONE_GLYPH: Partial<Record<Tone, StudioIconName>> = { error: 'warn', wait: 'clock' }

// Core states that outrank a plugin line: the pet is flagging trouble or the
// turn is paused on the user, and a plugin must not talk over that.
const PRIORITY_TONES: ReadonlySet<Tone | undefined> = new Set(['error', 'wait'])

// Hermes Studio: the prototype's speech bubble (.pet .bubble-say) — a solid
// card surface with the float shadow, popping in with the spring.
const BUBBLE_SURFACE =
  'pointer-events-none bg-(--ui-bg-editor) text-xs font-medium text-(--ui-text-primary) shadow-(--elev-float) motion-safe:animate-[studio-pop-in_240ms_cubic-bezier(0.34,1.32,0.64,1)_both]'

// Random pick that avoids repeating the line we're already showing.
function pick(lines: string[], prev: string): string {
  if (lines.length <= 1) {
    return lines[0] ?? ''
  }

  let next = prev

  while (next === prev) {
    next = lines[Math.floor(Math.random() * lines.length)]
  }

  return next
}

export interface PetBubbleProps {
  /** Render the core status lines (working…, your turn). The overlay passes
   *  true; the in-window pet leaves them to the app and shows plugin lines only. */
  showStatus?: boolean
  /** The pet was just clicked: say the status line now — or, at idle, a
   *  greeting — even where status lines are otherwise left to the app. */
  peek?: boolean
}

function moodFor(state: PetState, awaitingInput: boolean | undefined, peek: boolean): Mood | null {
  if (SPEAKING_STATES.has(state)) {
    return state as Mood
  }

  if (state === 'idle' && awaitingInput) {
    return 'waiting'
  }

  return peek ? 'idle' : null
}

export function PetBubble({ peek = false, showStatus = true }: PetBubbleProps = {}) {
  const { t } = useI18n()
  const moodLines = t.studio.overlays.aux.pet.lines
  const state = useStore($petState)
  const activity = useStore($petActivity)
  const pluginLine = useStore($petPluginMessage)
  const [line, setLine] = useState('')

  // Finish beats are carried by the sprite/mail icon; idle only speaks up when
  // it's actually the user's turn (or the pet was clicked). Everything else
  // maps to a mood.
  const specKey = moodFor(state, activity.awaitingInput, peek)
  const lines = specKey ? moodLines[specKey] : null
  const rotating = specKey === 'run' || specKey === 'review'

  // Pick a fresh line on every mood change, then keep rotating (random, no
  // repeat) only while the agent is actively working/thinking.
  useEffect(() => {
    if (!lines) {
      setLine('')

      return
    }

    setLine(prev => pick(lines, prev))

    if (!rotating || lines.length <= 1) {
      return
    }

    const id = window.setInterval(() => setLine(prev => pick(lines, prev)), 2600)

    return () => window.clearInterval(id)
  }, [lines, rotating])

  const spec = specKey ? SPECS[specKey] : null

  if (pluginLine && !PRIORITY_TONES.has(spec?.tone)) {
    const Glyph = TONE_GLYPH[pluginLine.tone]

    return (
      <div
        className={cn(BUBBLE_SURFACE, 'inline-flex w-max max-w-[13.75rem] flex-col gap-[3px] rounded-[12px] px-2.5 py-1.5 leading-[1.3]')}
        data-pet-plugin={pluginLine.pluginId}
        data-slot="pet-plugin-bubble"
      >
        <span className="truncate text-[0.5625rem] font-semibold leading-none tracking-[0.2px] text-(--ui-text-secondary)">
          {pluginLine.pluginName}
        </span>
        <span className="inline-flex items-start gap-[5px] [overflow-wrap:anywhere]">
          {Glyph && (
            <span className="inline-flex flex-none pt-px">
              <StudioIcon name={Glyph} size={12} style={{ color: TONE_COLOR[pluginLine.tone] }} />
            </span>
          )}
          {pluginLine.text}
        </span>
      </div>
    )
  }

  if (!spec || !(showStatus || peek)) {
    return null
  }

  const Glyph = spec.glyph
  const text = line || lines?.[0] || ''
  const hasText = Boolean(text)

  return (
    <div
      className={cn(
        BUBBLE_SURFACE,
        'inline-flex items-center whitespace-nowrap leading-none',
        // Glyph-only bubbles collapse to a tight, symmetric badge.
        hasText ? 'gap-[5px] rounded-[12px] px-2.5 py-1.5' : 'rounded-full p-[5px]'
      )}
      data-slot="pet-bubble"
    >
      {Glyph && (
        <span className="inline-flex">
          <StudioIcon name={Glyph} size={13} style={{ color: spec.tone ? TONE_COLOR[spec.tone] : 'currentColor' }} />
        </span>
      )}
      {text}
    </div>
  )
}
