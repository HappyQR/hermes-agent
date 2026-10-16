// Pure schedule helpers for the Automations page: the picker's presets
// (daily · weekdays · weekly · monthly · hourly) ⇄ cron expressions, and their
// human summaries. Anything that does not round-trip to a preset (`*/15 * * * *`,
// "every 30m", ISO timestamps) stays a free-text schedule the backend parses on
// save (cron/jobs.py) — the picker never rewrites it.

export type ScheduleFrequency = 'daily' | 'hourly' | 'monthly' | 'weekdays' | 'weekly'

export const SCHEDULE_FREQUENCIES: readonly ScheduleFrequency[] = ['daily', 'weekdays', 'weekly', 'monthly', 'hourly']

export interface SchedulePreset {
  /** Day of month for `monthly` (1–31). */
  dayOfMonth: number
  frequency: ScheduleFrequency
  hour: number
  minute: number
  /** Cron day-of-week numbers for `weekly` (0 = Sunday … 6 = Saturday). */
  weekdays: number[]
}

export const DEFAULT_SCHEDULE_PRESET: SchedulePreset = {
  dayOfMonth: 1,
  frequency: 'daily',
  hour: 9,
  minute: 0,
  weekdays: [1]
}

/** Monday-first display order of cron weekday numbers. */
export const WEEKDAY_ORDER: readonly number[] = [1, 2, 3, 4, 5, 6, 0]

function intIn(value: string, min: number, max: number): null | number {
  if (!/^\d{1,2}$/.test(value)) {
    return null
  }

  const n = Number(value)

  return n >= min && n <= max ? n : null
}

/** `1,3,5` / `0` / `7` → sorted unique cron weekdays; null for ranges and steps. */
function parseWeekdayList(value: string): null | number[] {
  const days = new Set<number>()

  for (const token of value.split(',')) {
    const day = intIn(token, 0, 7)

    if (day === null) {
      return null
    }

    days.add(day % 7)
  }

  return days.size > 0 ? [...days].sort((a, b) => a - b) : null
}

export function presetToCron(preset: SchedulePreset): string {
  const { dayOfMonth, frequency, hour, minute } = preset

  switch (frequency) {
    case 'daily':
      return `${minute} ${hour} * * *`

    case 'weekdays':
      return `${minute} ${hour} * * 1-5`
    case 'weekly': {
      const days = [...new Set(preset.weekdays.map(day => day % 7))].sort((a, b) => a - b)

      return `${minute} ${hour} * * ${(days.length > 0 ? days : [1]).join(',')}`
    }

    case 'monthly':
      return `${minute} ${hour} ${dayOfMonth} * *`

    case 'hourly':
      return `${minute} * * * *`
  }
}

/** The preset an expression round-trips to, or null when it needs the free-text field. */
export function cronToPreset(expr: string): null | SchedulePreset {
  const parts = expr.trim().split(/\s+/)

  if (parts.length !== 5) {
    return null
  }

  const [minuteToken, hourToken, domToken, monthToken, dowToken] = parts
  const minute = intIn(minuteToken, 0, 59)

  if (minute === null || monthToken !== '*') {
    return null
  }

  if (hourToken === '*') {
    return domToken === '*' && dowToken === '*' ? { ...DEFAULT_SCHEDULE_PRESET, frequency: 'hourly', minute } : null
  }

  const hour = intIn(hourToken, 0, 23)

  if (hour === null) {
    return null
  }

  const base = { ...DEFAULT_SCHEDULE_PRESET, hour, minute }

  if (domToken === '*') {
    if (dowToken === '*') {
      return { ...base, frequency: 'daily' }
    }

    if (dowToken === '1-5') {
      return { ...base, frequency: 'weekdays' }
    }

    const weekdays = parseWeekdayList(dowToken)

    return weekdays ? { ...base, frequency: 'weekly', weekdays } : null
  }

  const dayOfMonth = intIn(domToken, 1, 31)

  return dayOfMonth !== null && dowToken === '*' ? { ...base, dayOfMonth, frequency: 'monthly' } : null
}

/** `HH:MM` for an `<input type="time">`. */
export function presetTimeValue(preset: Pick<SchedulePreset, 'hour' | 'minute'>): string {
  return `${String(preset.hour).padStart(2, '0')}:${String(preset.minute).padStart(2, '0')}`
}

/** Parse an `<input type="time">` value; null while the field is incomplete. */
export function parseTimeValue(value: string): null | { hour: number; minute: number } {
  const match = /^(\d{1,2}):(\d{2})/.exec(value)

  if (!match) {
    return null
  }

  const hour = Number(match[1])
  const minute = Number(match[2])

  return hour <= 23 && minute <= 59 ? { hour, minute } : null
}

/** The copy a summary needs — the legacy `t.cron` helpers plus the studio additions. */
export interface ScheduleCopy {
  /** A time of day in the UI language. */
  clock: (hour: number, minute: number) => string
  dayName: (cronDay: number) => string
  daySeparator: string
  everyDayAt: (time: string) => string
  everyDayOfWeekAt: (day: string, time: string) => string
  everyHourAt: (minute: string) => string
  monthlyOnDayAt: (dayOfMonth: string, time: string) => string
  topOfHour: string
  weekdayShort: (cronDay: number) => string
  weekdaysAt: (time: string) => string
  weeklyOnDaysAt: (days: string, time: string) => string
  everyInterval: (count: number, unit: 'day' | 'hour' | 'minute') => string
}

export function describePreset(preset: SchedulePreset, copy: ScheduleCopy): string {
  const time = copy.clock(preset.hour, preset.minute)

  switch (preset.frequency) {
    case 'daily':
      return copy.everyDayAt(time)

    case 'weekdays':
      return copy.weekdaysAt(time)
    case 'weekly': {
      const days = WEEKDAY_ORDER.filter(day => preset.weekdays.includes(day))

      return days.length === 1
        ? copy.everyDayOfWeekAt(copy.dayName(days[0]), time)
        : copy.weeklyOnDaysAt(days.map(copy.weekdayShort).join(copy.daySeparator), time)
    }

    case 'monthly':
      return copy.monthlyOnDayAt(String(preset.dayOfMonth), time)

    case 'hourly':
      return preset.minute === 0 ? copy.topOfHour : copy.everyHourAt(String(preset.minute).padStart(2, '0'))
  }
}

/** Human summary for a stored expression, or null when it is not a picker preset. */
export function describeCron(expr: string, copy: ScheduleCopy): null | string {
  const preset = cronToPreset(expr)

  return preset ? describePreset(preset, copy) : null
}

/** An interval job ("every 15m") in its largest whole unit: "Every 15 minutes". */
export function describeInterval(minutes: number, copy: ScheduleCopy): string {
  if (minutes % 1440 === 0) {
    return copy.everyInterval(minutes / 1440, 'day')
  }

  return minutes % 60 === 0 ? copy.everyInterval(minutes / 60, 'hour') : copy.everyInterval(minutes, 'minute')
}
