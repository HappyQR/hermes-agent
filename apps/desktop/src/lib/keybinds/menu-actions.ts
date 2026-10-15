// The native application menu's one door into the app's actions
// (src/app/shell/native-menu.ts). A menu click is user-initiated, so unlike
// `runPluginAppAction` it is not limited to the plugin allow-list. Every item
// runs through the SAME handler its other entry points use, tried in order:
//
//   1. a built-in action (the keybind handler table, `registerBuiltinActionRunner`)
//   2. a contributed keybind's `run` (e.g. `layout.editMode`)
//   3. a ⌘K palette command's `run` (e.g. `layout.reset`, `profile.export`)
//   4. a menu-only command registered by the mounted menu (`menu.*`)

import { PALETTE_AREA, type PaletteContribution } from '@/app/command-palette/contrib'
import { registry } from '@/contrib/registry'
import { recordAction } from '@/store/desktop-metrics'

import { contributedKeybindHandler, KEYBIND_ACTION_IDS } from './actions'
import { runBuiltinAction } from './plugin-actions'

/** Resolves a menu-only command id to its handler (undefined when unknown). */
export type MenuCommandResolver = (id: string) => (() => void) | undefined

let menuOnly: MenuCommandResolver | null = null

/** The mounted menu installs its menu-only commands here (one owner at a time). */
export function registerMenuCommands(resolver: MenuCommandResolver): () => void {
  menuOnly = resolver

  return () => {
    if (menuOnly === resolver) {
      menuOnly = null
    }
  }
}

function paletteRun(id: string): (() => void) | undefined {
  const row = registry
    .getArea(PALETTE_AREA)
    .map(contribution => contribution.data as PaletteContribution | undefined)
    .find(data => data?.id === id && typeof data.run === 'function')

  return row?.run
}

/** Does the app have a command by this id right now? The menu omits items
 *  whose command doesn't exist (yet), so a late action appears once it lands. */
export function menuCommandAvailable(id: string): boolean {
  return Boolean(KEYBIND_ACTION_IDS.includes(id) || contributedKeybindHandler(id) || paletteRun(id) || menuOnly?.(id))
}

/** Run a menu item's command. False when nothing answers to the id. */
export function runMenuCommand(id: string): boolean {
  const handler = contributedKeybindHandler(id) ?? paletteRun(id) ?? menuOnly?.(id)

  if (runBuiltinAction(id)) {
    recordAction(id, 'menu')

    return true
  }

  if (!handler) {
    return false
  }

  handler()
  recordAction(id, 'menu')

  return true
}
