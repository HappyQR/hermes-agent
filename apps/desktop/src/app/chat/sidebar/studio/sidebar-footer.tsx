import { useStore } from '@nanostores/react'

import { $profileRailVisible } from '@/store/profile-rail-prefs'

import { ProfileRail } from '../profile-switcher'

import { SidebarAccount } from './account-button'
import { SidebarUpdatePill } from './update-pill'

/**
 * The sidebar foot (prototype `.sb-foot`): the update card when one is waiting,
 * the opt-in profile rail, and the account button with its profile/gateway menu.
 */
export function SidebarFooter() {
  const railVisible = useStore($profileRailVisible)

  return (
    <div className="flex shrink-0 flex-col gap-1.5 px-2.5 pt-2 pb-2.5" data-slot="sidebar-footer">
      <SidebarUpdatePill />
      {railVisible && (
        <div className="px-0.5">
          <ProfileRail />
        </div>
      )}
      <SidebarAccount />
    </div>
  )
}
