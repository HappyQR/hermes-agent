/**
 * The application menu's menu-only commands (`menu.*`): verbs that have no
 * keybind action of their own but already exist elsewhere in the app — each
 * one calls the same function its existing door (sidebar row menu, tab menu,
 * Settings, the composer, the error card) calls.
 */

import {
  appViewForPath,
  isOverlayView,
  NEW_CHAT_ROUTE,
  SESSION_IMPORT_ROUTE,
  sessionRoute,
  SETTINGS_ROUTE
} from '@/app/routes'
import { setTreeGroupTabStrip } from '@/components/pane-shell/tree/store'
import { translateNow } from '@/i18n/runtime'
import { DESKTOP_DOCS_URL } from '@/lib/docs'
import { openExternalLink } from '@/lib/external-link'
import { IS_MAC } from '@/lib/keybinds/combo'
import type { MenuCommandResolver } from '@/lib/keybinds/menu-actions'
import { exportSession } from '@/lib/session-export'
import { parkQueuedPrompts } from '@/store/composer-queue'
import { confirm } from '@/store/confirm'
import { setInterfaceMode } from '@/store/interface-mode'
import { $pinnedSessionIds, pinSession, unpinSession } from '@/store/layout'
import { selectProfile } from '@/store/profile'
import { openProjectCreate } from '@/store/projects'
import { requestSendDiagnostics } from '@/store/send-diagnostics'
import {
  $selectedStoredSessionId,
  $sessions,
  resolveComposerSessionKey,
  sessionMatchesStoredId,
  sessionPinId
} from '@/store/session'
import { sessionTileDelegate } from '@/store/session-states'
import { requestMode } from '@/themes/request'

import { requestComposerFocus, requestComposerGetDraft } from '../chat/composer/focus'
import type { WiringActions } from '../contrib/types'

import { APPEARANCE_MODES, type MenuTabBarMode, TAB_BAR_MODES } from './native-menu-model'
import { menuSessionTarget, type MenuSessionTarget, menuTabBarTarget } from './native-menu-state'
import { closeSplitTiles, openSplit } from './toolbar/layout-actions'

/** Where Help › Discord Community goes (the support link the app already uses). */
export const COMMUNITY_DISCORD_URL = 'https://discord.gg/NousResearch'

const PROFILE_PREFIX = 'menu.profile:'

export type MenuSessionActions = Pick<
  WiringActions,
  'onArchiveSession' | 'onBranchSession' | 'onCancel' | 'onDeleteSession' | 'onSubmit'
>

export interface MenuCommandDeps {
  actions: () => MenuSessionActions
  navigate: (to: string) => void
  pathname: () => string
  /** Open the menu's rename sheet for the target session. */
  openRename: (target: MenuSessionTarget) => void
}

const withSession =
  (run: (target: MenuSessionTarget) => void): (() => void) =>
  () => {
    const target = menuSessionTarget()

    if (target) {
      run(target)
    }
  }

function togglePin(target: MenuSessionTarget): void {
  const row = $sessions.get().find(session => sessionMatchesStoredId(session, target.id))
  const pinId = row ? sessionPinId(row) : target.id

  if ($pinnedSessionIds.get().includes(pinId)) {
    unpinSession(pinId)
  } else {
    pinSession(pinId)
  }
}

/** An explicit halt, like the composer's Stop: park the queue first so the
 *  interrupt doesn't roll straight into the next queued prompt. */
function haltSession(target: MenuSessionTarget, actions: MenuSessionActions): void {
  parkQueuedPrompts(resolveComposerSessionKey(target.id, $sessions.get()) ?? target.runtimeId)

  if (!target.isTile) {
    void actions.onCancel()
  } else if (target.runtimeId) {
    void sessionTileDelegate()?.interruptSession(target.runtimeId)
  }
}

/** `/compress` through the slash dispatcher, against the target's runtime. */
function compressSession(target: MenuSessionTarget, actions: MenuSessionActions): void {
  if (!target.isTile) {
    void actions.onSubmit('/compress', { attachments: [] })
  } else if (target.runtimeId) {
    void sessionTileDelegate()?.executeSlash('/compress', target.runtimeId)
  }
}

/** The same irreversible-delete guard every session menu shows (#61470). */
function confirmDelete(target: MenuSessionTarget, actions: MenuSessionActions): void {
  void confirm({
    busyLabel: translateNow('sidebar.row.deleting'),
    confirmLabel: translateNow('common.delete'),
    description: translateNow('sidebar.row.deleteDesc', target.title),
    destructive: true,
    doneLabel: translateNow('sidebar.row.deleted'),
    onConfirm: async () => actions.onDeleteSession(target.id),
    title: translateNow('sidebar.row.deleteTitle')
  })
}

function setTabBarMode(mode: MenuTabBarMode): void {
  const group = menuTabBarTarget()

  if (group) {
    setTreeGroupTabStrip(group.id, mode === 'auto' ? undefined : mode)
  }
}

/** Edit › Send Selection to Composer is the fixed ⌘L chord: deliver it to
 *  whatever has focus so the chord's own ladder decides (terminal or preview
 *  selection → composer context, else focus the composer). */
function sendSelectionToComposer(): void {
  const target = document.activeElement ?? document.body

  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      code: 'KeyL',
      ctrlKey: !IS_MAC,
      key: 'l',
      metaKey: IS_MAC
    })
  )
}

/** The composer's tips are its `?` help drawer: type `?` into an empty draft;
 *  with text already there, just bring the composer forward. */
async function showComposerTips(): Promise<void> {
  const draft = await requestComposerGetDraft([], { active: true })
  const empty = draft !== null && !(draft.text ?? '').trim()

  requestComposerFocus('active', empty ? { typeChar: '?' } : {})
}

const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve))

/** The built-in tour points at the chat chrome, so leave an overlay first. */
async function runTutorial(deps: MenuCommandDeps): Promise<void> {
  if (isOverlayView(appViewForPath(deps.pathname()))) {
    const selected = $selectedStoredSessionId.get()

    deps.navigate(selected ? sessionRoute(selected) : NEW_CHAT_ROUTE)
    await nextFrame()
    await nextFrame()
  }

  const { runBuiltInTour } = await import('@/app/chat/built-in-tour')

  await runBuiltInTour('full', () => true, '')
}

function profileCommand(id: string): (() => void) | undefined {
  if (!id.startsWith(PROFILE_PREFIX)) {
    return undefined
  }

  const name = decodeURIComponent(id.slice(PROFILE_PREFIX.length))

  return name ? () => selectProfile(name) : undefined
}

export function createMenuCommandResolver(deps: MenuCommandDeps): MenuCommandResolver {
  const table: Record<string, () => void> = {
    'menu.about': () => deps.navigate(`${SETTINGS_ROUTE}?tab=about`),
    'menu.newProject': openProjectCreate,
    'menu.importSession': () => deps.navigate(SESSION_IMPORT_ROUTE),
    'menu.exportSession': withSession(
      target => void exportSession(target.id, { profile: target.profile, title: target.title })
    ),
    'menu.selectionToComposer': sendSelectionToComposer,
    'menu.session.rename': withSession(deps.openRename),
    'menu.session.pin': withSession(togglePin),
    // Sidebar verbs: they handle a session open as a tile too.
    'menu.session.branch': withSession(target => deps.actions().onBranchSession(target.id)),
    'menu.session.archive': withSession(target => deps.actions().onArchiveSession(target.id)),
    'menu.session.delete': withSession(target => confirmDelete(target, deps.actions())),
    'menu.session.stop': withSession(target => haltSession(target, deps.actions())),
    'menu.session.compress': withSession(target => compressSession(target, deps.actions())),
    'menu.layout.single': closeSplitTiles,
    'menu.layout.split': () => openSplit(),
    'menu.interface.simple': () => setInterfaceMode('simple'),
    'menu.interface.advanced': () => setInterfaceMode('advanced'),
    'menu.help.tutorial': () => void runTutorial(deps).catch(() => undefined),
    'menu.help.composerTips': () => void showComposerTips(),
    'menu.help.docs': () => openExternalLink(DESKTOP_DOCS_URL),
    'menu.help.discord': () => openExternalLink(COMMUNITY_DISCORD_URL),
    'menu.help.diagnostics': () => requestSendDiagnostics()
  }

  for (const mode of TAB_BAR_MODES) {
    table[`menu.tabBar.${mode}`] = () => setTabBarMode(mode)
  }

  for (const mode of APPEARANCE_MODES) {
    table[`menu.appearance.${mode}`] = () => requestMode(mode)
  }

  return id => (Object.hasOwn(table, id) ? table[id] : profileCommand(id))
}
