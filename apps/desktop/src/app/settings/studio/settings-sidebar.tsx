import { type KeyboardEvent, type PointerEvent, type RefObject, useEffect, useState } from 'react'

import { IconTile } from '@/app/overlays/studio/icon-tile'
import { Button } from '@/components/ui/button'
import { HighlightMatches } from '@/components/ui/highlight-matches'
import { SearchField } from '@/components/ui/search-field'
import { Tip } from '@/components/ui/tooltip'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { X } from '@/lib/icons'
import { isMacPlatform } from '@/lib/platform'
import { cn } from '@/lib/utils'

import { SETTINGS_PAGE_GROUPS, SETTINGS_PAGES, type SettingsPageId } from './categories'
import { useWindowSearch, type WindowSearchHit } from './use-window-search'

/** The icon-only rail breakpoint (prototype styles.css @media max-width 860px). */
export const SETTINGS_RAIL_QUERY = '(max-width: 860px)'

const ITEM_CLASS =
  'flex w-full items-center gap-[0.5625rem] rounded-[7px] px-2 text-left text-[0.8125rem] transition-colors duration-100'

/** macOS window controls: red closes; minimize/zoom are disabled (it is a panel). */
function WindowControls({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()

  if (!isMacPlatform()) {
    return (
      <Button
        aria-label={t.settings.closeSettings}
        className="text-(--ui-text-tertiary) hover:text-foreground"
        onClick={() => {
          triggerHaptic('close')
          onClose()
        }}
        size="icon-xs"
        variant="ghost"
      >
        <X />
      </Button>
    )
  }

  return (
    <div className="group/traffic flex items-center gap-2" data-slot="settings-traffic-lights">
      <button
        aria-label={t.settings.closeSettings}
        className="relative grid size-3 place-items-center rounded-full bg-(--set-traffic-close) shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.2)] outline-none focus-visible:ring-2 focus-visible:ring-(--ui-accent-soft)"
        onClick={() => {
          triggerHaptic('close')
          onClose()
        }}
        type="button"
      >
        <X className="size-2 stroke-[3] text-(--set-traffic-glyph) opacity-0 transition-opacity duration-100 group-hover/traffic:opacity-100 group-focus-within/traffic:opacity-100" />
      </button>
      <span aria-hidden className="size-3 rounded-full bg-(--ui-fill) shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.12)]" />
      <span aria-hidden className="size-3 rounded-full bg-(--ui-fill) shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.12)]" />
    </div>
  )
}

function NavItem({
  active,
  id,
  label,
  onSelect,
  rail
}: {
  active: boolean
  id: SettingsPageId
  label: string
  onSelect: () => void
  rail: boolean
}) {
  const spec = SETTINGS_PAGES[id]

  const item = (
    <button
      aria-current={active ? 'page' : undefined}
      aria-label={rail ? label : undefined}
      className={cn(
        ITEM_CLASS,
        'h-[1.875rem]',
        rail && 'justify-center px-0',
        active ? 'bg-primary text-(--ui-on-accent)' : 'text-(--ui-text-primary) hover:bg-(--ui-hover)'
      )}
      data-tour={`nav-${id}`}
      onClick={onSelect}
      type="button"
    >
      <IconTile glyph={spec.glyph} size={22} tone={spec.tone} />
      {!rail && <span className="min-w-0 flex-1 truncate">{label}</span>}
    </button>
  )

  return rail ? (
    <Tip label={label} placement="left-rail">
      {item}
    </Tip>
  ) : (
    item
  )
}

function SearchResults({
  hits,
  hot,
  onOpen,
  query,
  setHot
}: {
  hits: WindowSearchHit[]
  hot: number
  onOpen: (hit: WindowSearchHit) => void
  query: string
  setHot: (index: number) => void
}) {
  const { t } = useI18n()

  if (hits.length === 0) {
    return (
      <div className="px-2 py-2 text-[0.78125rem] text-(--ui-text-tertiary)">
        {t.studio.settings.window.noResults(query.trim())}
      </div>
    )
  }

  return (
    <div aria-label={t.studio.settings.window.searchResults} className="flex flex-col gap-px" role="listbox">
      {hits.map((hit, index) => {
        const spec = SETTINGS_PAGES[hit.page]
        const isHot = index === hot

        return (
          <button
            aria-selected={isHot}
            className={cn(
              ITEM_CLASS,
              'items-start py-1.5',
              isHot ? 'bg-primary text-(--ui-on-accent)' : 'text-(--ui-text-primary) hover:bg-(--ui-hover)'
            )}
            data-search-hit={hit.id}
            key={hit.id}
            onClick={() => onOpen(hit)}
            onMouseMove={() => index !== hot && setHot(index)}
            role="option"
            type="button"
          >
            <IconTile glyph={spec.glyph} size={22} tone={spec.tone} />
            <span className="flex min-w-0 flex-1 flex-col leading-[1.3]">
              <span className="truncate">
                <HighlightMatches
                  className={isHot ? 'font-bold text-current' : 'font-semibold'}
                  query={query.trim().split(/\s+/)}
                  text={hit.label}
                />
              </span>
              <span
                className={cn(
                  'truncate text-[0.6875rem]',
                  isHot ? 'text-current opacity-80' : 'text-(--ui-text-tertiary)'
                )}
              >
                {hit.context}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function SettingsSidebar({
  onClose,
  onDragStart,
  onOpenHit,
  onQueryChange,
  onSelect,
  page,
  query,
  searchRef
}: {
  onClose: () => void
  onDragStart: (event: PointerEvent<HTMLElement>) => void
  onOpenHit: (hit: WindowSearchHit) => void
  onQueryChange: (query: string) => void
  onSelect: (page: SettingsPageId) => void
  page: SettingsPageId
  query: string
  searchRef: RefObject<HTMLInputElement | null>
}) {
  const { t } = useI18n()
  const rail = useMediaQuery(SETTINGS_RAIL_QUERY)
  const searching = !rail && query.trim().length > 0
  const hits = useWindowSearch(searching ? query : '')
  const [hot, setHot] = useState(0)

  useEffect(() => setHot(0), [query])

  // Keep the keyboard-selected hit in view.
  useEffect(() => {
    document.querySelector('[data-search-hit][aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [hot])

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setHot(current => Math.max(0, Math.min(hits.length - 1, current + step)))
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing && hits[hot]) {
      event.preventDefault()
      onOpenHit(hits[hot])
    } else if (event.key === 'Escape' && query) {
      // Clear first; a second Esc closes the window (OverlayView skips handled keys).
      event.preventDefault()
      onQueryChange('')
    }
  }

  return (
    <aside
      aria-label={t.studio.settings.window.navLabel}
      className={cn(
        'flex shrink-0 flex-col bg-(--ui-sidebar-surface-background) shadow-[inset_-0.5px_0_0_var(--ui-line-2)]',
        rail ? 'w-16' : 'w-[14.375rem]'
      )}
      data-slot="settings-sidebar"
      data-tour="overlay-nav"
    >
      <div
        className={cn(
          'flex h-[3.25rem] shrink-0 cursor-grab items-center active:cursor-grabbing',
          rail ? 'justify-center' : 'px-[1.125rem]'
        )}
        onPointerDown={onDragStart}
      >
        <WindowControls onClose={onClose} />
      </div>
      {!rail && (
        <div className="shrink-0 px-2.5 pb-2.5">
          <SearchField
            aria-label={t.studio.settings.searchPlaceholder}
            containerClassName="w-full"
            inputClassName="flex-1"
            inputRef={searchRef}
            onChange={onQueryChange}
            onKeyDown={onKeyDown}
            placeholder={t.studio.settings.searchPlaceholder}
            value={query}
            variant="filled"
          />
        </div>
      )}
      <nav className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2.5', rail ? 'px-2' : 'px-2.5')}>
        {searching ? (
          <SearchResults hits={hits} hot={hot} onOpen={onOpenHit} query={query} setHot={setHot} />
        ) : (
          <div className="flex flex-col gap-2.5">
            {SETTINGS_PAGE_GROUPS.map((group, index) => (
              <div className="flex flex-col gap-px" key={index}>
                {group.map(id => (
                  <NavItem
                    active={page === id}
                    id={id}
                    key={id}
                    label={t.studio.settings.pages[id].title}
                    onSelect={() => onSelect(id)}
                    rail={rail}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </nav>
    </aside>
  )
}
