import type { BaseWindow, MenuItemConstructorOptions } from 'electron'

import {
  type ApplicationMenuModel,
  isMainMenuCommand,
  isMenuAcceleratorAction,
  isReservedAccelerator,
  MAIN_MENU_ACCELERATORS,
  type MainMenuCommand,
  MENU_APP_NAME_TOKEN,
  type MenuCommandItem,
  type MenuModelItem,
  type MenuModelSection,
  type MenuRole,
  normalizeAccelerator
} from './application-menu-model'
import { windowMenuTemplate } from './window-menu'

/** One activation of a command item. */
export interface MenuCommandRequest {
  id: string
  /** The key equivalent the item carried (only set when it had one). */
  accelerator?: string
  /** The press came through the key equivalent rather than a click. */
  triggeredByAccelerator: boolean
  window?: BaseWindow
}

export interface ApplicationMenuTemplateDeps {
  appName: string
  onCommand: (request: MenuCommandRequest) => void
  /** Main's own say on its commands (Quick Ask follows the Quick Entry setting). */
  isMainCommandEnabled?: (id: MainMenuCommand) => boolean
}

function withAppName(label: string, appName: string): string {
  return label.split(MENU_APP_NAME_TOKEN).join(appName)
}

function hasPrimaryModifier(accelerator: string): boolean {
  const parts = (normalizeAccelerator(accelerator) ?? '').split('+')

  return parts.includes('Command') || parts.includes('Control')
}

/** Renderer-supplied key equivalents are honored only for allow-listed
 *  actions, with a Command/Control modifier, outside the reserved set. */
function rendererAccelerator(item: MenuCommandItem): string | undefined {
  const { accelerator, id } = item

  if (!accelerator || !isMenuAcceleratorAction(id) || isReservedAccelerator(accelerator)) {
    return undefined
  }

  return hasPrimaryModifier(accelerator) ? accelerator : undefined
}

function itemAccelerator(item: MenuCommandItem, used: Set<string>): string | undefined {
  const accelerator = isMainMenuCommand(item.id) ? MAIN_MENU_ACCELERATORS[item.id] : rendererAccelerator(item)

  if (!accelerator) {
    return undefined
  }

  // First item wins a chord; a duplicate would make AppKit's pick arbitrary.
  const key = normalizeAccelerator(accelerator) ?? accelerator

  if (used.has(key)) {
    return undefined
  }

  used.add(key)

  return accelerator
}

function commandEnabled(item: MenuCommandItem, deps: ApplicationMenuTemplateDeps): boolean {
  if (item.enabled === false) {
    return false
  }

  return !isMainMenuCommand(item.id) || deps.isMainCommandEnabled?.(item.id) !== false
}

function commandTemplate(
  item: MenuCommandItem,
  deps: ApplicationMenuTemplateDeps,
  used: Set<string>
): MenuItemConstructorOptions {
  const enabled = commandEnabled(item, deps)
  // A disabled item never carries a key equivalent: the chord then reaches the
  // renderer exactly as before (e.g. ⇧⌘S in Simple mode).
  const accelerator = enabled ? itemAccelerator(item, used) : undefined
  const checkable = typeof item.checked === 'boolean'

  return {
    id: item.id,
    label: withAppName(item.label, deps.appName),
    enabled,
    ...(checkable ? { type: 'checkbox' as const, checked: item.checked } : {}),
    ...(accelerator ? { accelerator } : {}),
    click: (menuItem, window, event) => {
      // Electron flips a checkbox before calling us; the renderer's next model
      // is the truth, so put the mark back until it arrives.
      if (checkable) {
        menuItem.checked = Boolean(item.checked)
      }

      deps.onCommand({
        id: item.id,
        accelerator,
        triggeredByAccelerator: Boolean(event?.triggeredByAccelerator),
        window
      })
    }
  }
}

function roleTemplate(role: MenuRole, label: string | undefined, appName: string): MenuItemConstructorOptions {
  return label ? { role, label: withAppName(label, appName) } : { role }
}

function itemTemplate(
  item: MenuModelItem,
  deps: ApplicationMenuTemplateDeps,
  used: Set<string>
): MenuItemConstructorOptions | null {
  switch (item.type) {
    case 'separator':
      return { type: 'separator' }

    case 'role':
      return roleTemplate(item.role, item.label, deps.appName)
    case 'submenu': {
      const submenu = itemsTemplate(item.items, deps, used)

      return submenu.length > 0
        ? { label: withAppName(item.label, deps.appName), enabled: item.enabled !== false, submenu }
        : null
    }

    case 'command':
      return commandTemplate(item, deps, used)

    default:
      return null
  }
}

/** Items with stray separators tidied away (leading, trailing, doubled — e.g.
 *  around a group whose every command is unavailable). */
function itemsTemplate(
  items: readonly MenuModelItem[],
  deps: ApplicationMenuTemplateDeps,
  used: Set<string>
): MenuItemConstructorOptions[] {
  const out: MenuItemConstructorOptions[] = []

  for (const item of items) {
    const next = itemTemplate(item, deps, used)

    if (!next || (next.type === 'separator' && (out.length === 0 || out.at(-1)?.type === 'separator'))) {
      continue
    }

    out.push(next)
  }

  while (out.at(-1)?.type === 'separator') {
    out.pop()
  }

  return out
}

function sectionTemplate(
  section: MenuModelSection,
  deps: ApplicationMenuTemplateDeps,
  used: Set<string>
): MenuItemConstructorOptions {
  const submenu = itemsTemplate(section.items, deps, used)
  const label = withAppName(section.label, deps.appName)

  switch (section.id) {
    // macOS titles the first menu with the bundle name whatever the label says.
    case 'app':
      return { label: deps.appName, submenu }

    // AppKit's standard Window menu (window list, Move & Resize).
    case 'window':
      return { ...windowMenuTemplate(true), label, submenu }

    // `help` gives the menu macOS's Help search field.
    case 'help':
      return { label, role: 'help', submenu }

    default:
      return { label, submenu }
  }
}

/**
 * The macOS application menu template for a model. Pure: roles stay roles,
 * command items call `deps.onCommand`, key equivalents come only from main's
 * own table or the renderer's allow-listed actions.
 */
export function applicationMenuTemplate(
  model: ApplicationMenuModel,
  deps: ApplicationMenuTemplateDeps
): MenuItemConstructorOptions[] {
  const used = new Set<string>()

  return model.sections.map(section => sectionTemplate(section, deps, used))
}

const SEPARATOR: MenuModelItem = { type: 'separator' }
const command = (id: MainMenuCommand, label: string): MenuModelItem => ({ type: 'command', id, label })
const role = (name: MenuRole): MenuModelItem => ({ type: 'role', role: name })
const app = MENU_APP_NAME_TOKEN

/**
 * The menu main installs before any renderer has sent its localized model: the
 * long-standing English menu, main-side commands and roles only, so it works
 * with no renderer at all. Replaced as soon as the focused window publishes.
 */
export function defaultApplicationMenuModel(): ApplicationMenuModel {
  return {
    sections: [
      {
        id: 'app',
        label: app,
        items: [
          command('main.about', `About ${app}`),
          command('main.checkForUpdates', 'Check for Updates…'),
          SEPARATOR,
          role('services'),
          SEPARATOR,
          role('hide'),
          role('hideOthers'),
          role('unhide'),
          SEPARATOR,
          role('quit')
        ]
      },
      {
        id: 'file',
        label: 'File',
        items: [
          command('main.newWindow', 'New Window'),
          command('main.openFolder', 'Open Folder…'),
          SEPARATOR,
          command('main.closeTab', 'Close')
        ]
      },
      {
        id: 'edit',
        label: 'Edit',
        items: [
          role('undo'),
          role('redo'),
          SEPARATOR,
          role('cut'),
          role('copy'),
          role('paste'),
          role('pasteAndMatchStyle'),
          role('delete'),
          role('selectAll'),
          SEPARATOR,
          {
            type: 'submenu',
            label: 'Substitutions',
            items: [role('showSubstitutions'), SEPARATOR, role('toggleTextReplacement')]
          }
        ]
      },
      {
        id: 'view',
        label: 'View',
        items: [
          command('main.reload', 'Reload'),
          role('forceReload'),
          command('main.toggleDevTools', 'Toggle Developer Tools'),
          SEPARATOR,
          command('main.actualSize', 'Actual Size'),
          command('main.zoomIn', 'Zoom In'),
          command('main.zoomOut', 'Zoom Out'),
          SEPARATOR,
          role('togglefullscreen')
        ]
      },
      { id: 'window', label: 'Window', items: [role('minimize'), role('zoom'), role('front')] },
      { id: 'help', label: 'Help', items: [command('main.checkForUpdates', 'Check for Updates…')] }
    ]
  }
}
