import type { Translations } from '@/i18n'
import type { MessagingPlatformInfo } from '@/types/hermes'

/** A platform's name in the UI language: Studio's table for the names that
 *  translate (邮件, 钉钉, 企业微信…), else the backend's label. */
export const platformName = (platform: Pick<MessagingPlatformInfo, 'id' | 'name'>, t: Translations): string =>
  t.studio.pages.messaging.platformNames[platform.id] ?? platform.name
