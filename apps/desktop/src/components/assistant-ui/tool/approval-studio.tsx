import { SETTINGS_ROUTE } from '@/app/routes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { Loader2 } from '@/lib/icons'
import type { ApprovalRequest } from '@/store/prompts'
import { requestRoute } from '@/store/recovery-requests'

export type ApprovalChoice = 'once' | 'session' | 'always' | 'deny'

// Approval mode (manual / smart / off) lives in Settings → Safety.
const SAFETY_SETTINGS_ROUTE = `${SETTINGS_ROUTE}?tab=config:safety`

// A plugin `approve` rule escalates through the same gate with a synthetic
// display target (`<tool> (plugin approval rule)`) while the real command /
// change lives in `description` — the user approves a label they cannot act
// on otherwise. Show the description whenever the command is missing or one
// of these synthetic labels; a real command keeps rendering as the command.
const SYNTHETIC_COMMAND_RE = /^<[^>]+> \(/

interface ApprovalDetails {
  /** The block under the title: the command, or the description standing in. */
  details: string
  isCommand: boolean
  /** Why it was flagged (the description), under a real command only. */
  why: string
}

export function approvalDetails(request: ApprovalRequest): ApprovalDetails {
  const command = request.command.trim()
  const description = request.description.trim()

  if (!command || SYNTHETIC_COMMAND_RE.test(command)) {
    return { details: description, isCommand: false, why: '' }
  }

  return { details: command, isCommand: true, why: description === command ? '' : description }
}

/** The allow-wider choices the gateway offered. A Smart DENY owner override
 *  without explicit choices is once/deny only; `allowPermanent: false` hides
 *  the permanent allow. */
export function approvalAllowChoices(request: ApprovalRequest): { always: boolean; session: boolean } {
  const choices = request.choices ?? (request.smartDenied ? ['once', 'deny'] : undefined)

  if (!choices) {
    return { always: request.allowPermanent !== false, session: true }
  }

  return { always: choices.includes('always'), session: choices.includes('session') }
}

interface ApprovalBodyProps {
  busy: boolean
  /** Opens the "always allow" confirm (it persists to config.yaml). */
  onAlwaysAllow: () => void
  onRespond: (choice: ApprovalChoice) => void
  position: number
  request: ApprovalRequest
  submitting: ApprovalChoice | null
  total: number
}

/**
 * Hermes Studio's approval card body (prototype `.appr`): a hand tile, the
 * question and the queue position; the command in a code block with why it
 * was flagged under it; then Reject (Esc) · Allow this session ▾ · Run (↵).
 * Every answer is the gateway's own choice set — nothing here widens it.
 */
export function StudioApprovalBody({
  busy,
  onAlwaysAllow,
  onRespond,
  position,
  request,
  submitting,
  total
}: ApprovalBodyProps) {
  const { t } = useI18n()
  const copy = t.assistant.approval
  const studio = t.studio.chat.transcript
  const { details, isCommand, why } = approvalDetails(request)

  return (
    <div className="studio-appr">
      <div className="studio-appr-head">
        <span aria-hidden className="studio-appr-icon">
          <StudioIcon name="hand" size={15} />
        </span>
        <b>{isCommand ? studio.approvalTitle : studio.approvalTitleAction}</b>
        <span className="studio-appr-count tabular-nums">
          {position} / {total}
        </span>
      </div>
      {details && <pre className="studio-appr-code">{details}</pre>}
      {why && <p className="studio-appr-why">{why}</p>}
      <div className="studio-appr-actions" data-slot="tool-approval-actions">
        <Button
          aria-keyshortcuts="Escape"
          data-approval-deny=""
          disabled={busy}
          onClick={() => onRespond('deny')}
          size="sm"
          variant="secondary"
        >
          {submitting === 'deny' ? <Loader2 className="size-3 animate-spin" /> : copy.reject}
          <span aria-hidden className="studio-btn-kbd">
            Esc
          </span>
        </Button>
        <span className="flex-1" />
        <AllowSplit busy={busy} onAlwaysAllow={onAlwaysAllow} onRespond={onRespond} request={request} />
        <Button
          aria-keyshortcuts="Enter"
          data-approval-run=""
          disabled={busy}
          onClick={() => onRespond('once')}
          size="sm"
        >
          {submitting === 'once' ? <Loader2 className="size-3 animate-spin" /> : copy.run}
          <span aria-hidden className="studio-btn-kbd">
            ↵
          </span>
        </Button>
      </div>
    </div>
  )
}

interface AllowSplitProps {
  busy: boolean
  onAlwaysAllow: () => void
  onRespond: (choice: ApprovalChoice) => void
  request: ApprovalRequest
}

/** "Allow this session" fused to a chevron with the wider choices and the
 *  way to the approval mode. Absent when the gateway offered only once/deny. */
function AllowSplit({ busy, onAlwaysAllow, onRespond, request }: AllowSplitProps) {
  const { t } = useI18n()
  const copy = t.assistant.approval
  const allow = approvalAllowChoices(request)

  if (!allow.session && !allow.always) {
    return null
  }

  // Defer one tick so the menu fully unmounts before the dialog mounts —
  // otherwise Radix's focus-return races the dialog and dismisses it.
  const confirmAlways = () => setTimeout(onAlwaysAllow, 0)

  return (
    <div className="studio-split">
      <Button
        disabled={busy}
        onClick={allow.session ? () => onRespond('session') : onAlwaysAllow}
        size="sm"
        variant="secondary"
      >
        {allow.session ? copy.allowSession : copy.alwaysAllowMenu}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label={copy.moreOptions} disabled={busy} size="sm" variant="secondary">
            <StudioIcon name="chev-d" size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44" side="top">
          {allow.session && (
            <DropdownMenuItem onSelect={() => onRespond('session')}>{copy.allowSession}</DropdownMenuItem>
          )}
          {allow.always && <DropdownMenuItem onSelect={confirmAlways}>{copy.alwaysAllowMenu}</DropdownMenuItem>}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => requestRoute(SAFETY_SETTINGS_ROUTE)}>
            {t.studio.chat.transcript.approvalMode}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
