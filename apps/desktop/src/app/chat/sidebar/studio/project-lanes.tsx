import { useStore } from '@nanostores/react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'

import { type NewSessionSplitHandler, startNewSessionDrag } from '@/app/chat/new-session-drag'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { type Translations, useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { $dismissedWorktreeIds, $removedWorktreeIds } from '@/store/layout'
import { notifyError } from '@/store/notifications'
import { fetchProjectSessions, listRepoBranches, projectProfile, switchBranchInRepo } from '@/store/projects'

import { useRepoWorktreeMap } from '../projects/model'
import { useRemoveWorktree } from '../projects/use-remove-worktree'
import {
  laneSwitchTarget,
  mergeRepoWorktreeGroups,
  type SidebarProjectTree,
  type SidebarSessionGroup
} from '../projects/workspace-groups'
import { WorkspaceContextMenu } from '../projects/workspace-header'
import { SidebarSessionSkeletons } from '../section-states'

interface ProjectLane {
  group: SidebarSessionGroup
  repoPath: null | string
}

/**
 * A project's lanes for the Projects section: main checkout, linked worktrees,
 * the kanban bucket. The overview payload carries no lane rows, so the first
 * expand hydrates THIS project (the same request "Show all" makes); git's own
 * worktree list adds empty lanes, and sidebar-dismissed worktrees stay hidden.
 */
function useProjectLanes(project: SidebarProjectTree): { failed: boolean; lanes: null | ProjectLane[] } {
  const [hydrated, setHydrated] = useState<null | SidebarProjectTree>(null)
  const [failed, setFailed] = useState(false)
  const dismissed = useStore($dismissedWorktreeIds)
  const removed = useStore($removedWorktreeIds)
  const source = hydrated ?? project

  const repoPaths = useMemo(
    () => source.repos.map(repo => repo.path).filter((path): path is string => Boolean(path)),
    [source]
  )

  const [worktrees] = useRepoWorktreeMap(repoPaths, true)

  // Re-hydrate when the project's session count moves (a session landed or left).
  useEffect(() => {
    // All-profiles view has no single backend to ask for one project's lanes;
    // the overview's lane structure (without counts) stands in.
    if (!projectProfile()) {
      setHydrated(null)

      return
    }

    let cancelled = false

    setFailed(false)
    fetchProjectSessions(project.id, { supersedable: false })
      .then(tree => {
        if (!cancelled) {
          setHydrated(tree)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [project.id, project.sessionCount])

  const lanes = useMemo(() => {
    if (!hydrated && projectProfile()) {
      return null
    }

    return source.repos.flatMap(repo => {
      const groups = mergeRepoWorktreeGroups(repo, repo.path ? worktrees[repo.path] : undefined)
      const discovered = new Set((repo.path ? worktrees[repo.path] : undefined)?.map(tree => tree.path?.trim()))

      // Main lanes are always visible; linked worktrees can be user-dismissed.
      // Discovery may resurrect a removed worktree, never an explicit hide.
      return groups
        .filter(
          group =>
            group.isMain ||
            !dismissed.includes(group.id) ||
            (removed.includes(group.id) && Boolean(group.path) && discovered.has(group.path ?? ''))
        )
        .map(group => ({ group, repoPath: repo.path }))
    })
  }, [dismissed, hydrated, removed, source, worktrees])

  return { failed, lanes }
}

/** A main-checkout lane is branch-labelled: open its "+" on that branch, not
 *  whatever the checkout currently sits on (`workspace-group.tsx` does the same). */
async function prepareLaneTarget(group: SidebarSessionGroup, t: Translations): Promise<boolean> {
  if (!(group.isMain && group.isGit !== false && group.path && group.label)) {
    return true
  }

  try {
    const branch = laneSwitchTarget(group, await listRepoBranches(group.path))

    if (branch) {
      await switchBranchInRepo(group.path, branch)
    }

    return true
  } catch (err) {
    notifyError(err, t.statusStack.coding.switchFailed(group.label))

    return false
  }
}

interface LaneRowProps {
  group: SidebarSessionGroup
  counted: boolean
  onScope: () => void
  onRemove?: () => void
  onNewSession?: (path: null | string) => void
  onNewSessionSplit?: NewSessionSplitHandler
}

function LaneRow({ counted, group, onNewSession, onNewSessionSplit, onRemove, onScope }: LaneRowProps) {
  const { t } = useI18n()
  const label = t.studio.sidebar.projects.newSessionInLane
  const canAdd = Boolean(onNewSession) && !group.isKanban

  const add = async () => {
    if (onNewSession && (await prepareLaneTarget(group, t))) {
      onNewSession(group.path)
    }
  }

  return (
    <WorkspaceContextMenu onRemove={onRemove} path={group.path}>
      <div className="group/lane flex h-6.5 min-w-0 items-center gap-2 rounded-[7px] px-2 text-[0.78125rem] text-(--ui-text-secondary) transition-colors duration-[120ms] hover:bg-(--ui-row-hover-background) has-[[data-state=open]]:bg-(--ui-row-hover-background)">
        <button
          className="flex min-w-0 flex-1 items-center gap-2 self-stretch bg-transparent text-left"
          onClick={onScope}
          type="button"
        >
          <StudioIcon
            className="text-(--ui-text-tertiary)"
            name={group.isKanban ? 'kanban' : group.isGit === false ? 'folder' : 'branch'}
            size={13}
          />
          <span className="min-w-0 flex-1 truncate" title={group.path ?? undefined}>
            {group.label}
          </span>
          {counted ? (
            <span className="shrink-0 text-[0.71875rem] tabular-nums text-(--ui-text-tertiary) group-hover/lane:hidden">
              {group.sessions.length}
            </span>
          ) : null}
        </button>
        {canAdd ? (
          <Tip label={label} placement="row">
            <button
              aria-label={label}
              className="-mr-1 hidden size-5.5 shrink-0 place-items-center rounded-[6px] text-(--ui-text-secondary) group-focus-within/lane:grid group-hover/lane:grid hover:bg-(--ui-hover) hover:text-foreground"
              onClick={() => void add()}
              onPointerDown={
                onNewSessionSplit
                  ? event =>
                      startNewSessionDrag(
                        placement =>
                          void prepareLaneTarget(group, t).then(
                            ok =>
                              ok &&
                              onNewSessionSplit(placement.dir, {
                                anchor: placement.anchor,
                                before: placement.before,
                                cwd: group.path
                              })
                          ),
                        event,
                        { cwd: group.path, label }
                      )
                  : undefined
              }
              type="button"
            >
              <StudioIcon name="plus" size={12} />
            </button>
          </Tip>
        ) : null}
      </div>
    </WorkspaceContextMenu>
  )
}

interface ProjectLanesProps {
  project: SidebarProjectTree
  onScope: () => void
  onNewSession?: (path: null | string) => void
  onNewSessionSplit?: NewSessionSplitHandler
}

/** The expanded project's lanes (prototype `.sb-proj-children`). */
export function ProjectLanes({ project, onNewSession, onNewSessionSplit, onScope }: ProjectLanesProps) {
  const { t } = useI18n()
  const { failed, lanes } = useProjectLanes(project)
  // One removal flow per project (lanes of every repo it spans share it).
  const { dialogs, requestRemove } = useRemoveWorktree(project.path)
  const counted = Boolean(projectProfile())

  let body: ReactNode

  if (failed) {
    body = <div className="px-2 py-1 text-xs text-(--ui-text-tertiary)">{t.sidebar.projectLoadFailed}</div>
  } else if (!lanes) {
    body = <SidebarSessionSkeletons />
  } else {
    body = lanes.map(({ group, repoPath }) => (
      <LaneRow
        counted={counted}
        group={group}
        key={group.id}
        onNewSession={onNewSession}
        onNewSessionSplit={onNewSessionSplit}
        onRemove={group.isMain || group.isKanban ? undefined : () => requestRemove(group, repoPath)}
        onScope={onScope}
      />
    ))
  }

  return (
    <div
      className={cn(
        'mb-1 ml-3.5 flex flex-col gap-px overflow-hidden pl-2 shadow-[inset_0.5px_0_0_var(--ui-line-2)]',
        'motion-safe:animate-[studio-fade-in_160ms_both]'
      )}
      data-slot="sidebar-project-lanes"
    >
      {body}
      {dialogs}
    </div>
  )
}
