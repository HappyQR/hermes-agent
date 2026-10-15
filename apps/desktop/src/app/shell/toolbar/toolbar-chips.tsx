import { useStore } from '@nanostores/react'
import { useEffect } from 'react'

import { openPullRequest } from '@/app/chat/pr-tag'
import type { StatusbarItem } from '@/app/shell/statusbar-controls'
import { renderActionItem } from '@/components/ui/actions-menu'
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { displayPath } from '@/lib/display-path'
import { runBuiltinAction } from '@/lib/keybinds/plugin-actions'
import { openWorktreeDialog, registerRepoStatusCwd, repoStatusForCwd } from '@/store/coding-status'
import { copyFilePath } from '@/store/file-actions'
import { $pullRequestsByBranch, branchPrKey, refreshPullRequests } from '@/store/pull-requests'

import { MenuHint, ToolbarChip, ToolbarMenu } from './toolbar-kit'

const menuHeadClass = 'max-w-72 truncate font-normal text-(--ui-text-tertiary)'

/** Project & working directory (prototype `.tb-chip` folder): the status bar's
 *  workspace item — same label, path and verbs — as a toolbar chip. */
export function ProjectChip({ item }: { item: StatusbarItem | undefined }) {
  const { t } = useI18n()
  const copy = t.studio.shell.toolbar

  if (!item || item.hidden || !item.label) {
    return null
  }

  const menuItems = (item.menuItems ?? []).filter(entry => !entry.hidden)

  return (
    <ToolbarMenu
      ariaLabel={copy.projectChip}
      contentClassName="min-w-56"
      items={kit => (
        <>
          {item.title && <kit.Label className={menuHeadClass}>{item.title}</kit.Label>}
          {menuItems.map(entry =>
            renderActionItem(kit, {
              disabled: entry.disabled,
              key: entry.id,
              label: entry.label,
              onSelect: () => entry.onSelect?.()
            })
          )}
        </>
      )}
      tip={copy.projectChip}
    >
      <ToolbarChip aria-label={copy.projectChip} data-slot="toolbar-project" icon="folder" label={item.label} />
    </ToolbarMenu>
  )
}

/** Branch & worktree chip plus the branch's pull request (prototype `.tb-chip`
 *  branch / pr), read from the same per-worktree probe as the composer rail. */
export function BranchChips({ cwd }: { cwd: string }) {
  const { t } = useI18n()
  const copy = t.studio.shell.toolbar
  const coding = t.statusStack.coding
  const repoPath = cwd.trim() || undefined
  const status = useStore(repoStatusForCwd(repoPath))
  const branch = status?.detached ? null : status?.branch || null
  const pr = useStore($pullRequestsByBranch)[repoPath && branch ? branchPrKey(repoPath, branch) : '']

  // Keep this worktree in the probe's refresh set while the chip shows it.
  useEffect(() => registerRepoStatusCwd(repoPath), [repoPath])

  useEffect(() => {
    if (repoPath && branch) {
      void refreshPullRequests({ [repoPath]: [branch] })
    }
  }, [repoPath, branch])

  if (!status || !repoPath) {
    return null
  }

  const label = status.detached ? coding.detached : status.branch || coding.noBranch

  const counts = [status.ahead > 0 && coding.ahead(status.ahead), status.behind > 0 && coding.behind(status.behind)]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      <ToolbarMenu
        ariaLabel={copy.branchChip}
        contentClassName="min-w-56"
        items={kit => (
          <>
            <kit.Label className={menuHeadClass}>{counts ? `${label} · ${counts}` : label}</kit.Label>
            <DropdownMenuItem onSelect={() => runBuiltinAction('view.toggleReview')}>
              <StudioIcon name="diff" size={15} />
              <span>{copy.reviewChanges}</span>
              <MenuHint actionId="view.toggleReview" />
            </DropdownMenuItem>
            {pr && (
              <DropdownMenuItem onSelect={() => openPullRequest(pr)}>
                <StudioIcon name="pr" size={15} />
                <span className="min-w-0 truncate">{`#${pr.number} ${pr.title}`}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void openWorktreeDialog({ base: branch ?? undefined, repoPath })}>
              <StudioIcon name="branch" size={15} />
              <span>{coding.newBranch}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void openWorktreeDialog({ repoPath })}>
              <StudioIcon name="tree" size={15} />
              <span>{copy.newWorktree}</span>
              <MenuHint actionId="workspace.newWorktree" />
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void copyFilePath(repoPath)}>
              <StudioIcon name="copy" size={15} />
              <span>{copy.copyWorktreePath}</span>
            </DropdownMenuItem>
            <DropdownMenuLabel className={menuHeadClass}>{displayPath(repoPath)}</DropdownMenuLabel>
          </>
        )}
        tip={copy.branchChip}
      >
        <ToolbarChip aria-label={copy.branchChip} data-slot="toolbar-branch" icon="branch" label={label} />
      </ToolbarMenu>
      {pr && (
        <Tip label={`#${pr.number} ${pr.title}`} side="bottom">
          <ToolbarChip
            aria-label={copy.pullRequest}
            data-slot="toolbar-pr"
            icon="pr"
            label={`#${pr.number}`}
            onClick={() => openPullRequest(pr)}
          />
        </Tip>
      )}
    </>
  )
}
