import { useEffect, useRef, useState } from 'react'

import { useI18n } from '@/i18n'
import { useKeybindHint } from '@/lib/keybinds/use-keybind-hint'
import { resetBrowseState } from '@/store/composer-input-history'

interface UseComposerPlaceholderOptions {
  /** A turn is running: the placeholder says how to queue for the next one. */
  busy?: boolean
  disabled: boolean
  reconnecting: boolean
  sessionId: null | string | undefined
}

/** Which pool the resting line comes from, and where in it (0–1). */
interface RestingPick {
  pool: 'followUp' | 'newSession'
  slot: number
}

const rollPick = (sessionId: null | string | undefined): RestingPick => ({
  pool: sessionId ? 'followUp' : 'newSession',
  slot: Math.random()
})

/**
 * The composer's placeholder text. A resting starter (new session) / continuation
 * (existing session) is picked once and only re-rolled when we genuinely move to
 * a *different* conversation — the null→id persist of a freshly-started session
 * keeps its starter so the text doesn't flip mid-stream. While the transport is
 * down, it swaps to a reconnecting / starting message instead.
 *
 * The pick is a pool and a slot, not a string: the language can change under a
 * mounted composer (the boot locale settles, Settings switches it), and the
 * line follows it instead of staying in the language it was picked in.
 */
export function useComposerPlaceholder({
  busy = false,
  disabled,
  reconnecting,
  sessionId
}: UseComposerPlaceholderOptions): string {
  const { t } = useI18n()
  const queueCombo = useKeybindHint('composer.queue')
  const newSessionPlaceholders = t.composer.newSessionPlaceholders
  const followUpPlaceholders = t.composer.followUpPlaceholders

  const [restingPick, setRestingPick] = useState(() => rollPick(sessionId))

  const prevSessionIdRef = useRef(sessionId)

  // eslint-disable-next-line no-restricted-syntax -- legitimate non-atom ref write (see eslint rule comment)
  useEffect(() => {
    const prev = prevSessionIdRef.current
    prevSessionIdRef.current = sessionId

    if (prev === sessionId) {
      return
    }

    // null → id: the new session we're already in just got persisted. Keep the
    // starter we showed instead of swapping to a follow-up under the user.
    if (prev == null && sessionId) {
      return
    }

    resetBrowseState(prev)
    setRestingPick(rollPick(sessionId))
  }, [sessionId])

  const restingPool = restingPick.pool === 'followUp' ? followUpPlaceholders : newSessionPlaceholders
  const restingPlaceholder = restingPool[Math.floor(restingPick.slot * restingPool.length)] ?? restingPool[0] ?? ''

  // When the transport is disabled it's because the gateway isn't open.
  // Distinguish a cold start ("Starting Hermes...") from a dropped connection
  // we're trying to restore. During reconnect, keep the textbox editable so a
  // flaky network doesn't block drafting; only submit/backend actions stay
  // disabled until the gateway is open again.
  if (disabled) {
    return reconnecting ? t.composer.placeholderReconnecting : t.composer.placeholderStarting
  }

  return busy && queueCombo ? t.studio.chat.composer.placeholderBusy(queueCombo) : restingPlaceholder
}
