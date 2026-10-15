import { SESSION_IMPORT_ROUTE } from '@/app/routes'
import { codiconIcon } from '@/components/ui/codicon'
import type { StudioIconName } from '@/components/ui/studio-icon'
import type { Translations } from '@/i18n'
import type { $repoWorktrees } from '@/store/coding-status'
import { openPetGenerate } from '@/store/pet-generate'
import { toggleBrowserTab } from '@/store/preview'
import { type $projectTree, goToProject, openFolderAsProject, requestStartWorkSession } from '@/store/projects'
import { runGatewayRestart } from '@/store/system-actions'
import { requestActiveUpdate } from '@/store/updates'
import { canOpenNewWindow, openNewWindow } from '@/store/windows'

import {
  AGENTS_ROUTE,
  ARTIFACTS_ROUTE,
  CAPABILITIES_ROUTE,
  COMMAND_CENTER_ROUTE,
  CRON_ROUTE,
  MESSAGING_ROUTE,
  NEW_CHAT_ROUTE,
  PROFILES_ROUTE,
  SETTINGS_ROUTE,
  STARMAP_ROUTE
} from '../routes'
import { SETTINGS_PAGE_IDS, SETTINGS_PAGES, settingsPageSearch } from '../settings/studio/categories'

import type { PaletteContribution } from './contrib'
import type { PaletteGroup, PaletteItem } from './types'

type Project = ReturnType<typeof $projectTree.get>[number]
type Worktree = ReturnType<typeof $repoWorktrees.get>[number]

export interface RootGroupsContext {
  contributed: Array<PaletteContribution & { key: string }>
  go: (path: string) => () => void
  /** Visible projects, sidebar order. */
  projects: readonly Project[]
  t: Translations
  updateVersionLabel: string
}

/** 前往: where you can go. Pages scope; the whole group is the ⌘K landing's middle block. */
export function goToGroup({ go, t }: RootGroupsContext): PaletteGroup {
  const cc = t.commandCenter

  const newWindow: PaletteItem[] = canOpenNewWindow()
    ? [
        {
          action: 'session.newWindow',
          glyph: 'window',
          id: 'nav-new-window',
          keywords: ['window', 'instance', 'open', 'new'],
          label: t.keybinds.actions['session.newWindow'],
          run: () => void openNewWindow()
        }
      ]
    : []

  return {
    heading: cc.goTo,
    scope: 'pages',
    items: [
      {
        action: 'session.new',
        glyph: 'compose',
        id: 'nav-new',
        keywords: ['chat', 'create'],
        label: cc.nav.newChat.title,
        run: go(NEW_CHAT_ROUTE)
      },
      ...newWindow,
      {
        action: 'nav.capabilities',
        glyph: 'cube',
        id: 'nav-skills',
        keywords: ['skills', 'tools', 'toolsets', 'mcp', 'capabilities'],
        label: cc.nav.capabilities.title,
        run: go(CAPABILITIES_ROUTE)
      },
      {
        action: 'nav.messaging',
        glyph: 'bubbles',
        id: 'nav-messaging',
        label: cc.nav.messaging.title,
        run: go(MESSAGING_ROUTE)
      },
      {
        action: 'nav.cron',
        glyph: 'clock',
        id: 'nav-cron',
        keywords: ['schedule', 'jobs'],
        label: t.shell.statusbar.cron,
        run: go(CRON_ROUTE)
      },
      { action: 'nav.artifacts', glyph: 'shapes', id: 'nav-artifacts', label: cc.nav.artifacts.title, run: go(ARTIFACTS_ROUTE) },
      {
        glyph: 'graph',
        id: 'nav-starmap',
        keywords: ['star map', 'memory', 'memories', 'skills', 'graph', 'learning', 'constellation'],
        label: t.starmap.title,
        run: go(STARMAP_ROUTE)
      },
      { action: 'nav.settings', glyph: 'gear', id: 'nav-settings', label: cc.nav.settings.title, run: go(SETTINGS_ROUTE) },
      // One row for the System Status sheet; its tabs are the note.
      {
        action: 'nav.commandCenter',
        detail: [cc.sections.sessions, cc.sections.system, cc.sections.usage, cc.sections.maintenance].join(' · '),
        glyph: 'pulse',
        id: 'nav-system-status',
        keywords: ['command center', 'system', 'status', 'sessions', 'usage', 'tokens', 'cost', 'logs', 'maintenance'],
        label: t.studio.overlays.system.title,
        run: go(COMMAND_CENTER_ROUTE)
      },
      { action: 'nav.profiles', glyph: 'people', id: 'nav-profiles', label: t.profiles.title, run: go(PROFILES_ROUTE) },
      { action: 'nav.agents', glyph: 'bot', id: 'nav-agents', label: t.agents.title, run: go(AGENTS_ROUTE) }
    ]
  }
}

/**
 * Projects are the primary way the desktop scopes work, so they're jumpable
 * from the palette. Plain select is a pure scope switch (sidebar enters the
 * project — never spends main); ⌘-Enter / ⌘-click also starts a new session at
 * the project root (stacked as a tab when main holds a chat), previewed by the
 * label swap while ⌘ is held. A project with its own codicon keeps it, matching
 * the sidebar. The pinned "Open folder…" row is the ⌘O upsert.
 */
export function projectGroup({ projects, t }: RootGroupsContext): PaletteGroup {
  const cc = t.commandCenter

  return {
    heading: cc.projects,
    scope: 'sessions',
    items: [
      {
        action: 'workspace.openFolder',
        glyph: 'folder-plus',
        id: 'project-open-folder',
        keywords: ['open', 'folder', 'directory', 'project', 'add', 'import', 'workspace'],
        label: cc.openFolder,
        run: () => void openFolderAsProject()
      },
      ...projects.map(
        (project): PaletteItem => ({
          comboHint: 'mod+enter',
          ...(project.icon
            ? { icon: codiconIcon(project.icon) }
            : { glyph: project.isNoProject ? ('house' as const) : ('folder' as const) }),
          id: `project-${project.id}`,
          keywords: ['project', 'workspace', 'go to', project.label, ...(project.path ? [project.path] : [])],
          label: project.label,
          modLabel: cc.newSessionInProject(project.label),
          runWithEvent: event => goToProject(project.id, { newSession: Boolean(event?.metaKey || event?.ctrlKey) })
        })
      )
    ]
  }
}

// Core contributed rows registered with English copy at boot: translated here
// by id, with a prototype glyph. Plugin rows keep their own label and icon.
const CORE_ROWS: Record<string, { action?: string; glyph: StudioIconName; label: (t: Translations) => string }> = {
  'keybinds.panel': { action: 'keybinds.openPanel', glyph: 'keyboard', label: t => t.studio.overlays.shortcuts.title },
  'layout.editMode': { glyph: 'layout', label: t => t.studio.overlays.palette.layoutEditMode },
  'layout.reset': { glyph: 'layout', label: t => t.studio.overlays.palette.resetLayout },
  'logs.toggle': { glyph: 'doc', label: t => t.studio.overlays.palette.toggleLogs },
  'plugins.reload': { glyph: 'puzzle', label: t => t.studio.overlays.palette.reloadPlugins },
  'profile.export': { glyph: 'share', label: t => t.profiles.exportProfile },
  'profile.import': { glyph: 'import', label: t => t.profiles.importProfile },
  'session.yolo': { glyph: 'bolt', label: t => t.studio.overlays.palette.toggleYolo },
  'view.simpleMode': { glyph: 'sliders', label: t => t.keybinds.actions['view.toggleSimpleMode'] },
  'view.toggleProfileRail': { glyph: 'people', label: t => t.keybinds.actions['view.toggleProfileRail'] },
  'view.toggleStatusbar': { glyph: 'dock', label: t => t.keybinds.actions['view.toggleStatusbar'] },
  'view.toggleTabStrip': { glyph: 'window', label: t => t.keybinds.actions['view.toggleTabStrip'] }
}

// The ⌘K landing previews the first six commands: these lead, in this order.
const FEATURED_COMMANDS = [
  'session-import',
  'core:keybinds.panel',
  'cc-open-browser',
  'core:view.simpleMode',
  'cc-restart-gateway',
  'cc-update-hermes'
]

function contributedItem(item: RootGroupsContext['contributed'][number], t: Translations): PaletteItem {
  const core = item.key.startsWith('core:') ? CORE_ROWS[item.key.slice(5)] : undefined
  // Read on mount and after every select, so a row that reports state can't
  // show the state it just left. paletteToggle reports a literal on/off.
  const detail = item.detail?.()
  const pal = t.studio.overlays.palette

  return {
    action: item.action ?? core?.action,
    detail: detail === 'on' ? pal.on : detail === 'off' ? pal.off : detail,
    detailVariant: item.detailVariant,
    ...(core ? { glyph: core.glyph } : item.icon ? { icon: item.icon } : { glyph: 'bolt' as const }),
    id: item.key,
    keepOpen: item.keepOpen,
    keywords: core ? [item.label, ...(item.keywords ?? [])] : item.keywords,
    label: core ? core.label(t) : item.label,
    run: item.run
  }
}

/** 命令: things you can do — the System Status quick actions plus every registry-contributed row. */
export function commandsGroup({ contributed, go, t, updateVersionLabel }: RootGroupsContext): PaletteGroup {
  const cc = t.commandCenter

  const items: PaletteItem[] = [
    {
      glyph: 'import',
      id: 'session-import',
      keywords: ['import', 'claude', 'codex', 'conversation'],
      label: t.sessionImport.action,
      run: go(SESSION_IMPORT_ROUTE)
    },
    {
      glyph: 'pulse',
      id: 'cc-restart-gateway',
      keywords: ['gateway', 'restart', 'messaging', 'reconnect', 'system'],
      label: cc.restartGateway,
      run: () => void runGatewayRestart()
    },
    {
      detail: updateVersionLabel,
      glyph: 'update',
      id: 'cc-update-hermes',
      keywords: ['update', 'upgrade', 'hermes', 'version', 'system', 'restart'],
      label: cc.updateHermes,
      run: () => requestActiveUpdate()
    },
    {
      glyph: 'retry',
      id: 'cc-reload-window',
      keywords: ['reload', 'window', 'refresh', 'restart', 'ui', 'stuck'],
      label: cc.reloadWindow,
      run: () => window.location.reload()
    },
    {
      action: 'view.showBrowser',
      glyph: 'globe',
      id: 'cc-open-browser',
      keywords: ['browser', 'web', 'url', 'address', 'open', 'toggle', 'close', 'navigate', 'internet', 'site'],
      label: cc.toggleBrowser,
      run: () => toggleBrowserTab()
    },
    ...contributed.map(item => contributedItem(item, t))
  ]

  const rank = (id: string) => {
    const index = FEATURED_COMMANDS.indexOf(id)

    return index < 0 ? FEATURED_COMMANDS.length : index
  }

  return { heading: cc.commands, items: items.sort((a, b) => rank(a.id) - rank(b.id)), scope: 'actions' }
}

/** 外观: the theme / mode / pet pickers (nested pages) and pet generation. */
export function appearanceGroup({ t }: RootGroupsContext): PaletteGroup {
  const cc = t.commandCenter

  return {
    heading: cc.appearance,
    scope: 'actions',
    items: [
      {
        glyph: 'brush',
        id: 'appearance-theme',
        keywords: ['theme', 'appearance', 'color', 'palette', 'skin', 'dark', 'light', 'look'],
        label: cc.changeTheme,
        to: 'theme'
      },
      {
        glyph: 'contrast',
        id: 'appearance-mode',
        keywords: ['appearance', 'color mode', 'brightness', 'dark', 'light', 'system'],
        label: cc.changeColorMode,
        to: 'color-mode'
      },
      {
        glyph: 'paw',
        id: 'appearance-pets',
        keywords: ['pet', 'petdex', 'mascot', 'pets', '/pet', 'paw'],
        label: cc.pets.title,
        to: 'pets'
      },
      {
        glyph: 'sparkle',
        id: 'appearance-generate-pet',
        keywords: ['pet', 'generate', 'create', 'make', 'new pet', 'mascot', 'hatch', 'ai'],
        label: cc.generatePet.title,
        run: () => openPetGenerate()
      }
    ]
  }
}

/** 设置: the Settings window's 19 categories, in sidebar order. */
export function settingsGroup({ go, t }: RootGroupsContext): PaletteGroup {
  return {
    heading: t.commandCenter.settings,
    scope: 'settings',
    items: SETTINGS_PAGE_IDS.map(id => {
      const copy = t.studio.settings.pages[id]

      return {
        detail: t.studio.overlays.palette.scopes.settings,
        glyph: SETTINGS_PAGES[id].glyph,
        id: `settings-page-${id}`,
        // The hero line names what lives on the page; a few heroes are templates.
        keywords: ['settings', id, ...(typeof copy.hero === 'string' ? [copy.hero] : [])],
        label: copy.title,
        run: go(`${SETTINGS_ROUTE}${settingsPageSearch(id)}`)
      }
    })
  }
}

/**
 * The active repo's worktrees → "new conversation in <branch>". This is the
 * ⌘K-typed "I want to work on <branch>" reflex: each entry seeds a fresh
 * session anchored to that worktree's checkout (requestStartWorkSession), so
 * git is the source of truth and edits land in the right tree.
 */
export function branchGroups(worktrees: readonly Worktree[], t: Translations): PaletteGroup[] {
  if (worktrees.length === 0) {
    return []
  }

  return [
    {
      heading: t.commandCenter.branches,
      scope: 'sessions',
      items: worktrees.map(wt => {
        const name = wt.branch?.trim() || wt.path.split('/').pop() || wt.path

        return {
          glyph: 'branch',
          id: `worktree-${wt.path}`,
          keywords: ['branch', 'worktree', 'switch', name, wt.path],
          label: t.commandCenter.startInBranch(name),
          run: () => requestStartWorkSession(wt.path)
        }
      })
    }
  ]
}
