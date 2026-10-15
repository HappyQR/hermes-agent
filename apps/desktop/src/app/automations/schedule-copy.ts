import { useMemo } from 'react'

import { type CronJob, getCronJobRuns, type SessionInfo } from '@/hermes'
import { type Translations, useI18n } from '@/i18n'
import { asText } from '@/lib/text'

import { openCronRun } from '../cron/open-cron-run'

import { formatClock } from './format'
import { describeCron, type ScheduleCopy } from './schedule-builder'

/** Summary copy from the legacy `t.cron` helpers plus the Studio additions. */
export function scheduleCopyFor(t: Translations, locale?: string): ScheduleCopy {
  const c = t.cron
  const s = t.studio.pages.cron

  return {
    clock: (hour, minute) => formatClock(hour, minute, locale),
    dayName: day => c.days[String(day)] ?? c.dayFallback(String(day)),
    daySeparator: s.daySeparator,
    everyDayAt: c.everyDayAt,
    everyDayOfWeekAt: c.everyDayOfWeekAt,
    everyHourAt: c.everyHourAt,
    monthlyOnDayAt: c.monthlyOnDayAt,
    topOfHour: c.topOfHour,
    weekdayShort: day => s.weekdaysShort[(day + 6) % 7],
    weekdaysAt: c.weekdaysAt,
    weeklyOnDaysAt: s.weeklyOnDaysAt
  }
}

export function useScheduleCopy(): ScheduleCopy {
  const { locale, t } = useI18n()

  return useMemo(() => scheduleCopyFor(t, locale), [locale, t])
}

export function cronExpr(job: CronJob): string {
  return asText(job.schedule?.expr) || asText(job.schedule_display) || ''
}

/** The human schedule for a job: a picker preset reads "Every day at 9:00";
 *  anything else shows the backend's own display. */
export function cronScheduleText(job: CronJob, copy: ScheduleCopy): string {
  const expr = asText(job.schedule?.expr)

  return (
    (expr ? describeCron(expr, copy) : null) ||
    asText(job.schedule_display) ||
    asText(job.schedule?.display) ||
    expr ||
    '—'
  )
}

/** Open the newest run of a job that has a session (output-only rows have none). */
export async function openLatestCronRun(
  jobId: string,
  open: (sessionId: string, session?: SessionInfo) => void,
  onNone: () => void
): Promise<void> {
  const runs = await getCronJobRuns(jobId, 5)
  const run = runs.find(row => row.source !== 'cron_output')

  if (!run) {
    onNone()

    return
  }

  openCronRun(run, open)
}
