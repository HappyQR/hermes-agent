/**
 * Hermes Studio — the sidebar's own view state (fork-owned; upstream never
 * touches this file, so the redesign's persisted knobs stay out of the hot
 * `store/layout.ts`).
 *
 * Every key here is GLOBAL presentation state for this window's sidebar — none
 * is scoped to a profile, connection or session — so `migrateTilesForProfile` /
 * `dropTilesForProfile` are unaffected.
 */
import { atom, computed, type ReadableAtom } from 'nanostores'

import { type Codec, Codecs, persistentAtom } from '@/lib/persisted'
import { openCommandPalettePage } from '@/store/command-palette'
import {
  $sidebarGrouping,
  $sidebarViewCustomized,
  resetSidebarView,
  SESSION_SEARCH_FOCUS_EVENT,
  setSidebarGrouping,
  type SidebarGrouping
} from '@/store/layout'
import { $sessionListDensity, setSessionListDensity } from '@/store/session-list-density'

// ── Section collapse ─────────────────────────────────────────────────────────

/** Built-in sidebar sections; contributed sections use their contribution id. */
export type SidebarSectionId = 'pinned' | 'projects' | 'sessions' | (string & {})

const SECTION_COLLAPSED_KEY = 'hermes.desktop.studio.sidebarSectionsCollapsed'

const sectionCollapsedCodec: Codec<Record<string, boolean>> = Codecs.json(value =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'))
    : {}
)

/** Collapsed flag per section id. Absent = the section's own default. */
export const $sidebarSectionCollapsed = persistentAtom<Record<string, boolean>>(
  SECTION_COLLAPSED_KEY,
  {},
  sectionCollapsedCodec
)

/** Sections on screen right now (ids + their defaults), so "Collapse all"
 *  folds every one of them — including sections never toggled by hand. */
export const $sidebarMountedSections = atom<Record<string, boolean>>({})

export function sidebarSectionCollapsed(
  collapsed: Readonly<Record<string, boolean>>,
  id: SidebarSectionId,
  defaultCollapsed = false
): boolean {
  return collapsed[id] ?? defaultCollapsed
}

export function setSidebarSectionCollapsed(id: SidebarSectionId, value: boolean): void {
  const current = $sidebarSectionCollapsed.get()

  if (current[id] !== value) {
    $sidebarSectionCollapsed.set({ ...current, [id]: value })
  }
}

export function toggleSidebarSection(id: SidebarSectionId, defaultCollapsed = false): void {
  setSidebarSectionCollapsed(id, !sidebarSectionCollapsed($sidebarSectionCollapsed.get(), id, defaultCollapsed))
}

/** Fold or unfold every section currently mounted. */
export function setAllSidebarSectionsCollapsed(value: boolean): void {
  const next = { ...$sidebarSectionCollapsed.get() }

  for (const id of Object.keys($sidebarMountedSections.get())) {
    next[id] = value
  }

  $sidebarSectionCollapsed.set(next)
}

export function registerSidebarSection(id: SidebarSectionId, defaultCollapsed: boolean): () => void {
  $sidebarMountedSections.set({ ...$sidebarMountedSections.get(), [id]: defaultCollapsed })

  return () => {
    const { [id]: _gone, ...rest } = $sidebarMountedSections.get()

    $sidebarMountedSections.set(rest)
  }
}

// ── Session search ───────────────────────────────────────────────────────────

/** The sidebar's search button and ⇧⌘F: ⌘K on its Sessions scope (server
 *  full-text search). The focus event still fires for the usage metrics. */
export function openSessionSearch(): void {
  window.dispatchEvent(new CustomEvent(SESSION_SEARCH_FOCUS_EVENT))
  openCommandPalettePage('sessions')
}

// ── Grouping ─────────────────────────────────────────────────────────────────

/** The six groupings the View options panel offers. `time` is the upstream
 *  `date` grouping; `source` and `none` exist only in the fork. */
export type StudioGrouping = 'none' | 'profile' | 'project' | 'source' | 'status' | 'time'

export const STUDIO_GROUPING_ORDER: readonly StudioGrouping[] = ['time', 'project', 'status', 'source', 'profile', 'none']

type GroupingOverride = 'none' | 'source'

const GROUPING_OVERRIDE_KEY = 'hermes.desktop.studio.sidebarGroupingOverride'

const groupingOverrideCodec: Codec<GroupingOverride | null> = {
  decode: raw => (raw === 'none' || raw === 'source' ? raw : null),
  encode: value => value
}

// `source` and `none` cannot live in upstream's grouping codec, so they ride on
// top of it: while an override is set the upstream grouping rests on `date`
// (never `project`, which would keep the project tree's fetches running).
export const $sidebarGroupingOverride = persistentAtom<GroupingOverride | null>(
  GROUPING_OVERRIDE_KEY,
  null,
  groupingOverrideCodec
)

const fromUpstream = (grouping: SidebarGrouping): StudioGrouping => (grouping === 'date' ? 'time' : grouping)

export const $sidebarEffectiveGrouping: ReadableAtom<StudioGrouping> = computed(
  [$sidebarGrouping, $sidebarGroupingOverride],
  (grouping, override) => override ?? fromUpstream(grouping)
)

export function setStudioGrouping(grouping: StudioGrouping): void {
  if (grouping === 'none' || grouping === 'source') {
    if ($sidebarGrouping.get() === 'project') {
      setSidebarGrouping('date')
    }

    $sidebarGroupingOverride.set(grouping)

    return
  }

  $sidebarGroupingOverride.set(null)
  setSidebarGrouping(grouping === 'time' ? 'date' : grouping)
}

/** `view.cycleSidebarGrouping`: walk all six groupings. */
export function cycleStudioGrouping(): void {
  const index = STUDIO_GROUPING_ORDER.indexOf($sidebarEffectiveGrouping.get())

  setStudioGrouping(STUDIO_GROUPING_ORDER[(index + 1) % STUDIO_GROUPING_ORDER.length])
}

// ── Source filter ────────────────────────────────────────────────────────────

const SOURCE_FILTER_KEY = 'hermes.desktop.studio.sidebarSourceFilter'

/** Source buckets (`desktop`, `cron`, or a messaging platform id) to show. */
export const $sidebarSourceFilter = persistentAtom<string[]>(SOURCE_FILTER_KEY, [], Codecs.stringArray)

export function toggleSidebarSourceFilter(source: string): void {
  const current = $sidebarSourceFilter.get()

  $sidebarSourceFilter.set(current.includes(source) ? current.filter(id => id !== source) : [...current, source])
}

// ── Preview line ─────────────────────────────────────────────────────────────

const PREVIEW_LINE_KEY = 'hermes.desktop.studio.sidebarPreviewLine'

/** "Preview" in View options for one-line rows: adds the first-message line.
 *  The Inbox card keeps upstream's own `preview` row meta. */
export const $sidebarPreviewLine = persistentAtom(PREVIEW_LINE_KEY, false, Codecs.bool)

export function setSidebarPreviewLine(on: boolean): void {
  $sidebarPreviewLine.set(on)
}

// ── Reset ────────────────────────────────────────────────────────────────────

export const SIDEBAR_DEFAULT_DENSITY = 'comfortable' as const

/** Anything in View options moved off the shipped view. */
export const $studioViewCustomized: ReadableAtom<boolean> = computed(
  [$sidebarViewCustomized, $sidebarGroupingOverride, $sidebarSourceFilter, $sidebarPreviewLine, $sessionListDensity],
  (customized, override, sources, previewLine, density) =>
    customized || override !== null || sources.length > 0 || previewLine || density !== SIDEBAR_DEFAULT_DENSITY
)

/** Filters that hide rows — what the empty state's "Clear filters" undoes. */
export function clearStudioSidebarFilters(): void {
  resetSidebarView()
  $sidebarGroupingOverride.set(null)
  $sidebarSourceFilter.set([])
}

/** "Restore defaults": every View options knob back to the shipped view. */
export function resetStudioSidebarView(): void {
  clearStudioSidebarFilters()
  $sidebarPreviewLine.set(false)
  setSessionListDensity(SIDEBAR_DEFAULT_DENSITY)
}
