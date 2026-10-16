import { useStore } from '@nanostores/react'
import { type ReactNode, useEffect, useRef, useState } from 'react'

import { $profileCreateRequest, $profiles, refreshActiveProfile, selectProfile } from '@/store/profile'
import { refreshProfileRemoteOverrides } from '@/store/profile-remote-override'
import type { ProfileInfo } from '@/types/hermes'

import { CreateProfileDialog } from '../../../profiles/create-profile-dialog'
import { DeleteProfileDialog } from '../../../profiles/delete-profile-dialog'
import { EditSoulDialog } from '../../../profiles/edit-soul-dialog'
import { RenameProfileDialog } from '../../../profiles/rename-profile-dialog'
import { ProfileRemoteOverrideDialog } from '../profile-remote-override-dialog'
import { useProfileRailRefreshOnActive } from '../use-profile-rail-refresh-on-active'

export interface AccountDialogs {
  openCreate: () => void
  openDelete: (profile: ProfileInfo) => void
  openRename: (profile: ProfileInfo) => void
  openSoul: (name: string) => void
  dialogs: ReactNode
}

/**
 * The profile dialogs the account menu opens (create, rename, delete, SOUL.md).
 *
 * `owner`: the account menu is the profile door while the profile rail is
 * hidden, so it then also takes over what the mounted rail used to own:
 * answering the `profile.create` hotkey, re-pulling the profile list when the
 * window comes back, and the one remote-override dialog its menu item opens.
 * With the rail on — and for any other host (the new-chat profile chip) —
 * those stay with their owner (two answers would open two dialogs).
 */
export function useAccountDialogs(owner: boolean): AccountDialogs {
  const profiles = useStore($profiles)
  const [createOpen, setCreateOpen] = useState(false)
  const [pendingRename, setPendingRename] = useState<null | ProfileInfo>(null)
  const [pendingDelete, setPendingDelete] = useState<null | ProfileInfo>(null)
  const [pendingSoul, setPendingSoul] = useState<null | string>(null)

  useProfileRailRefreshOnActive(owner)

  const profileNames = profiles.map(profile => profile.name)
  const namesKey = profileNames.join('\u0000')

  useEffect(() => {
    if (owner) {
      void refreshProfileRemoteOverrides(namesKey ? namesKey.split('\u0000') : [])
    }
  }, [namesKey, owner])

  const createRequest = useStore($profileCreateRequest)
  const lastCreateRef = useRef(createRequest)

  // eslint-disable-next-line no-restricted-syntax -- legitimate non-atom ref write (see eslint rule comment)
  useEffect(() => {
    if (createRequest === lastCreateRef.current) {
      return
    }

    lastCreateRef.current = createRequest

    if (owner) {
      setCreateOpen(true)
    }
  }, [createRequest, owner])

  const dialogs = (
    <>
      {/* Land in the new profile on a fresh chat, as the rail does. */}
      <CreateProfileDialog
        onClose={() => setCreateOpen(false)}
        onCreated={async name => {
          await refreshActiveProfile()
          selectProfile(name)
        }}
        open={createOpen}
        profiles={profiles}
      />
      <RenameProfileDialog
        currentName={pendingRename?.name ?? ''}
        isDefault={pendingRename?.is_default ?? false}
        onClose={() => setPendingRename(null)}
        onRenamed={refreshActiveProfile}
        open={pendingRename !== null}
      />
      <DeleteProfileDialog
        onClose={() => setPendingDelete(null)}
        onDeleted={refreshActiveProfile}
        open={pendingDelete !== null}
        profile={pendingDelete}
      />
      <EditSoulDialog onClose={() => setPendingSoul(null)} profileName={pendingSoul} />
      {owner && <ProfileRemoteOverrideDialog profileNames={profileNames} />}
    </>
  )

  return {
    dialogs,
    openCreate: () => setCreateOpen(true),
    openDelete: setPendingDelete,
    openRename: setPendingRename,
    openSoul: setPendingSoul
  }
}
