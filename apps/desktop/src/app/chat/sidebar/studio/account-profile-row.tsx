import { useStore } from '@nanostores/react'

import { MenuHint } from '@/components/ui/actions-menu'
import { Badge } from '@/components/ui/badge'
import { ColorSwatches } from '@/components/ui/color-swatches'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import { ProfileGlyph } from '@/components/ui/profile-glyph'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { useKeybindHint } from '@/lib/keybinds/use-keybind-hint'
import { PROFILE_SWATCHES, resolveProfileColor } from '@/lib/profile-color'
import { useStoreSelector } from '@/lib/use-session-slice'
import {
  $profileColors,
  normalizeProfileKey,
  prewarmProfilePick,
  profileLabel,
  selectProfile,
  setProfileColor
} from '@/store/profile'
import { $profileDotStateByScope, profileDotSummaryFor } from '@/store/profile-dot-state'
import { chooseProfilePicture, removeProfilePicture, useProfilePicture } from '@/store/profile-picture'
import { $profileRemoteOverrides, openRemoteOverrideDialog } from '@/store/profile-remote-override'
import { runExportProfileFlow } from '@/store/profile-share'
import type { ProfileInfo } from '@/types/hermes'

import { useProfileLaunchActions } from '../profile-launch-menu'
import { useProfilePrewarm } from '../use-profile-prewarm'

import type { AccountDialogs } from './use-account-dialogs'

interface AccountProfileRowProps {
  profile: ProfileInfo
  active: boolean
  /** The (gateway) scope its dot rollup and launch actions key on. */
  connectionId: null | string
  /** Keybind action that switches to it (`profile.default` / `profile.switch.N`). */
  keybind: null | string
  /** The legacy per-profile remote override is offered on single-gateway setups only. */
  remoteOverride: boolean
  dialogs: Pick<AccountDialogs, 'openDelete' | 'openRename' | 'openSoul'>
  close: () => void
}

/** What rides at a row's end: its sessions' rollup (never on the active row,
 *  #91710), else its remote host, else the switch shortcut. */
function RowTrailing({
  active,
  connectionId,
  keybind,
  name,
  remoteHost
}: Pick<AccountProfileRowProps, 'active' | 'connectionId' | 'keybind'> & { name: string; remoteHost: null | string }) {
  const { t } = useI18n()
  const copy = t.studio.sidebar.footer
  const hint = useKeybindHint(keybind ?? '')

  const summary = useStoreSelector($profileDotStateByScope, byScope =>
    profileDotSummaryFor(byScope, connectionId, name)
  )

  if (!active && summary?.needsInputCount) {
    return (
      <Badge className="ml-auto shrink-0" size="xs" variant="warn">
        {copy.needsInputBadge(summary.needsInputCount)}
      </Badge>
    )
  }

  if (!active && summary?.unreadCount) {
    return (
      <Badge className="ml-auto shrink-0" size="xs">
        {copy.unreadBadge(summary.unreadCount)}
      </Badge>
    )
  }

  if (remoteHost) {
    return (
      <Badge className="ml-auto shrink-0" size="xs" variant="outline">
        {t.profiles.remoteOverride.badge(remoteHost)}
      </Badge>
    )
  }

  return keybind && hint ? <MenuHint>{hint}</MenuHint> : null
}

/** Color… ▸ the rail's swatches (auto clears the pick). */
function ColorSubmenu({ color, name }: { color: null | string; name: string }) {
  const { t } = useI18n()
  const p = t.profiles

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <StudioIcon name="brush" size={15} />
        <span>{p.color}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent aria-label={p.colorFor} className="p-2">
        <ColorSwatches
          clearIcon="sync"
          clearLabel={p.autoColor}
          onChange={next => {
            setProfileColor(name, next)
            triggerHaptic('selection')
          }}
          swatches={PROFILE_SWATCHES}
          swatchLabel={p.setColor}
          value={color}
        />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

/**
 * One profile in the account menu (prototype ProfileMenu row): clicking it
 * switches and closes the menu; hovering (or →) opens its submenu — open in a
 * new window, set as default, picture, color, rename, SOUL.md, export, remote
 * host, delete. The submenu leads with "Switch to this profile" for the keyboard.
 */
export function AccountProfileRow({
  profile,
  active,
  connectionId,
  keybind,
  remoteOverride,
  dialogs,
  close
}: AccountProfileRowProps) {
  const { t } = useI18n()
  const p = t.profiles
  const copy = t.studio.sidebar.footer
  const colors = useStore($profileColors)
  const label = profileLabel(profile)
  const color = resolveProfileColor(profile.name, colors)
  const picture = useProfilePicture(profile.name)
  const { cancelPrewarm, notePointerMove, startPrewarm } = useProfilePrewarm(profile.name, prewarmProfilePick)
  const launch = useProfileLaunchActions({ connectionId, label, profile: profile.name })
  const remoteHost = useStore($profileRemoteOverrides)[normalizeProfileKey(profile.name)]?.host ?? null

  const select = () => {
    triggerHaptic('selection')
    selectProfile(profile.name)
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        aria-current={active ? 'true' : undefined}
        data-profile={profile.name}
        hideChevron
        onClick={() => {
          select()
          close()
        }}
        onPointerEnter={startPrewarm}
        onPointerLeave={cancelPrewarm}
        onPointerMove={notePointerMove}
      >
        <ProfileGlyph
          aria-hidden="true"
          color={color}
          isDefault={profile.is_default}
          name={profile.name}
          picture={picture}
        />
        <span className="min-w-0 flex-1 truncate">
          {label}
          {profile.is_default ? copy.defaultSuffix : ''}
        </span>
        <RowTrailing
          active={active}
          connectionId={connectionId}
          keybind={keybind}
          name={profile.name}
          remoteHost={remoteHost}
        />
        <span className="grid w-3.5 shrink-0 place-items-center text-(--ui-accent)">
          {active ? <StudioIcon name="check" size={13} stroke={2.2} /> : null}
        </span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-52">
        {!active && (
          <DropdownMenuItem onSelect={select}>
            <StudioIcon name="return" size={15} />
            <span>{copy.switchHere}</span>
          </DropdownMenuItem>
        )}
        {launch.canOpenWindow && (
          <DropdownMenuItem onSelect={launch.openWindow}>
            <StudioIcon name="window" size={15} />
            <span>{p.openInNewWindow}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem disabled={!launch.canSetDefault} onSelect={launch.makeDefault}>
          <StudioIcon name={launch.isDefault ? 'check' : 'house'} size={15} />
          <span>{launch.isDefault ? p.defaultProfile : p.setAsDefault}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => chooseProfilePicture(profile.name)}>
          <StudioIcon name="photo" size={15} />
          <span>{p.choosePicture}</span>
        </DropdownMenuItem>
        {picture && (
          <DropdownMenuItem onSelect={() => removeProfilePicture(profile.name)}>
            <StudioIcon name="x-circle" size={15} />
            <span>{p.removePicture}</span>
          </DropdownMenuItem>
        )}
        {/* The default profile has no color of its own (it wears the home mark). */}
        {!profile.is_default && <ColorSubmenu color={color} name={profile.name} />}
        <DropdownMenuItem onSelect={() => dialogs.openRename(profile)}>
          <StudioIcon name="pencil" size={15} />
          <span>{p.renameMenu}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => dialogs.openSoul(profile.name)}>
          <StudioIcon name="doc" size={15} />
          <span>{p.editSoul}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void runExportProfileFlow(profile.name)}>
          <StudioIcon name="share" size={15} />
          <span>{p.exportMenu}</span>
        </DropdownMenuItem>
        {remoteOverride && !profile.is_default && (
          <DropdownMenuItem onSelect={() => openRemoteOverrideDialog(profile.name)}>
            <StudioIcon name="server" size={15} />
            <span>{remoteHost ? p.remoteOverride.badge(remoteHost) : p.remoteOverride.menuItem}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={profile.is_default}
          onSelect={() => dialogs.openDelete(profile)}
          variant="destructive"
        >
          <StudioIcon name="trash" size={15} />
          <span>{t.studio.sidebar.menu.delete}</span>
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
