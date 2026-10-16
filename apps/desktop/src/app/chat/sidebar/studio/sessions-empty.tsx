import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { clearStudioSidebarFilters } from '@/store/sidebar-studio'

import { SIDEBAR_ROW_INSET, SIDEBAR_ROW_LEAD, SIDEBAR_ROW_MIN_H, SIDEBAR_TRUNCATED_LEADING } from '../row-geometry'

/** Filtered down to nothing (prototype `.sb-empty-pin`): say the filters are
 *  why the list is bare, and offer the way back. */
export function SessionsFilteredEmpty() {
  const { t } = useI18n()
  const copy = t.studio.sidebar.sessions

  return (
    <div className="mx-2 mt-0.5 mb-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg px-2.5 py-2 text-xs text-(--ui-text-tertiary) shadow-[inset_0_0_0_1px_var(--ui-line)]">
      <span>{copy.noMatches}</span>
      <Button onClick={clearStudioSidebarFilters} size="xs" variant="text">
        {copy.clearFilters}
      </Button>
    </div>
  )
}

/** The list's quiet empty line (no sessions yet, everything pinned, an empty
 *  project): plain secondary text on the rows' own geometry, so it lines up
 *  with the titles it stands in for instead of reading as a framed field. */
export function SessionsQuietEmpty({ text }: { text: string }) {
  return (
    <div className={cn(SIDEBAR_ROW_MIN_H, SIDEBAR_ROW_INSET, 'text-[0.8125rem] text-(--ui-text-tertiary)')}>
      <span aria-hidden="true" className={SIDEBAR_ROW_LEAD} />
      <span className={cn('min-w-0 truncate', SIDEBAR_TRUNCATED_LEADING)}>{text}</span>
    </div>
  )
}
