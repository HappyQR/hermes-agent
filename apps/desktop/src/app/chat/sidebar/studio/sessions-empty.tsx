import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { clearStudioSidebarFilters } from '@/store/sidebar-studio'

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

/** The list's quiet empty line (no sessions yet, everything pinned, an empty project). */
export function SessionsQuietEmpty({ text }: { text: string }) {
  return (
    <div className="mx-2 mt-0.5 mb-1.5 rounded-lg px-2.5 py-2 text-xs text-(--ui-text-tertiary) shadow-[inset_0_0_0_1px_var(--ui-line)]">
      {text}
    </div>
  )
}
