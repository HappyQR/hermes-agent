import { persistString, storedString } from '@/lib/storage'

import { normalizeLocale } from './languages'
import { setRuntimeI18nLocale } from './runtime'
import type { Locale } from './types'

const LAST_LOCALE_KEY = 'hermes.desktop.lastLocale'

/** The language the app last settled on. Boot surfaces ("Connecting to
 *  Hermes…") paint before the backend's display.language arrives; they speak
 *  this instead of English, and the config replaces it as soon as it loads. */
export const lastLocale = (): null | string => storedString(LAST_LOCALE_KEY)

export const rememberLocale = (locale: Locale): void => persistString(LAST_LOCALE_KEY, locale)

/** Before the first render: module-level copy (translateNow) starts there too. */
export function bootRuntimeLocale(): void {
  const last = lastLocale()

  if (last) {
    setRuntimeI18nLocale(normalizeLocale(last))
  }
}
