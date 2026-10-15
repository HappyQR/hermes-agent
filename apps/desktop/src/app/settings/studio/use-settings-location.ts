import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { movedSettingsTabRedirect } from '../moved-tabs'

import type { SettingsPageId } from './categories'
import { canonicalSettingsSearch, resolveSettingsLocation, type SettingsLocation } from './locations'

export interface SettingsWindowLocation extends SettingsLocation {
  /** Go to a page (optionally a section of it); drops the old page's target params. */
  openPage: (page: SettingsPageId, section?: string) => void
  params: URLSearchParams
  /** Rewrite the current query (replace): add/remove params on this page. */
  updateParams: (update: (next: URLSearchParams) => void) => void
}

/**
 * The Settings window's location: resolves canonical and legacy queries to a
 * page/section, rewrites legacy links in place (replace, so Back never lands
 * on the old shape), and forwards moved tabs (`?tab=mcp`) out of Settings.
 */
export function useSettingsLocation(): SettingsWindowLocation {
  const navigate = useNavigate()
  const { hash, pathname, search } = useLocation()
  const moved = useMemo(() => movedSettingsTabRedirect(search), [search])
  const canonical = useMemo(() => (moved ? null : canonicalSettingsSearch(search)), [moved, search])

  useEffect(() => {
    if (moved) {
      navigate(moved, { replace: true })
    } else if (canonical) {
      navigate({ hash, pathname, search: canonical }, { replace: true })
    }
  }, [canonical, hash, moved, navigate, pathname])

  const params = useMemo(() => new URLSearchParams(search), [search])
  const location = useMemo(() => resolveSettingsLocation(params), [params])

  const openPage = useCallback(
    (page: SettingsPageId, section?: string) => {
      const next = new URLSearchParams({ tab: page })

      if (section) {
        next.set('section', section)
      }

      navigate({ hash, pathname, search: `?${next}` }, { replace: true })
    },
    [hash, navigate, pathname]
  )

  const updateParams = useCallback(
    (update: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(search)

      update(next)
      navigate({ hash, pathname, search: `?${next}` }, { replace: true })
    },
    [hash, navigate, pathname, search]
  )

  return { ...location, openPage, params, updateParams }
}
