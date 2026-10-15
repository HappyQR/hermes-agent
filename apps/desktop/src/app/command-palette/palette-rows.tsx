import { memo, useDeferredValue } from 'react'

import { CommandGroup, CommandItem } from '@/components/ui/command'
import { HighlightMatches } from '@/components/ui/highlight-matches'
import { StudioIcon } from '@/components/ui/studio-icon'
import { formatCombo } from '@/lib/keybinds/combo'
import { cn } from '@/lib/utils'
import { bindingsFor } from '@/store/keybinds'

import { paletteValue } from './ranking'
import type { PaletteGroup, PaletteItem } from './types'

// Sentence-case group headings (prototype .pal-group): plain tertiary text,
// no sticky chrome bar. Targets the cmdk heading via the descendant variant.
const PAL_HEADING =
  'p-0 **:[[cmdk-group-heading]]:static **:[[cmdk-group-heading]]:bg-transparent **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:pb-1 **:[[cmdk-group-heading]]:pt-2.5 **:[[cmdk-group-heading]]:text-[0.71875rem] **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-(--ui-text-tertiary)'

// The prototype .pal-item: 34px rows on 9px corners; the highlighted row takes
// the accent fill with white text, tile, notes and key hints.
const PAL_ITEM =
  'group/pal min-h-[2.125rem] gap-2.5 rounded-[9px] px-2 py-1 text-[0.84375rem] text-(--ui-text-primary) data-[selected=true]:bg-primary data-[selected=true]:text-(--ui-on-accent)'

// A note after the label: `muted` is a passive fact (a version, a path), `state`
// a value the row will change (a toggle's on/off) — it keeps the label colour
// and earns its separation from a faint underline.
const DETAIL_VARIANT: Record<NonNullable<PaletteItem['detailVariant']>, string> = {
  muted: 'truncate text-(--ui-text-tertiary) group-data-[selected=true]/pal:text-white/80',
  state: 'shrink-0 underline decoration-current/50 underline-offset-2'
}

const EMPTY_GROUPS: PaletteGroup[] = []

/**
 * The palette's row list, split out so an OPENING palette paints before it
 * renders rows. This component mounts with the portal, so `useDeferredValue`'s
 * initial value applies per open: the first commit is the frame + input
 * (instant), and the several-hundred-row list arrives in an interruptible
 * follow-up render. Opening ⌘K must never wait on building the list.
 */
export const PaletteGroups = memo(function PaletteGroups({
  bindings,
  groups,
  modHeld,
  noResultsLabel,
  onSelectItem,
  onSelectMods,
  search
}: {
  bindings: Record<string, string[]>
  groups: PaletteGroup[]
  modHeld: boolean
  noResultsLabel: string
  onSelectItem: (item: PaletteItem) => void
  onSelectMods: (event: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => void
  search: string
}) {
  const deferred = useDeferredValue(groups, EMPTY_GROUPS)
  // While the rows are still catching up, an empty list means "not rendered
  // yet", not "nothing matched" — don't flash the empty state on open.
  const pending = deferred !== groups

  return (
    <>
      {/* Filtering happens in rankGroups, so cmdk's own CommandEmpty
          (keyed to its internal filter count) would never fire. */}
      {deferred.length === 0 && !pending && (
        <div className="py-6 text-center text-[0.8125rem] text-(--ui-text-tertiary)">{noResultsLabel}</div>
      )}
      {deferred.map((group, index) => (
        <CommandGroup className={PAL_HEADING} heading={group.heading} key={group.key ?? group.heading ?? `palette-group-${index}`}>
          {group.items.map(item => (
            <PaletteRow
              bindings={bindings}
              item={item}
              key={item.id}
              modHeld={modHeld}
              onSelectItem={onSelectItem}
              onSelectMods={onSelectMods}
              search={search}
            />
          ))}
        </CommandGroup>
      ))}
    </>
  )
})

function PaletteRowIcon({ item }: { item: PaletteItem }) {
  const Icon = item.icon

  return (
    <span
      aria-hidden
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-(--ui-fill-2) text-(--ui-text-secondary) group-data-[selected=true]/pal:bg-white/20 group-data-[selected=true]/pal:text-(--ui-on-accent) [&>svg]:size-3.5"
    >
      {item.glyph ? <StudioIcon name={item.glyph} size={14} /> : Icon ? <Icon /> : null}
    </span>
  )
}

const PaletteRow = memo(function PaletteRow({
  bindings,
  item,
  modHeld,
  onSelectMods,
  onSelectItem,
  search
}: {
  bindings: Record<string, string[]>
  item: PaletteItem
  modHeld: boolean
  onSelectMods: (event: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => void
  onSelectItem: (item: PaletteItem) => void
  search: string
}) {
  // The row's live keybind, else a static modifier-variant hint (⌘↵).
  // `bindingsFor`, not a raw lookup: a plugin's action is contributed after
  // $bindings was seeded, so its combo only resolves through the fallback chain.
  const combo = (item.action ? bindingsFor(item.action, bindings)[0] : undefined) ?? item.comboHint
  // While ⌘/⌃ is held, a row with a modifier variant previews it: the label
  // swaps to the variant's copy so Enter reads as what it will actually do.
  const modPreview = modHeld && Boolean(item.modLabel)

  return (
    <CommandItem
      className={PAL_ITEM}
      keywords={item.keywords}
      onMouseDown={onSelectMods}
      onSelect={() => onSelectItem(item)}
      value={paletteValue(item)}
    >
      <PaletteRowIcon item={item} />
      <span className="flex min-w-0 flex-1 items-baseline gap-2 overflow-hidden whitespace-nowrap">
        <span className={cn('truncate', modPreview && 'opacity-80')}>
          {modPreview ? (
            item.modLabel
          ) : (
            /* Same per-term split as scoreItem's AND matcher, so the emphasis
               shows exactly which words earned the row its rank. Bold, not
               accent: the highlighted row is already accent-filled. */
            <HighlightMatches className="font-bold text-current" query={search.split(/\s+/)} text={item.label} />
          )}
        </span>
        {item.detail && (
          <span className={cn('min-w-0 text-xs', DETAIL_VARIANT[item.detailVariant ?? 'muted'])}>{item.detail}</span>
        )}
      </span>
      {combo && (
        <span className="shrink-0 text-[0.71875rem] tracking-[0.02em] text-(--ui-text-tertiary) group-data-[selected=true]/pal:text-white/80">
          {formatCombo(combo)}
        </span>
      )}
      {item.to && (
        <StudioIcon
          className="shrink-0 text-(--ui-text-tertiary) group-data-[selected=true]/pal:text-white/80"
          name="chev-r"
          size={13}
        />
      )}
      {item.active && <StudioIcon className="shrink-0" name="check" size={14} />}
    </CommandItem>
  )
})
