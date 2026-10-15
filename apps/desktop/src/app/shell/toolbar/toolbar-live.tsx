import type { StatusbarItem } from '@/app/shell/statusbar-controls'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { useStoreSelector } from '@/lib/use-session-slice'
import { $subagentsBySession, activeSubagentCount } from '@/store/subagents'

/**
 * Prototype `.tb-live`: while the focused chat runs (or sub-agents work), an
 * accent pill with a spinning ring — "N subagents · 1:23" or "Running · 1:23" —
 * that opens the running agents.
 */
export function LivePill({ onOpen, timer }: { onOpen: () => void; timer: StatusbarItem | undefined }) {
  const { t } = useI18n()

  // Same cross-session running/queued scope as the agents panel it opens.
  const running = useStoreSelector($subagentsBySession, bySession =>
    Object.values(bySession).reduce((sum, items) => sum + activeSubagentCount(items), 0)
  )

  const busy = Boolean(timer && !timer.hidden)

  if (!busy && running === 0) {
    return null
  }

  const label = running > 0 ? t.statusStack.subagents(running) : t.statusStack.running

  return (
    <Tip label={t.studio.shell.toolbar.viewRunningAgents} side="bottom">
      <button
        className="studio-live-pill inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-(--ui-accent-soft) pr-[11px] pl-[9px] text-xs font-semibold whitespace-nowrap text-(--ui-accent-text)"
        data-slot="toolbar-live"
        onClick={onOpen}
        type="button"
      >
        <span aria-hidden="true" className="studio-ring-run size-3" />
        <span>{label}</span>
        {busy && timer?.detail && (
          <>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{timer.detail}</span>
          </>
        )}
      </button>
    </Tip>
  )
}
