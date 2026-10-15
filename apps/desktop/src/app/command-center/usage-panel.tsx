import { compactNumber } from '@hermes/shared'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FormGroup, FormSection } from '@/app/overlays/studio/form-group'
import { SimpleRow } from '@/app/overlays/studio/simple-row'
import { CARD_SURFACE_CLASS, StatCard } from '@/app/overlays/studio/stat-card'
import { PageLoader } from '@/components/page-loader'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Tip } from '@/components/ui/tooltip'
import { getUsageAnalytics } from '@/hermes'
import type { AnalyticsResponse } from '@/hermes'
import { useI18n } from '@/i18n'
import { AlertCircle } from '@/lib/icons'
import { cn } from '@/lib/utils'
import type { AnalyticsTotals } from '@/types/hermes'

import { useRefreshHotkey } from '../hooks/use-refresh-hotkey'

import { EmptyPanel } from './empty-panel'

const USAGE_PERIODS = [7, 30, 90] as const

type UsagePeriod = (typeof USAGE_PERIODS)[number]

/** Cache reads as a share of all prompt tokens (input excludes cache reads, see agent/usage_pricing.py). */
export function cacheHitPercent(totals: Pick<AnalyticsTotals, 'total_cache_read' | 'total_input'>): null | number {
  const cached = totals.total_cache_read ?? 0
  const prompt = (totals.total_input ?? 0) + cached

  return prompt > 0 && cached > 0 ? Math.round((cached / prompt) * 100) : null
}

/** 用量: period switch, totals incl. cost, daily stacked bars, top models and skills. */
export function UsagePanel() {
  const { t, locale } = useI18n()
  const cc = t.commandCenter
  const sys = t.studio.overlays.system
  const [period, setPeriod] = useState<UsagePeriod>(30)
  const [usage, setUsage] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestRef = useRef(0)

  const refresh = useCallback(async (days: UsagePeriod) => {
    const requestId = requestRef.current + 1
    requestRef.current = requestId
    setLoading(true)
    setError('')

    try {
      const response = await getUsageAnalytics(days)

      if (requestRef.current === requestId) {
        setUsage(response)
      }
    } catch (cause) {
      if (requestRef.current === requestId) {
        setError(cause instanceof Error ? cause.message : String(cause))
      }
    } finally {
      if (requestRef.current === requestId) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void refresh(period)
  }, [period, refresh])

  useRefreshHotkey(() => void refresh(period))

  const money = useMemo(
    () => new Intl.NumberFormat(locale, { currency: 'USD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 2, style: 'currency' }),
    [locale]
  )

  const totals = usage?.totals

  const periodControl = (
    <SegmentedControl
      aria-label={sys.periodLabel}
      onChange={id => setPeriod(Number(id) as UsagePeriod)}
      options={USAGE_PERIODS.map(value => ({ id: String(value), label: cc.days(value) }))}
      size="sm"
      value={String(period)}
    />
  )

  if (!totals) {
    return (
      <>
        <div className="flex items-center">{periodControl}</div>
        {loading ? (
          <PageLoader className="min-h-48" label={cc.loadingUsage} />
        ) : (
          <EmptyPanel
            action={
              <Button onClick={() => void refresh(period)} size="sm" variant="secondary">
                {cc.retry}
              </Button>
            }
            description={error || cc.noUsage(period)}
          />
        )}
      </>
    )
  }

  const hit = cacheHitPercent(totals)

  return (
    <>
      <div className="flex items-center gap-3">
        {periodControl}
        {error && (
          <span className="inline-flex items-center gap-1 text-[0.71875rem] text-destructive">
            <AlertCircle className="size-3.5" />
            {error}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2.5 max-[47.5rem]:grid-cols-2">
        <StatCard label={cc.statSessions} value={compactNumber(totals.total_sessions)} />
        <StatCard label={cc.statApiCalls} value={compactNumber(totals.total_api_calls)} />
        <StatCard
          label={cc.statTokens}
          value={`${compactNumber(totals.total_input)} / ${compactNumber(totals.total_output)}`}
        />
        <StatCard
          hint={totals.total_actual_cost > 0 ? cc.actualCost(money.format(totals.total_actual_cost)) : undefined}
          label={cc.statCost}
          value={money.format(totals.total_estimated_cost ?? 0)}
        />
      </div>

      <DailyBars cacheHit={hit} usage={usage} />

      <div className="grid gap-2.5 min-[40rem]:grid-cols-2">
        <UsageList
          emptyLabel={cc.noModelUsage}
          rows={(usage?.by_model ?? []).slice(0, 6).map(entry => ({
            key: entry.model,
            label: entry.model,
            value: compactNumber((entry.input_tokens || 0) + (entry.output_tokens || 0))
          }))}
          title={cc.topModels}
        />
        <UsageList
          emptyLabel={cc.noSkillActivity}
          mono
          rows={(usage?.skills?.top_skills ?? []).slice(0, 6).map(entry => ({
            key: entry.skill,
            label: entry.skill,
            value: cc.actions(compactNumber(entry.total_count))
          }))}
          title={cc.topSkills}
        />
      </div>
    </>
  )
}

function DailyBars({ cacheHit, usage }: { cacheHit: null | number; usage: AnalyticsResponse | null }) {
  const { t } = useI18n()
  const cc = t.commandCenter
  const sys = t.studio.overlays.system
  const daily = useMemo(() => usage?.daily ?? [], [usage])

  const maxTokens = useMemo(
    () => daily.reduce((acc, entry) => Math.max(acc, (entry.input_tokens || 0) + (entry.output_tokens || 0)), 1),
    [daily]
  )

  return (
    <div className={cn('p-3.5', CARD_SURFACE_CLASS)}>
      {daily.length === 0 ? (
        <div className="grid h-[7.5rem] place-items-center text-[0.75rem] text-(--ui-text-tertiary)">
          {cc.noDailyActivity}
        </div>
      ) : (
        <div className="flex h-[7.5rem] items-end gap-[3px]">
          {daily.map(entry => {
            const input = entry.input_tokens || 0
            const output = entry.output_tokens || 0

            return (
              <Tip
                key={entry.day}
                label={sys.dayDetail(entry.day, compactNumber(input), compactNumber(output))}
              >
                <div className="flex h-full min-w-0 flex-1 flex-col justify-end gap-px" tabIndex={-1}>
                  <i
                    className="block rounded-t-[3px] bg-primary opacity-85"
                    style={{ height: `${(output / maxTokens) * 100}%`, minHeight: output > 0 ? 1 : 0 }}
                  />
                  <i
                    className="block rounded-b-[2px] bg-[color-mix(in_srgb,var(--dt-primary)_35%,transparent)]"
                    style={{ height: `${(input / maxTokens) * 100}%`, minHeight: input > 0 ? 1 : 0 }}
                  />
                </div>
              </Tip>
            )
          })}
        </div>
      )}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[0.71875rem] text-(--ui-text-tertiary)">
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block size-2 rounded-[2px] bg-primary" />
          {cc.output}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block size-2 rounded-[2px] bg-[color-mix(in_srgb,var(--dt-primary)_35%,transparent)]" />
          {cc.input}
        </span>
        <span className="flex-1" />
        {daily.length > 0 && (
          <span className="tabular-nums">
            {daily[0]?.day} – {daily[daily.length - 1]?.day}
          </span>
        )}
        {cacheHit !== null && <span className="tabular-nums">{sys.cacheHit(cacheHit)}</span>}
      </div>
    </div>
  )
}

function UsageList({
  emptyLabel,
  mono = false,
  rows,
  title
}: {
  emptyLabel: string
  mono?: boolean
  rows: Array<{ key: string; label: string; value: string }>
  title: string
}) {
  return (
    <FormSection title={title}>
      <FormGroup>
        {rows.length === 0 ? (
          <SimpleRow className="min-h-11" title={<span className="text-(--ui-text-tertiary)">{emptyLabel}</span>} />
        ) : (
          rows.map(row => (
            <SimpleRow
              className="min-h-11"
              key={row.key}
              title={<span className={cn(mono && 'font-mono text-[0.78125rem]')}>{row.label}</span>}
            >
              <span className="text-[0.75rem] tabular-nums text-(--ui-text-tertiary)">{row.value}</span>
            </SimpleRow>
          ))
        )}
      </FormGroup>
    </FormSection>
  )
}
