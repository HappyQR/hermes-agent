import type { StudioCapabilitiesTranslations } from '@/i18n/types_studio_pages'

/** A skill category's display name: the localized name of a known catalog
 *  category, else the slug humanized ("smart-home" → "Smart home"). */
export function categoryLabel(slug: string, c: StudioCapabilitiesTranslations): string {
  const key = slug.trim().toLowerCase()
  const known = (c.categories as Record<string, string | undefined>)[key]

  if (known) {
    return known
  }

  const words = key.replace(/[-_]+/g, ' ').trim()

  return words ? words.charAt(0).toUpperCase() + words.slice(1) : slug
}
