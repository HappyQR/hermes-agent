import { type KeyboardEvent, type ReactNode, type Ref, useId, useRef, useState } from 'react'

import { findSessionApprovalStack, findSurfaceClarifyCard } from '@/app/chat/decision-anchor'
import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { useStoreSelector } from '@/lib/use-session-slice'
import { $parkedQueueSessions } from '@/store/composer-queue'

import { useStatusDrawer } from '../hooks/use-status-drawer'
import { useComposerSurfaceId } from '../scope'
import type { StatusStackSection } from '../status-stack'
import { codingRowModel, useCodingStatus } from '../status-stack/coding-row-model'

import { JUMP_CHIPS, NOTICE_SECTIONS, type TrayChipId } from './chips'
import { GitChip, GitPanel, type TrayCoding } from './git-chip'
import { TrayChipButton } from './tray-chip'
import { TrayPanel } from './tray-panel'
import { type TrayChip, useTrayChips } from './use-tray-chips'

export type { TrayCoding } from './git-chip'

type OpenId = TrayChipId | 'git' | null

export interface ActivityTrayProps {
  /** The git chip's inputs; null where the git row never showed (the guide's
   *  chat, Simple mode). */
  coding: TrayCoding | null
  /** Everything the composer status stack computed, in its order. */
  sections: readonly StatusStackSection[]
  /** Runtime session id (status items, prompts). */
  sessionId: null | string
  /** The composer's queue key — also the conversation the hidden choice and
   *  the open chip belong to. */
  sessionKey: null | string
}

const ARROW_STEP: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 }

/** ←/→ (mirrored in RTL), Home and End move between the toolbar's buttons. */
function moveToolbarFocus(event: KeyboardEvent<HTMLDivElement>) {
  const step = ARROW_STEP[event.key]

  if (step === undefined && event.key !== 'Home' && event.key !== 'End') {
    return
  }

  const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])')]
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement)

  if (index < 0) {
    return
  }

  event.preventDefault()
  const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'

  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? buttons.length - 1
        : (index + (rtl ? -step! : step!) + buttons.length) % buttons.length

  buttons[next]?.focus()
}

/**
 * Which chip's panel is open. Opening is only ever user-initiated and never
 * persisted: a conversation switch, hiding the tray, or the chip going away
 * all close it — and a chip that comes back later does not reopen by itself.
 */
function useOpenChip(chips: readonly TrayChip[], sessionKey: null | string, collapsed: boolean, gitShown: boolean) {
  const [open, setOpen] = useState<{ id: OpenId; key: null | string }>({ id: null, key: sessionKey })
  const requested = open.key === sessionKey && !collapsed ? open.id : null
  const openChip = chips.find(chip => chip.id === requested && !JUMP_CHIPS.has(chip.id)) ?? null
  const openId: OpenId = requested === 'git' && gitShown ? 'git' : (openChip?.id ?? null)

  if (open.id !== null && openId === null) {
    setOpen({ id: null, key: sessionKey })
  }

  return {
    close: () => setOpen({ id: null, key: sessionKey }),
    openChip,
    openId,
    toggle: (id: Exclude<OpenId, null>) => setOpen({ id: openId === id ? null : id, key: sessionKey })
  }
}

interface TrayRowProps {
  chips: readonly TrayChip[]
  collapsed: boolean
  git: ReactNode
  onActivate: (chip: TrayChip) => void
  onHide: () => void
  onShow: () => void
  openId: OpenId
  panelId: string
  ref: Ref<HTMLDivElement>
  total: number
}

function TrayRow({ chips, collapsed, git, onActivate, onHide, onShow, openId, panelId, ref, total }: TrayRowProps) {
  const copy = useI18n().t.studio.chat.tray

  return (
    <div aria-label={copy.label} className="tray-row" onKeyDown={moveToolbarFocus} ref={ref} role="toolbar">
      {collapsed ? (
        <>
          <span className="tray-spacer" />
          <TrayChipButton icon="chevron-up" id="show" label={copy.show(total)} onClick={onShow} />
        </>
      ) : (
        <>
          {chips.map(chip => (
            <TrayChipButton
              controls={JUMP_CHIPS.has(chip.id) ? undefined : panelId}
              expanded={openId === chip.id}
              icon={chip.icon}
              id={chip.id}
              key={chip.id}
              label={chip.label}
              live={chip.live}
              onClick={() => onActivate(chip)}
              progress={chip.progress}
              tone={chip.tone}
            />
          ))}
          <span className="tray-spacer" />
          {git}
          <Tip label={copy.hide} side="top">
            <Button aria-label={copy.hide} className="tray-collapse" onClick={onHide} size="icon-xs" variant="ghost">
              <Codicon name="chevron-down" size="0.75rem" />
            </Button>
          </Tip>
        </>
      )}
    </div>
  )
}

/**
 * Hermes Studio's activity tray — the composer status stack as one row of
 * chips above the composer. Each chip is a kind of activity (tasks, goal,
 * subagents, queue, background work, previews, git); pressing one opens its
 * group in a panel, pressing it again (or Esc, or ✕) closes it. Decisions
 * (approval, a question) jump to their card in the transcript instead.
 * Billing and consent notices stay visible above the tray. The hidden choice
 * persists per conversation and owner (useStatusDrawer, as the ridge did).
 */
export function ActivityTray({ coding, sections, sessionId, sessionKey }: ActivityTrayProps) {
  const { t } = useI18n()
  const surfaceId = useComposerSurfaceId()
  const panelId = useId()
  const rowRef = useRef<HTMLDivElement | null>(null)
  const { collapsed, toggle: toggleCollapsed } = useStatusDrawer(sessionKey)
  const queueParked = useStoreSelector($parkedQueueSessions, map => Boolean(sessionKey && map[sessionKey]))
  const notices = sections.filter(section => NOTICE_SECTIONS.has(section.key))
  const panelSections = sections.filter(section => !NOTICE_SECTIONS.has(section.key))
  const chips = useTrayChips({ sectionKeys: panelSections.map(section => section.key), sessionId, sessionKey, t })
  const git = useCodingStatus(coding?.repoPath)
  const model = coding && git.status ? codingRowModel(git.status, git.worktrees, coding, t.statusStack.coding) : null
  const { close, openChip, openId, toggle } = useOpenChip(chips, sessionKey, collapsed, Boolean(model))
  const total = chips.length + (model ? 1 : 0)

  const activate = (chip: TrayChip) => {
    triggerHaptic('selection')

    if (!JUMP_CHIPS.has(chip.id)) {
      toggle(chip.id)

      return
    }

    const target = chip.id === 'approval' ? findSessionApprovalStack(sessionId) : findSurfaceClarifyCard(surfaceId)

    target?.scrollIntoView({ block: 'nearest' })
  }

  const escape = () => {
    const chipId = openId

    close()
    rowRef.current?.querySelector<HTMLElement>(`[data-tray-chip="${chipId}"]`)?.focus()
  }

  if (sections.length === 0 && total === 0) {
    return null
  }

  return (
    <div className="activity-tray" data-slot="activity-tray">
      {notices.length > 0 && (
        <div className="tray-notices" data-slot="activity-tray-notices">
          {notices.map(notice => (
            <div className="tray-notice" data-tray-notice={notice.key} key={notice.key}>
              {notice.node}
            </div>
          ))}
        </div>
      )}
      <TrayPanel
        git={
          openId === 'git' && coding && model ? (
            <GitPanel coding={coding} git={git} model={model} onClose={close} />
          ) : null
        }
        id={panelId}
        onClose={close}
        onEscape={escape}
        openChip={openChip}
        queueParked={queueParked}
        sections={panelSections}
      />
      {total > 0 && (
        <TrayRow
          chips={chips}
          collapsed={collapsed}
          git={
            coding &&
            model && (
              <GitChip
                coding={coding}
                controls={panelId}
                expanded={openId === 'git'}
                git={git}
                model={model}
                onToggle={() => {
                  triggerHaptic('selection')
                  toggle('git')
                }}
              />
            )
          }
          onActivate={activate}
          onHide={() => {
            close()
            toggleCollapsed()
          }}
          onShow={toggleCollapsed}
          openId={openId}
          panelId={panelId}
          ref={rowRef}
          total={total}
        />
      )}
    </div>
  )
}
