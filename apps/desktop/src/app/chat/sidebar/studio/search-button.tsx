import { Codicon } from '@/components/ui/codicon'
import { useI18n } from '@/i18n'
import { useKeybindHint } from '@/lib/keybinds/use-keybind-hint'
import { recordAction } from '@/store/desktop-metrics'
import { openSessionSearch } from '@/store/sidebar-studio'

/**
 * The sidebar's search affordance (prototype `.sb-search`): not a field but a
 * door into ⌘K's Sessions scope, which runs the server's full-text search over
 * every session. ⇧⌘F opens the same scope.
 */
export function SidebarSearchButton() {
  const { t } = useI18n()
  const copy = t.studio.sidebar
  const hint = useKeybindHint('nav.commandPalette')

  return (
    <button
      aria-label={copy.searchAria}
      className="mx-2.5 mb-2 flex h-7.5 shrink-0 items-center gap-1.75 rounded-lg bg-(--ui-fill-2) px-2.25 text-left text-[0.8125rem] text-(--ui-text-tertiary) transition-colors duration-[120ms] hover:bg-(--ui-fill) [-webkit-app-region:no-drag]"
      data-slot="sidebar-search"
      onClick={() => {
        recordAction('session.focusSearch', 'click')
        openSessionSearch()
      }}
      type="button"
    >
      <Codicon name="search" size="0.875rem" />
      <span className="min-w-0 flex-1 truncate">{copy.search}</span>
      {hint && (
        <span aria-hidden="true" className="shrink-0 text-[0.71875rem] tracking-[0.02em] text-(--ui-text-tertiary)">
          {hint}
        </span>
      )}
    </button>
  )
}
