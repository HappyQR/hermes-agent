import type * as React from 'react'

import { type NewSessionSplitHandler, startNewSessionDrag } from '@/app/chat/new-session-drag'
import { Codicon } from '@/components/ui/codicon'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

import { SidebarRowGrab } from '../chrome'
import { useWorkspaceNodeOpen } from '../projects/model'
import { ProjectContextMenu, ProjectMenu } from '../projects/project-menu'
import type { SidebarProjectTree } from '../projects/workspace-groups'
import { shellOwnsPress } from '../reorderable-list'

import { ProjectLanes } from './project-lanes'

/** The folder a new session in this project starts in. A path-less explicit
 *  project still carries repo roots: anchor at the first one (#124808). */
export function projectNewSessionPath(project: SidebarProjectTree): null | string {
  return !project.isNoProject && !(project.path ?? '').trim()
    ? ((project.repos ?? []).map(repo => repo.path).find(root => (root ?? '').trim()) ?? project.path)
    : project.path
}

/** The project's glyph: its chosen icon, else the folder, in its color. */
function ProjectGlyph({ project }: { project: SidebarProjectTree }) {
  return (
    <span
      className={cn('grid size-4 shrink-0 place-items-center', !project.color && 'text-(--ui-text-secondary)')}
      style={project.color ? { color: project.color } : undefined}
    >
      {project.icon ? <Codicon name={project.icon} size="0.9375rem" /> : <StudioIcon name="folder" size={16} />}
    </span>
  )
}

interface ProjectSectionRowProps {
  project: SidebarProjectTree
  activeProjectId: null | string
  /** The project the Sessions list is scoped to. */
  scoped: boolean
  /** Scope the Sessions list to a project, or clear the scope (null). */
  onSelectScope: (id: null | string) => void
  onNewSessionInWorkspace: (path: null | string) => void
  onNewSessionSplit?: NewSessionSplitHandler
  reorderable?: boolean
  dragging?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
  ref?: React.Ref<HTMLDivElement>
  style?: React.CSSProperties
}

/**
 * A row of the Projects section (prototype `ProjectRow`): a chevron that shows
 * the project's lanes, the folder in the project's color, its name, "Auto" for
 * a discovered repo, and on hover [+ new session here] [⋯]. Clicking the row
 * scopes the Sessions list to the project (again to clear it). Dragging a
 * session onto it moves the session into the project.
 */
export function ProjectSectionRow({
  project,
  activeProjectId,
  scoped,
  onSelectScope,
  onNewSessionInWorkspace,
  onNewSessionSplit,
  reorderable = false,
  dragging = false,
  dragHandleProps,
  ref,
  style
}: ProjectSectionRowProps) {
  const { t } = useI18n()
  const copy = t.studio.sidebar.projects
  const s = t.sidebar
  // Lanes default closed: opening one hydrates that project alone.
  const [open, toggleOpen] = useWorkspaceNodeOpen(`projects-section:${project.id}`, false)
  const isActive = project.id === activeProjectId
  const newSessionPath = projectNewSessionPath(project)
  const newSession = () => onNewSessionInWorkspace(newSessionPath)

  const glyph = reorderable ? (
    <SidebarRowGrab
      ariaLabel={s.projects.reorder(project.label)}
      dragging={dragging}
      dragHandleProps={dragHandleProps}
      leadClassName="size-4 overflow-visible"
    >
      <ProjectGlyph project={project} />
    </SidebarRowGrab>
  ) : (
    <ProjectGlyph project={project} />
  )

  return (
    <div
      className={cn(
        dragging && 'relative z-10',
        // Painted imperatively by session-drag.ts while a dragged session
        // hovers this row — a live "drop here to move" cue (prototype .sb-row.drop).
        'rounded-[7px] data-[session-drop-hover=true]:bg-(--ui-accent-softer) data-[session-drop-hover=true]:shadow-[inset_0_0_0_1.5px_var(--ui-accent)]'
      )}
      data-sessions-project={project.id}
      ref={ref}
      style={style}
    >
      <ProjectContextMenu isActive={isActive} onNewSession={newSession} project={project}>
        <div
          className={cn(
            'group/workspace flex h-7.5 min-w-0 items-center gap-2 rounded-[7px] px-2 text-[0.8125rem] transition-colors duration-[120ms]',
            'hover:bg-(--ui-row-hover-background) has-[[data-state=open]]:bg-(--ui-row-hover-background)',
            scoped && 'bg-(--ui-selected) hover:bg-(--ui-selected)',
            dragging && 'cursor-grabbing bg-(--ui-sidebar-surface-background)'
          )}
          data-glass-opaque={dragging ? '' : undefined}
          onPointerDown={event => {
            // The ⋯ menu and its dialogs portal out of this row's subtree.
            if (!shellOwnsPress(event)) {
              return
            }

            if ((event.target as HTMLElement).closest('[data-reorder-handle], [data-row-actions], button')) {
              return
            }

            dragHandleProps?.onPointerDown?.(event)
          }}
        >
          <button
            aria-expanded={open}
            aria-label={s.projects.toggle(project.label, !open)}
            className="-mx-1.5 grid size-5.5 shrink-0 place-items-center rounded-[6px] text-(--ui-text-tertiary) hover:bg-(--ui-hover) hover:text-foreground active:bg-(--ui-press)"
            data-slot="sidebar-project-toggle"
            onClick={toggleOpen}
            type="button"
          >
            <StudioIcon name={open ? 'chev-d' : 'chev-r'} size={11} stroke={2.2} />
          </button>
          <button
            aria-pressed={scoped}
            className="flex min-w-0 flex-1 items-center gap-2 self-stretch bg-transparent text-left"
            data-slot="sidebar-project-main"
            onClick={() => onSelectScope(scoped ? null : project.id)}
            type="button"
          >
            {glyph}
            <span className="min-w-0 flex-1 truncate font-medium">{project.label}</span>
            {project.isAuto ? (
              <Tip label={s.projects.autoDiscovered} placement="row">
                <span className="shrink-0 text-[0.71875rem] text-(--ui-text-tertiary) group-hover/workspace:hidden">
                  {copy.auto}
                </span>
              </Tip>
            ) : null}
          </button>
          <span
            className="-mr-1 hidden items-center group-hover/workspace:flex group-focus-within/workspace:flex has-[[data-state=open]]:flex"
            data-row-actions
          >
            <Tip label={copy.newSessionHere} placement="row">
              <button
                aria-label={copy.newSessionHere}
                className="grid size-5.5 place-items-center rounded-[6px] text-(--ui-text-secondary) hover:bg-(--ui-hover) hover:text-foreground"
                onClick={newSession}
                onPointerDown={
                  onNewSessionSplit
                    ? event =>
                        // Drag the "+" onto a chat zone: a new session pinned to
                        // the project's folder, exactly where it's dropped.
                        startNewSessionDrag(
                          placement =>
                            onNewSessionSplit(placement.dir, {
                              anchor: placement.anchor,
                              before: placement.before,
                              cwd: newSessionPath
                            }),
                          event,
                          { cwd: newSessionPath, label: copy.newSessionHere }
                        )
                    : undefined
                }
                type="button"
              >
                <StudioIcon name="plus" size={13} />
              </button>
            </Tip>
            <ProjectMenu
              isActive={isActive}
              onNewSession={newSession}
              project={project}
              triggerClassName="grid size-5.5 place-items-center rounded-[6px] text-(--ui-text-secondary) hover:bg-(--ui-hover) hover:text-foreground data-[state=open]:bg-(--ui-press)"
            />
          </span>
        </div>
      </ProjectContextMenu>
      {open && (
        <ProjectLanes
          onNewSession={onNewSessionInWorkspace}
          onNewSessionSplit={onNewSessionSplit}
          onScope={() => onSelectScope(project.id)}
          project={project}
        />
      )}
    </div>
  )
}
