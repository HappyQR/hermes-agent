import { describe, expect, it } from 'vitest'

import { sessionTimeLabel } from './session-time-label'

const labels = { yesterday: 'Yesterday' }
// Wednesday 2026-10-14, 15:30 local.
const now = new Date(2026, 9, 14, 15, 30).getTime()
const at = (month: number, day: number, hour: number, minute = 0, year = 2026) =>
  new Date(year, month, day, hour, minute).getTime()

describe('sessionTimeLabel', () => {
  it('shows the clock time inside the current day', () => {
    expect(sessionTimeLabel(at(9, 14, 11, 42), labels, 'en-GB', now)).toBe('11:42')
  })

  it('keeps the small hours with the previous evening (4 AM rollover)', () => {
    // 01:00 today still belongs to yesterday's nominal day.
    expect(sessionTimeLabel(at(9, 14, 1), labels, 'en-GB', now)).toBe('Yesterday')
    expect(sessionTimeLabel(at(9, 13, 9), labels, 'en-GB', now)).toBe('Yesterday')
  })

  it('names the weekday within the last week, then falls back to a date', () => {
    expect(sessionTimeLabel(at(9, 12, 10), labels, 'en-GB', now)).toBe('Mon')
    expect(sessionTimeLabel(at(8, 28, 10), labels, 'en-GB', now)).toBe('28 Sept')
  })

  it("adds the year once the date is not this year's", () => {
    expect(sessionTimeLabel(at(11, 30, 10, 0, 2025), labels, 'en-GB', now)).toBe('30 Dec 2025')
  })

  it('follows the app locale', () => {
    expect(sessionTimeLabel(at(9, 12, 10), labels, 'zh', now)).toBe('周一')
    expect(sessionTimeLabel(at(8, 28, 10), labels, 'zh', now)).toBe('9月28日')
  })
})
