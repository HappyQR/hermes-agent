/**
 * The macOS application menu, renderer half: builds this window's localized
 * menu model from i18n, the user's current bindings and live state, publishes
 * it to main (which rebuilds the NSMenu only when it changed), and runs the
 * items main sends back through `runMenuCommand`. Windows/Linux have no
 * application menu, so nothing is published there.
 */

import { useStore } from '@nanostores/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { $registryVersion } from '@/contrib/registry'
import { useI18n } from '@/i18n'
import { menuCommandAvailable, registerMenuCommands, runMenuCommand } from '@/lib/keybinds/menu-actions'
import { isMacPlatform } from '@/lib/platform'
import { $interfaceMode } from '@/store/interface-mode'
import { $bindings, $capture, bindingsFor } from '@/store/keybinds'
import { $sidebarOpen } from '@/store/layout'
import { $statusbarVisible } from '@/store/statusbar-prefs'
import { useTheme } from '@/themes/context'

import type { ApplicationMenuModel } from '../../../electron/application-menu-model'

import { $inspectorShown } from './inspector/inspector-state'
import { createMenuCommandResolver, type MenuSessionActions } from './native-menu-commands'
import { buildMenuModel, type MenuModelInput } from './native-menu-model'
import {
  $menuProfilesKey,
  $menuSessionBusy,
  $menuSessionKey,
  $menuTabBarMode,
  menuProfilesState,
  menuSessionState,
  type MenuSessionTarget
} from './native-menu-state'

export interface NativeMenuRename {
  /** The session the last Session › Rename… targeted (kept while the sheet closes). */
  target: MenuSessionTarget | null
  open: boolean
  close: () => void
}

/** Send a model unless it is the one this window sent last. */
function usePublisher(): (model: ApplicationMenuModel) => void {
  const lastSent = useRef('')

  return useCallback((model: ApplicationMenuModel) => {
    const serialized = JSON.stringify(model)

    if (serialized !== lastSent.current) {
      lastSent.current = serialized
      window.hermesDesktop?.setMenuModel?.(model)
    }
  }, [])
}

/** The model's inputs; `registryVersion` re-runs the build when contributions
 *  (keybinds, palette rows) change which commands exist. */
type MenuInput = Omit<MenuModelInput, 'available'> & { registryVersion: number }

/** Everything the model reads, memoized on the values that change it. */
function useMenuInput(): MenuInput {
  const { t } = useI18n()
  const { mode: themeMode } = useTheme()
  const sidebarOpen = useStore($sidebarOpen)
  // The inspector is today's right side; ⌘J toggles it.
  const inspectorOpen = useStore($inspectorShown)
  const statusbarVisible = useStore($statusbarVisible)
  const interfaceMode = useStore($interfaceMode)
  const tabBar = useStore($menuTabBarMode)
  const sessionKey = useStore($menuSessionKey)
  const busy = useStore($menuSessionBusy)
  const profilesKey = useStore($menuProfilesKey)
  const bindings = useStore($bindings)
  const recording = useStore($capture) !== null
  // Contributed keybinds / palette rows decide which items exist.
  const registryVersion = useStore($registryVersion)

  return useMemo(() => {
    const profiles = menuProfilesState(profilesKey)

    return {
      combos: (id: string) => bindingsFor(id, bindings),
      copy: t.studio.menu,
      recording,
      registryVersion,
      state: {
        activeProfile: profiles.active,
        inspectorOpen,
        interfaceMode,
        profiles: profiles.list,
        session: menuSessionState(sessionKey, busy),
        showAllProfiles: profiles.showAll,
        sidebarOpen,
        statusbarVisible,
        tabBar,
        themeMode
      }
    }
  }, [
    bindings,
    busy,
    inspectorOpen,
    interfaceMode,
    profilesKey,
    recording,
    registryVersion,
    sessionKey,
    sidebarOpen,
    statusbarVisible,
    t,
    tabBar,
    themeMode
  ])
}

export function useNativeMenu(actions: MenuSessionActions): NativeMenuRename {
  const navigate = useNavigate()
  const location = useLocation()
  const [renameTarget, setRenameTarget] = useState<MenuSessionTarget | null>(null)
  const [renameOpen, setRenameOpen] = useState(false)
  const publish = usePublisher()
  const input = useMenuInput()

  // Menu-only commands read the latest route and actions at call time.
  const live = useRef({ actions, pathname: location.pathname })

  live.current = { actions, pathname: location.pathname }

  useEffect(
    () =>
      registerMenuCommands(
        createMenuCommandResolver({
          actions: () => live.current.actions,
          navigate: to => navigate(to),
          openRename: target => {
            setRenameTarget(target)
            setRenameOpen(true)
          },
          pathname: () => live.current.pathname
        })
      ),
    [navigate]
  )

  // Built here, after the menu-only commands above are registered (effects
  // run in order), so `menuCommandAvailable` sees them on the first publish.
  useEffect(() => {
    if (isMacPlatform()) {
      publish(buildMenuModel({ ...input, available: menuCommandAvailable }))
    }
  }, [input, publish])

  useEffect(() => window.hermesDesktop?.onMenuCommand?.(({ id }) => void runMenuCommand(id)), [])

  return { close: () => setRenameOpen(false), open: renameOpen, target: renameTarget }
}
