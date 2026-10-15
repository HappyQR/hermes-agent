import { describe, expect, it } from 'vitest'

import { enStudioMenu } from '@/i18n/en_studio_menu'
import { zhStudioMenu } from '@/i18n/zh_studio_menu'
import { defaultBindings } from '@/lib/keybinds/actions'

import type {
  ApplicationMenuModel,
  MenuCommandItem,
  MenuModelItem,
  MenuSectionId
} from '../../../electron/application-menu-model'

import { buildMenuModel, menuCommandIds, type MenuModelInput, type MenuState } from './native-menu-model'

const BASE_STATE: MenuState = {
  activeProfile: 'default',
  inspectorOpen: false,
  interfaceMode: 'advanced',
  profiles: [
    { key: 'default', label: 'default' },
    { key: 'work', label: 'Work' }
  ],
  session: null,
  showAllProfiles: false,
  sidebarOpen: true,
  split: false,
  statusbarVisible: true,
  tabBar: 'auto',
  themeMode: 'system'
}

const DEFAULTS = defaultBindings()

function build(
  overrides: Omit<Partial<MenuModelInput>, 'state'> & { state?: Partial<MenuState> } = {}
): ApplicationMenuModel {
  return buildMenuModel({
    available: () => true,
    combos: id => DEFAULTS[id] ?? (id === 'layout.editMode' ? ['mod+shift+\\'] : []),
    copy: enStudioMenu,
    recording: false,
    ...overrides,
    state: { ...BASE_STATE, ...overrides.state }
  })
}

function flat(list: readonly MenuModelItem[]): MenuModelItem[] {
  return list.flatMap(item => (item.type === 'submenu' ? [item, ...flat(item.items)] : [item]))
}

function commands(model: ApplicationMenuModel, section?: MenuSectionId): MenuCommandItem[] {
  return model.sections
    .filter(entry => !section || entry.id === section)
    .flatMap(entry => flat(entry.items))
    .filter((item): item is MenuCommandItem => item.type === 'command')
}

const command = (model: ApplicationMenuModel, id: string) => commands(model).find(item => item.id === id)

describe('native menu model', () => {
  it('lays the menu bar out like the prototype, in the user language', () => {
    const model = build({ copy: zhStudioMenu })

    expect(model.sections.map(section => section.label)).toEqual([
      '{{app}}',
      '文件',
      '编辑',
      '显示',
      '会话',
      '窗口',
      '帮助'
    ])
    expect(commands(model, 'file').map(item => item.label)).toEqual([
      '新建会话',
      '新建标签页',
      '新建窗口',
      '打开文件夹为项目…',
      '新建项目…',
      '新建工作树…',
      '从 Claude Code 或 Codex 导入会话…',
      '导出会话…',
      '导出配置档案…',
      '导入配置档案…',
      '关闭标签页',
      '重新打开关闭的标签页'
    ])
    expect(command(model, 'menu.about')?.label).toBe('关于 {{app}}')
  })

  it('keeps the native roles with localized labels', () => {
    const roles = (id: MenuSectionId) =>
      flat(build().sections.find(section => section.id === id)?.items ?? []).flatMap(item =>
        item.type === 'role' ? [item.role] : []
      )

    expect(roles('app')).toEqual(['services', 'hide', 'hideOthers', 'unhide', 'quit'])
    expect(roles('edit')).toEqual([
      'undo',
      'redo',
      'cut',
      'copy',
      'paste',
      'pasteAndMatchStyle',
      'delete',
      'selectAll',
      'toggleSpellChecker',
      'showSubstitutions',
      'toggleTextReplacement'
    ])
    expect(roles('window')).toEqual(['minimize', 'zoom', 'front'])
  })

  it('disables the session verbs without a session and enables them with one', () => {
    const verbs = ['menu.session.rename', 'menu.session.pin', 'menu.session.branch', 'menu.session.archive']
    const draft = build()

    for (const id of [
      ...verbs,
      'menu.session.stop',
      'menu.session.compress',
      'menu.session.delete',
      'menu.exportSession'
    ]) {
      expect(command(draft, id)?.enabled, id).toBe(false)
    }

    // Model picker, voice and session cycling work from a fresh draft too.
    expect(command(draft, 'composer.modelPicker')?.enabled).toBeUndefined()

    const idle = build({ state: { session: { archived: false, busy: false, pinned: true, renameable: true } } })

    for (const id of [...verbs, 'menu.session.compress', 'menu.session.delete']) {
      expect(command(idle, id)?.enabled, id).toBeUndefined()
    }

    expect(command(idle, 'menu.session.stop')?.enabled).toBe(false)
    expect(command(idle, 'menu.session.pin')?.label).toBe('Unpin')

    const busy = build({ state: { session: { archived: true, busy: true, pinned: false, renameable: false } } })

    expect(command(busy, 'menu.session.stop')?.enabled).toBeUndefined()
    expect(command(busy, 'menu.session.compress')?.enabled).toBe(false)
    // A canonical Bot Chat's title is its identity.
    expect(command(busy, 'menu.session.rename')?.enabled).toBe(false)
    expect(command(busy, 'menu.session.archive')?.label).toBe('Unarchive')
  })

  it('labels toggles by what they will do and checks the current modes', () => {
    const model = build({
      state: {
        interfaceMode: 'simple',
        sidebarOpen: false,
        statusbarVisible: false,
        tabBar: 'never',
        themeMode: 'dark'
      }
    })

    expect(command(model, 'view.toggleSidebar')?.label).toBe('Show Sidebar')
    expect(command(model, 'view.toggleRightSidebar')?.label).toBe('Show Inspector')
    // Simple mode rests the status bar (prototype: the item belongs to Pro).
    expect(command(model, 'view.toggleStatusbar')).toMatchObject({ enabled: false, label: 'Show Status Bar' })
    expect(command(model, 'menu.tabBar.never')?.checked).toBe(true)
    expect(command(model, 'menu.tabBar.auto')?.checked).toBe(false)
    expect(command(model, 'menu.interface.simple')?.checked).toBe(true)
    expect(command(model, 'menu.appearance.dark')?.checked).toBe(true)
    expect(command(model, 'menu.appearance.system')?.checked).toBe(false)
  })

  it('checks the active profile, or All Profiles instead', () => {
    const one = build({ state: { activeProfile: 'work' } })

    expect(command(one, 'menu.profile:work')?.checked).toBe(true)
    expect(command(one, 'menu.profile:default')?.checked).toBe(false)
    expect(command(one, 'profile.toggleAll')?.checked).toBe(false)

    const all = build({ state: { activeProfile: 'work', showAllProfiles: true } })

    expect(command(all, 'menu.profile:work')?.checked).toBe(false)
    expect(command(all, 'profile.toggleAll')?.checked).toBe(true)
  })

  it('omits commands the app does not have instead of faking them', () => {
    const model = build({ available: id => id !== 'view.showAgents' && id !== 'layout.reset' })
    const ids = menuCommandIds(model)

    expect(ids).not.toContain('view.showAgents')
    expect(ids).not.toContain('layout.reset')
    expect(ids).toContain('layout.editMode')
  })

  it('greys out Tab Bar when no zone can show one', () => {
    const tabBar = build({ state: { tabBar: null } })
      .sections.find(section => section.id === 'view')
      ?.items.find(item => item.type === 'submenu' && item.label === 'Tab Bar')

    expect(tabBar).toMatchObject({ enabled: false })
  })
})

describe('native menu key equivalents', () => {
  const accelerators = (model: ApplicationMenuModel) =>
    Object.fromEntries(commands(model).flatMap(item => (item.accelerator ? [[item.id, item.accelerator]] : [])))

  it('come from the allow-listed app-level actions only, as their current binding', () => {
    expect(accelerators(build())).toEqual({
      'composer.modelPicker': 'Command+Shift+M',
      'keybinds.openPanel': 'Command+/',
      'layout.editMode': 'Command+Shift+\\',
      'nav.commandCenter': 'Command+.',
      'nav.settings': 'Command+,',
      'profile.toggleAll': 'Command+Shift+0',
      'session.new': 'Command+N',
      'session.newTab': 'Command+T',
      'session.newWindow': 'Command+Shift+N',
      'view.flipPanes': 'Command+\\',
      'view.showBrowser': 'Command+Shift+L',
      'view.toggleHud': 'Command+Shift+H',
      'view.toggleRightSidebar': 'Command+J',
      'view.toggleSidebar': 'Command+B',
      'view.toggleStatusbar': 'Command+Shift+S',
      'workspace.newWorktree': 'Command+Shift+B',
      'workspace.openFolder': 'Command+O'
    })
  })

  it('follow a rebind and drop an unbound or unsafe one', () => {
    const rebound = build({
      combos: id =>
        id === 'view.toggleSidebar'
          ? ['mod+alt+s']
          : id === 'session.new'
            ? []
            : id === 'session.newTab'
              ? ['shift+t', 'mod+shift+y']
              : (DEFAULTS[id] ?? [])
    })

    expect(command(rebound, 'view.toggleSidebar')?.accelerator).toBe('Command+Alt+S')
    expect(command(rebound, 'session.new')?.accelerator).toBeUndefined()
    // A bare/shift-only chord would steal typing; the next usable combo wins.
    expect(command(rebound, 'session.newTab')?.accelerator).toBe('Command+Shift+Y')
  })

  it('are stripped while the shortcuts panel records, and never sit on disabled items', () => {
    expect(accelerators(build({ recording: true }))).toEqual({})
    expect(command(build({ state: { interfaceMode: 'simple' } }), 'view.toggleStatusbar')?.accelerator).toBeUndefined()
  })

  it('never doubles a chord across two items', () => {
    const shared = build({ combos: id => (id === 'session.new' || id === 'session.newTab' ? ['mod+n'] : []) })

    expect(command(shared, 'session.new')?.accelerator).toBe('Command+N')
    expect(command(shared, 'session.newTab')?.accelerator).toBeUndefined()
  })
})
