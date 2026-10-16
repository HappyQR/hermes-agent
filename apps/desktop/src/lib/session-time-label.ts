import { DAY, intlLocale, nominalDayStart } from '@/lib/time'

export interface SessionTimeLabels {
  yesterday: string
}

type FormatterKind = 'clock' | 'monthDay' | 'monthDayYear' | 'weekday'

const OPTIONS: Record<FormatterKind, Intl.DateTimeFormatOptions> = {
  clock: { hour: '2-digit', minute: '2-digit' },
  monthDay: { day: 'numeric', month: 'short' },
  monthDayYear: { day: 'numeric', month: 'short', year: 'numeric' },
  weekday: { weekday: 'short' }
}

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatter(kind: FormatterKind, locale: string | undefined): Intl.DateTimeFormat {
  const key = `${locale ?? ''}\u0000${kind}`
  let format = formatters.get(key)

  if (!format) {
    try {
      format = new Intl.DateTimeFormat(locale === undefined ? undefined : intlLocale(locale), OPTIONS[kind])
    } catch {
      format = new Intl.DateTimeFormat(undefined, OPTIONS[kind])
    }

    formatters.set(key, format)
  }

  return format
}

/**
 * A session row's time meta (prototype: `11:42` · `Yesterday` · `Mon` · `Sep 28`):
 * the clock time inside the current nominal day (the day rolls over at 4 AM,
 * like the date dividers), "Yesterday", the weekday within the last week, then
 * a short date — with the year once it is not this year's.
 */
export function sessionTimeLabel(
  ms: number,
  labels: SessionTimeLabels,
  locale?: string,
  nowMs: number = Date.now()
): string {
  const days = Math.round((nominalDayStart(nowMs) - nominalDayStart(ms)) / DAY)

  if (days <= 0) {
    return formatter('clock', locale).format(ms)
  }

  if (days === 1) {
    return labels.yesterday
  }

  if (days < 7) {
    return formatter('weekday', locale).format(ms)
  }

  const sameYear = new Date(ms).getFullYear() === new Date(nowMs).getFullYear()

  return formatter(sameYear ? 'monthDay' : 'monthDayYear', locale).format(ms)
}
