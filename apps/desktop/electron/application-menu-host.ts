/**
 * Main's runtime half of the macOS application menu: which window's model is
 * installed, when the NSMenu is rebuilt, and where a fired item goes.
 *
 * - Every renderer window publishes its localized model (`hermes:menu-model`);
 *   the installed menu follows the focused one (last focused wins while a
 *   model-less window — Quick Entry, the pet — has focus).
 * - The NSMenu is rebuilt only when the model to show actually changed.
 * - Nothing is installed before `buildMenu()` runs: the first-window ordering
 *   of #115332 (application-menu-startup.ts) stays the only way in.
 * - A command click goes to that window's renderer (`hermes:menu-command`).
 *   A fired key equivalent is REPLAYED into the focused web contents as the
 *   same keystroke, so the renderer's keybind dispatcher — with every focus
 *   rule it applies — or a focused guest page sees exactly the keydown it
 *   would have seen without the menu.
 */

import type { BaseWindow, MenuItemConstructorOptions } from 'electron'

import { applicationMenuTemplate, defaultApplicationMenuModel, type MenuCommandRequest } from './application-menu'
import {
  acceleratorKeyInput,
  type ApplicationMenuModel,
  isMainMenuCommand,
  type MainMenuCommand,
  MENU_COMMAND_CHANNEL,
  MENU_MODEL_CHANNEL,
  type MenuInputModifier,
  menuModelsEqual,
  sanitizeMenuModel
} from './application-menu-model'

/** The slice of `WebContents` the host touches. */
export interface MenuWebContents {
  readonly id: number
  isDestroyed(): boolean
  once(event: 'destroyed', listener: () => void): unknown
  send(channel: string, ...args: unknown[]): void
  sendInputEvent(event: { keyCode: string; modifiers?: MenuInputModifier[]; type: 'keyDown' | 'keyUp' }): void
}

export interface ApplicationMenuHostDeps<TMenu> {
  isMac: boolean
  appName: string
  buildMenu: (template: MenuItemConstructorOptions[]) => TMenu
  setApplicationMenu: (menu: TMenu) => void
  /** Whatever holds keyboard focus now — a preview guest page included. */
  focusedWebContents: () => MenuWebContents | null
  /** The focused BrowserWindow's own web contents, null when none is focused. */
  focusedWindowContents: () => MenuWebContents | null
  /** The primary window's web contents: the last-resort command target. */
  mainContents: () => MenuWebContents | null
  runMainCommand: (id: MainMenuCommand, window: BaseWindow | undefined) => void
  isMainCommandEnabled?: (id: MainMenuCommand) => boolean
}

export interface MenuIpc {
  on(channel: string, listener: (event: { sender: MenuWebContents }, value: unknown) => void): unknown
}

export interface MenuFocusSource {
  on(
    event: 'browser-window-focus',
    listener: (event: unknown, window: { webContents: MenuWebContents }) => void
  ): unknown
}

export interface ApplicationMenuHost<TMenu> {
  /** Build the menu for the current model and allow later rebuilds. Called
   *  once by the first-window installer; returns the menu to install. */
  buildMenu: () => TMenu
  /** A renderer published its model. */
  acceptModel: (sender: MenuWebContents, value: unknown) => void
  /** A window gained focus: show its model if it has one. */
  windowFocused: (contents: MenuWebContents | null | undefined) => void
  /** Rebuild even if the model is unchanged (main-side state such as Quick Entry moved). */
  refresh: () => void
  dispatch: (request: MenuCommandRequest) => void
  /** Wire the IPC channel and the focus listener. */
  listen: (ipc: MenuIpc, focus: MenuFocusSource) => void
}

const usable = (contents: MenuWebContents | null | undefined): contents is MenuWebContents =>
  Boolean(contents && !contents.isDestroyed())

export function createApplicationMenuHost<TMenu>(deps: ApplicationMenuHostDeps<TMenu>): ApplicationMenuHost<TMenu> {
  const models = new Map<number, ApplicationMenuModel>()
  const contentsById = new Map<number, MenuWebContents>()
  let ownerId: null | number = null
  let installed: ApplicationMenuModel | null = null
  let ready = false

  const currentModel = (): ApplicationMenuModel =>
    (ownerId === null ? undefined : models.get(ownerId)) ?? defaultApplicationMenuModel()

  const replay = (accelerator: string): boolean => {
    const input = acceleratorKeyInput(accelerator)
    const focused = deps.focusedWebContents()

    if (!input || !usable(focused)) {
      return false
    }

    focused.sendInputEvent({ type: 'keyDown', ...input })
    focused.sendInputEvent({ type: 'keyUp', ...input })

    return true
  }

  const commandTarget = (): MenuWebContents | null => {
    const focused = deps.focusedWindowContents()

    const candidates = [
      focused && models.has(focused.id) ? focused : null,
      ownerId === null ? null : contentsById.get(ownerId),
      deps.mainContents()
    ]

    return candidates.find(usable) ?? null
  }

  const dispatch = (request: MenuCommandRequest): void => {
    if (isMainMenuCommand(request.id)) {
      deps.runMainCommand(request.id, request.window)

      return
    }

    if (request.triggeredByAccelerator && request.accelerator && replay(request.accelerator)) {
      return
    }

    commandTarget()?.send(MENU_COMMAND_CHANNEL, { id: request.id })
  }

  const build = (): TMenu => {
    installed = currentModel()

    return deps.buildMenu(
      applicationMenuTemplate(installed, {
        appName: deps.appName,
        isMainCommandEnabled: deps.isMainCommandEnabled,
        onCommand: dispatch
      })
    )
  }

  const install = (force = false): void => {
    if (!deps.isMac || !ready || (!force && menuModelsEqual(installed, currentModel()))) {
      return
    }

    deps.setApplicationMenu(build())
  }

  const forget = (id: number): void => {
    models.delete(id)
    contentsById.delete(id)

    if (ownerId === id) {
      ownerId = [...models.keys()].at(-1) ?? null
      install()
    }
  }

  const acceptModel = (sender: MenuWebContents, value: unknown): void => {
    const model = deps.isMac ? sanitizeMenuModel(value) : null

    if (!model) {
      return
    }

    if (!contentsById.has(sender.id)) {
      contentsById.set(sender.id, sender)
      sender.once('destroyed', () => forget(sender.id))
    }

    models.set(sender.id, model)

    if (ownerId === null || ownerId === sender.id || deps.focusedWindowContents()?.id === sender.id) {
      ownerId = sender.id
      install()
    }
  }

  const windowFocused = (contents: MenuWebContents | null | undefined): void => {
    if (!contents || ownerId === contents.id || !models.has(contents.id)) {
      return
    }

    ownerId = contents.id
    install()
  }

  return {
    buildMenu: () => {
      ready = true

      return build()
    },
    acceptModel,
    windowFocused,
    refresh: () => install(true),
    dispatch,
    listen: (ipc, focus) => {
      ipc.on(MENU_MODEL_CHANNEL, (event, value) => acceptModel(event.sender, value))
      focus.on('browser-window-focus', (_event, window) => windowFocused(window?.webContents))
    }
  }
}
