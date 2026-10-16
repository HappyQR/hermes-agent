import { ActionBarPrimitive, BranchPickerPrimitive, useAuiState } from '@assistant-ui/react'
import { type FC, useCallback, useState } from 'react'

import { MessageHoverTime } from '@/components/assistant-ui/thread/message-hover-time'
import { ReactionPicker } from '@/components/assistant-ui/thread/message-reactions'
import { useMessageReactions } from '@/components/assistant-ui/thread/use-message-reactions'
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { ActionsMenu, type MenuKit } from '@/components/ui/actions-menu'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { DESKTOP_BUTTON_ACTIONS, recordAction } from '@/store/desktop-metrics'
import { notify, notifyError } from '@/store/notifications'

import type { MessageActionProps } from './assistant-message'

/** The read-aloud control the message module owns (passed in, so this file
 *  does not import the message module back). */
type ReadAloudComponent = FC<{
  fullResponseAvailable: boolean
  getFullText: () => string
  getText: () => string
  messageId: string
}>

/** The latest settled reply keeps its actions on screen; older ones reveal
 *  theirs on hover. A boolean leaf selector, so streaming never re-renders
 *  the footer (see the perf note on the message root). */
const useLatestSettled = () => useAuiState(s => s.message.isLast && !s.thread.isRunning)

/** Export the reply as Markdown through the native save dialog. Hidden on
 *  shells without the save-path / text-write bridges. */
function useExportMarkdown(getText: () => string) {
  const { t } = useI18n()
  const copy = t.studio.chat.transcript
  const bridge = window.hermesDesktop
  const available = Boolean(bridge?.selectSavePath && bridge.writeTextFile)

  const exportMarkdown = useCallback(async () => {
    try {
      const target = await bridge?.selectSavePath?.({
        defaultPath: copy.exportFileName,
        filters: [{ extensions: ['md'], name: 'Markdown' }]
      })

      if (!target) {
        return
      }

      const { path } = (await bridge?.writeTextFile?.(target, getText())) ?? { path: target }
      notify({ kind: 'success', message: copy.exported(path.split(/[\\/]/).pop() || path) })
    } catch (error) {
      notifyError(error, copy.exportFailed)
    }
  }, [bridge, copy, getText])

  return available ? exportMarkdown : null
}

/**
 * Hermes Studio's reply footer (prototype `.ai-foot`): one left-aligned row —
 * copy · read aloud · regenerate · branch · react · ⋯ · ‹ n / m › · time ·
 * duration. Always shown on the latest settled reply, on hover elsewhere.
 * Every action is upstream's: the same Copy, Read aloud (⇧ reads the whole
 * response), Reload, Branch in new chat, reactions and version picker; the
 * ⋯ menu holds the whole-response copy and Markdown export.
 */
export const StudioAssistantFooter: FC<MessageActionProps & { durationS?: number; ReadAloud: ReadAloudComponent }> = ({
  ReadAloud,
  durationS,
  fullResponseAvailable,
  getFullResponseText,
  getMessageText,
  messageId,
  onBranchInNewChat
}) => {
  const { t } = useI18n()
  const copy = t.assistant.thread
  const studio = t.studio.chat.transcript
  const latest = useLatestSettled()
  const exportMarkdown = useExportMarkdown(getFullResponseText)
  const [pickerOpen, setPickerOpen] = useState(false)
  const { enabled: reactionsEnabled, react, reactions: shownReactions } = useMessageReactions(messageId, 'assistant')

  const pickEmoji = useCallback(
    (emoji: null | string) => {
      setPickerOpen(false)
      react(emoji)
    },
    [react]
  )

  const moreItems = (kit: MenuKit) => (
    <>
      {fullResponseAvailable && (
        <CopyButton appearance={kit.copyAppearance} label={copy.copyFullResponse} text={getFullResponseText} />
      )}
      {exportMarkdown && (
        <kit.Item onSelect={() => void exportMarkdown()}>
          <StudioIcon name="share" size={14} />
          <span>{studio.exportMarkdown}</span>
        </kit.Item>
      )}
    </>
  )

  return (
    <div className="studio-msg-footer" data-latest={latest ? '' : undefined} data-slot="aui_msg-footer">
      <ActionBarPrimitive.Root className="studio-msg-actions" data-slot="aui_msg-actions">
        <CopyButton
          appearance="icon"
          buttonSize="icon-xs"
          label={copy.copy}
          onCopied={() => recordAction(DESKTOP_BUTTON_ACTIONS.messageCopy, 'click')}
          text={getMessageText}
        />
        <ReadAloud
          fullResponseAvailable={fullResponseAvailable}
          getFullText={getFullResponseText}
          getText={getMessageText}
          messageId={messageId}
        />
        <ActionBarPrimitive.Reload asChild>
          <TooltipIconButton
            onClick={() => {
              triggerHaptic('submit')
              recordAction(DESKTOP_BUTTON_ACTIONS.messageRetry, 'click')
            }}
            tooltip={copy.refresh}
          >
            <StudioIcon name="retry" size={14} />
          </TooltipIconButton>
        </ActionBarPrimitive.Reload>
        {onBranchInNewChat && (
          <TooltipIconButton
            onClick={() => {
              triggerHaptic('selection')
              onBranchInNewChat(messageId)
            }}
            tooltip={copy.branchNewChat}
          >
            <StudioIcon name="branch" size={14} />
          </TooltipIconButton>
        )}
        {(fullResponseAvailable || exportMarkdown) && (
          <ActionsMenu align="start" ariaLabel={copy.moreActions} items={moreItems} side="top">
            <Button aria-label={copy.moreActions} size="icon-xs" type="button" variant="ghost">
              <StudioIcon name="more" size={14} />
            </Button>
          </ActionsMenu>
        )}
        <BranchPickerPrimitive.Root className="studio-msg-versions" hideWhenSingleBranch>
          <Tip label={studio.previousVersion} side="top">
            <BranchPickerPrimitive.Previous aria-label={studio.previousVersion} className="studio-msg-version-step">
              <StudioIcon name="chev-l" size={12} />
            </BranchPickerPrimitive.Previous>
          </Tip>
          <span className="tabular-nums">
            <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
          </span>
          <Tip label={studio.nextVersion} side="top">
            <BranchPickerPrimitive.Next aria-label={studio.nextVersion} className="studio-msg-version-step">
              <StudioIcon name="chev-r" size={12} />
            </BranchPickerPrimitive.Next>
          </Tip>
        </BranchPickerPrimitive.Root>
        <MessageHoverTime className="studio-msg-meta" />
        {/* Reply meta (prototype "model · tokens · 48 秒"): only the turn time
            is known per message — and only for turns watched live. */}
        {durationS !== undefined && (
          <Tip label={copy.turnDuration(studio.replyDuration(durationS))} side="top">
            <span className="studio-msg-meta tabular-nums" data-slot="aui_turn-duration">
              {studio.replyDuration(durationS)}
            </span>
          </Tip>
        )}
      </ActionBarPrimitive.Root>
      {/* Outside the bar, so a landed reaction stays at full strength while
          the bar itself rests hidden on older replies. */}
      {(reactionsEnabled || shownReactions.length > 0) && (
        <ReactionPicker
          onOpenChange={setPickerOpen}
          onSelect={pickEmoji}
          open={pickerOpen}
          selected={shownReactions.find(reaction => reaction.author === 'user')?.emoji}
        >
          <TooltipIconButton
            data-reacted={shownReactions.length > 0 || undefined}
            data-slot="aui_msg-reactions"
            data-state={pickerOpen ? 'open' : undefined}
            onClick={reactionsEnabled ? () => setPickerOpen(open => !open) : undefined}
            tooltip={copy.react}
          >
            {shownReactions.length > 0 ? (
              <span className="flex items-center gap-0.5 text-[0.8125rem] leading-none">
                {shownReactions.map(reaction => (
                  <span className="reaction-pop" key={`${reaction.author}-${reaction.emoji}`}>
                    {reaction.emoji}
                  </span>
                ))}
              </span>
            ) : (
              <StudioIcon name="heart" size={14} />
            )}
          </TooltipIconButton>
        </ReactionPicker>
      )}
    </div>
  )
}
