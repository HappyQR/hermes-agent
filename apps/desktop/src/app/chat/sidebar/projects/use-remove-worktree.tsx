import type * as React from 'react'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useI18n } from '@/i18n'
import { dismissWorktree } from '@/store/layout'
import { notifyError } from '@/store/notifications'
import { removeWorktreePath } from '@/store/projects'

import type { SidebarSessionGroup } from './workspace-groups'

/**
 * Removing a worktree lane asks how: actually `git worktree remove` it, or just
 * hide the lane and leave the worktree on disk. A dirty worktree escalates to a
 * force prompt instead of erroring (those changes are usually throwaway).
 * Shared by the entered project's lanes and the Projects section's lanes.
 */
export function useRemoveWorktree(defaultRepoPath: null | string): {
  dialogs: React.ReactNode
  requestRemove: (group: SidebarSessionGroup, repoPath?: null | string) => void
} {
  const { t } = useI18n()
  const s = t.sidebar
  const [removeTarget, setRemoveTarget] = useState<null | SidebarSessionGroup>(null)
  const [forceTarget, setForceTarget] = useState<null | SidebarSessionGroup>(null)
  // The repo the pending removal belongs to (a project can span several).
  const [repoPath, setRepoPath] = useState<null | string>(defaultRepoPath)

  const removeViaGit = async (group: SidebarSessionGroup, force = false) => {
    if (!repoPath || !group.path) {
      return
    }

    try {
      await removeWorktreePath(repoPath, group.path, { force })
      dismissWorktree(group.id, { removed: true })
    } catch (err) {
      // git refuses a non-force remove on a dirty/locked worktree — offer force
      // rather than dead-ending on an error toast.
      if (!force && /force|modified|untracked|dirty|locked|contains/i.test(String((err as Error)?.message ?? ''))) {
        setForceTarget(group)
      } else {
        notifyError(err, s.projects.removeWorktreeFailed)
      }
    }
  }

  // Both prompts share the shape (hide-from-sidebar + cancel + a destructive
  // action); only the copy and the destructive handler differ.
  const worktreeDialog = (
    target: null | SidebarSessionGroup,
    setTarget: (next: null | SidebarSessionGroup) => void,
    description: string,
    destructiveLabel: string,
    onDestructive: (group: SidebarSessionGroup) => void
  ) => (
    <ConfirmDialog
      confirmLabel={destructiveLabel}
      description={description}
      destructive
      // removeViaGit finishes on its own: it either dismisses the lane,
      // escalates to the force prompt, or toasts.
      dismissOnConfirm
      onClose={() => setTarget(null)}
      onConfirm={() => {
        if (target) {
          onDestructive(target)
        }
      }}
      open={Boolean(target)}
      secondaryAction={{
        label: s.projects.removeFromSidebar,
        onClick: () => target && dismissWorktree(target.id)
      }}
      title={`${s.projects.removeWorktree} "${target?.label ?? ''}"?`}
    />
  )

  const dialogs = (
    <>
      {worktreeDialog(
        removeTarget,
        setRemoveTarget,
        s.projects.removeWorktreeConfirm,
        s.projects.removeWorktree,
        group => void removeViaGit(group)
      )}
      {worktreeDialog(
        forceTarget,
        setForceTarget,
        s.projects.removeWorktreeDirty,
        s.projects.forceRemove,
        group => void removeViaGit(group, true)
      )}
    </>
  )

  return {
    dialogs,
    requestRemove: (group, path = defaultRepoPath) => {
      setRepoPath(path)
      setRemoveTarget(group)
    }
  }
}
