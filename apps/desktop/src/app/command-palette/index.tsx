import { useStore } from '@nanostores/react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { leaveIntro } from '@/components/onboarding/first-run/intro'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useI18n } from '@/i18n'
import { $repoWorktrees } from '@/store/coding-status'
import {
  $commandPaletteOpen,
  $commandPalettePage,
  $commandPaletteSeed,
  closeCommandPalette,
  setCommandPaletteOpen
} from '@/store/command-palette'
import { completeFlow, recordAction } from '@/store/desktop-metrics'
import { $bindings } from '@/store/keybinds'
import { $dismissedAutoProjectIds, filterVisibleProjects } from '@/store/layout'
import { openPetGenerate } from '@/store/pet-generate'
import { $projectTree } from '@/store/projects'
import { type ThemeMode, useTheme } from '@/themes/context'

import { openSessionFromPicker, openSessionIntentFromModifiers } from '../open-session'
import { navigateToWorkspacePage } from '../routes'
import { useSettingsSearchCatalog } from '../settings/use-settings-search'

import { usePaletteContributions } from './contrib'
import { MarketplaceThemePage } from './marketplace-theme-page'
import { PaletteFrame } from './palette-frame'
import { PaletteGroups } from './palette-rows'
import { PetInlineToggle, PetPalettePage } from './pet-palette-page'
import { paletteValue, rankGroups } from './ranking'
import { appearanceGroup, branchGroups, commandsGroup, goToGroup, projectGroup, settingsGroup } from './root-groups'
import {
  $paletteQuery,
  $paletteScope,
  $paletteSources,
  cycleScope,
  groupsForScope,
  type PaletteScopeId,
  SCOPE_PAGES
} from './scopes'
import {
  appearanceSearchGroups,
  capabilityGroups,
  directGroups,
  externalGroups,
  recentGroup,
  sessionGroups,
  settingsSearchGroups
} from './search-groups'
import { buildSubPages, type ThemeRowsContext } from './theme-rows'
import type { PaletteItem } from './types'
import { useModifierHeld, usePaletteMcpServers, useUpdateVersionLabel } from './use-palette-data'
import { usePaletteSessions } from './use-palette-sessions'

// Nested page → its parent, so Back / Esc step up one level instead of closing
// the palette. Pages absent here go straight back to the root list.
const PAGE_PARENTS: Record<string, string> = { 'install-theme': 'theme' }

// Backstop only. The palette normally retires on the content's real
// `animationend`, so the CSS owns the close duration; this just guarantees the
// body can't stay mounted forever somewhere animations never run (jsdom,
// `animation: none`). Deliberately longer than any plausible exit so it never
// races the real signal and truncates the fade.
const EXIT_FALLBACK_MS = 1000

interface SelectMods {
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

const NO_MODS: SelectMods = { ctrlKey: false, metaKey: false, shiftKey: false }

/**
 * ⌘K is an overlay that is stateful to itself: pressing it must open a frame
 * immediately, and must not be held up by whatever else the shell is doing. So
 * the mounted cost of a CLOSED palette is one store subscription and nothing
 * else.
 *
 * Everything expensive — a dozen store subscriptions (connection, update
 * status/apply, keybinds, worktrees, projects, theme, i18n), three server
 * queries, and the group builders that assemble a few hundred rows — lives in
 * `CommandPaletteBody`, which only exists while the palette is on screen.
 * Before this split those hooks ran on every render of the always-mounted
 * component: an in-flight update rewrote `$updateApply` per progress line and
 * rebuilt the entire row set each time, for a surface nobody could see.
 *
 * `mounted` lags `open` by the close animation rather than tracking it exactly.
 * Unmounting the body the instant `open` flips false would rip the content out
 * of the tree before Radix could play `data-[state=closed]`, so the overlay
 * would vanish instead of closing. The body reports its own exit via
 * `onExited` (the content's real `animationend`), so nothing here has to know
 * how long that animation is — the CSS owns the duration.
 *
 * The `openCount` key remounts the body per open, which is what lets local
 * search/scope/sub-page state reset without a close effect.
 */
export function CommandPalette() {
  const open = useStore($commandPaletteOpen)
  const [mounted, setMounted] = useState(open)
  const [openCount, setOpenCount] = useState(0)

  const retire = useCallback(() => {
    // Only retire the body if the palette is still closed — a reopen mid-fade
    // must not unmount the fresh instance.
    if (!$commandPaletteOpen.get()) {
      setMounted(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setOpenCount(count => count + 1)
      setMounted(true)

      return
    }

    // Safety net for environments where the exit animation never runs (jsdom,
    // `animation: none`), so the body can't be stranded mounted. The real
    // unmount is `onExited` below; whichever fires first wins.
    const timer = setTimeout(retire, EXIT_FALLBACK_MS)

    return () => clearTimeout(timer)
  }, [open, retire])

  return (
    <DialogPrimitive.Root onOpenChange={setCommandPaletteOpen} open={open}>
      {mounted && <CommandPaletteBody key={openCount} onExited={retire} />}
    </DialogPrimitive.Root>
  )
}

function CommandPaletteBody({ onExited }: { onExited: () => void }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const pendingPage = useStore($commandPalettePage)
  const pendingSeed = useStore($commandPaletteSeed)
  const bindings = useStore($bindings)
  const worktrees = useStore($repoWorktrees)
  const projectTree = useStore($projectTree)
  const dismissedAutoProjects = useStore($dismissedAutoProjectIds)
  const sources = useStore($paletteSources)
  const paletteOpen = useStore($commandPaletteOpen)

  const { availableThemes, clearThemePreview, mode, previewTheme, resolvedMode, setMode, setTheme, themeName } =
    useTheme()

  // Mode rows preview like theme rows do: paint the committed skin at the
  // highlighted brightness. `system` has to be resolved here — previewTheme
  // paints a concrete light/dark.
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')

  // Search, scope and sub-page are local to a mount, and this component
  // remounts per open (keyed by open count), so each open starts clean.
  const [search, setSearch] = useState('')
  const [page, setPage] = useState<null | string>(null)
  const [scope, setScope] = useState<PaletteScopeId>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const modHeld = useModifierHeld()
  const updateVersionLabel = useUpdateVersionLabel()
  const mcpServers = usePaletteMcpServers()
  const { archivedSessions, pinnedSessions, recentSessions, sessions } = usePaletteSessions()
  const contributed = usePaletteContributions()
  // The deep settings catalog; the body mounts per open, so its queries fire
  // on open and stay warm.
  const settingsCatalog = useSettingsSearchCatalog(true)

  // Running a keepOpen row (a toggle) changes state the rows themselves report,
  // so the groups have to rebuild without the palette closing. A counter keeps
  // that generic — the palette never learns which stores its contributions read.
  const [selectTick, setSelectTick] = useState(0)

  // cmdk's onSelect doesn't forward the triggering event — keep the last
  // click/keydown modifiers so session rows can honour ⌘-Enter / ⌘-click.
  const lastSelectMods = useRef<SelectMods>(NO_MODS)

  const noteSelectMods = useCallback((event: SelectMods) => {
    lastSelectMods.current = { ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey }
  }, [])

  const go = useCallback((path: string) => () => navigateToWorkspacePage(navigate, path), [navigate])

  // Sessions: plain select = open beside what's already loaded (focus existing
  // tile/main, else a new tab — main only when it's a blank draft);
  // ⌘/⌃-select / ⌘-Enter = force a new tab; ⇧⌘ = own window. Same door as the
  // sidebar, minus the sidebar's licence to spend main.
  const goSession = useCallback(
    (sessionId: string) => (event?: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }) => {
      openSessionFromPicker(sessionId, navigate, openSessionIntentFromModifiers(event, 'stack'))
    },
    [navigate]
  )

  const themeCtx = useMemo<ThemeRowsContext>(
    () => ({
      availableThemes,
      mode,
      previewTheme,
      resolveThemeMode: (target: ThemeMode) => (target === 'system' ? (systemDark ? 'dark' : 'light') : target),
      resolvedMode,
      setMode,
      setTheme,
      t,
      themeName
    }),
    [availableThemes, mode, previewTheme, resolvedMode, setMode, setTheme, systemDark, t, themeName]
  )

  const searchCtx = useMemo(() => ({ go, goSession, t }), [go, goSession, t])

  // Group order is the tiebreaker rankGroups falls back on (stable sort), and
  // exact ties are the common case — "yolo" hits both "Toggle yolo" and a
  // worktree named bb/yolo-* as a whole word. So this order IS the priority:
  // where you're going, then what you can do, then what you can configure.
  const baseGroups = useMemo(() => {
    const ctx = {
      contributed,
      go,
      projects: filterVisibleProjects(projectTree, dismissedAutoProjects),
      t,
      updateVersionLabel
    }

    return [goToGroup(ctx), projectGroup(ctx), commandsGroup(ctx), appearanceGroup(ctx), settingsGroup(ctx)]
    // `selectTick` is a deliberate re-read trigger, not a value: rows report
    // live state through `detail()`, so the groups must rebuild after a select
    // that kept the palette open — eslint only sees an unused dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contributed, dismissedAutoProjects, go, projectTree, selectTick, t, updateVersionLabel])

  // The long, granular lists. On All they only surface once the user types —
  // otherwise they'd bury the landing; a scope lists the ones not marked
  // typed-only. Branch rows rank last: they scale with whatever worktrees
  // happen to exist, so on a tie they're the least likely thing meant.
  const listGroups = useMemo(
    () => [
      ...capabilityGroups(mcpServers, searchCtx),
      ...appearanceSearchGroups(themeCtx),
      ...sessionGroups({ archivedSessions, pinnedSessions, recentSessions, sessions }, searchCtx),
      ...settingsSearchGroups(settingsCatalog, searchCtx),
      ...branchGroups(worktrees, t)
    ],
    [
      archivedSessions,
      mcpServers,
      pinnedSessions,
      recentSessions,
      searchCtx,
      sessions,
      settingsCatalog,
      t,
      themeCtx,
      worktrees
    ]
  )

  const scopedGroups = useMemo(
    () =>
      groupsForScope({
        groups: [
          ...baseGroups,
          ...directGroups(search, searchCtx),
          ...listGroups,
          ...externalGroups({ onSearchContent: () => setScope('sessions'), query: search, scope, sources, t })
        ],
        query: search,
        recent: recentGroup(recentSessions, searchCtx),
        scope
      }),
    [baseGroups, listGroups, recentSessions, scope, search, searchCtx, sources, t]
  )

  const subPages = useMemo(() => buildSubPages(themeCtx), [themeCtx])
  const activePage = page ? subPages[page] : null

  const visibleGroups = useMemo(
    () => rankGroups(activePage ? activePage.groups : scopedGroups, search),
    [activePage, scopedGroups, search]
  )

  // Deep-link into a nested page (e.g. `/pet list` → pets picker) or a scope
  // (Settings' ⌘K → Settings; the sessions sidebar's full-text search → Sessions & Projects).
  useEffect(() => {
    if (pendingPage) {
      const scoped = SCOPE_PAGES[pendingPage]

      if (scoped) {
        setScope(scoped)
      } else {
        setPage(pendingPage)
      }

      $commandPalettePage.set(null)
    }
  }, [pendingPage])

  // Landing on a page or scope (deep-link open onto Settings, drilling into a
  // submenu, stepping back out, clicking a scope chip) must leave the filter
  // typeable immediately. Radix only autofocuses on mount; a page swap
  // re-renders the same input, and a click moves focus to the button.
  useEffect(() => {
    inputRef.current?.focus()
  }, [page, scope])

  // Type-to-search hand-off: the keystroke that opened the palette (typing on
  // the Settings page) prefills the filter so the first character isn't lost.
  useEffect(() => {
    if (pendingSeed !== null) {
      setSearch(pendingSeed)
      $commandPaletteSeed.set(null)
    }
  }, [pendingSeed])

  // External sources read what the palette is asking for (scopes.ts).
  useEffect(() => $paletteQuery.set(search), [search])
  useEffect(() => $paletteScope.set(scope), [scope])

  useEffect(
    () => () => {
      $paletteQuery.set('')
      $paletteScope.set('all')
    },
    []
  )

  // Step up one nested page (or back to the root list), clearing the filter so
  // the parent page doesn't reopen mid-search.
  const goBack = useCallback(() => {
    setSearch('')
    setPage(prev => (prev ? (PAGE_PARENTS[prev] ?? null) : null))
  }, [])

  // The HighlightWatcher inside <Command> reports the highlighted row (arrows
  // or hover) from the cmdk store. Resolve it back to its PaletteItem so
  // preview-capable rows (the theme pickers) can paint live. Any other
  // highlight clears the preview.
  const itemByValue = useMemo(
    () => new Map(visibleGroups.flatMap(group => group.items.map(item => [paletteValue(item), item] as const))),
    [visibleGroups]
  )

  const handleHighlight = useCallback(
    (value: string) => {
      const item = itemByValue.get(value)

      if (item?.onHighlight) {
        item.onHighlight()
      } else {
        clearThemePreview()
      }
    },
    [clearThemePreview, itemByValue]
  )

  // A preview lives only while its rows show. If the page changes, give the
  // paint back to the committed appearance.
  useEffect(() => {
    clearThemePreview()
  }, [page, clearThemePreview])

  // Clear at close START, not at unmount. The body stays mounted through the
  // whole exit animation (see CommandPalette), so an unmount clear would
  // revert the theme only after the fade. The unmount return is the backstop
  // for a body that dies without a close (a remount on reopen).
  useEffect(() => {
    if (!paletteOpen) {
      clearThemePreview()
    }
  }, [paletteOpen, clearThemePreview])

  useEffect(() => clearThemePreview, [clearThemePreview])

  const handleSelect = useCallback((item: PaletteItem) => {
    if (item.to) {
      setPage(item.to)
      setSearch('')

      return
    }

    completeFlow('command_palette')
    recordAction(item.action ?? 'other', 'palette')
    // A Cmd-K command or layout is a way out of the first-run intro.
    leaveIntro()

    if (item.runWithEvent) {
      item.runWithEvent(lastSelectMods.current)
    } else {
      item.run?.()
    }

    // Clear stashed modifiers so a plain Enter after a ⌘-click isn't sticky.
    lastSelectMods.current = NO_MODS

    if (!item.keepOpen) {
      closeCommandPalette()

      return
    }

    // Staying open means the rows are still on screen — re-read anything they
    // report (a toggle's on/off) so the note isn't showing the previous state.
    setSelectTick(tick => tick + 1)
  }, [])

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Capture modifiers before cmdk's Enter fires onSelect (which swipes the
    // inviting MouseEvent and hands us nothing).
    noteSelectMods(event)

    // Tab / ⇧Tab cycles the scope chips: the palette owns Tab, so the chips
    // stay out of the focus order and the input keeps the keyboard.
    if (!activePage && event.key === 'Tab' && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      event.stopPropagation()
      setScope(current => cycleScope(current, event.shiftKey ? -1 : 1))

      return
    }

    // In a submenu: Esc and empty-input Backspace step back out instead of
    // closing the whole palette.
    if (activePage && (event.key === 'Escape' || (event.key === 'Backspace' && search === ''))) {
      event.preventDefault()
      event.stopPropagation()
      goBack()
    }
  }

  return (
    <PaletteFrame
      activePageTitle={activePage?.title ?? null}
      inputRef={inputRef}
      onBack={goBack}
      onExited={onExited}
      onHighlight={handleHighlight}
      onInputKeyDown={onInputKeyDown}
      onScopeChange={setScope}
      onSearchChange={setSearch}
      placeholder={activePage ? activePage.placeholder : t.studio.overlays.palette.placeholder}
      right={page === 'pets' ? <PetInlineToggle /> : undefined}
      scope={scope}
      search={search}
    >
      {/* Server-driven pages render their own list; the rest show groups. */}
      {page === 'pets' ? (
        <PetPalettePage
          onGenerate={() => {
            closeCommandPalette()
            openPetGenerate()
          }}
          search={search}
        />
      ) : page === 'install-theme' ? (
        <MarketplaceThemePage onPickTheme={setTheme} search={search} />
      ) : (
        <PaletteGroups
          bindings={bindings}
          groups={visibleGroups}
          modHeld={modHeld}
          noResultsLabel={t.commandCenter.noResults}
          onSelectItem={handleSelect}
          onSelectMods={noteSelectMods}
          search={search}
        />
      )}
    </PaletteFrame>
  )
}
