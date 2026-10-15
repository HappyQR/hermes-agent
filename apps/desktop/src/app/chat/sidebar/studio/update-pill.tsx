import { useStore } from '@nanostores/react'

import { StudioIcon } from '@/components/ui/studio-icon'
import type { DesktopUpdateStatus } from '@/global'
import { type Translations, useI18n } from '@/i18n'
import { $connection } from '@/store/session'
import {
  $backendUpdateApply,
  $backendUpdateStatus,
  $updateApply,
  $updateStatus,
  openUpdateOverlayFor,
  type UpdateApplyState,
  type UpdateTarget
} from '@/store/updates'

interface PillState {
  target: UpdateTarget
  headline: string
  detail: string
}

// A rollback (the checkout already holds the release) is not news to announce.
function waiting(status: DesktopUpdateStatus | null): boolean {
  return !status?.rollback && ((status?.behind ?? 0) > 0 || Boolean(status?.updateAvailable))
}

function busy(apply: UpdateApplyState): boolean {
  return apply.applying || apply.stage === 'restart'
}

/** What the pill says for one target, or null when that target has nothing to show. */
export function updatePillState(
  target: UpdateTarget,
  status: DesktopUpdateStatus | null,
  apply: UpdateApplyState,
  copy: Translations['studio']['sidebar']['footer']
): null | PillState {
  if (!waiting(status) && !busy(apply)) {
    return null
  }

  const tag = status?.channel === 'stable' ? status.latestTag : null
  const behind = status?.behind ?? 0

  const headline =
    target === 'backend' ? copy.updateBackend : tag ? copy.updateAvailable(`Hermes ${tag}`) : copy.updateGeneric

  const detail =
    apply.stage === 'restart'
      ? copy.updateRestart
      : apply.applying
        ? copy.updateApplying
        : !tag && behind > 0
          ? copy.updateBehind(behind)
          : copy.updateView

  return { detail, headline, target }
}

/**
 * The footer's update card (prototype `.sb-update`): shown while this app —
 * or, on a remote connection, its backend — has an update waiting or is
 * applying one. A click opens the updates overlay for that target; the pill
 * never starts an install itself.
 */
export function SidebarUpdatePill() {
  const { t } = useI18n()
  const copy = t.studio.sidebar.footer
  const clientStatus = useStore($updateStatus)
  const clientApply = useStore($updateApply)
  const backendStatus = useStore($backendUpdateStatus)
  const backendApply = useStore($backendUpdateApply)
  const remote = useStore($connection)?.mode === 'remote'

  const state =
    updatePillState('client', clientStatus, clientApply, copy) ??
    (remote ? updatePillState('backend', backendStatus, backendApply, copy) : null)

  if (!state) {
    return null
  }

  return (
    <button
      className="flex w-full min-w-0 items-center gap-2 rounded-[9px] bg-(--ui-accent-softer) px-2.5 py-2 text-left text-xs text-foreground shadow-[inset_0_0_0_0.5px_color-mix(in_srgb,var(--ui-accent)_30%,transparent)] transition-colors duration-[120ms] hover:bg-(--ui-accent-soft) motion-safe:animate-[studio-pop-in_200ms_var(--studio-spring)_both] [-webkit-app-region:no-drag]"
      data-slot="sidebar-update"
      data-update-target={state.target}
      onClick={() => openUpdateOverlayFor(state.target)}
      type="button"
    >
      <StudioIcon className="shrink-0 text-(--ui-accent)" name="update" size={16} />
      <span className="flex min-w-0 flex-1 flex-col leading-[1.35]">
        <b className="truncate font-semibold">{state.headline}</b>
        <span className="truncate text-(--ui-text-tertiary)">{state.detail}</span>
      </span>
    </button>
  )
}
