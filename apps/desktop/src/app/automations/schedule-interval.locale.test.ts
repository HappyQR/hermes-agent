import { describe, expect, it } from 'vitest'

import { resolveTranslations } from '@/i18n/registry'

import { scheduleCopyFor } from './schedule-copy'

const text = (locale: 'en' | 'ru' | 'zh', minutes: number) => {
  const copy = scheduleCopyFor(resolveTranslations(locale), locale)

  return minutes % 60 === 0 ? copy.everyInterval(minutes / 60, 'hour') : copy.everyInterval(minutes, 'minute')
}

describe('interval schedules in the UI language', () => {
  it('reads naturally in English, Chinese and Russian', () => {
    expect(text('en', 15)).toBe('Every 15 minutes')
    expect(text('en', 60)).toBe('Every hour')
    expect(text('zh', 15)).toBe('每 15 分钟')
    expect(text('zh', 60)).toBe('每小时')
    expect(text('ru', 15)).toBe('Каждые 15 минут')
    expect(text('ru', 120)).toBe('Каждые 2 часа')
    expect(text('ru', 60)).toBe('Каждый час')
  })
})
