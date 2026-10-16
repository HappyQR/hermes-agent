import { useStore } from '@nanostores/react'
import { type ComponentProps, useMemo } from 'react'

import {
  DropdownMenuItem,
  DropdownMenuLabel,
  dropdownMenuSectionLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { GlyphSpinner } from '@/components/ui/glyph-spinner'
import { StudioIcon } from '@/components/ui/studio-icon'
import { type Translations, useI18n } from '@/i18n'
import { $hudMode } from '@/store/hud'

import { ApprovalModePill, ApprovalModeRadioItems, useComposerApprovalMode } from './approval-mode-controls'
import { ContextMenu } from './context-menu'
import { ContextRingPill } from './context-ring'
import { ComposerControls } from './controls'
import { MicButton } from './mic-button'
import { ModelMenuExtras } from './model-menu-extras'
import { ModelPill } from './model-pill'
import { useReasoningSummary } from './reasoning-pill'
import { RICH_INPUT_SLOT } from './rich-editor'
import { SendCluster } from './send-cluster'
import type { VoiceActivityState } from './types'
import { VoiceActivity, VoicePlaybackActivity } from './voice-activity'
import { VoiceCapsule } from './voice-capsule'
import { VoiceMenu } from './voice-menu'

type Requester = <T = unknown>(method: string, params?: Record<string, unknown>) => Promise<T>

/** The pill's effort in the reader's language ("中", "Medium"); a clamped pick
 *  shows both ends ("Ultra→Max"), like the upstream pill's short labels. */
function effortName(summary: NonNullable<ReturnType<typeof useReasoningSummary>>, t: Translations): string {
  const o = t.shell.modelOptions

  const levels: Record<string, string> = {
    high: o.high,
    low: o.low,
    max: o.max,
    medium: o.medium,
    minimal: o.minimal,
    none: t.studio.chat.composer.effortOff,
    ultra: o.ultra,
    xhigh: o.xhigh
  }

  const name = (level: string) => levels[level] ?? summary.label

  return summary.clamp ? `${name(summary.clamp.effort)}→${name(summary.clamp.wire)}` : name(summary.effort)
}

type UpstreamControlsProps = ComponentProps<typeof ComposerControls>

export interface StudioComposerControlsProps extends UpstreamControlsProps {
  /** `/compress` through the composer's own submit (the context panel's Compress). */
  onCompress?: () => void
  requestGateway: Requester
}

/**
 * The right side of the Studio composer row (prototype `.cmp-row`): context
 * gauge · "model · effort" · mic · primary. A live voice conversation turns it
 * into the voice capsule; the HUD's Spotlight bar keeps upstream's controls.
 */
export function StudioComposerControls(props: StudioComposerControlsProps) {
  const { onCompress, requestGateway, ...upstream } = props
  const { t } = useI18n()
  const hudMode = useStore($hudMode)
  const reasoning = useReasoningSummary(upstream.state.model)
  const reasoningMenu = upstream.state.model.reasoningMenuContent

  const extras = useMemo(
    () =>
      reasoning ? (
        <>
          {reasoningMenu}
          <DropdownMenuSeparator className="mx-0" />
        </>
      ) : null,
    [reasoning, reasoningMenu]
  )

  if (hudMode) {
    return <ComposerControls {...upstream} />
  }

  if (upstream.conversation.active) {
    return <VoiceCapsule {...upstream.conversation} disabled={upstream.disabled} />
  }

  const { compactModelPill = false, disabled, foldVoice = false, hideModelPill = false, minimal = false } = upstream

  return (
    <div className="flex min-w-0 shrink items-center gap-(--composer-control-gap)" data-slot="composer-controls">
      {!minimal && !hideModelPill && (
        <>
          <ContextRingPill compact={compactModelPill} onCompress={onCompress} requestGateway={requestGateway} />
          <ModelMenuExtras.Provider value={extras}>
            <ModelPill
              compact={compactModelPill}
              disabled={disabled}
              effort={
                reasoning && !compactModelPill
                  ? {
                      label: reasoning.pending ? (
                        <GlyphSpinner className="opacity-50" spinner="braille" />
                      ) : (
                        effortName(reasoning, t)
                      ),
                      title: reasoning.title
                    }
                  : undefined
              }
              model={upstream.state.model}
            />
          </ModelMenuExtras.Provider>
        </>
      )}
      {!minimal &&
        (foldVoice ? (
          <VoiceMenu
            autoSpeak={upstream.autoSpeak}
            disabled={disabled}
            onDictate={upstream.onDictate}
            onStartConversation={upstream.conversation.onStart}
            onToggleAutoSpeak={upstream.onToggleAutoSpeak}
            state={upstream.state}
            voiceStatus={upstream.voiceStatus}
          />
        ) : (
          <MicButton
            autoSpeak={upstream.autoSpeak}
            disabled={disabled}
            onDictate={upstream.onDictate}
            onStartConversation={upstream.conversation.onStart}
            onToggleAutoSpeak={upstream.onToggleAutoSpeak}
            state={upstream.state}
            voiceStatus={upstream.voiceStatus}
          />
        ))}
      <SendCluster
        busy={upstream.busy}
        busyAction={upstream.busyAction}
        canSubmit={upstream.canSubmit}
        cardWaiting={upstream.cardWaiting ?? false}
        disabled={disabled}
        hasComposerPayload={upstream.hasComposerPayload}
        onQueue={upstream.onQueue}
        onStartVoice={upstream.conversation.onStart}
      />
    </div>
  )
}

/** Open the slash palette in the composer that now has focus (after the "+"
 *  menu closed): the "/" lands, and an input event wakes the trigger engine. */
function openSlashPalette(insertText: (text: string) => void) {
  insertText('/')
  window.requestAnimationFrame(() => {
    const editor = document.activeElement

    if (editor instanceof HTMLElement && editor.dataset.slot === RICH_INPUT_SLOT) {
      editor.dispatchEvent(new Event('input', { bubbles: true }))
    }
  })
}

interface StudioPlusItemsProps {
  onInsertText: (text: string) => void
  popout?: { onToggle: () => void; poppedOut: boolean }
  runAfterClose: (action: () => void) => void
}

/** The "+" menu's Studio rows: skills, the approval mode, and the floating composer. */
function StudioPlusItems({ onInsertText, popout, runAfterClose }: StudioPlusItemsProps) {
  const { t } = useI18n()
  const copy = t.studio.chat.composer
  const { mode, setMode } = useComposerApprovalMode()

  return (
    <>
      <DropdownMenuItem onSelect={() => runAfterClose(() => openSlashPalette(onInsertText))}>
        <StudioIcon name="cube" size={15} />
        <span>{copy.skills}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className={dropdownMenuSectionLabel}>{t.shell.approvalMode.title}</DropdownMenuLabel>
      <ApprovalModeRadioItems mode={mode} onChange={setMode} />
      {popout && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => runAfterClose(popout.onToggle)}>
            <StudioIcon name="popout" size={15} />
            <span>{popout.poppedOut ? copy.dock : copy.popOut}</span>
          </DropdownMenuItem>
        </>
      )}
    </>
  )
}

type ContextMenuProps = Omit<ComponentProps<typeof ContextMenu>, 'extraItems'>

export interface ComposerLeadingProps extends ContextMenuProps {
  popout?: { onToggle: () => void; poppedOut: boolean }
  voiceActivityState: VoiceActivityState
}

/**
 * The left side of the Studio composer row: "+" (attachments, snippets,
 * skills, approval mode, pop-out), then the live pills — dictation / read
 * aloud, and the orange auto-approve warning.
 */
export function ComposerLeading({ popout, voiceActivityState, ...menu }: ComposerLeadingProps) {
  return (
    <div className="composer-leading" data-slot="composer-leading">
      <ContextMenu
        {...menu}
        extraItems={({ runAfterClose }) => (
          <StudioPlusItems onInsertText={menu.onInsertText} popout={popout} runAfterClose={runAfterClose} />
        )}
      />
      <VoiceActivity compact state={voiceActivityState} />
      <VoicePlaybackActivity compact />
      <ApprovalModePill />
    </div>
  )
}
