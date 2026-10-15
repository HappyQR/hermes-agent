import { useEffect, useReducer, useRef, useState } from 'react'

import { BrandMark } from '@/components/brand-mark'
import { translateNow, useI18n } from '@/i18n'
import { UpDownChevrons } from '@/lib/icons-studio-overlays'
import { isSubmitEnter } from '@/lib/ime'
import { formatCombo } from '@/lib/keybinds/combo'
import {
  initialQuickComposerState,
  QUICK_TARGET_CURRENT,
  QUICK_TARGET_NEW,
  type QuickComposerEvent,
  quickComposerReducer,
  type QuickComposerState,
  quickEntryResultEvent
} from '@/store/quick-entry'

import { formatAccelerator } from './accelerator'

// Native select popups do not reliably inherit the closed control's colors.
// Paint both sides of the contrast pair on every option so Chromium cannot
// combine a dark-theme foreground with an OS-provided light popup surface.
const QUICK_TARGET_OPTION_STYLE = {
  backgroundColor: 'var(--ui-bg-elevated, var(--background))',
  color: 'var(--ui-text-primary, var(--foreground))'
}

/** The live global chord (main owns it), re-read every time the window is summoned. */
function useSummonShortcut(): null | string {
  const [shortcut, setShortcut] = useState<null | string>(null)

  useEffect(() => {
    const api = window.hermesDesktop?.quickEntry
    let alive = true

    const read = () => {
      void api
        ?.getSettings?.()
        .then(status => {
          if (alive) {
            setShortcut(status?.enabled && status.registered ? formatAccelerator(status.shortcut) : null)
          }
        })
        .catch(() => undefined)
    }

    read()
    const offShown = api?.onShown?.(read)

    return () => {
      alive = false
      offShown?.()
    }
  }, [])

  return shortcut
}

/**
 * The Quick Entry composer — the whole renderer surface of the global-hotkey
 * mini window. Deliberately one input plus a session-target picker and nothing
 * else: this is a capture surface, not a second chat.
 *
 * All behavior rides `quickComposerReducer` (pure, unit-tested): submit sends
 * the trimmed text + target through the shell and asks to hide; an empty submit
 * does neither so a stray Enter can't make the window vanish; Escape and losing
 * focus dismiss without sending; a dead gateway disables the input entirely
 * (the reducer refuses the send AND the input paints the reconnect hint).
 *
 * The window itself has no gateway connection. Its view of backend truth — is
 * the gateway up, which recent sessions exist — is pushed in by the primary
 * renderer through main (`onState`), and its text goes back the same road to
 * the primary renderer's normal prompt-submit path.
 */
export function QuickEntryApp() {
  const { t } = useI18n()
  const copy = t.studio.overlays.aux.quickEntry
  const summon = useSummonShortcut()
  const inputRef = useRef<HTMLInputElement>(null)
  const submitIdRef = useRef(0)

  // The reducer returns { send, state }; this wrapper performs the side effect
  // (hand the payload to the shell, ask to hide) and stores the next state, so
  // the decision stays pure and testable while the effects stay in one place.
  const [state, dispatch] = useReducer((current: QuickComposerState, event: QuickComposerEvent) => {
    const { send, state: next } = quickComposerReducer(current, event)
    const api = window.hermesDesktop?.quickEntry

    if (send) {
      const submitId = submitIdRef.current
      void api?.submit(send).then(result => {
        dispatch(quickEntryResultEvent(result, submitId))

        if (!result.ok) {
          requestAnimationFrame(() => inputRef.current?.focus())
        }
      })
    } else if (!next.visible && current.visible) {
      api?.dismiss()
    }

    return next
  }, initialQuickComposerState)

  // Re-summoned by the chord: the shell reuses the window, so reset the draft
  // and take the keyboard back for a fresh capture. Also adopt gateway-state
  // pushes (connection + recent sessions) relayed from the primary renderer.
  useEffect(() => {
    const api = window.hermesDesktop?.quickEntry

    const offShown = api?.onShown(() => {
      dispatch({ type: 'shown' })
      requestAnimationFrame(() => inputRef.current?.focus())
    })

    const offState = api?.onState(payload => {
      dispatch({
        connected: payload?.connected === true,
        sessions: Array.isArray(payload?.sessions) ? payload.sessions : [],
        type: 'state'
      })
    })

    const offLateResult = api?.onLateResult(payload => {
      dispatch({
        message: payload?.result?.message ?? translateNow('studio.overlays.aux.quickEntry.deliveryFailed'),
        ok: payload?.result?.ok === true,
        type: 'late-result'
      })
    })

    inputRef.current?.focus()

    return () => {
      offShown?.()
      offState?.()
      offLateResult?.()
    }
  }, [])

  const hint = [`${formatCombo('enter')} ${copy.send}`, `${formatCombo('escape')} ${copy.dismiss}`]

  if (summon) {
    hint.push(copy.summon(summon))
  }

  return (
    // The 12px transparent margin is the shadow's whole budget: anything that
    // reaches past it is clipped by the fixed 640×168 window into a hard edge.
    <div className="flex h-screen w-screen items-center justify-center bg-transparent p-3">
      <div
        className="flex w-full flex-col gap-2.5 rounded-[18px] bg-(--ui-bg-elevated) p-3.5 text-(--ui-text-primary) shadow-[0_0_0_0.5px_var(--ui-line-2),0_4px_10px_-2px_rgb(0_0_0/0.24)]"
        data-slot="quick-entry"
      >
        <div className="flex items-center gap-3">
          <BrandMark className="size-7" />
          <input
            aria-label={t.settings.quickEntry.enabledTitle}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="h-8 min-w-0 flex-1 border-0 bg-transparent text-xl text-(--ui-text-primary) outline-none placeholder:text-(--ui-text-quaternary) disabled:opacity-55"
            disabled={!state.connected}
            onBlur={event => {
              // Moving focus to the target picker is not leaving the window.
              if (!event.relatedTarget) {
                dispatch({ type: 'blur' })
              }
            }}
            onChange={event => dispatch({ draft: event.target.value, type: 'edit' })}
            onKeyDown={event => {
              if (isSubmitEnter(event) && !event.shiftKey) {
                event.preventDefault()
                dispatch({ submitId: ++submitIdRef.current, type: 'submit' })
              } else if (event.key === 'Escape') {
                event.preventDefault()
                dispatch({ type: 'dismiss' })
              }
            }}
            placeholder={state.connected ? copy.placeholder : copy.disconnected}
            ref={inputRef}
            spellCheck={false}
            value={state.draft}
          />
        </div>
        <div className="flex min-w-0 items-center gap-2 text-xs text-(--ui-text-tertiary)">
          <label className="shrink-0 select-none" htmlFor="quick-entry-target">
            {copy.sendTo}
          </label>
          {/* A native <select>: a Radix popup would be clipped by the 168px
              window, while the OS list can spill past it. Styled as the macOS
              pop-up button; the options keep explicit colours (#77429). */}
          <span className="relative inline-flex min-w-0 max-w-[16rem] items-center">
            <select
              aria-label={copy.targetLabel}
              className="h-[1.625rem] min-w-0 max-w-full cursor-default appearance-none truncate rounded-[7px] border-0 bg-(--ui-bg-editor) pl-2.5 pr-6 text-xs text-(--ui-text-primary) shadow-[0_0_0_0.5px_var(--ui-line-2),0_1px_1.5px_rgb(0_0_0/0.06)] outline-none focus-visible:shadow-[0_0_0_0.5px_color-mix(in_srgb,var(--dt-primary)_60%,transparent),0_0_0_3px_color-mix(in_srgb,var(--dt-primary)_25%,transparent)] disabled:opacity-55"
              disabled={!state.connected}
              id="quick-entry-target"
              onChange={event => dispatch({ target: event.target.value, type: 'target' })}
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  dispatch({ type: 'dismiss' })
                }
              }}
              value={state.target}
            >
              <option style={QUICK_TARGET_OPTION_STYLE} value={QUICK_TARGET_CURRENT}>
                {copy.targetCurrent}
              </option>
              <option style={QUICK_TARGET_OPTION_STYLE} value={QUICK_TARGET_NEW}>
                {copy.targetNew}
              </option>
              {state.sessions.map(session => (
                <option key={session.id} style={QUICK_TARGET_OPTION_STYLE} value={session.id}>
                  {session.title}
                </option>
              ))}
            </select>
            <UpDownChevrons
              aria-hidden
              className="pointer-events-none absolute right-1.5 size-3 text-(--ui-text-tertiary)"
            />
          </span>
          <span className="min-w-0 flex-1 truncate text-right">{hint.join(' · ')}</span>
        </div>
        {state.error ? (
          <div className="text-xs text-(--ui-red)" role="alert">
            {state.error}
          </div>
        ) : null}
      </div>
    </div>
  )
}
