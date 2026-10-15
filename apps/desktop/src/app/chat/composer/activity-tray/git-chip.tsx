import type { ReactNode } from 'react'

import { openPullRequest } from '@/app/chat/pr-tag'
import { ActionsContextMenu, type MenuKit } from '@/components/ui/actions-menu'
import { CopyButton } from '@/components/ui/copy-button'
import { DiffCount } from '@/components/ui/diff-count'
import { KbdCombo } from '@/components/ui/kbd'
import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { displayPath } from '@/lib/display-path'
import { useKeybindHint } from '@/lib/keybinds/use-keybind-hint'

import { renderCodingBranchItems } from '../status-stack/coding-branch-items'
import {
  type CodingBranchActions,
  type CodingRowModel,
  type CodingStatus,
  startBranchFrom,
  switchToBranch
} from '../status-stack/coding-row-model'

import { TrayChipButton } from './tray-chip'

/** What the tray needs to offer the git chip: the branch actions the composer
 *  owns, the review pane toggle, and THIS surface's worktree (blank in a bot
 *  chat, which has no repo to speak of). */
export interface TrayCoding extends CodingBranchActions {
  onReview: () => void
  repoPath: null | string | undefined
}

interface GitChipProps {
  coding: TrayCoding
  controls: string
  expanded: boolean
  git: CodingStatus
  model: CodingRowModel
  onToggle: () => void
}

/** The branch chip: glyph · #PR · branch · ±lines (or "N changed"). Click opens
 *  the git panel; right-click is the git row's branch menu, unchanged. */
export function GitChip({ coding, controls, expanded, git, model, onToggle }: GitChipProps) {
  const { t } = useI18n()
  const status = git.status

  if (!status) {
    return null
  }

  const renderBranchItems = (kit: MenuKit) =>
    renderCodingBranchItems(kit, {
      actions: coding,
      copy: { coding: t.statusStack.coding, projects: t.sidebar.projects },
      model,
      repoPath: git.repoPath
    })

  return (
    <ActionsContextMenu contentClassName="w-60" disabled={!coding.onBranchOff} items={renderBranchItems}>
      <Tip label={t.studio.chat.tray.git.hint} side="top">
        <TrayChipButton
          controls={controls}
          expanded={expanded}
          icon="branch"
          id="git"
          label={git.pr ? `#${git.pr.number} ${model.branchLabel}` : model.branchLabel}
          onClick={onToggle}
        >
          {model.hasLineDelta ? (
            <DiffCount added={status.added} className="tray-chip-diff" removed={status.removed} />
          ) : model.untrackedOnly ? (
            <span className="tray-chip-diff text-(--ui-orange)">{t.statusStack.coding.changed(status.untracked)}</span>
          ) : null}
        </TrayChipButton>
      </Tip>
    </ActionsContextMenu>
  )
}

interface GitPanelProps {
  coding: TrayCoding
  git: CodingStatus
  model: CodingRowModel
  onClose: () => void
}

function PanelRow({ children, icon, onSelect }: { children: ReactNode; icon: StudioIconName; onSelect: () => void }) {
  return (
    <button className="tray-panel-row" onClick={onSelect} type="button">
      <StudioIcon className="tray-panel-row-icon" name={icon} size={14} />
      {children}
    </button>
  )
}

/** The git chip's panel: where you are (branch, ahead/behind) and what you can
 *  do from here — the same actions the git row's menu offers, as rows. */
export function GitPanel({ coding, git, model, onClose }: GitPanelProps) {
  const { t } = useI18n()
  const s = t.statusStack.coding
  const copy = t.studio.chat.tray.git
  const reviewCombo = useKeybindHint('view.toggleReview')
  const status = git.status

  if (!status) {
    return null
  }

  // Close first, then act: the panel never lingers over a dialog it opened.
  const run = (action: () => void) => () => {
    onClose()
    action()
  }

  const drift = [status.ahead > 0 && s.ahead(status.ahead), status.behind > 0 && s.behind(status.behind)]
    .filter(Boolean)
    .join(' · ')

  return (
    <div data-slot="activity-tray-git">
      <div className="tray-panel-head">
        <StudioIcon className="text-(--ui-text-tertiary)" name="branch" size={14} />
        <b className="min-w-0 truncate">{model.branchLabel}</b>
        {drift && <span className="tray-panel-caption tabular-nums">{drift}</span>}
      </div>
      <PanelRow icon="diff" onSelect={run(coding.onReview)}>
        <span className="tray-panel-row-label">{copy.reviewChanges}</span>
        {reviewCombo && <KbdCombo combo={reviewCombo} size="sm" />}
      </PanelRow>
      {git.pr && (
        <PanelRow icon="pr" onSelect={run(() => git.pr && openPullRequest(git.pr))}>
          <span className="tray-panel-row-label">{copy.openPullRequest(git.pr.number)}</span>
        </PanelRow>
      )}
      {coding.onBranchOff && (
        <>
          <div className="tray-panel-separator" role="separator" />
          {model.branchTargets.map(target => (
            <PanelRow
              icon="branch"
              key={target.base ?? '__head__'}
              onSelect={run(() => startBranchFrom(target.base, git.repoPath))}
            >
              <span className="tray-panel-row-label">{target.label}</span>
            </PanelRow>
          ))}
          {model.switchTarget && (
            <PanelRow
              icon="arrow-left"
              onSelect={run(() => void switchToBranch(model.switchTarget!, coding.onSwitchBranch, s))}
            >
              <span className="tray-panel-row-label">{s.switchTo(model.switchTarget)}</span>
            </PanelRow>
          )}
          {model.otherWorktrees.map(worktree => (
            <PanelRow icon="tree" key={worktree.path} onSelect={run(() => coding.onOpenWorktree?.(worktree.path))}>
              <span className="tray-panel-row-label">{worktree.branch}</span>
              <span className="tray-panel-row-meta">{displayPath(worktree.path)}</span>
            </PanelRow>
          ))}
          <PanelRow icon="plus" onSelect={run(() => startBranchFrom(undefined, git.repoPath))}>
            <span className="tray-panel-row-label">{t.sidebar.projects.startWork}</span>
          </PanelRow>
          {coding.onConvertBranch && (
            <PanelRow icon="branch" onSelect={run(() => startBranchFrom(undefined, git.repoPath))}>
              <span className="tray-panel-row-label">{t.sidebar.projects.convertBranch}</span>
            </PanelRow>
          )}
        </>
      )}
      {git.repoPath && (
        <>
          <div className="tray-panel-separator" role="separator" />
          <div className="tray-panel-row" data-static="">
            <StudioIcon className="tray-panel-row-icon" name="folder" size={14} />
            <span className="tray-panel-row-label font-mono text-xs" data-slot="coding-status-cwd">
              {displayPath(git.repoPath)}
            </span>
            <CopyButton
              appearance="icon"
              buttonSize="icon-xs"
              iconClassName="size-3"
              label={copy.copyWorktreePath}
              side="top"
              text={git.repoPath}
            />
          </div>
        </>
      )}
    </div>
  )
}
