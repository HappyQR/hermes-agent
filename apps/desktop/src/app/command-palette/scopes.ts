import { atom } from 'nanostores'

import type { StudioIconName } from '@/components/ui/studio-icon'

/**
 * ⌘K scopes (prototype .pal-scopes): All / Sessions & Projects / Pages / Commands / Settings.
 * Every palette group carries the scope it belongs to; a scoped view lists
 * its groups even with an empty query.
 */
export type PaletteScopeId = 'actions' | 'all' | 'pages' | 'sessions' | 'settings'

export const PALETTE_SCOPES: readonly PaletteScopeId[] = ['all', 'sessions', 'pages', 'actions', 'settings']

/**
 * Palette page ids (`openCommandPalettePage(id)`) that open a scope instead of a
 * nested page: Settings' type-to-search opens `settings`; the sessions sidebar
 * opens `sessions` for its full-text search.
 */
export const SCOPE_PAGES: Readonly<Record<string, PaletteScopeId>> = {
  sessions: 'sessions',
  settings: 'settings'
}

export function cycleScope(current: PaletteScopeId, step: 1 | -1): PaletteScopeId {
  const index = PALETTE_SCOPES.indexOf(current)

  return PALETTE_SCOPES[(index + step + PALETTE_SCOPES.length) % PALETTE_SCOPES.length]
}

// ── External sources ─────────────────────────────────────────────────────────
// The seam for data the palette does not own: a source publishes groups for a
// scope while the palette is open, keyed by its own id, and reads the live query
// from `$paletteQuery`. The sessions area's server full-text search is the
// intended first source: it registers under scope `sessions`, answers the
// query, and the palette lists its hits under that scope (and offers a
// "Search all session content" row from All once the source exists).

export interface PaletteExternalItem {
  detail?: string
  glyph?: StudioIconName
  id: string
  keywords?: string[]
  label: string
  /** Modifiers of the selecting event (⌘-Enter / ⌘-click opens a new tab, ⇧⌘ a window). */
  run: (event?: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }) => void
}

export interface PaletteExternalGroup {
  heading: string
  items: PaletteExternalItem[]
}

export interface PaletteSource {
  groups: PaletteExternalGroup[]
  scope: PaletteScopeId
}

/** The palette's live query, published while it is open (empty when closed). */
export const $paletteQuery = atom('')

/** The palette's active scope, published while it is open. */
export const $paletteScope = atom<PaletteScopeId>('all')

/** Source id → what it currently answers. A source present with no groups yet still counts as registered. */
export const $paletteSources = atom<Record<string, PaletteSource>>({})

export function setPaletteSource(id: string, source: null | PaletteSource): void {
  const next = { ...$paletteSources.get() }

  if (source) {
    next[id] = source
  } else {
    delete next[id]
  }

  $paletteSources.set(next)
}

export function hasPaletteSource(sources: Record<string, PaletteSource>, scope: PaletteScopeId): boolean {
  return Object.values(sources).some(source => source.scope === scope)
}

// ── Scope selection ──────────────────────────────────────────────────────────

export interface ScopedGroup {
  heading?: string
  items: readonly unknown[]
  scope: PaletteScopeId
  /** Listed only once the user types (long, granular lists). */
  typedOnly?: boolean
}

/**
 * The groups a scope shows before ranking. With a query: every group in the
 * scope (all of them under All). Without one, All is the curated landing
 * (recent sessions, Go to, the first few commands) and a scope lists its groups
 * minus the typed-only ones.
 */
export function groupsForScope<G extends ScopedGroup>({
  commandsPreview = 6,
  groups,
  query,
  recent,
  scope
}: {
  commandsPreview?: number
  groups: readonly G[]
  query: string
  recent?: G
  scope: PaletteScopeId
}): G[] {
  if (query.trim()) {
    return groups.filter(group => scope === 'all' || group.scope === scope)
  }

  if (scope !== 'all') {
    return groups.filter(group => group.scope === scope && !group.typedOnly)
  }

  const pages = groups.filter(group => group.scope === 'pages' && !group.typedOnly).slice(0, 1)
  const actions = groups.find(group => group.scope === 'actions' && !group.typedOnly)
  const landing: G[] = []

  if (recent && recent.items.length > 0) {
    landing.push(recent)
  }

  landing.push(...pages)

  if (actions) {
    landing.push({ ...actions, items: actions.items.slice(0, commandsPreview) })
  }

  return landing
}
