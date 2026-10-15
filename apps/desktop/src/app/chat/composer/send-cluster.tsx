import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
import { Tip, TipKeybindLabel } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { useKeybindHint } from '@/lib/keybinds/use-keybind-hint'
import { recordAction } from '@/store/desktop-metrics'

import type { ComposerBusyAction } from './busy-submit-state'
import { PRIMARY_ICON_BTN } from './control-classes'
import { composerSendLabel } from './controls'
import { TalkButton } from './mic-button'

export interface SendClusterProps {
  busy: boolean
  busyAction: ComposerBusyAction
  canSubmit: boolean
  /** A card parked on the session takes typed text as its answer through Send. */
  cardWaiting: boolean
  disabled: boolean
  hasComposerPayload: boolean
  onQueue: () => void
  /** Stop the run, then send (absent when the draft can't steer). */
  onRedirect?: () => void
  onStartVoice: () => void
  /** Hand the draft to the live run after its next tool call (absent when it can't). */
  onSteer?: () => void
}

interface SendMode {
  action: () => void
  hint: ReactNode
  icon: StudioIconName
  key: Exclude<ComposerBusyAction, 'stop'>
  label: string
}

/** The busy-turn modes the primary does NOT already perform. */
function useOtherSendModes({ busyAction, onQueue, onRedirect, onSteer }: SendClusterProps): SendMode[] {
  const { t } = useI18n()
  const c = t.composer
  const copy = t.studio.chat.composer
  const queueCombo = useKeybindHint('composer.queue')

  const modes: SendMode[] = [
    { action: onQueue, hint: queueCombo, icon: 'tray', key: 'queue', label: c.queueMessage },
    ...(onSteer ? [{ action: onSteer, hint: copy.steerHint, icon: 'arrow-right' as const, key: 'steer' as const, label: c.steer }] : []),
    ...(onRedirect
      ? [{ action: onRedirect, hint: copy.redirectHint, icon: 'retry' as const, key: 'interrupt' as const, label: c.redirect }]
      : [])
  ]

  return modes.filter(mode => mode.key !== busyAction)
}

/**
 * The composer's primary button and its morphs (prototype `.send`): talk while
 * empty and idle → send → stop while a turn runs with nothing typed. With a
 * draft mid-turn the primary follows the backend's busy-input mode (redirect,
 * queue or steer) and a chevron offers the other two. The submit button keeps
 * its "Send" / "Stop" names — e2e and assistive tech read them.
 */
export function SendCluster(props: SendClusterProps) {
  const { busy, busyAction, canSubmit, cardWaiting, disabled, hasComposerPayload, onStartVoice } = props
  const { t } = useI18n()
  const c = t.composer
  const others = useOtherSendModes(props)

  if (!busy && !hasComposerPayload) {
    return <TalkButton disabled={disabled} onStart={onStartVoice} />
  }

  const showStop = busy && !hasComposerPayload
  // A waiting card takes the draft as its answer through Send, whatever the busy action.
  const label = showStop ? c.stop : composerSendLabel(busy && !cardWaiting, busyAction, c)
  const moreModes = busy && hasComposerPayload && !cardWaiting && busyAction !== 'stop' && others.length > 0

  return (
    <span className="composer-send-group">
      <Tip label={<TipKeybindLabel actionId="composer.send" text={label} />} placement="control">
        <Button
          aria-label={label}
          className={PRIMARY_ICON_BTN}
          data-slot="composer-send"
          disabled={disabled || !canSubmit}
          onClick={() => recordAction(showStop ? 'composer.cancel' : 'composer.send', 'click')}
          type="submit"
        >
          {showStop ? <StudioIcon name="stop" size={15} /> : <StudioIcon name="arrow-up" size={16} stroke={2.2} />}
        </Button>
      </Tip>
      {moreModes && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={t.studio.chat.composer.moreSendOptions}
              className="composer-send-more"
              data-slot="composer-send-more"
              disabled={disabled}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <StudioIcon name="chev-u" size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-60" side="top" sideOffset={8}>
            {others.map(mode => (
              <DropdownMenuItem key={mode.key} onSelect={mode.action}>
                <StudioIcon name={mode.icon} size={14} />
                <span>{mode.label}</span>
                {mode.hint && <DropdownMenuShortcut>{mode.hint}</DropdownMenuShortcut>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </span>
  )
}
