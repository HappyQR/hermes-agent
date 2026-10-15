/**
 * Live state the application menu reflects, derived as small VALUE atoms
 * (strings / booleans): nanostores only notifies when the value changes, so a
 * streaming token or a splitter drag that leaves the menu's answer alone never
 * rebuilds the model.
 */

import { computed } from 'nanostores'

import { findGroup, findGroupOfPane, type GroupNode } from '@/components/pane-shell/tree/model'
import { $activeTreeGroup, $hiddenTreePanes, $layoutTree, shownPanesInGroup } from '@/components/pane-shell/tree/store'
import { workspaceSessionRenameable } from '@/components/pane-shell/workspace-scope'
import { $registryVersion } from '@/contrib/registry'
import { NEW_SESSION_TITLE, sessionTitle } from '@/lib/chat-runtime'
import { $pinnedSessionIds } from '@/store/layout'
import {
  $activeGatewayProfile,
  $profileOrder,
  $profiles,
  $showAllProfiles,
  normalizeProfileKey,
  profileLabel,
  sortByProfileOrder
} from '@/store/profile'
import {
  $activeSessionId,
  $busy,
  $sessions,
  ownerLookupSessionRows,
  sessionMatchesStoredId,
  sessionPinId
} from '@/store/session'
import { $focusedSessionIsTile, $focusedStoredSessionId } from '@/store/session-focus'
import { $botChatScopes, $sessionStates, $sessionTiles } from '@/store/session-states'
import { $archivedSessions } from '@/store/sidebar-archive'
import type { ProfileInfo } from '@/types/hermes'

import type { MenuProfileEntry, MenuSessionState, MenuTabBarMode } from './native-menu-model'

// ── Tab Bar ─────────────────────────────────────────────────────────────────

/** The zone View › Tab Bar acts on: the focused zone, else the workspace's —
 *  the `view.toggleTabStrip` ladder without its hover rung (the pointer is on
 *  the menu bar, outside every zone, whenever the menu is used). */
export function menuTabBarTarget(): GroupNode | null {
  const tree = $layoutTree.get()

  if (!tree) {
    return null
  }

  const focusedId = $activeTreeGroup.get()
  const candidates = [focusedId ? findGroup(tree, focusedId) : null, findGroupOfPane(tree, 'workspace')]

  return candidates.find(group => group && shownPanesInGroup(group).length > 0) ?? null
}

export const $menuTabBarMode = computed(
  [$layoutTree, $activeTreeGroup, $hiddenTreePanes, $registryVersion],
  (): MenuTabBarMode | null => {
    const group = menuTabBarTarget()

    return group ? (group.tabStrip ?? 'auto') : null
  }
)

// ── The session the user is working in ──────────────────────────────────────

/** The session menu acts on: the focused tile, else the primary selection. */
export interface MenuSessionTarget {
  id: string
  isTile: boolean
  /** Its live runtime, when one is bound. */
  runtimeId: null | string
  title: string
  profile?: string
}

export function menuSessionTarget(): MenuSessionTarget | null {
  const id = $focusedStoredSessionId.get()

  if (!id) {
    return null
  }

  const isTile = $focusedSessionIsTile.get()
  const row = ownerLookupSessionRows().find(session => sessionMatchesStoredId(session, id))

  const runtimeId = isTile
    ? ($sessionTiles.get().find(tile => tile.storedSessionId === id)?.runtimeId ?? null)
    : $activeSessionId.get()

  return { id, isTile, runtimeId, title: row ? sessionTitle(row) : NEW_SESSION_TITLE, profile: row?.profile }
}

/** Identity-derived facts about the target (everything but `busy`), as a
 *  stable string key. Empty when there is no session. */
export const $menuSessionKey = computed(
  [$focusedStoredSessionId, $sessions, $archivedSessions, $pinnedSessionIds, $sessionTiles, $botChatScopes],
  (id, sessions, archived, pinned, tiles, botScopes): string => {
    if (!id) {
      return ''
    }

    const row = sessions.find(session => sessionMatchesStoredId(session, id))
    const tile = tiles.find(candidate => candidate.storedSessionId === id)

    // Same gate the tab menu uses: a canonical Bot Chat's title is its identity.
    const scope = tile
      ? { workspaceMode: tile.workspaceMode, workspaceTabTitle: tile.workspaceTabTitle }
      : botScopes[id]

    const state: Omit<MenuSessionState, 'busy'> = {
      archived: row?.archived === true || archived.some(session => sessionMatchesStoredId(session, id)),
      pinned: pinned.includes(row ? sessionPinId(row) : id),
      renameable: workspaceSessionRenameable(scope)
    }

    return JSON.stringify(state)
  }
)

/** Is the target's turn running? Read per runtime, so token streaming (which
 *  rewrites `$sessionStates`) only notifies when the answer flips. */
export const $menuSessionBusy = computed(
  [$focusedStoredSessionId, $focusedSessionIsTile, $busy, $sessionTiles, $sessionStates],
  (id, isTile, busy, tiles, states): boolean => {
    if (!id) {
      return false
    }

    if (!isTile) {
      return busy
    }

    const runtimeId = tiles.find(tile => tile.storedSessionId === id)?.runtimeId

    return Boolean(runtimeId && states[runtimeId]?.busy)
  }
)

export function menuSessionState(key: string, busy: boolean): MenuSessionState | null {
  return key ? { ...(JSON.parse(key) as Omit<MenuSessionState, 'busy'>), busy } : null
}

// ── Profiles ────────────────────────────────────────────────────────────────

/** Rail order: the default profile first, then named ones in the user's order. */
function railProfiles(profiles: readonly ProfileInfo[], order: string[]): ProfileInfo[] {
  const named = sortByProfileOrder(
    profiles.filter(profile => !profile.is_default),
    order
  )

  return [...profiles.filter(profile => profile.is_default), ...named]
}

export interface MenuProfilesState {
  active: string
  list: MenuProfileEntry[]
  showAll: boolean
}

export const $menuProfilesKey = computed(
  [$profiles, $profileOrder, $activeGatewayProfile, $showAllProfiles],
  (profiles, order, active, showAll): string => {
    const state: MenuProfilesState = {
      active: normalizeProfileKey(active),
      list: railProfiles(profiles, order).map(profile => ({
        key: normalizeProfileKey(profile.name),
        label: profileLabel(profile)
      })),
      showAll
    }

    return JSON.stringify(state)
  }
)

export const menuProfilesState = (key: string): MenuProfilesState => JSON.parse(key) as MenuProfilesState
