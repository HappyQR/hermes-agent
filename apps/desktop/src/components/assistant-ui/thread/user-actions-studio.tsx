import { ActionBarPrimitive, ComposerPrimitive } from '@assistant-ui/react'
import type { FC } from 'react'

import { MessageHoverTime } from '@/components/assistant-ui/thread/message-hover-time'
import type { RestoreMessageTarget } from '@/components/assistant-ui/thread/types'
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { notifyThreadEditOpen } from '@/store/thread-scroll'

interface UserMessageActionRowProps {
  fullText: string
  messageId: string
  onCancel?: () => Promise<void> | void
  onRequestRestoreConfirm?: (messageId: string, target: RestoreMessageTarget) => void
  /** Spectator transcripts (watch windows) can only copy. */
  readOnly: boolean
  runtimeUserOrdinal: RestoreMessageTarget['userOrdinal']
  showRestore: boolean
  showStop: boolean
}

/**
 * Hermes Studio's prompt actions (prototype `.u-actions`): a row under the
 * bubble — time · edit and rerun · copy · stop (latest prompt while running)
 * or "rerun from here" — revealed on hover or focus. Edit is the same
 * runtime edit the bubble's own click opens; "rerun from here" is the
 * existing restore, behind its confirm. Neither branches nor restores files:
 * later messages are removed and the prompt runs again.
 */
export const UserMessageActionRow: FC<UserMessageActionRowProps> = ({
  fullText,
  messageId,
  onCancel,
  onRequestRestoreConfirm,
  readOnly,
  runtimeUserOrdinal,
  showRestore,
  showStop
}) => {
  const { t } = useI18n()
  const copy = t.assistant.thread

  return (
    <div className="studio-user-actions" data-slot="aui_user-actions">
      <MessageHoverTime className="studio-user-time" />
      {!readOnly && (
        <ActionBarPrimitive.Edit asChild>
          <TooltipIconButton
            onClick={() => triggerHaptic('selection')}
            onPointerDown={() => notifyThreadEditOpen()}
            tooltip={t.studio.chat.transcript.editAndRerun}
          >
            <StudioIcon name="pencil" size={13} />
          </TooltipIconButton>
        </ActionBarPrimitive.Edit>
      )}
      <CopyButton appearance="icon" buttonSize="icon-xs" label={copy.copy} stopPropagation text={fullText} />
      {showStop ? (
        <TooltipIconButton
          onClick={event => {
            event.preventDefault()
            event.stopPropagation()
            void onCancel?.()
          }}
          tooltip={copy.stop}
        >
          <StudioIcon name="stop" size={12} />
        </TooltipIconButton>
      ) : showRestore ? (
        <TooltipIconButton
          onClick={event => {
            event.preventDefault()
            event.stopPropagation()
            triggerHaptic('selection')
            onRequestRestoreConfirm?.(messageId, { text: fullText, userOrdinal: runtimeUserOrdinal })
          }}
          tooltip={copy.restoreFromHere}
        >
          <StudioIcon name="rewind" size={13} />
        </TooltipIconButton>
      ) : null}
    </div>
  )
}

interface EditComposerFooterProps {
  canSend: boolean
  onSend: () => void
  sending: boolean
}

/**
 * Under the inline edit (prototype edit card): what sending does — the
 * prompt reruns from here and later messages go — then Cancel and Send.
 * Both keep focus in the editor on press: a blur would start the edit's
 * blur-cancel and tear the composer down before the click lands.
 */
export const EditComposerFooter: FC<EditComposerFooterProps> = ({ canSend, onSend, sending }) => {
  const { t } = useI18n()
  const copy = t.assistant.thread

  return (
    <div className="studio-edit-footer" data-slot="aui_edit-footer">
      <span className="studio-edit-note">{t.studio.chat.transcript.editRerunNote}</span>
      <ComposerPrimitive.Cancel asChild>
        <Button onPointerDown={event => event.preventDefault()} size="sm" type="button" variant="ghost">
          {t.common.cancel}
        </Button>
      </ComposerPrimitive.Cancel>
      <Button
        aria-label={copy.sendEdited}
        disabled={!canSend}
        onClick={onSend}
        onPointerDown={event => event.preventDefault()}
        size="sm"
        type="button"
      >
        {sending ? <StudioIcon name="stop" size={12} /> : t.composer.send}
      </Button>
    </div>
  )
}
