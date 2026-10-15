import { useCallback } from 'react'

import { useI18n } from '@/i18n'

import type { SettingsPageId } from './categories'

const camel = (id: string) => id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())

/** `(page, sectionId) → title` from t.studio.settings.sections (kebab ids → camel keys). */
export function useSectionTitle(): (page: SettingsPageId, section: string) => string {
  const { t } = useI18n()

  return useCallback(
    (page: SettingsPageId, section: string) => {
      if (page === 'billing') {
        return t.settings.subpages.billingOverview
      }

      const sections = t.studio.settings.sections as unknown as Record<string, Record<string, string> | undefined>
      const title = sections[page]?.[camel(section)]

      return typeof title === 'string' ? title : ''
    },
    [t]
  )
}
