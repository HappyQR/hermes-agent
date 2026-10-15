import type { StudioCronTranslations } from '@/i18n/types_studio_pages'
import { DAY, fmtClock, fmtDayTime, startOfLocalDay } from '@/lib/time'

// "today 9:00" / "tomorrow 9:00" / "Oct 20, 10:00" — how the Automations page
// names a run time (system locale, like every other timestamp in the app).
const relativeDay = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

export function formatWhen(ms: number, nowMs = Date.now()): string {
  const dayOffset = Math.round((startOfLocalDay(ms) - startOfLocalDay(nowMs)) / DAY)

  if (dayOffset >= -1 && dayOffset <= 1) {
    return `${relativeDay.format(dayOffset, 'day')} ${fmtClock.format(new Date(ms))}`
  }

  return fmtDayTime.format(new Date(ms))
}

/** Parse an ISO string from the backend; null when absent or invalid. */
export function isoMs(value?: null | string): null | number {
  if (!value) {
    return null
  }

  const ms = Date.parse(value)

  return Number.isNaN(ms) ? null : ms
}

export function formatDuration(seconds: number, copy: StudioCronTranslations): string {
  const whole = Math.max(0, Math.round(seconds))

  if (whole < 60) {
    return copy.durationSeconds(whole)
  }

  if (whole < 3600) {
    return copy.durationMinutes(Math.floor(whole / 60), whole % 60)
  }

  return copy.durationHours(Math.floor(whole / 3600), Math.floor((whole % 3600) / 60))
}
