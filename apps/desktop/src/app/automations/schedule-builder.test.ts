import { describe, expect, it } from 'vitest'

import {
  cronToPreset,
  DEFAULT_SCHEDULE_PRESET,
  describePreset,
  parseTimeValue,
  presetTimeValue,
  presetToCron,
  type ScheduleCopy,
  type SchedulePreset
} from './schedule-builder'

const copy: ScheduleCopy = {
  clock: (hour, minute) => `${hour}:${String(minute).padStart(2, '0')}`,
  dayName: day => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
  daySeparator: ', ',
  everyDayAt: time => `Every day at ${time}`,
  everyDayOfWeekAt: (day, time) => `Every ${day} at ${time}`,
  everyHourAt: minute => `Every hour at :${minute}`,
  monthlyOnDayAt: (day, time) => `Monthly on day ${day} at ${time}`,
  topOfHour: 'At the top of every hour',
  weekdayShort: day => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
  weekdaysAt: time => `Weekdays at ${time}`,
  weeklyOnDaysAt: (days, time) => `Every ${days} at ${time}`
}

const preset = (overrides: Partial<SchedulePreset>): SchedulePreset => ({ ...DEFAULT_SCHEDULE_PRESET, ...overrides })

describe('schedule presets ⇄ cron', () => {
  it.each([
    [preset({ frequency: 'daily', hour: 9, minute: 30 }), '30 9 * * *'],
    [preset({ frequency: 'weekdays', hour: 8, minute: 0 }), '0 8 * * 1-5'],
    [preset({ frequency: 'weekly', hour: 10, minute: 15, weekdays: [5, 1, 3] }), '15 10 * * 1,3,5'],
    [preset({ frequency: 'monthly', hour: 7, minute: 5, dayOfMonth: 15 }), '5 7 15 * *'],
    [preset({ frequency: 'hourly', minute: 45 }), '45 * * * *']
  ])('round-trips %o through %s', (value, expr) => {
    expect(presetToCron(value)).toBe(expr)
    expect(presetToCron(cronToPreset(expr)!)).toBe(expr)
    expect(cronToPreset(expr)?.frequency).toBe(value.frequency)
  })

  it('normalizes Sunday written as 7 and keeps weekdays sorted', () => {
    expect(cronToPreset('0 9 * * 7,1')?.weekdays).toEqual([0, 1])
    expect(presetToCron(preset({ frequency: 'weekly', weekdays: [] }))).toBe('0 9 * * 1')
  })

  it.each(['*/15 * * * *', '0 */2 * * *', '0 9 1-7 * *', '0 9 * 6 *', 'every 30m', '0 9 * * 1-3', '0 25 * * *', ''])(
    'leaves %s to the free-text schedule',
    expr => {
      expect(cronToPreset(expr)).toBeNull()
    }
  )
})

describe('schedule summaries', () => {
  it('describes each frequency', () => {
    expect(describePreset(preset({ frequency: 'hourly', minute: 0 }), copy)).toBe('At the top of every hour')
    expect(describePreset(preset({ frequency: 'hourly', minute: 5 }), copy)).toBe('Every hour at :05')
    expect(describePreset(preset({ frequency: 'weekly', weekdays: [3] }), copy)).toBe('Every Wednesday at 9:00')
    // Monday-first order, whatever order the days were picked in.
    expect(describePreset(preset({ frequency: 'weekly', weekdays: [0, 1] }), copy)).toBe('Every Mon, Sun at 9:00')
    expect(describePreset(preset({ dayOfMonth: 3, frequency: 'monthly', minute: 5 }), copy)).toBe(
      'Monthly on day 3 at 9:05'
    )
  })

  it('reads and writes time inputs', () => {
    expect(presetTimeValue({ hour: 7, minute: 5 })).toBe('07:05')
    expect(parseTimeValue('21:40')).toEqual({ hour: 21, minute: 40 })
    expect(parseTimeValue('')).toBeNull()
    expect(parseTimeValue('24:00')).toBeNull()
  })
})
