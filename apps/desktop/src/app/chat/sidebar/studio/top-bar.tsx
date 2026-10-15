import { useStore } from '@nanostores/react'
import { atom } from 'nanostores'
import { useEffect, useState } from 'react'

import { type NewSessionSplitHandler, startNewSessionDrag } from '@/app/chat/new-session-drag'
import { TitlebarIcon } from '@/app/shell/titlebar-icon'
import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Tip, TipKeybindLabel } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { runBuiltinAction } from '@/lib/keybinds/plugin-actions'
import { cn } from '@/lib/utils'
import { recordAction } from '@/store/desktop-metrics'
import { toggleSidebarOpen } from '@/store/layout'
import { $newChatProfile } from '@/store/profile'

import type { SidebarNavItem } from '../../../types'
import { CONTEXT_SPLIT_KIT, SplitSubmenu } from '../split-submenu'

export interface SidebarTopBarActions {
  onNavigate: (item: SidebarNavItem) => void
  onNewSessionSplit: NewSessionSplitHandler
}

// The band is painted by the sessions zone's header (pane chrome `band`), so it
// mounts outside ChatSidebar. The sidebar publishes its controller actions here;
// they are latest-wrapped by the sidebar surface, so the last pair published
// stays valid while the pane is parked behind the Bots tab.
const $sidebarTopBarActions = atom<SidebarTopBarActions | null>(null)

export function publishSidebarTopBarActions(actions: SidebarTopBarActions): void {
  $sidebarTopBarActions.set(actions)
}

/** The "New session" nav item the compose button stands in for. */
export const NEW_SESSION_NAV_ITEM: SidebarNavItem = {
  action: 'new-session',
  icon: props => <Codicon name="edit" {...props} />,
  id: 'new-session',
  keybindActionId: 'session.new',
  label: ''
}

const FLASH_MS = 140

/** ⌘N pings the compose button the way it pinged the old nav row's hint. */
function useShortcutFlash(): boolean {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined

    const onShortcut = () => {
      setFlash(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setFlash(false), FLASH_MS)
    }

    window.addEventListener('hermes:new-session-shortcut', onShortcut)

    return () => {
      window.removeEventListener('hermes:new-session-shortcut', onShortcut)
      clearTimeout(timeout)
    }
  }, [])

  return flash
}

/**
 * The sessions column's titlebar band (prototype `.sb-top`): a draggable spacer,
 * then [Hide sidebar ⌘B] [New session ⌘N]. The zone reserves the traffic
 * lights. The compose button keeps every gesture of the old "New session" nav
 * row: click, drag onto a zone to create there, right-click → Open in split,
 * the ⌘N flash, and the `sidebar-nav-new-session` tour anchor.
 */
export function SidebarTopBar() {
  const { t } = useI18n()
  const actions = useStore($sidebarTopBarActions)
  const flash = useShortcutFlash()
  const newSessionLabel = t.sidebar.nav['new-session']

  const newSession = () => {
    triggerHaptic('tap')
    recordAction('session.new', 'click')

    if (!actions) {
      runBuiltinAction('session.new')

      return
    }

    // A plain new session lands in whatever profile the live gateway is on.
    $newChatProfile.set(null)
    actions.onNavigate(NEW_SESSION_NAV_ITEM)
  }

  return (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-1" data-slot="sidebar-top-bar">
      <Tip label={<TipKeybindLabel actionId="view.toggleSidebar" text={t.titlebar.hideSidebar} />} placement="toolbar">
        <Button
          aria-label={t.titlebar.hideSidebar}
          onClick={() => {
            triggerHaptic('tap')
            toggleSidebarOpen()
          }}
          size="icon-titlebar"
          variant="ghost"
        >
          <TitlebarIcon name="layout-sidebar-left" />
        </Button>
      </Tip>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <span className="inline-flex">
            <Tip label={<TipKeybindLabel actionId="session.new" text={newSessionLabel} />} placement="toolbar">
              <Button
                aria-label={newSessionLabel}
                className={cn(flash && 'bg-(--ui-press) text-(--ui-text-primary) transition-none')}
                data-tour="sidebar-nav-new-session"
                onClick={newSession}
                onPointerDown={event => {
                  // Drag onto a zone's strip / edge / center to create the session
                  // exactly there. A sub-threshold release stays the click above.
                  if (!actions) {
                    return
                  }

                  startNewSessionDrag(placement => {
                    $newChatProfile.set(null)
                    actions.onNewSessionSplit(placement.dir, { anchor: placement.anchor, before: placement.before })
                  }, event)
                }}
                size="icon-titlebar"
                variant="ghost"
              >
                <TitlebarIcon name="edit" />
              </Button>
            </Tip>
          </span>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label={newSessionLabel}>
          <SplitSubmenu
            disabled={!actions}
            kit={CONTEXT_SPLIT_KIT}
            label={t.sidebar.row.openInSplit}
            onSplit={dir => actions?.onNewSessionSplit(dir)}
          />
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
