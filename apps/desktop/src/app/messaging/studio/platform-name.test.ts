import { describe, expect, it } from 'vitest'

import { resolveTranslations } from '@/i18n/registry'

import { platformName } from './platform-name'

const zh = resolveTranslations('zh')
const en = resolveTranslations('en')

describe('messaging platform names', () => {
  it('reads translatable names in the UI language', () => {
    expect(platformName({ id: 'dingtalk', name: 'DingTalk' }, zh)).toBe('钉钉')
    expect(platformName({ id: 'email', name: 'Email' }, zh)).toBe('邮件')
  })

  it('keeps brand names and unknown platforms as the backend labels them', () => {
    expect(platformName({ id: 'telegram', name: 'Telegram' }, zh)).toBe('Telegram')
    expect(platformName({ id: 'future_chat', name: 'Future Chat' }, zh)).toBe('Future Chat')
  })

  it('leaves English exactly as the backend names it', () => {
    for (const [id, name] of [
      ['wecom', 'WeCom (group bot)'],
      ['weixin', 'Weixin / WeChat (Personal)'],
      ['relay', 'Relay (experimental)']
    ]) {
      expect(platformName({ id, name }, en)).toBe(name)
    }
  })
})
