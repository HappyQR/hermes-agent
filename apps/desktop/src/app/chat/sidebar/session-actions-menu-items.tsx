import { useStore } from '@nanostores/react'
import { useEffect } from 'react'

import { openSession } from '@/app/open-session'
import {
  closeAllTreeTabs,
  closeOtherTreeTabs,
  closeTreeTabsToRight,
  reloadTreePane,
  treeTabCloseTargets
} from '@/components/pane-shell/tree/store'
import type { ActionItemSpec, MenuKit } from '@/components/ui/actions-menu'
import { ColorSwatches } from '@/components/ui/color-swatches'
import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
import { type Translations, useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { ArchiveOff } from '@/lib/icons'
import { formatModifierToken, IS_MAC } from '@/lib/keybinds/combo'
import { PROFILE_SWATCHES } from '@/lib/profile-color'
import { exportSession, exportSessionMarkdown } from '@/lib/session-export'
import { notify, notifyError } from '@/store/notifications'
import {
  $projectTree,
  moveSessionToProject,
  openProjectCreate,
  projectIdForCwd,
  projectRootCwd,
  refreshProjectTree
} from '@/store/projects'
import { $sessions, sessionMatchesStoredId, sessionPinId } from '@/store/session'
import { $sessionColorOverrides, setSessionColorOverride } from '@/store/session-color'
import { closeAllOpenSessionTiles } from '@/store/session-states'
import { canOpenSessionInTerminal, canOpenSessionWindow, openSessionInTerminal } from '@/store/windows'

type RowCopy = Translations['sidebar']['row']
type MenuCopy = Translations['studio']['sidebar']['menu']

export const menuIcon = (name: StudioIconName) => <StudioIcon name={name} size={15} />

// Apple's modifier order: ⌃ ⌥ ⇧ ⌘.
const MODIFIER_ORDER = ['ctrl', 'alt', 'shift', 'mod']

/** A row gesture as a menu hint ("⇧⌘-click"), in the platform's notation. The
 *  gestures themselves live in session-row-gesture.ts. */
export function clickHint(mods: readonly string[], copy: MenuCopy): string {
  const tokens = [...mods]
    .sort((a, b) => MODIFIER_ORDER.indexOf(a) - MODIFIER_ORDER.indexOf(b))
    .map(formatModifierToken)

  return copy.clickHint(IS_MAC ? tokens.join('') : tokens.join('+'))
}

const select = (run: () => void) => () => {
  triggerHaptic('selection')
  run()
}

interface OpenItemsContext {
  sessionId: string
  profile?: string
  /** Sidebar rows carry the click gestures the hints name; tabs don't. */
  row: boolean
  alreadyTabbed: boolean
  isRemote: boolean
  r: RowCopy
  menu: MenuCopy
}

/** OPEN — where else this session can go. A tab surface IS a tab already, so it
 *  only offers the window hop (and its own Close). */
export function buildOpenItems({ alreadyTabbed, isRemote, menu, profile, r, row, sessionId }: OpenItemsContext) {
  const items: ActionItemSpec[] = []

  if (row && !alreadyTabbed) {
    items.push({
      disabled: !sessionId,
      hint: clickHint(['mod'], menu),
      iconNode: menuIcon('plus'),
      label: r.openInNewTab,
      // Stack into the MAIN zone as a tab (center dock; the strip sticky-shows
      // on gain). Focuses first if the session is already on screen.
      onSelect: select(() => openSession(sessionId, () => undefined, 'tab'))
    })
  }

  if (canOpenSessionWindow()) {
    items.push({
      disabled: !sessionId,
      hint: row ? clickHint(['shift', 'mod'], menu) : undefined,
      iconNode: menuIcon('window'),
      label: menu.openInNewWindow,
      onSelect: select(() => openSession(sessionId, () => undefined, 'window'))
    })
  }

  // The user's OWN terminal, not the in-app pane: resumes the session in the
  // TUI. Hidden on a remote connection — the emulator we'd open runs on this
  // machine while the session (and its runtime) lives on the remote host.
  if (canOpenSessionInTerminal() && !isRemote) {
    items.push({
      disabled: !sessionId,
      iconNode: menuIcon('terminal'),
      label: r.openInTerminal,
      onSelect: select(() => {
        // Read the row lazily: subscribing every row's menu to $sessions
        // would re-render the whole sidebar on each session update.
        const cwd =
          $sessions
            .get()
            .find(s => sessionMatchesStoredId(s, sessionId))
            ?.cwd?.trim() || undefined

        void openSessionInTerminal(sessionId, { cwd, profile })
      })
    })
  }

  return items
}

/** TAB — verbs that act on the strip (tab surfaces only; a row isn't a tab). */
export function buildTabItems({
  onClose,
  tabPaneId,
  t
}: {
  onClose?: () => void
  tabPaneId?: string
  t: Translations
}): ActionItemSpec[] {
  const closeTargets = tabPaneId ? treeTabCloseTargets(tabPaneId) : null
  const items: ActionItemSpec[] = []

  if (tabPaneId) {
    items.push({ icon: 'refresh', label: t.zones.reload, onSelect: select(() => reloadTreePane(tabPaneId)) })
  }

  if (onClose) {
    items.push({ disabled: false, icon: 'close', label: t.common.close, onSelect: select(onClose) })
  }

  if (tabPaneId) {
    items.push(
      {
        disabled: !closeTargets?.others,
        icon: 'close-all',
        label: t.zones.closeOthers,
        onSelect: select(() => closeOtherTreeTabs(tabPaneId))
      },
      {
        disabled: !closeTargets?.right,
        icon: 'arrow-right',
        label: t.zones.closeToRight,
        onSelect: select(() => closeTreeTabsToRight(tabPaneId))
      },
      {
        disabled: !closeTargets?.all,
        icon: 'clear-all',
        label: t.zones.closeAll,
        onSelect: select(() => {
          // Persist-close session tiles before dismissing the remaining tree
          // panes, or Bot Mode rehydrates them from the shared tile bucket (#94137).
          closeAllOpenSessionTiles(tabPaneId)
          closeAllTreeTabs(tabPaneId)
        })
      }
    )
  }

  return items
}

// The color picker inside the session menu's Color submenu. Its own component
// so only an OPEN submenu subscribes to the stores (not every row's menu).
// Reads/writes the override keyed by the DURABLE id so a color survives
// compression; clearing falls back to the inherited project color.
function SessionColorSwatches({ sessionId }: { sessionId: string }) {
  const { t } = useI18n()
  const overrides = useStore($sessionColorOverrides)
  const session = useStore($sessions).find(s => sessionMatchesStoredId(s, sessionId))
  const durableId = session ? sessionPinId(session) : sessionId

  return (
    <ColorSwatches
      clearIcon="circle-slash"
      clearLabel={t.sidebar.projects.noColor}
      onChange={color => setSessionColorOverride(durableId, color)}
      swatches={PROFILE_SWATCHES}
      value={overrides[durableId] ?? null}
    />
  )
}

/** Color ▸ the session's color label. */
export function SessionColorSubmenu({ kit, sessionId }: { kit: MenuKit; sessionId: string }) {
  const { t } = useI18n()

  return (
    <kit.Sub>
      <kit.SubTrigger disabled={!sessionId}>
        {menuIcon('brush')}
        <span>{t.studio.sidebar.menu.color}</span>
      </kit.SubTrigger>
      <kit.SubContent className="p-2">
        <SessionColorSwatches sessionId={sessionId} />
      </kit.SubContent>
    </kit.Sub>
  )
}

/** Export ▸ Markdown… / JSON… (the transcript as a download). */
export function SessionExportSubmenu({
  kit,
  profile,
  sessionId,
  title
}: {
  kit: MenuKit
  profile?: string
  sessionId: string
  title: string
}) {
  const { t } = useI18n()
  const menu = t.studio.sidebar.menu

  return (
    <kit.Sub>
      <kit.SubTrigger disabled={!sessionId}>
        {menuIcon('share')}
        <span>{menu.export}</span>
      </kit.SubTrigger>
      <kit.SubContent>
        <kit.Item onSelect={select(() => void exportSessionMarkdown(sessionId, { profile, title }))}>
          <span>{menu.exportMarkdown}</span>
        </kit.Item>
        <kit.Item onSelect={select(() => void exportSession(sessionId, { profile, title }))}>
          <span>{menu.exportJson}</span>
        </kit.Item>
      </kit.SubContent>
    </kit.Sub>
  )
}

// The project list inside "Move to project". Its own component so only an OPEN
// submenu subscribes to the stores. Re-homes the session's workspace at the
// target project's root — the fix for a chat created in the wrong folder. The
// current owner carries a check (nothing to move into); folderless buckets
// (Home) are left out. New project… creates one to move into.
function MoveToProjectItems({ kit, sessionId, profile }: { kit: MenuKit; sessionId: string; profile?: string }) {
  const { t } = useI18n()
  const p = t.sidebar.projects
  const tree = useStore($projectTree)
  const session = useStore($sessions).find(s => sessionMatchesStoredId(s, sessionId))
  const cwd = session?.cwd?.trim() || ''
  const currentProjectId = cwd ? projectIdForCwd(cwd) : null
  const targets = tree.filter(node => !node.isNoProject && projectRootCwd(node))

  // The flat sidebar view only warms $projectTree on a background timer, so
  // opening this submenu before it fires showed "No other projects" even when
  // projects exist. Refresh on open so the list is authoritative.
  useEffect(() => {
    void refreshProjectTree()
  }, [])

  return (
    <>
      {targets.length === 0 && <kit.Item disabled>{p.moveNoProjects}</kit.Item>}
      {targets.map(node =>
        node.id === currentProjectId ? (
          <kit.Item data-current="" key={node.id} onSelect={() => undefined}>
            <span className="min-w-0 flex-1 truncate">{node.label}</span>
            <StudioIcon className="ml-auto text-(--ui-accent)" name="check" size={13} />
          </kit.Item>
        ) : (
          <kit.Item
            key={node.id}
            onSelect={select(() => {
              moveSessionToProject(sessionId, node.id, profile)
                .then(() => notify({ durationMs: 2_000, kind: 'success', message: p.movedTo(node.label) }))
                .catch(err => notifyError(err, p.moveFailed))
            })}
          >
            <span className="min-w-0 flex-1 truncate">{node.label}</span>
          </kit.Item>
        )
      )}
      <kit.Separator />
      <kit.Item onSelect={select(openProjectCreate)}>
        <span>{t.studio.sidebar.menu.newProject}</span>
      </kit.Item>
    </>
  )
}

/** Move to project ▸ every project (current one checked) + New project…. */
export function MoveToProjectSubmenu({ kit, profile, sessionId }: { kit: MenuKit; profile?: string; sessionId: string }) {
  const { t } = useI18n()

  return (
    <kit.Sub>
      <kit.SubTrigger disabled={!sessionId}>
        {menuIcon('folder')}
        <span>{t.sidebar.projects.moveToProject}</span>
      </kit.SubTrigger>
      <kit.SubContent>
        <MoveToProjectItems kit={kit} profile={profile} sessionId={sessionId} />
      </kit.SubContent>
    </kit.Sub>
  )
}

interface DangerItemsContext {
  archived: boolean
  row: boolean
  onArchive?: () => void
  onDelete?: () => void
  requestDelete: () => void
  t: Translations
}

/** DANGER — put it away / destroy it (delete stays last, destructive-red). */
export function buildDangerItems({ archived, onArchive, onDelete, requestDelete, row, t }: DangerItemsContext) {
  const r = t.sidebar.row
  const menu = t.studio.sidebar.menu

  const items: ActionItemSpec[] = [
    {
      disabled: !onArchive,
      // Already archived (the Archived view): the same verb restores the row
      // instead of re-archiving it (#98813); the wiring dispatches onArchive.
      hint: row && !archived ? clickHint(['alt', 'shift'], menu) : undefined,
      iconNode: archived ? <ArchiveOff className="size-3.5" /> : menuIcon('archive'),
      label: archived ? r.unarchive : r.archive,
      onSelect: select(() => onArchive?.())
    },
    {
      className: 'text-destructive focus:text-destructive',
      disabled: !onDelete,
      iconNode: menuIcon('trash'),
      label: menu.delete,
      onSelect: () => {
        triggerHaptic('warning')

        // Deleting is irreversible: gate it behind an explicit confirm (#61470).
        // The dialog owns the delete call, so every surface that routes through
        // this menu (sidebar rows, tab menus, the chat header) gets the guard.
        if (onDelete) {
          requestDelete()
        }
      },
      variant: 'destructive'
    }
  ]

  return items
}
