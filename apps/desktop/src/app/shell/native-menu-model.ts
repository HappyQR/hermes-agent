/**
 * The macOS application menu as a localized model (pure): structure and copy
 * follow the Studio prototype's menu bar, live state decides labels, checks
 * and enablement, and the user's current bindings become key equivalents for
 * the allow-listed app-level actions. Main renders it (electron/application-menu.ts).
 *
 * Command ids are the app's own: keybind action ids, contributed keybind and
 * ⌘K palette ids, `main.*` for what only main can do, and `menu.*` for the
 * handful of menu-only commands (native-menu-commands.ts). An item whose
 * command doesn't exist is left out, never faked.
 */

import type { StudioMenuTranslations } from '@/i18n/types_studio_menu'
import type { InterfaceMode } from '@/store/interface-mode'
import type { ThemeMode } from '@/themes/context'

import {
  type ApplicationMenuModel,
  comboToAccelerator,
  isMainMenuCommand,
  isMenuAcceleratorAction,
  type MainMenuCommand,
  MENU_APP_NAME_TOKEN,
  type MenuCommandItem,
  type MenuModelItem,
  type MenuModelSection,
  type MenuRole
} from '../../../electron/application-menu-model'

export type MenuTabBarMode = 'always' | 'auto' | 'never'

export interface MenuSessionState {
  archived: boolean
  busy: boolean
  pinned: boolean
  renameable: boolean
}

export interface MenuProfileEntry {
  /** Canonical profile key (`default` for the root profile). */
  key: string
  label: string
}

export interface MenuState {
  sidebarOpen: boolean
  inspectorOpen: boolean
  statusbarVisible: boolean
  interfaceMode: InterfaceMode
  themeMode: ThemeMode
  /** The tab-bar mode of the zone Tab Bar acts on; null when no zone qualifies. */
  tabBar: MenuTabBarMode | null
  profiles: readonly MenuProfileEntry[]
  activeProfile: string
  showAllProfiles: boolean
  /** The session the user is working in; null on a fresh draft. */
  session: MenuSessionState | null
}

export interface MenuModelInput {
  copy: StudioMenuTranslations
  state: MenuState
  /** Whether the app can run `id` right now (main.* ids are always available). */
  available: (id: string) => boolean
  /** The user's current combos for an action, first is primary. */
  combos: (id: string) => readonly string[]
  /** The shortcuts panel is recording a chord: no key equivalents at all. */
  recording: boolean
}

export const TAB_BAR_MODES: readonly MenuTabBarMode[] = ['auto', 'always', 'never']
export const APPEARANCE_MODES: readonly ThemeMode[] = ['light', 'dark', 'system']

export const menuProfileCommand = (key: string): string => `menu.profile:${encodeURIComponent(key)}`

const SEPARATOR: MenuModelItem = { type: 'separator' }
const APP = MENU_APP_NAME_TOKEN

type Entry = MenuModelItem | null

const items = (...entries: Entry[]): MenuModelItem[] =>
  entries.filter((entry): entry is MenuModelItem => entry !== null)

const role = (name: MenuRole, label: string): MenuModelItem => ({ type: 'role', role: name, label })

const submenu = (label: string, entries: Entry[], enabled = true): Entry => {
  const list = items(...entries)

  return list.some(entry => entry.type !== 'separator')
    ? { type: 'submenu', label, items: list, ...(enabled ? {} : { enabled: false }) }
    : null
}

interface CommandOptions {
  checked?: boolean
  enabled?: boolean
}

class MenuBuilder {
  private readonly used = new Set<string>()

  constructor(private readonly input: MenuModelInput) {}

  /** A command item, or null when the app has no such command. */
  command(id: string, label: string, options: CommandOptions = {}): Entry {
    if (!isMainMenuCommand(id) && !this.input.available(id)) {
      return null
    }

    const enabled = options.enabled !== false
    const item: MenuCommandItem = { type: 'command', id, label }

    if (!enabled) {
      item.enabled = false
    }

    if (typeof options.checked === 'boolean') {
      item.checked = options.checked
    }

    const accelerator = enabled ? this.accelerator(id) : null

    if (accelerator) {
      item.accelerator = accelerator
    }

    return item
  }

  main(id: MainMenuCommand, label: string): Entry {
    return this.command(id, label)
  }

  /** The action's current binding as a key equivalent — allow-listed actions
   *  only, first usable combo, each chord on one item at most. */
  private accelerator(id: string): null | string {
    if (this.input.recording || !isMenuAcceleratorAction(id)) {
      return null
    }

    for (const combo of this.input.combos(id)) {
      const accelerator = comboToAccelerator(combo)

      if (accelerator && !this.used.has(accelerator)) {
        this.used.add(accelerator)

        return accelerator
      }
    }

    return null
  }
}

function appSection(menu: MenuBuilder, copy: StudioMenuTranslations['app']): MenuModelSection {
  return {
    id: 'app',
    label: APP,
    items: items(
      menu.command('menu.about', copy.about(APP)),
      menu.main('main.checkForUpdates', copy.checkForUpdates),
      SEPARATOR,
      menu.command('nav.settings', copy.settings),
      SEPARATOR,
      role('services', copy.services),
      SEPARATOR,
      role('hide', copy.hide(APP)),
      role('hideOthers', copy.hideOthers),
      role('unhide', copy.showAll),
      SEPARATOR,
      role('quit', copy.quit(APP))
    )
  }
}

function fileSection(menu: MenuBuilder, { copy, state }: MenuModelInput): MenuModelSection {
  const file = copy.file

  return {
    id: 'file',
    label: copy.titles.file,
    items: items(
      menu.command('session.new', file.newSession),
      menu.command('session.newTab', file.newTab),
      menu.command('session.newWindow', file.newWindow),
      SEPARATOR,
      menu.command('workspace.openFolder', file.openFolder),
      menu.command('menu.newProject', file.newProject),
      menu.command('workspace.newWorktree', file.newWorktree),
      menu.command('menu.importSession', file.importSession),
      SEPARATOR,
      menu.command('menu.exportSession', file.exportSession, { enabled: state.session !== null }),
      menu.command('profile.export', file.exportProfile),
      menu.command('profile.import', file.importProfile),
      SEPARATOR,
      menu.main('main.closeTab', file.closeTab),
      menu.command('view.reopenTab', file.reopenTab)
    )
  }
}

function editSection(menu: MenuBuilder, copy: StudioMenuTranslations): MenuModelSection {
  const edit = copy.edit

  return {
    id: 'edit',
    label: copy.titles.edit,
    items: items(
      role('undo', edit.undo),
      role('redo', edit.redo),
      SEPARATOR,
      role('cut', edit.cut),
      role('copy', edit.copy),
      role('paste', edit.paste),
      role('pasteAndMatchStyle', edit.pasteAndMatchStyle),
      role('delete', edit.delete),
      role('selectAll', edit.selectAll),
      SEPARATOR,
      menu.command('view.findInPage', edit.find),
      menu.command('menu.selectionToComposer', edit.sendSelection),
      submenu(edit.spelling, [role('toggleSpellChecker', edit.checkSpellingWhileTyping)]),
      submenu(edit.substitutions, [
        role('showSubstitutions', edit.showSubstitutions),
        SEPARATOR,
        role('toggleTextReplacement', edit.textReplacement)
      ])
    )
  }
}

function viewPanels(menu: MenuBuilder, { copy, state }: MenuModelInput): Entry[] {
  const view = copy.view

  return [
    menu.command('view.toggleSidebar', state.sidebarOpen ? view.hideSidebar : view.showSidebar),
    menu.command('view.toggleRightSidebar', state.inspectorOpen ? view.hideInspector : view.showInspector),
    menu.command('view.showBrowser', view.preview),
    menu.command('view.toggleReview', view.changes),
    menu.command('view.showTerminal', view.terminal),
    // Lights up once the inspector's Agents pane registers its action.
    menu.command('view.showAgents', view.agents)
  ]
}

function viewChrome(menu: MenuBuilder, { copy, state }: MenuModelInput): Entry[] {
  const view = copy.view

  const tabBarLabels: Record<MenuTabBarMode, string> = {
    always: view.tabBarAlways,
    auto: view.tabBarAuto,
    never: view.tabBarNever
  }

  return [
    submenu(view.layout, [
      menu.command('view.flipPanes', view.swapSidebar),
      menu.command('layout.editMode', view.editLayout),
      menu.command('layout.reset', view.resetLayout)
    ]),
    menu.command('view.toggleHud', view.hud),
    submenu(
      view.tabBar,
      TAB_BAR_MODES.map(mode =>
        menu.command(`menu.tabBar.${mode}`, tabBarLabels[mode], { checked: state.tabBar === mode })
      ),
      state.tabBar !== null
    ),
    // Simple mode rests the status bar; its toggle belongs to Pro (prototype).
    menu.command('view.toggleStatusbar', state.statusbarVisible ? view.hideStatusBar : view.showStatusBar, {
      enabled: state.interfaceMode !== 'simple'
    })
  ]
}

function viewModes(menu: MenuBuilder, { copy, state }: MenuModelInput): Entry[] {
  const view = copy.view
  const appearanceLabels: Record<ThemeMode, string> = { dark: view.dark, light: view.light, system: view.system }

  return [
    submenu(view.interfaceMode, [
      menu.command('menu.interface.simple', view.simple, { checked: state.interfaceMode === 'simple' }),
      menu.command('menu.interface.advanced', view.advanced, { checked: state.interfaceMode === 'advanced' })
    ]),
    submenu(
      view.appearance,
      APPEARANCE_MODES.map(mode =>
        menu.command(`menu.appearance.${mode}`, appearanceLabels[mode], { checked: state.themeMode === mode })
      )
    )
  ]
}

function viewSection(menu: MenuBuilder, input: MenuModelInput): MenuModelSection {
  const view = input.copy.view

  return {
    id: 'view',
    label: input.copy.titles.view,
    items: items(
      ...viewPanels(menu, input),
      SEPARATOR,
      ...viewChrome(menu, input),
      SEPARATOR,
      ...viewModes(menu, input),
      SEPARATOR,
      menu.main('main.zoomIn', view.zoomIn),
      menu.main('main.zoomOut', view.zoomOut),
      menu.main('main.actualSize', view.actualSize),
      role('togglefullscreen', view.fullScreen),
      SEPARATOR,
      menu.main('main.reload', view.reload),
      role('forceReload', view.forceReload),
      menu.main('main.toggleDevTools', view.developerTools)
    )
  }
}

function sessionSection(menu: MenuBuilder, { copy, state }: MenuModelInput): MenuModelSection {
  const labels = copy.session
  const session = state.session
  const has = session !== null

  return {
    id: 'session',
    label: copy.titles.session,
    items: items(
      menu.command('menu.session.rename', labels.rename, { enabled: Boolean(session?.renameable) }),
      menu.command('menu.session.pin', session?.pinned ? labels.unpin : labels.pin, { enabled: has }),
      menu.command('menu.session.branch', labels.branch, { enabled: has }),
      SEPARATOR,
      menu.command('menu.session.stop', labels.stop, { enabled: Boolean(session?.busy) }),
      menu.command('menu.session.compress', labels.compress, { enabled: has && !session.busy }),
      menu.command('composer.modelPicker', labels.switchModel),
      menu.command('composer.voice', labels.voice),
      SEPARATOR,
      menu.command('session.next', labels.next),
      menu.command('session.prev', labels.previous),
      SEPARATOR,
      menu.command('menu.session.archive', session?.archived ? labels.unarchive : labels.archive, { enabled: has }),
      menu.command('menu.session.delete', labels.delete, { enabled: has })
    )
  }
}

function windowSection(menu: MenuBuilder, { copy, state }: MenuModelInput): MenuModelSection {
  const labels = copy.window

  const profiles = state.profiles.map(profile =>
    menu.command(menuProfileCommand(profile.key), profile.label, {
      checked: !state.showAllProfiles && profile.key === state.activeProfile
    })
  )

  return {
    id: 'window',
    label: copy.titles.window,
    items: items(
      role('minimize', labels.minimize),
      role('zoom', labels.zoom),
      SEPARATOR,
      submenu(labels.profiles, [
        ...profiles,
        SEPARATOR,
        menu.command('profile.toggleAll', labels.allProfiles, { checked: state.showAllProfiles }),
        menu.command('nav.profiles', labels.manageProfiles)
      ]),
      menu.command('nav.commandCenter', labels.systemStatus),
      menu.main('main.quickAsk', labels.quickAsk),
      SEPARATOR,
      role('front', labels.bringAllToFront)
    )
  }
}

function helpSection(menu: MenuBuilder, copy: StudioMenuTranslations): MenuModelSection {
  const help = copy.help

  return {
    id: 'help',
    label: copy.titles.help,
    items: items(
      menu.command('keybinds.openPanel', help.shortcuts),
      menu.command('menu.help.tutorial', help.tutorial),
      menu.command('menu.help.composerTips', help.composerTips),
      SEPARATOR,
      menu.command('menu.help.docs', help.docs),
      menu.command('menu.help.discord', help.discord),
      menu.command('menu.help.diagnostics', help.sendDiagnostics)
    )
  }
}

export function buildMenuModel(input: MenuModelInput): ApplicationMenuModel {
  const menu = new MenuBuilder(input)

  return {
    sections: [
      appSection(menu, input.copy.app),
      fileSection(menu, input),
      editSection(menu, input.copy),
      viewSection(menu, input),
      sessionSection(menu, input),
      windowSection(menu, input),
      helpSection(menu, input.copy)
    ]
  }
}

/** Every command id in a model (submenus included), for coverage checks. */
export function menuCommandIds(model: ApplicationMenuModel): string[] {
  const walk = (list: readonly MenuModelItem[]): string[] =>
    list.flatMap(item => (item.type === 'command' ? [item.id] : item.type === 'submenu' ? walk(item.items) : []))

  return model.sections.flatMap(section => walk(section.items))
}
