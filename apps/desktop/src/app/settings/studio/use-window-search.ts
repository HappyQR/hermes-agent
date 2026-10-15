import { useMemo } from 'react'

import { useI18n } from '@/i18n'
import { Settings2 } from '@/lib/icons'

import { filterSettingsSearchEntries, type SettingsSearchEntry, settingsSearchTargetQuery } from '../settings-search'
import { useSettingsSearchCatalog } from '../use-settings-search'

import { SETTINGS_PAGE_IDS, type SettingsPageId } from './categories'
import { resolveSettingsLocation, SETTINGS_SECTIONS, type SettingsLocation } from './locations'
import { useSectionTitle } from './section-titles'

/** One hit in the Settings sidebar search. */
export interface WindowSearchHit {
  id: string
  label: string
  /** Where it lives: "Category" for a page, "Page › Section" otherwise. */
  context: string
  page: SettingsPageId
  /** The query to navigate to (canonical or legacy; legacy is rewritten on arrival). */
  search: string
}

const MAX_HITS = 40

// Manifest rows the window no longer renders (the titlebar app-actions side is
// inert since the Studio toolbar took those buttons).
const HIDDEN_SETTINGS = new Set(['appearance.app-actions'])

function sectionSearch(location: SettingsLocation, extra?: string): string {
  const params = new URLSearchParams({ tab: location.page })

  if (location.section && !extra) {
    params.set('section', location.section)
  }

  return extra ? `?${params}&${extra}` : `?${params}`
}

/**
 * Sidebar search over every category, every section and every setting row
 * (manifest rows, config-schema fields, credentials). Ranked with the same
 * scorer the settings search tests pin (label exact > prefix > contains >
 * context > all terms > keywords). The catalog loads on the first keystroke.
 */
export function useWindowSearch(query: string): WindowSearchHit[] {
  const { t } = useI18n()
  const pages = t.studio.settings.pages
  const sectionTitle = useSectionTitle()
  const enabled = query.trim().length > 0
  const catalog = useSettingsSearchCatalog(enabled)

  const pageTitle = (page: SettingsPageId) => pages[page].title

  const contextOf = (location: SettingsLocation) =>
    location.section
      ? `${pageTitle(location.page)} › ${sectionTitle(location.page, location.section)}`
      : pageTitle(location.page)

  const entries = useMemo(() => {
    const hits = new Map<string, WindowSearchHit>()
    const list: SettingsSearchEntry[] = []

    const push = (hit: WindowSearchHit, keywords: string[], description?: string) => {
      hits.set(hit.id, hit)
      list.push({
        context: hit.context,
        description,
        icon: Settings2,
        id: hit.id,
        keywords,
        label: hit.label,
        target: { view: 'about' }
      })
    }

    for (const page of SETTINGS_PAGE_IDS) {
      push(
        {
          context: t.studio.settings.window.categoryResult,
          id: `page:${page}`,
          label: pageTitle(page),
          page,
          search: `?tab=${page}`
        },
        [page],
        page === 'plugins' ? pages.plugins.hero(t.sidebar.nav.capabilities) : pages[page].hero
      )

      for (const section of SETTINGS_SECTIONS[page]) {
        const title = sectionTitle(page, section)

        if (title && title !== pageTitle(page)) {
          push(
            {
              context: pageTitle(page),
              id: `section:${page}:${section}`,
              label: title,
              page,
              search: sectionSearch({ page, section })
            },
            [page, section]
          )
        }
      }
    }

    const deep = [...catalog.settingEntries, ...catalog.configEntries, ...catalog.credentialEntries].filter(
      entry => !(entry.target.setting && HIDDEN_SETTINGS.has(entry.target.setting))
    )

    for (const entry of deep) {
      const legacy = settingsSearchTargetQuery(entry.target)
      const location = resolveSettingsLocation(new URLSearchParams(legacy))

      push(
        { context: contextOf(location), id: entry.id, label: entry.label, page: location.page, search: `?${legacy}` },
        entry.keywords,
        entry.description
      )
    }

    return { hits, list }
    // The catalog arrays are rebuilt per render upstream; key on their sizes + locale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog.settingEntries.length, catalog.configEntries.length, catalog.credentialEntries.length, t])

  return useMemo(() => {
    if (!enabled) {
      return []
    }

    return filterSettingsSearchEntries(entries.list, query)
      .slice(0, MAX_HITS)
      .flatMap(entry => entries.hits.get(entry.id) ?? [])
  }, [enabled, entries, query])
}
