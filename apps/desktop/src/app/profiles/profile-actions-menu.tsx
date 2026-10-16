import { LOCAL_CONNECTION_ID } from '@hermes/shared'
import { useStore } from '@nanostores/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ColorSwatches } from '@/components/ui/color-swatches'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { PROFILE_SWATCHES, resolveProfileColor } from '@/lib/profile-color'
import { $activeConnectionId, $hasMultipleConnections } from '@/store/connections'
import { $defaultProfileRoute, setDefaultProfile } from '@/store/default-profile'
import { notify, notifyError } from '@/store/notifications'
import { $profileColors, profileLabel, setProfileColor } from '@/store/profile'
import { chooseProfilePicture, removeProfilePicture, useProfilePicture } from '@/store/profile-picture'
import { openRemoteOverrideDialog } from '@/store/profile-remote-override'
import { runExportProfileFlow } from '@/store/profile-share'
import { canOpenNewWindow, openNewWindow } from '@/store/windows'
import type { ProfileInfo } from '@/types/hermes'

/** The launch route the rail uses for a profile on this gateway (named profiles on This device use the legacy door). */
export function useProfileRoute(profile: ProfileInfo) {
  const activeConnectionId = useStore($activeConnectionId)

  return {
    connectionId: profile.is_default || activeConnectionId !== LOCAL_CONNECTION_ID ? activeConnectionId : null,
    profile: profile.name
  }
}

/**
 * Actions ▾ — the profile rail's context menu, mirrored in the Profiles sheet:
 * new window, default, picture, colour, rename, SOUL.md, export, remote host,
 * delete.
 */
export function ProfileActionsMenu({
  onDelete,
  onEditSoul,
  onRename,
  profile
}: {
  onDelete: () => void
  onEditSoul: () => void
  onRename: () => void
  profile: ProfileInfo
}) {
  const { t } = useI18n()
  const p = t.profiles
  const colors = useStore($profileColors)
  const defaultRoute = useStore($defaultProfileRoute)
  const multipleConnections = useStore($hasMultipleConnections)
  const route = useProfileRoute(profile)
  const [colorOpen, setColorOpen] = useState(false)
  const picture = useProfilePicture(profile.name)
  const label = profileLabel(profile)
  const isLaunchDefault = defaultRoute?.connectionId === route.connectionId && defaultRoute?.profile === route.profile

  const makeDefault = async () => {
    try {
      await setDefaultProfile(route)
      notify({ kind: 'success', message: p.defaultDescription, title: p.defaultSet(label) })
    } catch (error) {
      notifyError(error, p.failedSetDefault)
    }
  }

  return (
    <Popover onOpenChange={setColorOpen} open={colorOpen}>
      <DropdownMenu>
        <PopoverAnchor asChild>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary">
              {p.actions}
              <StudioIcon name="chev-d" size={11} />
            </Button>
          </DropdownMenuTrigger>
        </PopoverAnchor>
        <DropdownMenuContent align="end" className="min-w-52">
          {canOpenNewWindow() && (
            <DropdownMenuItem onSelect={() => void openNewWindow(route)}>
              <StudioIcon name="popout" size={14} />
              {p.openInNewWindow}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            disabled={isLaunchDefault || !window.hermesDesktop?.profile?.setDefault}
            onSelect={() => void makeDefault()}
          >
            <StudioIcon name={isLaunchDefault ? 'check' : 'house'} size={14} />
            {isLaunchDefault ? p.defaultProfile : p.setAsDefault}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => chooseProfilePicture(profile.name)}>
            <StudioIcon name="photo" size={14} />
            {p.choosePicture}
          </DropdownMenuItem>
          {picture && (
            <DropdownMenuItem onSelect={() => removeProfilePicture(profile.name)}>
              <StudioIcon name="x-circle" size={14} />
              {p.removePicture}
            </DropdownMenuItem>
          )}
          {!profile.is_default && (
            <DropdownMenuItem onSelect={() => setColorOpen(true)}>
              <StudioIcon name="brush" size={14} />
              {p.color}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={onRename}>
            <StudioIcon name="pencil" size={14} />
            {p.renameMenu}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onEditSoul}>
            <StudioIcon name="doc" size={14} />
            {p.editSoul}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void runExportProfileFlow(profile.name)}>
            <StudioIcon name="share" size={14} />
            {p.exportMenu}
          </DropdownMenuItem>
          {/* Same gate as the rail: with several gateways the registry is the
              way to reach another machine, not a per-profile override. */}
          {!multipleConnections && (
            <DropdownMenuItem onSelect={() => openRemoteOverrideDialog(profile.name)}>
              <StudioIcon name="server" size={14} />
              {p.remoteOverride.menuItem}
            </DropdownMenuItem>
          )}
          {!profile.is_default && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onDelete} variant="destructive">
                <StudioIcon name="trash" size={14} />
                {t.common.delete}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <PopoverContent align="end" aria-label={p.colorFor} className="w-auto p-2">
        <ColorSwatches
          clearIcon="sync"
          clearLabel={p.autoColor}
          onChange={color => {
            setProfileColor(profile.name, color)
            setColorOpen(false)
            triggerHaptic('selection')
          }}
          swatches={PROFILE_SWATCHES}
          swatchLabel={p.setColor}
          value={resolveProfileColor(profile.name, colors)}
        />
      </PopoverContent>
    </Popover>
  )
}
