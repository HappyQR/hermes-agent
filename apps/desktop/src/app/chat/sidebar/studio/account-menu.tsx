import { LOCAL_CONNECTION_ID } from '@hermes/shared'
import { useStore } from '@nanostores/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import { MenuHint } from '@/components/ui/actions-menu'
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  dropdownMenuSectionLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { PROFILE_SLOT_COUNT } from '@/lib/keybinds/actions'
import { useKeybindHint } from '@/lib/keybinds/use-keybind-hint'
import { cn } from '@/lib/utils'
import { $activeConnectionId, $connectionsRegistry, $hasMultipleConnections } from '@/store/connections'
import { $fleetRoster } from '@/store/fleet-roster'
import { $showsAdvancedChrome } from '@/store/interface-mode'
import {
  $activeGatewayProfile,
  $profileOrder,
  $profiles,
  $showAllProfiles,
  normalizeProfileKey,
  sortByProfileOrder,
  toggleShowAllProfiles
} from '@/store/profile'
import { $profileRailVisible, toggleProfileRailVisible } from '@/store/profile-rail-prefs'
import { runImportProfileFlow } from '@/store/profile-share'
import { openUpdatesWindow } from '@/store/updates'

import { openKeybindsSheet } from '../../../keybinds-sheet/store'
import { COMMAND_CENTER_ROUTE, PROFILES_ROUTE, SETTINGS_ROUTE } from '../../../routes'
import { FleetGatewayMenuGroup } from '../fleet-gateway-menu-group'
import { buildRestGroups, type FleetAgent } from '../fleet-rail'

import { useAllProfilesView, useGatewayIdentity } from './account-identity'
import { AccountProfileRow } from './account-profile-row'
import { GatewaySubmenu } from './gateway-submenu'
import type { AccountDialogs } from './use-account-dialogs'

/** The active gateway's profiles, default first then the user's rail order —
 *  each with the keybind that switches to it. */
function useActiveProfiles() {
  const profiles = useStore($profiles)
  const order = useStore($profileOrder)

  return useMemo(() => {
    const named = sortByProfileOrder(
      profiles.filter(profile => !profile.is_default),
      order
    )

    const defaultProfile = profiles.find(profile => profile.is_default)

    return [
      ...(defaultProfile ? [{ keybind: 'profile.default', profile: defaultProfile }] : []),
      ...named.map((profile, index) => ({
        keybind: index < PROFILE_SLOT_COUNT ? `profile.switch.${index + 1}` : null,
        profile
      }))
    ]
  }, [order, profiles])
}

function Hinted({ action, children }: { action: string; children: React.ReactNode }) {
  const hint = useKeybindHint(action)

  return (
    <>
      {children}
      {hint ? <MenuHint>{hint}</MenuHint> : null}
    </>
  )
}

interface AccountProfileRowsProps {
  close: () => void
  dialogs: Pick<AccountDialogs, 'openDelete' | 'openRename' | 'openSoul'>
  switchToRest: (agent: FleetAgent) => void
}

/**
 * The profile half of the account menu: this gateway's header and profile
 * rows, then every other gateway's group. Shared with the new-chat screen's
 * profile chip, so both switch through the same paths (remote and
 * multi-connection routing included).
 */
export function AccountProfileRows({ close, dialogs, switchToRest }: AccountProfileRowsProps) {
  const allView = useAllProfilesView()
  const gatewayProfile = useStore($activeGatewayProfile)
  const multipleConnections = useStore($hasMultipleConnections)
  const registry = useStore($connectionsRegistry)
  const activeConnectionId = useStore($activeConnectionId)
  const roster = useStore($fleetRoster)
  const order = useStore($profileOrder)
  const rows = useActiveProfiles()
  const gateway = useGatewayIdentity()
  const activeKey = normalizeProfileKey(gatewayProfile)
  // Named picks on This device keep the legacy profile door (it resolves the
  // per-profile remote overrides); the default row keys on the gateway itself.
  const namedConnectionId = activeConnectionId === LOCAL_CONNECTION_ID ? null : activeConnectionId

  const restGroups = useMemo(
    () =>
      multipleConnections
        ? buildRestGroups({ activeConnectionId, connections: registry?.connections ?? [], order, roster })
        : [],
    [activeConnectionId, multipleConnections, order, registry?.connections, roster]
  )

  return (
    <>
      <DropdownMenuLabel className={cn(dropdownMenuSectionLabel, 'flex items-center gap-1.5')}>
        <span className="truncate">{gateway.label}</span>
        <span aria-hidden="true">·</span>
        <span className="shrink-0">{gateway.status}</span>
      </DropdownMenuLabel>
      {rows.map(({ keybind, profile }) => (
        <AccountProfileRow
          active={!allView && normalizeProfileKey(profile.name) === activeKey}
          close={close}
          connectionId={profile.is_default ? activeConnectionId : namedConnectionId}
          dialogs={dialogs}
          key={profile.name}
          keybind={keybind}
          profile={profile}
          remoteOverride={!multipleConnections}
        />
      ))}
      {restGroups.map(group => (
        <FleetGatewayMenuGroup
          group={group}
          key={group.connectionId}
          onSelect={agent => {
            switchToRest(agent)
            close()
          }}
          slot="sidebar-account-gateway"
        />
      ))}
    </>
  )
}

interface AccountMenuItemsProps {
  close: () => void
  dialogs: AccountDialogs
  switchToRest: (agent: FleetAgent) => void
}

/**
 * The account menu (prototype HP.ProfileMenu): All profiles, this gateway's
 * profiles, every other gateway's, profile management, the gateway, system
 * status, settings, shortcuts and updates. It replaces the profile rail and
 * the status bar's gateway/profile items as the default door.
 */
export function AccountMenuItems({ close, dialogs, switchToRest }: AccountMenuItemsProps) {
  const { t } = useI18n()
  const p = t.profiles
  const copy = t.studio.sidebar.footer
  const navigate = useNavigate()
  const profiles = useStore($profiles)
  const showAll = useStore($showAllProfiles)
  const advanced = useStore($showsAdvancedChrome)
  const railVisible = useStore($profileRailVisible)

  // Nothing to widen to with one profile (the switch is inert there, even
  // when Bot Mode has turned it on).
  const offerAll = profiles.length > 1

  return (
    <>
      {offerAll && (
        <>
          <DropdownMenuCheckboxItem checked={showAll} onCheckedChange={() => toggleShowAllProfiles()}>
            <Hinted action="profile.toggleAll">
              <span className="min-w-0 flex-1 truncate">{p.allProfiles}</span>
            </Hinted>
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
        </>
      )}
      <AccountProfileRows close={close} dialogs={dialogs} switchToRest={switchToRest} />
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={dialogs.openCreate}>
        <StudioIcon name="plus" size={15} />
        <span>{copy.newProfile}</span>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => void runImportProfileFlow()}>
        <StudioIcon name="import" size={15} />
        <span>{p.importProfile}</span>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => navigate(PROFILES_ROUTE)}>
        <StudioIcon name="people" size={15} />
        <span>{p.manageProfiles}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <GatewaySubmenu />
      <DropdownMenuItem onSelect={() => navigate(COMMAND_CENTER_ROUTE)}>
        <StudioIcon name="pulse" size={15} />
        <Hinted action="nav.commandCenter">
          <span>{copy.systemStatus}</span>
        </Hinted>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => navigate(SETTINGS_ROUTE)}>
        <StudioIcon name="gear" size={15} />
        <Hinted action="nav.settings">
          <span>{copy.settings}</span>
        </Hinted>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={openKeybindsSheet}>
        <StudioIcon name="keyboard" size={15} />
        <Hinted action="keybinds.openPanel">
          <span>{copy.shortcuts}</span>
        </Hinted>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => openUpdatesWindow()}>
        <StudioIcon name="update" size={15} />
        <span>{copy.checkUpdates}</span>
      </DropdownMenuItem>
      {/* Kept beyond the prototype: the colored rail (drag-order, dense
          fleets) stays one click away. Simple mode rests it hidden. */}
      {advanced && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={railVisible} onCheckedChange={() => toggleProfileRailVisible()}>
            {copy.showRail}
          </DropdownMenuCheckboxItem>
        </>
      )}
    </>
  )
}
