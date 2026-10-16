import type { Translations } from '@/i18n'
import { isMacPlatform } from '@/lib/platform'

/** "This Mac" on macOS, "This device" elsewhere — the app also ships on Windows and Linux. */
export function thisDeviceLabel(t: Translations): string {
  return isMacPlatform() ? t.studio.pages.common.thisMac : t.studio.pages.common.thisDevice
}
