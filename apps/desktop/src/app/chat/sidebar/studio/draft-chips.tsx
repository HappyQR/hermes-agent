import { useStore } from '@nanostores/react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { MenuHint } from '@/components/ui/actions-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { useKeybindHint } from '@/lib/keybinds/use-keybind-hint'
import { $dismissedAutoProjectIds, filterVisibleProjects } from '@/store/layout'
import {
  $projectTree,
  openFolderAsProject,
  projectIdForCwd,
  requestDetachedSession,
  requestStartWorkSession
} from '@/store/projects'
import { $currentCwd, $newChatWorkspaceTarget } from '@/store/session'

import { PROFILES_ROUTE } from '../../../routes'
import { filterToSessionBearingProjects } from '../project-filter'
import type { SidebarProjectTree } from '../projects/workspace-groups'

import { AccountTile } from './account-button'
import { useAccountIdentity } from './account-identity'
import { AccountProfileRows } from './account-menu'
import { projectNewSessionPath } from './project-row'
import { useAccountDialogs } from './use-account-dialogs'
import { useSwitchToRest } from './use-switch-to-rest'

// The new-chat screen's chips (prototype `.empty-meta .lnk`): the
// `.studio-empty-link` pill (studio/chat.css) with a trailing caret.
const CHIP = 'studio-empty-link data-[state=open]:bg-(--ui-hover) data-[state=open]:text-(--ui-text-primary)'

const check = <StudioIcon className="ml-auto shrink-0 text-(--ui-accent)" name="check" size={13} stroke={2.2} />

/** The projects a draft can start in (the Projects section's list) and the one
 *  the draft's folder belongs to — none for a detached draft. */
export function useDraftProject(): { current: null | SidebarProjectTree; projects: SidebarProjectTree[] } {
  const tree = useStore($projectTree)
  const dismissed = useStore($dismissedAutoProjectIds)
  const cwd = useStore($currentCwd)
  const target = useStore($newChatWorkspaceTarget)

  return useMemo(() => {
    const projects = filterToSessionBearingProjects(filterVisibleProjects(tree, dismissed)).filter(
      project => !project.isNoProject && projectNewSessionPath(project)
    )

    // `null` is an explicit "no folder" draft; otherwise the folder it sits in.
    const folder = target === null ? '' : (target ?? cwd ?? '').trim()
    const id = folder ? projectIdForCwd(folder) : null

    return { current: projects.find(project => project.id === id) ?? null, projects }
  }, [cwd, dismissed, target, tree])
}

/**
 * 「📁 No project ▾」: which project the new chat starts in. A pick starts the
 * draft there — the Projects section's "New session in this project" path —
 * and No project starts a detached draft.
 */
export function DraftProjectChip() {
  const { t } = useI18n()
  const copy = t.studio.sidebar
  const { current, projects } = useDraftProject()
  const openFolderHint = useKeybindHint('workspace.openFolder') ?? undefined
  const label = current?.label ?? copy.draft.noProject

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label={copy.draft.projectAria(label)} className={CHIP} data-slot="draft-project-chip" type="button">
          <StudioIcon name="folder" size={13} />
          <span className="max-w-48 truncate">{label}</span>
          <StudioIcon name="chev-d" size={11} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56 max-w-80" side="top" sideOffset={6}>
        <DropdownMenuItem onSelect={() => requestDetachedSession()}>
          <span className="min-w-0 flex-1 truncate">{copy.draft.noProject}</span>
          {current ? null : check}
        </DropdownMenuItem>
        {projects.length > 0 && <DropdownMenuSeparator />}
        {projects.map(project => (
          <DropdownMenuItem
            key={project.id}
            onSelect={() => {
              const path = projectNewSessionPath(project)

              if (path) {
                requestStartWorkSession(path)
              }
            }}
          >
            {/* Inline: the menu row tints a bare svg tertiary otherwise. */}
            <StudioIcon name="folder" size={15} style={project.color ? { color: project.color } : undefined} />
            <span className="min-w-0 flex-1 truncate">{project.label}</span>
            {project.id === current?.id ? check : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void openFolderAsProject()}>
          <StudioIcon name="folder-plus" size={15} />
          <span>{copy.projects.openFolder}</span>
          {openFolderHint ? <MenuHint>{openFolderHint}</MenuHint> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * 「H Hermes ▾」: which profile the new chat belongs to. The menu is the
 * account menu's profile rows (same switch paths, other gateways included),
 * then Manage profiles….
 */
export function DraftProfileChip() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const identity = useAccountIdentity()
  const [open, setOpen] = useState(false)
  // Not the owner: the sidebar account menu (or the rail) answers the
  // new-profile shortcut and hosts the remote-override dialog.
  const dialogs = useAccountDialogs(false)
  const { dialog: localDeviceDialog, pendingRoute, switchToRest } = useSwitchToRest()

  return (
    <>
      <DropdownMenu onOpenChange={setOpen} open={open}>
        <DropdownMenuTrigger asChild>
          <button
            aria-busy={pendingRoute !== null || undefined}
            aria-label={t.studio.sidebar.draft.profileAria(identity.name)}
            className={CHIP}
            data-slot="draft-profile-chip"
            type="button"
          >
            <AccountTile className="-ml-0.5 size-4.5 rounded-[5px] text-[0.625rem]" pending={pendingRoute !== null} />
            <span className="max-w-40 truncate">{identity.name}</span>
            <StudioIcon name="chev-d" size={11} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 max-w-80" side="top" sideOffset={6}>
          <AccountProfileRows close={() => setOpen(false)} dialogs={dialogs} switchToRest={switchToRest} />
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => navigate(PROFILES_ROUTE)}>
            <StudioIcon name="people" size={15} />
            <span>{t.profiles.manageProfiles}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {dialogs.dialogs}
      {localDeviceDialog}
    </>
  )
}
