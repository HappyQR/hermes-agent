import type { useSensors } from '@dnd-kit/core'
import { useState } from 'react'

import { type NewSessionSplitHandler, startNewProjectDrag } from '@/app/chat/new-session-drag'
import { MenuHint } from '@/components/ui/actions-menu'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { GlyphSpinner } from '@/components/ui/glyph-spinner'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { useKeybindHint } from '@/lib/keybinds/use-keybind-hint'
import { openWorktreeDialog } from '@/store/coding-status'
import { $newProjectDropPlacement, openFolderAsProject, openProjectCreate } from '@/store/projects'

import type { SidebarProjectTree } from '../projects/workspace-groups'
import { ReorderableList, useSortableBindings } from '../reorderable-list'
import { SidebarSessionSkeletons } from '../section-states'

import { ProjectSectionRow } from './project-row'
import { SidebarSection } from './section-header'

/** Projects header "+": a menu (new project · open folder · new worktree), and
 *  a drag source — drag it onto a zone to start the new project's first
 *  session exactly there (the project dialog consumes the armed placement). */
function ProjectsAddMenu() {
  const { t } = useI18n()
  const copy = t.studio.sidebar.projects
  const [open, setOpen] = useState(false)
  const openFolderHint = useKeybindHint('workspace.openFolder') ?? undefined
  const newWorktreeHint = useKeybindHint('workspace.newWorktree') ?? undefined
  const label = t.sidebar.projects.newButton

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <Tip label={label} placement="row">
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={label}
            className="size-5.5 rounded-[6px] text-(--ui-text-tertiary) hover:bg-(--ui-hover) hover:text-foreground data-[state=open]:bg-(--ui-press)"
            onPointerDown={event => {
              // The drag owns the press; a tap (sub-threshold release) opens the menu.
              event.preventDefault()
              startNewProjectDrag(placement => $newProjectDropPlacement.set(placement), event, {
                onTap: () => setOpen(true)
              })
            }}
            size="icon-xs"
            variant="ghost"
          >
            <StudioIcon name="plus" size={13} />
          </Button>
        </DropdownMenuTrigger>
      </Tip>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuItem onSelect={openProjectCreate}>
          <StudioIcon name="folder-plus" size={15} />
          <span>{copy.newProject}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void openFolderAsProject()}>
          <StudioIcon name="folder" size={15} />
          <span>{copy.openFolder}</span>
          {openFolderHint ? <MenuHint>{openFolderHint}</MenuHint> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void openWorktreeDialog()}>
          <StudioIcon name="branch" size={15} />
          <span>{copy.newWorktree}</span>
          {newWorktreeHint ? <MenuHint>{newWorktreeHint}</MenuHint> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SortableProjectRow(props: React.ComponentProps<typeof ProjectSectionRow>) {
  return <ProjectSectionRow {...props} {...useSortableBindings(props.project.id)} reorderable />
}

interface SidebarProjectsSectionProps {
  /** Real projects (the synthetic Home bucket excluded), already ordered. */
  projects: SidebarProjectTree[]
  loading: boolean
  scanning: boolean
  activeProjectId: null | string
  /** The project the Sessions list is scoped to, if any. */
  scopedProjectId: null | string
  onSelectScope: (id: null | string) => void
  onNewSessionInWorkspace: (path: null | string) => void
  onNewSessionSplit?: NewSessionSplitHandler
  onReorder?: (ids: string[]) => void
  dndSensors?: ReturnType<typeof useSensors>
}

/**
 * The Projects section (prototype: always above Pinned): one row per project,
 * lanes on expand, a click scopes the Sessions list. Drag-to-reorder keeps the
 * hand-picked order; the header "+" creates.
 */
export function SidebarProjectsSection({
  projects,
  loading,
  scanning,
  activeProjectId,
  scopedProjectId,
  onSelectScope,
  onNewSessionInWorkspace,
  onNewSessionSplit,
  onReorder,
  dndSensors
}: SidebarProjectsSectionProps) {
  const { t } = useI18n()
  const copy = t.studio.sidebar.projects
  const draggable = projects.length > 1 && Boolean(onReorder)

  const row = (project: SidebarProjectTree, Row: typeof ProjectSectionRow) => (
    <Row
      activeProjectId={activeProjectId}
      key={project.id}
      onNewSessionInWorkspace={onNewSessionInWorkspace}
      onNewSessionSplit={onNewSessionSplit}
      onSelectScope={onSelectScope}
      project={project}
      scoped={project.id === scopedProjectId}
    />
  )

  let body: React.ReactNode

  if (!projects.length) {
    body = loading ? (
      <SidebarSessionSkeletons />
    ) : (
      <div className="mx-2 mt-0.5 mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg px-2.5 py-2 text-xs text-(--ui-text-tertiary) shadow-[inset_0_0_0_1px_var(--ui-line)]">
        <span>{copy.empty}</span>
        <Button onClick={openProjectCreate} size="xs" variant="text">
          {copy.newProject}
        </Button>
      </div>
    )
  } else if (draggable && onReorder) {
    body = (
      <ReorderableList ids={projects.map(project => project.id)} onReorder={onReorder} sensors={dndSensors}>
        {projects.map(project => row(project, SortableProjectRow))}
      </ReorderableList>
    )
  } else {
    body = projects.map(project => row(project, ProjectSectionRow))
  }

  return (
    <SidebarSection
      count={projects.length}
      id="projects"
      meta={
        scanning ? (
          <GlyphSpinner ariaLabel={t.sidebar.loading} className="text-[0.6875rem] text-(--ui-text-quaternary)" />
        ) : undefined
      }
      title={t.sidebar.projects.sectionLabel}
      tools={<ProjectsAddMenu />}
    >
      <div className="flex flex-col gap-px" data-slot="sidebar-projects">
        {body}
      </div>
    </SidebarSection>
  )
}
