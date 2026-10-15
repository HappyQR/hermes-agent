import { useStore } from '@nanostores/react'
import { useEffect, useState } from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { profileShortLabel } from '@/lib/profile-short-label'
import { cn } from '@/lib/utils'
import { $hasMultipleConnections } from '@/store/connections'
import { $profileRailVisible } from '@/store/profile-rail-prefs'
import { registerSidebarAccount } from '@/store/sidebar-studio'

import { useFleetRoster } from '../use-fleet-roster'

import { type GatewayTone, useAccountIdentity, useGatewayIdentity } from './account-identity'
import { AccountMenuItems } from './account-menu'
import { useAccountDialogs } from './use-account-dialogs'
import { useSwitchToRest } from './use-switch-to-rest'

const TONE_DOT: Record<GatewayTone, string> = {
  bad: 'bg-(--ui-dot-red)',
  good: 'bg-(--ui-dot-green)',
  warn: 'bg-(--ui-dot-orange)'
}

/** The 30px profile tile with the gateway's status dot on its corner. */
function AccountAvatar({ pending, tone }: { pending: boolean; tone: GatewayTone }) {
  const identity = useAccountIdentity()

  let face: React.ReactNode

  if (pending) {
    face = <span className="studio-ring-run size-3.5" />
  } else if (identity.all) {
    face = <StudioIcon name="people" size={16} />
  } else if (identity.color) {
    face = profileShortLabel(identity.name)
  } else {
    face = <StudioIcon name="house" size={16} />
  }

  return (
    <span className="relative shrink-0">
      <span
        aria-hidden="true"
        className={cn(
          'grid size-7.5 place-items-center rounded-lg text-[0.8125rem] font-bold uppercase leading-none',
          identity.color && !identity.all
            ? 'text-white'
            : 'bg-(--ui-control-active-background) text-(--ui-text-secondary)'
        )}
        style={identity.color && !identity.all ? { backgroundColor: identity.color } : undefined}
      >
        {face}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'absolute -right-0.5 -bottom-0.5 size-2.25 rounded-full shadow-[0_0_0_2px_var(--ui-sidebar-surface-background)]',
          TONE_DOT[tone]
        )}
      />
    </span>
  )
}

interface AccountButtonProps extends React.ComponentProps<'button'> {
  pending: boolean
}

/** Prototype `.sb-profile`: avatar · name / "gateway · status [· remote]" · ⌃⌄. */
function AccountButton({ pending, className, ...props }: AccountButtonProps) {
  const { t } = useI18n()
  const copy = t.studio.sidebar.footer
  const identity = useAccountIdentity()
  const gateway = useGatewayIdentity()
  const sub = [gateway.label, gateway.status, gateway.remote ? copy.remote : null].filter(Boolean).join(' · ')

  return (
    <button
      aria-busy={pending || undefined}
      aria-label={`${copy.account}: ${identity.name}, ${sub}`}
      className={cn(
        'flex h-11 w-full min-w-0 items-center gap-2.25 rounded-[10px] px-2 text-left transition-colors duration-[120ms]',
        'hover:bg-(--ui-row-hover-background) data-[state=open]:bg-(--ui-row-hover-background) [-webkit-app-region:no-drag]',
        className
      )}
      type="button"
      {...props}
      // After the spread: the menu trigger hands down its own data-slot.
      data-slot="sidebar-account"
    >
      <AccountAvatar pending={pending} tone={gateway.tone} />
      <span className="flex min-w-0 flex-1 flex-col leading-[1.25]">
        <span className="truncate text-[0.8125rem] font-semibold">{identity.name}</span>
        <span className="truncate text-[0.71875rem] text-(--ui-text-tertiary)">{sub}</span>
      </span>
      <StudioIcon className="shrink-0 text-(--ui-text-tertiary)" name="chev-ud" size={13} />
    </button>
  )
}

/**
 * The sidebar footer's account control: who you are and which gateway you
 * are on, opening the profile/gateway menu above it. While the profile rail
 * is hidden (the Studio default) it is also the rail's stand-in for the tour
 * tip and the pet's perch.
 */
export function SidebarAccount() {
  const railVisible = useStore($profileRailVisible)
  const multipleConnections = useStore($hasMultipleConnections)
  const [open, setOpen] = useState(false)
  const dialogs = useAccountDialogs(railVisible)
  const { dialog: localDeviceDialog, pendingRoute, switchToRest } = useSwitchToRest()

  // The rail keeps the fleet roster fresh while it is mounted.
  useFleetRoster(multipleConnections && !railVisible)
  useEffect(() => registerSidebarAccount(), [])

  return (
    <div
      className="min-w-0"
      data-slot={railVisible ? undefined : 'profile-rail'}
      data-tour={railVisible ? undefined : 'profile-rail'}
    >
      <DropdownMenu onOpenChange={setOpen} open={open}>
        <DropdownMenuTrigger asChild>
          <AccountButton pending={pendingRoute !== null} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 max-w-80" collisionPadding={8} side="top" sideOffset={6}>
          <AccountMenuItems close={() => setOpen(false)} dialogs={dialogs} switchToRest={switchToRest} />
        </DropdownMenuContent>
      </DropdownMenu>
      {dialogs.dialogs}
      {localDeviceDialog}
    </div>
  )
}
