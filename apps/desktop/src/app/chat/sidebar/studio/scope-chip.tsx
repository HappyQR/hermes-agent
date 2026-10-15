import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'

/**
 * The Sessions header's project scope chip (prototype `.sb-scope`): the list
 * shows only this project's sessions until the ✕ clears it.
 */
export function SidebarScopeChip({ label, onClear }: { label: string; onClear: () => void }) {
  const { t } = useI18n()
  const copy = t.studio.sidebar.scope

  return (
    <span
      className="ml-1 inline-flex h-4.5 max-w-32 min-w-0 shrink items-center gap-0.5 rounded-full bg-(--ui-accent-soft) pr-0.5 pl-1.75 text-[0.6875rem] font-semibold text-(--ui-accent-text) motion-safe:animate-[studio-pop-in_200ms_var(--studio-spring)_both]"
      data-slot="sidebar-scope-chip"
    >
      <Tip label={copy.tip} placement="row">
        <span className="flex min-w-0 items-center gap-0.5">
          <StudioIcon name="folder" size={11} />
          <span className="min-w-0 truncate">{label}</span>
        </span>
      </Tip>
      <Tip label={copy.clear} placement="row">
        <button
          aria-label={copy.clear}
          className="grid size-3.75 shrink-0 place-items-center rounded-full text-current hover:bg-[color-mix(in_srgb,var(--ui-accent)_22%,transparent)]"
          onClick={event => {
            event.stopPropagation()
            onClear()
          }}
          type="button"
        >
          <StudioIcon name="x" size={9} stroke={2.4} />
        </button>
      </Tip>
    </span>
  )
}
