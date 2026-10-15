import { useStore } from '@nanostores/react'
import { useCallback, useEffect, useMemo } from 'react'

import { useSessionView } from '@/app/chat/session-view'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { setYoloEnabled } from '@/lib/yolo-session'
import {
  $approvalModes,
  type ApprovalMode,
  type ApprovalModeRequester,
  setApprovalModeForProfile,
  syncApprovalModeForProfile
} from '@/store/approval-mode'
import { requestGatewayForProfile } from '@/store/gateway'
import { $activeGatewayProfile } from '@/store/profile'
import { $gatewayState, $yoloActive } from '@/store/session'

import { useComposerScope } from './scope'

const MODES: readonly ApprovalMode[] = ['manual', 'smart', 'off']

/**
 * The approval mode of the profile this composer's session belongs to. With
 * the statusbar hidden by default the composer owns the read: it syncs on
 * mount and whenever the gateway (re)opens, dialling that profile directly —
 * `approvals.mode` is profile-scoped, so the session-routed requester would
 * read another profile's answer.
 */
export function useComposerApprovalMode() {
  const scope = useComposerScope()
  const activeProfile = useStore($activeGatewayProfile)
  const profile = scope.profile ?? activeProfile
  const mode = useStore($approvalModes)[profile.trim() || 'default'] ?? 'smart'
  const gatewayOpen = useStore($gatewayState) === 'open'

  const request = useCallback<ApprovalModeRequester>(
    (method, params) => requestGatewayForProfile(profile, method, params),
    [profile]
  )

  useEffect(() => {
    if (gatewayOpen) {
      void syncApprovalModeForProfile(request, profile).catch(() => undefined)
    }
  }, [gatewayOpen, profile, request])

  const setMode = useCallback(
    (next: ApprovalMode) => void setApprovalModeForProfile(request, profile, next).catch(() => undefined),
    [profile, request]
  )

  return { mode, setMode }
}

/** The three modes as radio rows with their descriptions — the same rows the
 *  statusbar's approval menu shows, one state behind both. */
export function ApprovalModeRadioItems({
  mode,
  onChange
}: {
  mode: ApprovalMode
  onChange: (mode: ApprovalMode) => void
}) {
  const { t } = useI18n()
  const copy = t.shell.approvalMode

  const rows = useMemo(
    () => ({
      manual: { description: copy.manualDescription, label: copy.manual },
      off: { description: copy.offDescription, label: copy.off },
      smart: { description: copy.smartDescription, label: copy.smart }
    }),
    [copy]
  )

  return (
    <DropdownMenuRadioGroup onValueChange={value => onChange(value as ApprovalMode)} value={mode}>
      {MODES.map(value => (
        <DropdownMenuRadioItem className="items-start gap-2" key={value} value={value}>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span>{rows[value].label}</span>
            <span className="text-[0.6875rem] leading-snug text-(--ui-text-tertiary)">{rows[value].description}</span>
          </span>
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}

/**
 * The orange "Auto-approve" pill in the composer row: shown only while
 * commands run without asking — the profile's approval mode is off, or this
 * chat has YOLO on. It opens the same mode menu rather than resetting to a
 * guessed default (the default is Smart, not Manual).
 */
export function ApprovalModePill() {
  const { t } = useI18n()
  const copy = t.studio.chat.composer
  const view = useSessionView()
  const { mode, setMode } = useComposerApprovalMode()
  // YOLO is the primary chat's session flag (`/yolo`, ⌘K, the statusbar zap).
  const yolo = useStore($yoloActive) && view.kind === 'primary'

  if (mode !== 'off' && !yolo) {
    return null
  }

  return (
    <DropdownMenu>
      <Tip label={yolo && mode !== 'off' ? copy.yoloHint : copy.autoApproveHint} placement="control">
        <DropdownMenuTrigger asChild>
          <button className="composer-pill" data-slot="composer-auto-approve" data-tone="warn" type="button">
            <StudioIcon name="bolt" size={13} />
            <span>{copy.autoApprove}</span>
          </button>
        </DropdownMenuTrigger>
      </Tip>
      <DropdownMenuContent align="start" className="w-72" side="top" sideOffset={8}>
        <DropdownMenuLabel>{t.shell.approvalMode.title}</DropdownMenuLabel>
        <ApprovalModeRadioItems mode={mode} onChange={setMode} />
        {yolo && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void setYoloEnabled(false).catch(() => undefined)}>
              {copy.turnOffYolo}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
