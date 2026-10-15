import { type ActionItemSpec, type MenuKit, renderActionItem } from '@/components/ui/actions-menu'
import type { Translations } from '@/i18n'

import { type CodingBranchActions, type CodingRowModel, startBranchFrom, switchToBranch } from './coding-row-model'

// Tiny uppercase section header, matching the composer "+" menu's labels.
const MENU_SECTION = 'text-[0.625rem] font-semibold uppercase tracking-wider text-(--ui-text-tertiary)'

interface CodingBranchItemsInput {
  actions: CodingBranchActions
  copy: { coding: Translations['statusStack']['coding']; projects: Translations['sidebar']['projects'] }
  model: CodingRowModel
  repoPath: string | undefined
}

/**
 * The branch actions — new branch (from here / from trunk), switch to trunk,
 * other worktrees, start work, convert a branch — rendered identically by every
 * menu that offers them (the git row's kebab and right-click menu, the activity
 * tray's git chip), so they never drift.
 */
export function renderCodingBranchItems(kit: MenuKit, { actions, copy, model, repoPath }: CodingBranchItemsInput) {
  const s = copy.coding

  const branchItems: ActionItemSpec[] = model.branchTargets.map(target => ({
    key: target.base ?? '__head__',
    label: <span className="truncate">{target.label}</span>,
    onSelect: () => startBranchFrom(target.base, repoPath)
  }))

  const worktreeItems: ActionItemSpec[] = model.otherWorktrees.map(worktree => ({
    key: worktree.path,
    label: <span className="truncate">{worktree.branch}</span>,
    onSelect: () => actions.onOpenWorktree?.(worktree.path)
  }))

  const switchTarget = model.switchTarget

  return (
    <>
      <kit.Label className={MENU_SECTION}>{s.newBranch}</kit.Label>
      {branchItems.map(item => renderActionItem(kit, item))}
      {switchTarget &&
        renderActionItem(kit, {
          key: '__switch__',
          label: <span className="truncate">{s.switchTo(switchTarget)}</span>,
          onSelect: () => void switchToBranch(switchTarget, actions.onSwitchBranch, s)
        })}
      <kit.Separator />
      <kit.Label className={MENU_SECTION}>{s.worktrees}</kit.Label>
      {worktreeItems.map(item => renderActionItem(kit, item))}
      {/* Create a fresh worktree off the current HEAD (the generic "spin up a
          worktree here", mirroring the sidebar's + button). */}
      {renderActionItem(kit, {
        key: '__start__',
        label: <span className="truncate">{copy.projects.startWork}</span>,
        onSelect: () => startBranchFrom(undefined, repoPath)
      })}
      {actions.onConvertBranch &&
        renderActionItem(kit, {
          key: '__convert__',
          label: <span className="truncate">{copy.projects.convertBranch}</span>,
          onSelect: () => startBranchFrom(undefined, repoPath)
        })}
    </>
  )
}
