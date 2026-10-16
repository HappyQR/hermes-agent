import { useEffect, useMemo, useState } from 'react'

import { Callout } from '@/components/studio/pages/surfaces'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StudioIcon } from '@/components/ui/studio-icon'
import {
  applyTelegramOnboarding,
  cancelTelegramOnboarding,
  getTelegramOnboardingStatus,
  type MessagingPlatformInfo,
  startTelegramOnboarding,
  type TelegramOnboardingApplyResponse,
  type TelegramOnboardingStartResponse
} from '@/hermes'
import { useI18n } from '@/i18n'

import { TelegramQrSheet } from './studio/telegram-qr-sheet'

const TELEGRAM_USER_ID_RE = /^\d{3,20}$/

type Phase = 'applying' | 'idle' | 'ready' | 'starting' | 'waiting'

/** A 410 from the status endpoint means the pairing is gone for good (expired/claimed). */
export function isTerminalTelegramOnboardingError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)

  return /\b410\b/.test(message) && /\b(expired|claimed|gone)\b/i.test(message)
}

export function formatExpiry(expiresAt: string, now = Date.now()): null | string {
  const ms = Date.parse(expiresAt) - now

  if (!Number.isFinite(ms) || ms <= 0) {
    return null
  }

  const seconds = Math.ceil(ms / 1000)

  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
}

async function renderQr(payload: string): Promise<string> {
  // Lazy: the QR encoder is only needed while a pairing is on screen.
  const QRCode = await import('qrcode')

  return QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 1, width: 224 })
}

export interface TelegramQrSetupProps {
  /** Called after the backend wrote the token + allowlist; receives the restart outcome. */
  onApplied: (result: TelegramOnboardingApplyResponse) => void
  platform: MessagingPlatformInfo
  /** Request-shaped profile scope (undefined → active profile). */
  scopeProfile: string | undefined
}

/**
 * Telegram "Quick setup": the Nous pairing service mints a bot on the user's
 * behalf; we show its QR/deep link, poll until Telegram confirms, let the user
 * review the allowlist, and apply. Mirrors the dashboard's Channels flow so
 * the Desktop no longer sends users to @BotFather by hand.
 */
export function TelegramQrSetup({ onApplied, platform, scopeProfile }: TelegramQrSetupProps) {
  const { t } = useI18n()
  const q = t.messaging.telegramQr
  const [setup, setSetup] = useState<null | TelegramOnboardingStartResponse>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [botUsername, setBotUsername] = useState<null | string>(null)
  // The bot a successful apply just saved; outlives reset() so the card still says which bot is connected.
  const [connectedBot, setConnectedBot] = useState<null | string>(null)
  const [allowedIds, setAllowedIds] = useState<string[]>([])
  const [detectedOwnerId, setDetectedOwnerId] = useState<null | string>(null)
  const [newAllowedId, setNewAllowedId] = useState('')
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)

  const reset = () => {
    setSetup(null)
    setQrDataUrl('')
    setPhase('idle')
    setBotUsername(null)
    setAllowedIds([])
    setDetectedOwnerId(null)
    setNewAllowedId('')
    setError('')
  }

  // Poll the pairing until Telegram confirms. A transient fetch error keeps
  // polling with a visible hint; a terminal 410 (or local expiry) resets.
  useEffect(() => {
    if (!setup || phase !== 'waiting') {
      return
    }

    let cancelled = false
    let timer: null | number = null

    const poll = async () => {
      try {
        const status = await getTelegramOnboardingStatus(setup.pairing_id, scopeProfile)

        if (cancelled) {
          return
        }

        if (status.status === 'ready') {
          setPhase('ready')
          setBotUsername(status.bot_username ?? null)
          setError('')

          if (status.owner_user_id && TELEGRAM_USER_ID_RE.test(status.owner_user_id)) {
            setDetectedOwnerId(status.owner_user_id)
            setAllowedIds([status.owner_user_id])
          }

          return
        }

        setError('')
        timer = window.setTimeout(() => void poll(), 2000)
      } catch (pollError) {
        if (cancelled) {
          return
        }

        const expiresAt = Date.parse(setup.expires_at)
        const expired = Number.isFinite(expiresAt) && Date.now() >= expiresAt

        if (isTerminalTelegramOnboardingError(pollError) || expired) {
          setSetup(null)
          setQrDataUrl('')
          setPhase('idle')
          setError(q.pairingExpired)

          return
        }

        setError(q.stillWaiting(String(pollError)))
        timer = window.setTimeout(() => void poll(), 2000)
      }
    }

    timer = window.setTimeout(() => void poll(), 1200)

    return () => {
      cancelled = true

      if (timer !== null) {
        window.clearTimeout(timer)
      }
    }
  }, [phase, q, scopeProfile, setup])

  // One-second tick keeps the expiry countdown honest while a pairing is shown.
  useEffect(() => {
    if (!setup) {
      return
    }

    const timer = window.setInterval(() => setTick(value => value + 1), 1000)

    return () => window.clearInterval(timer)
  }, [setup])

  const expiresIn = useMemo(
    () => (setup ? formatExpiry(setup.expires_at) : null),
    // tick refreshes the memo each second without recomputing on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setup, tick]
  )

  const start = async () => {
    setPhase('starting')
    setError('')
    setBotUsername(null)
    setConnectedBot(null)
    setAllowedIds([])
    setDetectedOwnerId(null)
    setNewAllowedId('')

    try {
      const result = await startTelegramOnboarding(undefined, scopeProfile)
      const dataUrl = await renderQr(result.qr_payload)
      setSetup(result)
      setQrDataUrl(dataUrl)
      setPhase('waiting')
    } catch (startError) {
      setPhase('idle')
      setError(String(startError))
    }
  }

  const cancel = async () => {
    if (setup) {
      try {
        await cancelTelegramOnboarding(setup.pairing_id, scopeProfile)
      } catch {
        // Local cleanup still wins; the backend prunes expired pairings itself.
      }
    }

    reset()
  }

  const addAllowedId = () => {
    const trimmed = newAllowedId.trim()

    if (!TELEGRAM_USER_ID_RE.test(trimmed)) {
      setError(q.numericOnly)

      return
    }

    setError('')
    setAllowedIds(ids => (ids.includes(trimmed) ? ids : [...ids, trimmed]))
    setNewAllowedId('')
  }

  const apply = async () => {
    if (!setup) {
      return
    }

    if (allowedIds.length === 0) {
      setError(q.addAtLeastOne)

      return
    }

    setPhase('applying')
    setError('')

    try {
      const result = await applyTelegramOnboarding(setup.pairing_id, allowedIds, scopeProfile)
      reset()
      setConnectedBot(result.bot_username || botUsername)
      onApplied(result)
    } catch (applyError) {
      setPhase('ready')
      setError(String(applyError))
    }
  }

  const s = t.studio.pages.messaging

  // 扫码快速设置 (prototype pages.js:150-154): one card on the page; the code
  // itself and the allowlist review live in the QR sheet.
  return (
    <>
      <div
        className="flex items-center gap-3 rounded-[11px] bg-(--pg-card) px-3.5 py-3 shadow-(--pg-card-ring)"
        data-slot="telegram-quick-setup"
      >
        <StudioIcon className="shrink-0 text-primary" name="viewfinder" size={22} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <b className="text-[0.8125rem] font-semibold text-(--ui-text-primary)">{s.quickSetupTitle}</b>
          <span className="text-xs leading-normal text-(--ui-text-tertiary)">
            {platform.configured && !connectedBot ? s.quickSetupBody : q.quickHelp}
          </span>
          {phase === 'idle' && connectedBot && (
            <span className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="success">{t.messaging.states.connected}</Badge>
              <span className="font-mono text-xs text-(--ui-text-tertiary)">@{connectedBot}</span>
            </span>
          )}
        </div>
        <Button disabled={phase === 'starting'} onClick={() => void start()} variant="outline">
          {phase === 'starting' ? q.starting : s.showQr}
        </Button>
      </div>

      {error && !setup && <Callout tone="warn">{error}</Callout>}

      <TelegramQrSheet
        allowedIds={allowedIds}
        botUsername={botUsername}
        deepLink={setup?.deep_link ?? ''}
        detectedOwnerId={detectedOwnerId}
        error={setup ? error : ''}
        expiresIn={expiresIn}
        newAllowedId={newAllowedId}
        onAddAllowedId={addAllowedId}
        onApply={() => void apply()}
        onCancel={() => void cancel()}
        onNewAllowedIdChange={setNewAllowedId}
        onRemoveAllowedId={id => setAllowedIds(ids => ids.filter(existing => existing !== id))}
        open={Boolean(setup && qrDataUrl)}
        phase={phase}
        qrDataUrl={qrDataUrl}
      />
    </>
  )
}
