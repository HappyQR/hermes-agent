import { type KeyboardEvent, type ReactNode, useMemo } from 'react'

import { blurComposerInput } from '@/app/chat/composer/focus'
import {
  StatusSectionPresentation,
  type StatusSectionPresentationValue
} from '@/components/chat/status-section-presentation'
import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { useI18n } from '@/i18n'

import type { StatusStackSection } from '../status-stack'

import type { TrayChip } from './use-tray-chips'

interface TrayPanelProps {
  /** The git panel, when the git chip is the open one. */
  git: ReactNode
  id: string
  /** The open panel chip (null with the git panel or nothing open). */
  openChip: TrayChip | null
  onClose: () => void
  /** Pressing Esc inside the panel: close it and hand focus back to its chip. */
  onEscape: () => void
  queueParked: boolean
  sections: readonly StatusStackSection[]
}

/** Section keys whose chip already shows the section's own label: the panel
 *  heading takes a short title instead, so the count never appears twice. */
function usePresentations(queueParked: boolean): Record<string, StatusSectionPresentationValue> {
  const { t } = useI18n()
  const copy = t.studio.chat.tray

  return useMemo(
    () => ({
      background: { panel: true, title: copy.titles.background },
      queue: { caption: queueParked ? undefined : copy.queueCaption, panel: true, title: copy.titles.queue },
      'retained-todo': { panel: true, title: copy.titles.previousTodo },
      subagent: { panel: true, title: copy.titles.subagent },
      todo: { caption: copy.todoCaption, panel: true, title: copy.titles.todo }
    }),
    [copy, queueParked]
  )
}

const PANEL_ONLY: StatusSectionPresentationValue = { panel: true }

/**
 * The panel above the chip row. EVERY section stays mounted here — hidden and
 * inert unless its chip is the open one — so a group's own state (expanded
 * queue rows, the selected subagent, an open goal menu) survives switching
 * chips, hiding the tray, and progress updates (DESIGN.md: hidden sections stay
 * mounted but inert). Opening is only ever user-initiated.
 */
export function TrayPanel({ git, id, onClose, onEscape, openChip, queueParked, sections }: TrayPanelProps) {
  const { t } = useI18n()
  const copy = t.studio.chat.tray
  const presentations = usePresentations(queueParked)
  const open = Boolean(openChip || git)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Portaled menus inside the panel own their own Esc; only the panel's DOM closes it.
    if (event.key !== 'Escape' || event.defaultPrevented || !event.currentTarget.contains(event.target as Node)) {
      return
    }

    // Claim it, so the composer's window-level Esc-to-stop stands down: one cancel, one thing.
    event.preventDefault()
    event.stopPropagation()
    onEscape()
  }

  return (
    <div
      aria-label={openChip?.label}
      className="tray-panel"
      data-slot="composer-status-stack"
      hidden={!open}
      id={id}
      onKeyDown={onKeyDown}
      onPointerDownCapture={() => blurComposerInput()}
      role="region"
    >
      <Button aria-label={copy.close} className="tray-panel-close" onClick={onClose} size="icon-xs" variant="ghost">
        <Codicon name="close" size="0.75rem" />
      </Button>
      {openChip?.id === 'preview' && (
        <div className="tray-panel-head">
          <b>{copy.titles.preview}</b>
        </div>
      )}
      {git}
      {sections.map(section => {
        const shown = Boolean(openChip?.sectionKeys.includes(section.key))

        return (
          <StatusSectionPresentation.Provider key={section.key} value={presentations[section.key] ?? PANEL_ONLY}>
            <div data-slot="status-stack-section" data-tray-section={section.key} hidden={!shown} inert={!shown}>
              {section.node}
            </div>
          </StatusSectionPresentation.Provider>
        )
      })}
    </div>
  )
}
