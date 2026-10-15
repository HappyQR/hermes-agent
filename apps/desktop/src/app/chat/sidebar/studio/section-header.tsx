import { useStore } from '@nanostores/react'
import { type ReactNode, useEffect } from 'react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { $sidebarListGroupIds, $sidebarWorkspaceNodeOpen, setWorkspaceNodesOpen } from '@/store/layout'
import { $projectTree } from '@/store/projects'
import { $unreadFinishedSessionIds, markAllSessionsRead } from '@/store/session'
import { ackAllSessionsRead } from '@/store/session-unread'
import {
  $sidebarEffectiveGrouping,
  $sidebarSectionCollapsed,
  registerSidebarSection,
  setAllSidebarSectionsCollapsed,
  sidebarSectionCollapsed,
  type SidebarSectionId,
  toggleSidebarSection
} from '@/store/sidebar-studio'

/** A section's collapsed flag (persisted per id) and its toggle. Registers the
 *  section as on screen so "Collapse all" reaches it. */
export function useSidebarSection(id: SidebarSectionId, defaultCollapsed = false): [boolean, () => void] {
  const collapsed = sidebarSectionCollapsed(useStore($sidebarSectionCollapsed), id, defaultCollapsed)

  useEffect(() => registerSidebarSection(id, defaultCollapsed), [id, defaultCollapsed])

  return [collapsed, () => toggleSidebarSection(id, defaultCollapsed)]
}

/** The group folds the active grouping draws (date/status/source dividers, or
 *  project rows) — what "Expand/Collapse all groups" acts on. */
function useGroupFoldIds(): string[] {
  const grouping = useStore($sidebarEffectiveGrouping)
  const listGroupIds = useStore($sidebarListGroupIds)
  const projects = useStore($projectTree)

  return grouping === 'project' ? projects.map(project => project.id) : listGroupIds
}

/** Header right-click menu. Its own component so the stores it reads are only
 *  subscribed while the menu is open. */
function SectionMenuItems() {
  const { t } = useI18n()
  const copy = t.studio.sidebar.section
  const unread = useStore($unreadFinishedSessionIds).length
  const foldIds = useGroupFoldIds()
  const nodeOpen = useStore($sidebarWorkspaceNodeOpen)
  const allFolded = foldIds.length > 0 && foldIds.every(id => nodeOpen[id] === false)

  return (
    <>
      <ContextMenuItem
        disabled={unread === 0}
        onSelect={() => {
          markAllSessionsRead()
          // Ack the persisted layer too, or the next list refresh repaints
          // every dot just dismissed.
          ackAllSessionsRead()
        }}
      >
        <StudioIcon name="check" size={15} />
        <span>{t.sidebar.markAllRead}</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={() => setAllSidebarSectionsCollapsed(false)}>
        <span>{t.sidebar.filter.expandAll}</span>
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => setAllSidebarSectionsCollapsed(true)}>
        <span>{t.sidebar.filter.collapseAll}</span>
      </ContextMenuItem>
      {foldIds.length > 0 && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem disabled={!allFolded} onSelect={() => setWorkspaceNodesOpen(foldIds, true)}>
            <span>{copy.expandGroups}</span>
          </ContextMenuItem>
          <ContextMenuItem disabled={allFolded} onSelect={() => setWorkspaceNodesOpen(foldIds, false)}>
            <span>{copy.collapseGroups}</span>
          </ContextMenuItem>
        </>
      )}
    </>
  )
}

interface SidebarSectionHeaderProps {
  title: string
  collapsed: boolean
  onToggle: () => void
  /** Items hidden behind the fold, announced while collapsed. */
  count?: number
  /** Inline after the title (the project scope chip). */
  extra?: ReactNode
  /** Muted slot after the title (a scan spinner). */
  meta?: ReactNode
  /** Hover-revealed controls; they stay visible while one of their menus is open. */
  tools?: ReactNode
}

/**
 * Section header (prototype `.sb-sec-head`): a 26px caption whose title and
 * empty fill both fold the section, a chevron that shows on hover (and stays,
 * turned, while folded), a count pill while folded, and hover tools. Right-click
 * offers mark-all-read and the expand/collapse sweeps.
 */
export function SidebarSectionHeader({
  title,
  collapsed,
  onToggle,
  count,
  extra,
  meta,
  tools
}: SidebarSectionHeaderProps) {
  const { t } = useI18n()
  const copy = t.studio.sidebar.section

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="group/section flex h-6.5 shrink-0 items-center gap-1 pr-1 pl-2 text-[0.71875rem] font-semibold text-(--ui-text-tertiary) select-none"
          data-slot="sidebar-section-header"
        >
          <Tip label={collapsed ? copy.expand : copy.collapse} placement="row">
            <button
              aria-expanded={!collapsed}
              // With an inline extra (the scope chip) the title keeps its width
              // and the chip truncates instead.
              className={cn(
                'inline-flex items-center gap-0.75 bg-transparent text-left',
                extra ? 'shrink-0' : 'min-w-0 shrink'
              )}
              onClick={onToggle}
              type="button"
            >
              <span className="truncate">{title}</span>
              <StudioIcon
                className={cn(
                  'opacity-0 transition-[opacity,transform] duration-200 ease-(--studio-ease) group-hover/section:opacity-100',
                  collapsed && '-rotate-90 opacity-100'
                )}
                name="chev-d"
                size={11}
                stroke={2.2}
              />
            </button>
          </Tip>
          {collapsed && count ? (
            <span aria-label={copy.collapsedCount(count)} className="sidebar-section-count" role="status">
              {count}
            </span>
          ) : null}
          {meta}
          {extra}
          <span aria-hidden="true" className="h-full min-w-2 flex-1" onClick={onToggle} />
          {tools ? (
            <span className="flex items-center opacity-0 transition-opacity duration-[120ms] group-hover/section:opacity-100 focus-within:opacity-100 has-[[data-state=open]]:opacity-100">
              {tools}
            </span>
          ) : null}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <SectionMenuItems />
      </ContextMenuContent>
    </ContextMenu>
  )
}

interface SidebarSectionProps extends Omit<SidebarSectionHeaderProps, 'collapsed' | 'onToggle'> {
  id: SidebarSectionId
  children: ReactNode
  defaultCollapsed?: boolean
  className?: string
}

/** A collapsible sidebar section (prototype `.sb-sec`): header + body. */
export function SidebarSection({ id, children, defaultCollapsed = false, className, ...header }: SidebarSectionProps) {
  const [collapsed, toggle] = useSidebarSection(id, defaultCollapsed)

  return (
    <section className={cn('mt-1.5 flex flex-col', className)} data-sidebar-section={id}>
      <SidebarSectionHeader collapsed={collapsed} onToggle={toggle} {...header} />
      {!collapsed && children}
    </section>
  )
}
