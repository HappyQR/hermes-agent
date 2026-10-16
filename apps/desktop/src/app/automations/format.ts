import type { StudioCronTranslations } from '@/i18n/types_studio_pages'
import { DAY, intlLocale, startOfLocalDay } from '@/lib/time'

// Run times on the Automations page read in the UI language ("明天 09:00",
// "tomorrow 9:00 AM", "10月20日 10:00") so a schedule line never mixes two
// languages. Formatters are cached per locale.
interface WhenFormatters {
  clock: Intl.DateTimeFormat
  dayTime: Intl.DateTimeFormat
  relativeDay: Intl.RelativeTimeFormat
}

const FORMATTERS = new Map<string, WhenFormatters>()

function createFormatters(locale: string | undefined): WhenFormatters {
  const numericClock = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' })
  // 24-hour locales read "09:00", not "9:00" (a schedule is a clock time).
  const hour = numericClock.resolvedOptions().hour12 === false ? '2-digit' : 'numeric'

  return {
    clock: new Intl.DateTimeFormat(locale, { hour, minute: '2-digit' }),
    dayTime: new Intl.DateTimeFormat(locale, { day: 'numeric', hour, minute: '2-digit', month: 'short' }),
    relativeDay: new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  }
}

function formattersFor(locale?: string): WhenFormatters {
  const key = locale ?? ''
  let formatters = FORMATTERS.get(key)

  if (!formatters) {
    try {
      formatters = createFormatters(locale === undefined ? undefined : intlLocale(locale))
    } catch {
      // A registered pack's tag Intl does not know: fall back to the system locale.
      formatters = createFormatters(undefined)
    }

    FORMATTERS.set(key, formatters)
  }

  return formatters
}

/** "today 9:00" / "tomorrow 9:00" / "Oct 20, 10:00". */
export function formatWhen(ms: number, locale?: string, nowMs = Date.now()): string {
  const { clock, dayTime, relativeDay } = formattersFor(locale)
  const dayOffset = Math.round((startOfLocalDay(ms) - startOfLocalDay(nowMs)) / DAY)

  if (dayOffset >= -1 && dayOffset <= 1) {
    return `${relativeDay.format(dayOffset, 'day')} ${clock.format(new Date(ms))}`
  }

  return dayTime.format(new Date(ms))
}

/** A cron time of day ("09:00" / "9:00 AM") in the UI language. */
export function formatClock(hour: number, minute: number, locale?: string): string {
  return formattersFor(locale).clock.format(new Date(2000, 0, 1, hour, minute))
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
