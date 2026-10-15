import { useStore } from '@nanostores/react'
import { useEffect } from 'react'

import type { HermesBranchPullRequest, HermesGitBranch, HermesGitWorktree, HermesRepoStatus } from '@/global'
import type { Translations } from '@/i18n'
import { openWorktreeDialog, registerRepoStatusCwd, repoStatusForCwd, repoWorktreesForCwd } from '@/store/coding-status'
import { notifyError } from '@/store/notifications'
import { $pullRequestsByBranch, branchPrKey, refreshPullRequests } from '@/store/pull-requests'

/** The branch actions a coding surface can offer. Each is optional: an omitted
 *  handler hides its rows (e.g. a remote backend has no local worktrees). */
export interface CodingBranchActions {
  /** Branch the current draft off into a fresh worktree + session. */
  onBranchOff?: (branch: string, base?: string) => Promise<void>
  /** Check an existing branch out into a fresh worktree + session. */
  onConvertBranch?: (branch: string, path?: null | string, isDefault?: boolean) => Promise<void>
  /** List the repo's local branches for the "convert a branch" picker. */
  onListBranches?: () => Promise<HermesGitBranch[]>
  /** Jump into an existing worktree (open a fresh session anchored there). */
  onOpenWorktree?: (path: string) => void
  /** Switch the current repo checkout to another branch. */
  onSwitchBranch?: (branch: string) => Promise<void>
}

export interface CodingStatus {
  pr: HermesBranchPullRequest | undefined
  repoPath: string | undefined
  status: HermesRepoStatus | null
  worktrees: HermesGitWorktree[]
}

/**
 * One surface's git context: its OWN worktree's status (never the primary's —
 * a blank repoPath stays blank), the other worktrees, and the branch's PR.
 * While mounted the worktree joins the coding-status refresh set, and the PR
 * is looked up once per branch (TTL-cached and shared with the sidebar).
 */
export function useCodingStatus(repoPath: null | string | undefined): CodingStatus {
  const resolvedRepoPath = repoPath?.trim() || undefined
  const status = useStore(repoStatusForCwd(resolvedRepoPath))
  const worktrees = useStore(repoWorktreesForCwd(resolvedRepoPath))

  useEffect(() => registerRepoStatusCwd(resolvedRepoPath), [resolvedRepoPath])

  const prBranch = status?.detached ? null : status?.branch || null

  useEffect(() => {
    if (resolvedRepoPath && prBranch) {
      void refreshPullRequests({ [resolvedRepoPath]: [prBranch] })
    }
  }, [resolvedRepoPath, prBranch])

  const pr =
    useStore($pullRequestsByBranch)[resolvedRepoPath && prBranch ? branchPrKey(resolvedRepoPath, prBranch) : '']

  return { pr, repoPath: resolvedRepoPath, status, worktrees }
}

export interface BranchTarget {
  base: string | undefined
  label: string
}

export interface CodingRowModel {
  branchLabel: string
  branchTargets: BranchTarget[]
  current: null | string
  hasLineDelta: boolean
  otherWorktrees: HermesGitWorktree[]
  switchTarget: null | string
  /** Untracked files carry no line delta vs HEAD: surface them as a count when
   *  they're the only change (otherwise +/- tells the story). */
  untrackedOnly: boolean
}

/** Pure derivation of what the git row / chip shows and which branch actions it offers. */
export function codingRowModel(
  status: HermesRepoStatus,
  worktrees: readonly HermesGitWorktree[],
  actions: Pick<CodingBranchActions, 'onOpenWorktree' | 'onSwitchBranch'>,
  s: Translations['statusStack']['coding']
): CodingRowModel {
  const branchLabel = status.detached ? s.detached : status.branch || s.noBranch
  const current = status.detached ? null : status.branch
  const branchTargets: BranchTarget[] = []

  // Current branch first (the 99% "branch off where I am"), then the trunk just
  // below it ("New branch from main"), deduped when they're the same; a plain
  // off-HEAD branch when no trunk is detected.
  if (current) {
    branchTargets.push({ base: current, label: s.branchOffFrom(current) })
  }

  if (status.defaultBranch && status.defaultBranch !== current) {
    branchTargets.push({ base: status.defaultBranch, label: s.branchOffFrom(status.defaultBranch) })
  }

  if (branchTargets.length === 0) {
    branchTargets.push({ base: undefined, label: s.newBranch })
  }

  const switchTarget =
    actions.onSwitchBranch && current && status.defaultBranch && status.defaultBranch !== current
      ? status.defaultBranch
      : null

  // Other worktrees to jump into — everything except the one we're already in
  // (matched by its checked-out branch) and the bare/main placeholder entry.
  const otherWorktrees = actions.onOpenWorktree
    ? worktrees.filter(w => w.path && !w.detached && w.branch && w.branch !== current)
    : []

  const hasLineDelta = status.added > 0 || status.removed > 0

  return {
    branchLabel,
    branchTargets,
    current,
    hasLineDelta,
    otherWorktrees,
    switchTarget,
    untrackedOnly: !hasLineDelta && status.untracked > 0
  }
}

/** The shared worktree dialog (one mounted in the sidebar), pinned to this repo. */
export function startBranchFrom(base: string | undefined, repoPath: string | undefined): void {
  void openWorktreeDialog({ base, repoPath })
}

/** Switch the checkout, reporting a failure instead of throwing it at the menu. */
export async function switchToBranch(
  branch: string,
  onSwitchBranch: CodingBranchActions['onSwitchBranch'],
  s: Translations['statusStack']['coding']
): Promise<void> {
  if (!onSwitchBranch) {
    return
  }

  try {
    await onSwitchBranch(branch)
  } catch (err) {
    notifyError(err, s.switchFailed(branch))
  }
}
