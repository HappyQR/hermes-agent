import { normalize } from '@/lib/text'

import type { PaletteGroup, PaletteItem } from './types'

// Ranking happens in React, not cmdk. We score, sort, and prune the groups
// ourselves and hand cmdk an already-ordered list with `shouldFilter={false}`,
// leaving it as pure keyboard/selection machinery. (cmdk's own group
// re-sorting silently no-ops: its sort() queries groups by an internal id that
// never matches the heading text it writes into `data-value`, so groups always
// keep source order — which put a generic keyword match like "Capabilities" on
// top and the auto-highlight on it while an exact "Tools" row sat below.)
//
// cmdk still auto-selects the first DOM item whenever the search changes, so
// rendering best-match-first is what puts the highlight on the best match.
//
// AND semantics: every typed word must appear in the label or keywords. The
// grade rewards matches on the visible label — exact > prefix > whole word >
// word prefix > substring > scattered terms > keyword-only — so typing "tools"
// selects the row that says Tools, not a row that hides it in keywords.
export const scoreItem = (item: PaletteItem, needle: string): number => {
  const label = item.label.toLowerCase()
  const keys = (item.keywords ?? []).join(' ').toLowerCase()
  const terms = needle.split(/\s+/).filter(Boolean)

  if (terms.some(term => !label.includes(term) && !keys.includes(term))) {
    return 0
  }

  if (label === needle) {
    return 1
  }

  if (label.startsWith(needle)) {
    return 0.9
  }

  const words = label.split(/[^\p{L}\p{N}]+/u).filter(Boolean)

  if (words.includes(needle)) {
    return 0.85
  }

  if (words.some(word => word.startsWith(needle))) {
    return 0.8
  }

  if (label.includes(needle)) {
    return 0.7
  }

  if (terms.every(term => label.includes(term))) {
    return 0.6
  }

  // Matched only via keywords — the weakest, generic-row signal.
  return 0.4
}

// Order items within each group by score, order groups by their best item, and
// drop everything that doesn't match. Ties keep their original order (stable
// sort), so curated group/item ordering still breaks even scores. Groups marked
// `unranked` (already ordered by their source) keep their rows and follow.
export const rankGroups = (groups: PaletteGroup[], search: string): PaletteGroup[] => {
  const needle = normalize(search)

  if (!needle) {
    return groups
  }

  const ranked = groups
    .filter(group => !group.unranked)
    .map(group => {
      const scored = group.items
        .map(item => ({ item, score: scoreItem(item, needle) }))
        .filter(entry => entry.score > 0)
        .sort((a, b) => b.score - a.score)

      return { group: { ...group, items: scored.map(entry => entry.item) }, max: scored[0]?.score ?? 0 }
    })
    .filter(entry => entry.max > 0)
    .sort((a, b) => b.max - a.max)
    .map(entry => entry.group)

  return [...ranked, ...groups.filter(group => group.unranked && group.items.length > 0)]
}

// cmdk selection values must be unique; labels alone can repeat (a settings
// field and a session can share a title). The id suffix disambiguates.
export const paletteValue = (item: PaletteItem): string => `${item.label}\u0001${item.id}`
