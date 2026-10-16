import { describe, expect, it } from 'vitest'

import { TRANSLATIONS } from '@/i18n'

const duration = (locale: keyof typeof TRANSLATIONS) => TRANSLATIONS[locale].studio.chat.transcript.replyDuration

describe('the reply footer turn time', () => {
  it('keeps the classic English timer text', () => {
    expect([48, 65, 120].map(duration('en'))).toEqual(['48s', '1:05', '2:00'])
  })

  it('reads in the UI language', () => {
    expect([48, 65, 120].map(duration('zh'))).toEqual(['48 秒', '1 分 5 秒', '2 分钟'])
    expect([48, 65].map(duration('ru'))).toEqual(['48 с', '1 мин 5 с'])
  })
})
