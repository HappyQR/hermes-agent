import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { IconTile } from '@/app/overlays/studio/icon-tile'
import { Button } from '@/components/ui/button'
import { TabDropdown } from '@/components/ui/tab-dropdown'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { X } from '@/lib/icons'
import { ChevronBack } from '@/lib/icons-studio-overlays'
import { isEditableTarget } from '@/lib/keybinds/combo'
import { typeToFocusChar } from '@/lib/keybinds/composer-focus-keys'
import { $commandPaletteOpen } from '@/store/command-palette'
import { recordFeatureUse, settingsArea } from '@/store/desktop-metrics'

import { SettingsBreadcrumbContext } from '../primitives'
import type { SettingsPageProps } from '../types'

import { SETTINGS_PAGE_GROUPS, SETTINGS_PAGES, type SettingsPageId } from './categories'
import { type SettingsDrill, SettingsDrillContext } from './drill'
import { PAGE_METRICS_VIEW } from './locations'
import { SettingsPageView } from './page-view'
import { SettingsScopeNote, SettingsScopePopup } from './scope'
import { settingsSectionElementId } from './section'
import { SettingsSidebar } from './settings-sidebar'
import { useSettingsLocation } from './use-settings-location'
import { useWindowDrag } from './use-window-drag'
import type { WindowSearchHit } from './use-window-search'
import { SettingsWindowContext } from './window-context'

/** Below this the sidebar folds into a page menu in the header (prototype ≤ 760px). */
const SINGLE_COLUMN_QUERY = '(max-width: 760px)'

const TARGET_PARAMS = ['field', 'setting', 'key', 'aux', 'session', 'kind', 'label', 'origin']

function SettingsHero({ page }: { page: SettingsPageId }) {
  const { t } = useI18n()
  const spec = SETTINGS_PAGES[page]
  const copy = t.studio.settings.pages
  const hero = page === 'plugins' ? copy.plugins.hero(t.sidebar.nav.capabilities) : copy[page].hero

  return (
    <div className="flex flex-col items-center gap-2 pb-0.5 pt-2.5 text-center" data-slot="settings-hero">
      <IconTile glyph={spec.glyph} size={54} tone={spec.tone} />
      <h3 className="mt-1 text-xl font-bold tracking-[-0.01em] text-(--ui-text-primary)">{copy[page].title}</h3>
      <p className="max-w-[52ch] text-[0.78125rem] leading-normal text-(--ui-text-tertiary)">{hero}</p>
    </div>
  )
}

/** Scroll `?section=` into view once it renders, then drop the param (so a repeat jump works). */
function useSectionScroll(page: SettingsPageId, section: string | undefined, params: URLSearchParams, drop: () => void) {
  const hasTarget = TARGET_PARAMS.some(key => params.get(key))

  useEffect(() => {
    if (!section || hasTarget) {
      return
    }

    let attempts = 0
    let timer = 0

    const attempt = () => {
      const element = document.getElementById(settingsSectionElementId(page, section))

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        drop()

        return
      }

      if (attempts++ < 20) {
        timer = window.setTimeout(attempt, 80)
      }
    }

    timer = window.setTimeout(attempt, 60)

    return () => window.clearTimeout(timer)
  }, [drop, hasTarget, page, section])
}

/** Type anywhere on the window (outside a field) to search: focuses the sidebar search and seeds it. */
function useTypeToSearch(searchRef: React.RefObject<HTMLInputElement | null>, setQuery: (fn: (q: string) => string) => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ($commandPaletteOpen.get() || isEditableTarget(event.target) || !searchRef.current) {
        return
      }

      const char = typeToFocusChar(event)

      if (char === null || char === ' ') {
        return
      }

      event.preventDefault()
      setQuery(query => query + char)
      searchRef.current.focus()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [searchRef, setQuery])
}

function PageMenu({ onSelect, page }: { onSelect: (page: SettingsPageId) => void; page: SettingsPageId }) {
  const { t } = useI18n()

  return (
    <TabDropdown
      align="start"
      items={SETTINGS_PAGE_GROUPS.flatMap((group, groupIndex) =>
        group.map((id, index) => ({
          active: id === page,
          id,
          label: t.studio.settings.pages[id].title,
          onSelect: () => onSelect(id),
          separatorBefore: groupIndex > 0 && index === 0
        }))
      )}
    />
  )
}

function SettingsHeader({
  drill,
  narrow,
  onClose,
  onDragStart,
  onSelect,
  page
}: {
  drill: null | SettingsDrill
  narrow: boolean
  onClose: () => void
  onDragStart: (event: React.PointerEvent<HTMLElement>) => void
  onSelect: (page: SettingsPageId) => void
  page: SettingsPageId
}) {
  const { t } = useI18n()
  const title: ReactNode = drill?.title ?? t.studio.settings.pages[page].title

  return (
    <header
      className="flex h-[3.25rem] shrink-0 cursor-grab items-center gap-2.5 px-5 active:cursor-grabbing"
      data-slot="settings-header"
      onPointerDown={onDragStart}
    >
      <Button
        aria-label={t.common.back}
        className="text-(--ui-text-secondary) disabled:opacity-35"
        disabled={!drill}
        onClick={() => {
          triggerHaptic('selection')
          drill?.onBack()
        }}
        size="icon-sm"
        variant="ghost"
      >
        <ChevronBack className="size-4" />
      </Button>
      {narrow ? (
        <div className="min-w-0 flex-1">
          <PageMenu onSelect={onSelect} page={page} />
        </div>
      ) : (
        <h2 className="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold text-(--ui-text-primary)">{title}</h2>
      )}
      {SETTINGS_PAGES[page].scope === 'profile' && <SettingsScopePopup />}
      {narrow && (
        <Button
          aria-label={t.settings.closeSettings}
          className="text-(--ui-text-tertiary) hover:text-foreground"
          onClick={() => {
            triggerHaptic('close')
            onClose()
          }}
          size="icon-sm"
          variant="ghost"
        >
          <X />
        </Button>
      )}
    </header>
  )
}

/**
 * The Hermes Studio Settings window (macOS System Settings): category list
 * with search on the left; header, hero and grouped sections on the right.
 * Every page composes the existing settings components (see page-view.tsx).
 */
export function SettingsWindow({ onClose, onConfigSaved, onMainModelChanged }: SettingsPageProps) {
  const location = useSettingsLocation()
  const { openPage, page, params, section, updateParams } = location
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [drill, setDrill] = useState<null | SettingsDrill>(null)
  const narrow = useMediaQuery(SINGLE_COLUMN_QUERY)
  const onDragStart = useWindowDrag(rootRef)

  useEffect(() => recordFeatureUse(settingsArea(PAGE_METRICS_VIEW[page])), [page])

  // The prototype opens with the search field focused.
  useEffect(() => {
    searchRef.current?.focus({ preventScroll: true })
  }, [])

  useTypeToSearch(searchRef, setQuery)

  const dropSection = useCallback(() => updateParams(next => next.delete('section')), [updateParams])

  useSectionScroll(page, section, params, dropSection)

  const selectPage = useCallback(
    (next: SettingsPageId) => {
      triggerHaptic('selection')
      openPage(next)
      bodyRef.current?.scrollTo({ top: 0 })
    },
    [openPage]
  )

  const openHit = useCallback(
    (hit: WindowSearchHit) => {
      triggerHaptic('selection')
      navigate({ pathname: '/settings', search: hit.search }, { replace: true })
    },
    [navigate]
  )

  const scope = SETTINGS_PAGES[page].scope

  return (
    <SettingsWindowContext.Provider value>
      <SettingsDrillContext.Provider value={setDrill}>
        <div className="flex h-full min-h-0 text-(--ui-text-primary)" data-slot="settings-window" ref={rootRef}>
          {!narrow && (
            <SettingsSidebar
              onClose={onClose}
              onDragStart={onDragStart}
              onOpenHit={openHit}
              onQueryChange={setQuery}
              onSelect={selectPage}
              page={page}
              query={query}
              searchRef={searchRef}
            />
          )}
          <main className="flex min-w-0 flex-1 flex-col bg-(--ui-bg-inspector)" data-slot="settings-main">
            <SettingsHeader
              drill={drill}
              narrow={narrow}
              onClose={onClose}
              onDragStart={onDragStart}
              onSelect={selectPage}
              page={page}
            />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-1" ref={bodyRef}>
              <div
                className="mx-auto flex max-w-[40rem] flex-col gap-[1.375rem] animate-[studio-fade-in_180ms_both] motion-reduce:animate-none"
                data-settings-page={page}
                key={page}
              >
                {!drill && page !== 'about' && <SettingsHero page={page} />}
                {!drill && scope === 'profile' && <SettingsScopeNote />}
                {/* The window owns page titles (classic pages hide theirs under this flag). */}
                <SettingsBreadcrumbContext.Provider value>
                  <SettingsPageView
                    location={location}
                    onClose={onClose}
                    onConfigSaved={onConfigSaved}
                    onMainModelChanged={onMainModelChanged}
                    page={page}
                  />
                </SettingsBreadcrumbContext.Provider>
              </div>
            </div>
          </main>
        </div>
      </SettingsDrillContext.Provider>
    </SettingsWindowContext.Provider>
  )
}

