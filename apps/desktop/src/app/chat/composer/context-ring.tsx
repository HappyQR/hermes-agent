import { useStore } from '@nanostores/react'
import { type ReactNode, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { useSessionView } from '@/app/chat/session-view'
import { COMMAND_CENTER_ROUTE } from '@/app/routes'
import { ContextUsagePanel } from '@/app/shell/context-usage-panel'
import { useContextBreakdown } from '@/app/shell/hooks/use-context-breakdown'
import { usePaneVisible } from '@/components/pane-shell/pane-visibility'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { cacheHitLabel, LiveDuration } from '@/lib/statusbar'
import { useStoreSelector } from '@/lib/use-session-slice'
import { $currentUsage } from '@/store/session'
import { $sessionStates } from '@/store/session-states'
import type { ContextBreakdown, UsageStats } from '@/types/hermes'

const EMPTY_USAGE: UsageStats = { calls: 0, input: 0, output: 0, total: 0 }

type Requester = <T = unknown>(method: string, params?: Record<string, unknown>) => Promise<T>

/**
 * The gauge's figure: the breakdown wins whenever there is one — it is the
 * MEASURED occupancy once the backend has it and is keyed to the session it
 * describes — and the streamed usage carries the gauge mid-turn (the breakdown
 * is a pre-turn snapshot). Same rule as the statusbar meter.
 */
export function mergeGaugeUsage(usage: UsageStats, breakdown: ContextBreakdown | null): UsageStats {
  return breakdown
    ? {
        ...usage,
        context_estimated: breakdown.context_estimated,
        context_max: breakdown.context_max,
        context_percent: breakdown.context_percent,
        context_source: breakdown.context_source,
        context_used: breakdown.context_used
      }
    : usage
}

/** Pie-style gauge (prototype ContextRing): a thin ring plus a filled sector,
 *  deliberately static so it never reads as the running spinner. */
export function ContextRing({ percent }: { percent: number }) {
  const r = 5
  const angle = Math.min(0.999, Math.max(0, percent / 100)) * 2 * Math.PI
  const x = (9 + r * Math.sin(angle)).toFixed(2)
  const y = (9 - r * Math.cos(angle)).toFixed(2)

  return (
    <svg aria-hidden className="composer-context-ring" viewBox="0 0 18 18">
      <circle cx="9" cy="9" fill="none" r="7.5" stroke="currentColor" strokeOpacity="0.38" strokeWidth="1.3" />
      {percent > 0 && (
        <path
          d={`M9 9 L9 ${9 - r} A${r} ${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${x} ${y} Z`}
          data-high={percent > 80 ? '' : undefined}
        />
      )}
    </svg>
  )
}

/** This surface's own usage: the primary reads the draft/primary mirror, a
 *  tile its own session slice — never the statusbar's focused-session globals. */
function useSurfaceUsage(runtimeId: null | string): UsageStats {
  const view = useSessionView()
  const primaryUsage = useStore($currentUsage)
  const tileUsage = useStoreSelector($sessionStates, states => (runtimeId ? (states[runtimeId]?.usage ?? null) : null))

  return view.kind === 'primary' ? primaryUsage : (tileUsage ?? EMPTY_USAGE)
}

function Stat({ label, children }: { children: ReactNode; label: string }) {
  return (
    <div className="composer-context-stat">
      <span>{label}</span>
      <b className="tabular-nums">{children || '—'}</b>
    </div>
  )
}

interface ContextRingPillProps {
  /** Below the compact width the pill keeps only the ring. */
  compact?: boolean
  /** Runs `/compress` through the composer's own submit path. */
  onCompress?: () => void
  requestGateway: Requester
}

/**
 * The composer's context gauge ("12%" beside the model pill): opens the
 * statusbar's context panel plus the turn stats (cache hit, throughput, turn
 * time, session cost), with Compress and Usage details. Fetches the breakdown
 * only while its pane is visible, so N tiles don't each poll.
 */
export function ContextRingPill({ compact = false, onCompress, requestGateway }: ContextRingPillProps) {
  const { locale, t } = useI18n()
  const copy = t.studio.chat.composer
  const navigate = useNavigate()
  const view = useSessionView()
  const runtimeId = useStore(view.$runtimeId)
  const busy = useStore(view.$busy)
  const turnStartedAt = useStore(view.$turnStartedAt)
  const paneVisible = usePaneVisible()
  const usage = useSurfaceUsage(runtimeId)
  const [open, setOpen] = useState(false)

  const { breakdown, loading } = useContextBreakdown({ busy, enabled: paneVisible, requestGateway, sessionId: runtimeId })
  const gauge = useMemo(() => mergeGaugeUsage(usage, breakdown), [breakdown, usage])

  if (!runtimeId || !gauge.context_max) {
    return null
  }

  const percent = Math.max(0, Math.min(100, Math.round(gauge.context_percent ?? 0)))
  const cacheHit = cacheHitLabel(usage)
  const tps = usage.avg_tps && Number.isFinite(usage.avg_tps) ? Math.round(usage.avg_tps) : 0

  const cost =
    typeof usage.cost_usd === 'number'
      ? new Intl.NumberFormat(locale, { currency: 'USD', maximumFractionDigits: 2, style: 'currency' }).format(
          usage.cost_usd
        )
      : ''

  const label = copy.contextUsagePercent(percent)

  return (
    // Modal: the pane's hover focus-follow would otherwise pull focus back to
    // the editor and dismiss the panel as a focus-outside.
    <Popover modal onOpenChange={setOpen} open={open}>
      <Tip label={cacheHit ? `${t.studio.chat.contextUsage} · ${copy.cacheHit(cacheHit)}` : label} placement="control">
        <PopoverTrigger asChild>
          <button aria-label={label} className="composer-pill" data-slot="composer-context-ring" type="button">
            <ContextRing percent={percent} />
            {!compact && <span className="tabular-nums">{percent}%</span>}
          </button>
        </PopoverTrigger>
      </Tip>
      <PopoverContent align="end" className="w-80 p-0" side="top" sideOffset={8}>
        <div className="composer-context-panel" data-slot="composer-context-panel">
          <ContextUsagePanel breakdown={breakdown} loading={loading} usage={gauge} />
          <div className="grid grid-cols-2 gap-2 px-3">
            <Stat label={copy.stats.cacheHit}>{cacheHit}</Stat>
            <Stat label={copy.stats.throughput}>{tps ? copy.stats.throughputValue(tps) : ''}</Stat>
            <Stat label={copy.stats.turnTime}>{busy ? <LiveDuration since={turnStartedAt} /> : ''}</Stat>
            <Stat label={copy.stats.sessionCost}>{cost}</Stat>
          </div>
          <div className="flex items-center gap-1.5 p-3">
            <Tip label={busy ? copy.compressIdleOnly : undefined} placement="control">
              <span className="inline-flex">
                <Button
                  disabled={busy || !onCompress}
                  onClick={() => {
                    setOpen(false)
                    onCompress?.()
                  }}
                  size="sm"
                  variant="secondary"
                >
                  {copy.compress}
                </Button>
              </span>
            </Tip>
            <span className="flex-1" />
            <Button
              onClick={() => {
                setOpen(false)
                navigate(`${COMMAND_CENTER_ROUTE}?section=usage`)
              }}
              size="sm"
              variant="ghost"
            >
              {copy.usageDetails}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
