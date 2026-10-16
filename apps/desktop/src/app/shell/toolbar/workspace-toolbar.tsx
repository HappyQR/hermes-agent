import { useStore } from '@nanostores/react'
import { memo, useEffect, useRef, useState } from 'react'

import { WiredPane } from '@/app/contrib/context'
import type { WiringActions } from '@/app/contrib/types'
import { $workspaceIsPage, WORKSPACE_PAGE_HEADER_AREA } from '@/app/routes'
import type { StatusbarItem } from '@/app/shell/statusbar-controls'
import { Slot } from '@/contrib/react/slot'

import { useStatusbarItems } from '../hooks/use-statusbar-items'
import { showAgentsPane } from '../inspector/inspector-state'
import { useSharedStatus } from '../status-snapshot-host'

import { ToolbarCapsule } from './toolbar-capsule'
import { BranchChips, ProjectChip } from './toolbar-chips'
import { LivePill } from './toolbar-live'
import { ToolbarPageTitle, ToolbarTitle } from './toolbar-title'

const NO_ITEMS: StatusbarItem[] = []

/** True once the zone's main scroller (transcript or page) leaves the top. */
function useZoneScrolled() {
  const ref = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const zone = ref.current?.closest<HTMLElement>('[data-tree-group]')

    if (!zone) {
      return
    }

    const onScroll = (event: Event) => {
      const target = event.target

      // Only the zone's big scroller counts — not a code block or a menu.
      if (target instanceof HTMLElement && target.clientHeight > zone.clientHeight / 2) {
        setScrolled(target.scrollTop > 2)
      }
    }

    zone.addEventListener('scroll', onScroll, { capture: true, passive: true })

    return () => zone.removeEventListener('scroll', onScroll, { capture: true })
  }, [])

  return { ref, scrolled }
}

interface WorkspaceToolbarProps {
  cwd: string
  cwdItem?: StatusbarItem
  onOpenAgents: () => void
  timer?: StatusbarItem
}

/**
 * Hermes Studio's 52px workspace toolbar (prototype `.tb`): the focused chat's
 * title ▾ with its project / branch / PR chips on the left; the live pill and
 * the Layout ▾ | inspector capsule on the right. On a full page the page title
 * fades in instead and the page's own header controls follow it.
 */
export function WorkspaceToolbar({ cwd, cwdItem, onOpenAgents, timer }: WorkspaceToolbarProps) {
  const isPage = useStore($workspaceIsPage)
  const { ref, scrolled } = useZoneScrolled()

  return (
    <div
      className="flex h-full min-w-0 flex-1 items-center gap-2"
      data-scrolled={scrolled || undefined}
      data-slot="studio-toolbar"
      ref={ref}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        {isPage ? (
          <>
            <ToolbarPageTitle />
            <Slot area={WORKSPACE_PAGE_HEADER_AREA} />
          </>
        ) : (
          <>
            <ToolbarTitle />
            <ProjectChip item={cwdItem} />
            <BranchChips cwd={cwd} />
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!isPage && <LivePill onOpen={onOpenAgents} timer={timer} />}
        <ToolbarCapsule />
      </div>
    </div>
  )
}

/** The wired toolbar: reads the focused chat's workspace through the same item
 *  hook as the status bar, so the two can never describe different sessions. */
export const ToolbarSurface = memo(function ToolbarSurface({
  actions,
  agentsOpen,
  chatOpen,
  commandCenterOpen
}: {
  actions: WiringActions
  agentsOpen: boolean
  chatOpen: boolean
  commandCenterOpen: boolean
}) {
  const shared = useSharedStatus()

  const { currentCwd, leftStatusbarItems, statusbarItems } = useStatusbarItems({
    ...shared,
    agentsOpen,
    changeSessionCwd: actions.changeSessionCwd,
    chatOpen,
    commandCenterOpen,
    extraLeftItems: NO_ITEMS,
    extraRightItems: NO_ITEMS,
    openAgents: actions.openAgents,
    openCommandCenterSection: actions.openCommandCenterSection,
    requestGateway: actions.requestGateway,
    toggleCommandCenter: actions.toggleCommandCenter
  })

  const find = (id: string) =>
    leftStatusbarItems.find(item => item.id === id) ?? statusbarItems.find(item => item.id === id)

  return (
    <WorkspaceToolbar
      cwd={currentCwd}
      cwdItem={find('workspace-cwd')}
      onOpenAgents={showAgentsPane}
      timer={find('running-timer')}
    />
  )
})

/** The workspace pane's titlebar band (pane chrome `band`): a stable component
 *  so re-registering the pane never remounts the toolbar. */
export function WorkspaceToolbarBand() {
  return <WiredPane part="toolbar" />
}
