import { useStore } from '@nanostores/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { type PanelMenuItem, PanelRowMenu } from '@/app/overlays/panel'
import { SheetFooter, SheetHeader } from '@/app/overlays/studio/sheet-header'
import { PageLoader } from '@/components/page-loader'
import { ActionsContextMenu, renderActionItem } from '@/components/ui/actions-menu'
import { Button } from '@/components/ui/button'
import { RowButton } from '@/components/ui/row-button'
import { SearchField } from '@/components/ui/search-field'
import { StudioIcon } from '@/components/ui/studio-icon'
import type { ProfileInfo } from '@/hermes'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { normalize } from '@/lib/text'
import { cn } from '@/lib/utils'
import { notifyError } from '@/store/notifications'
import { profileLabel, refreshProfiles } from '@/store/profile'
import { $profileRailVisible } from '@/store/profile-rail-prefs'
import { $profileRemoteOverrides, refreshProfileRemoteOverrides } from '@/store/profile-remote-override'
import { runImportProfileFlow } from '@/store/profile-share'

import { ProfileRemoteOverrideDialog } from '../chat/sidebar/profile-remote-override-dialog'
import { useRefreshHotkey } from '../hooks/use-refresh-hotkey'
import { OverlayView } from '../overlays/overlay-view'

import { CreateProfilePane } from './create-profile-pane'
import { DeleteProfileDialog } from './delete-profile-dialog'
import { ProfileAvatar } from './profile-avatar'
import { ProfileDetail } from './profile-detail'
import { RenameProfileDialog } from './rename-profile-dialog'
import { useSoulEditor } from './use-soul-editor'

interface ProfilesViewProps {
  onClose: () => void
}

const NEW_PROFILE = '\u0000new'

/** 配置档案 — the Profiles sheet: list, detail, SOUL.md, and the rail's profile actions. */
export function ProfilesView({ onClose }: ProfilesViewProps) {
  const { t } = useI18n()
  const p = t.profiles
  const sp = t.studio.overlays.profiles
  const railVisible = useStore($profileRailVisible)
  const [profiles, setProfiles] = useState<null | ProfileInfo[]>(null)
  const [selectedName, setSelectedName] = useState<null | string>(null)
  const [query, setQuery] = useState('')
  const [pendingRename, setPendingRename] = useState<null | ProfileInfo>(null)
  const [pendingDelete, setPendingDelete] = useState<null | ProfileInfo>(null)

  const refresh = useCallback(async () => {
    try {
      const list = await refreshProfiles()
      setProfiles(list)
      setSelectedName(current => {
        if (current === NEW_PROFILE || (current && list.some(profile => profile.name === current))) {
          return current
        }

        return list.find(profile => profile.is_default)?.name ?? list[0]?.name ?? null
      })
      void refreshProfileRemoteOverrides(list.map(profile => profile.name))
    } catch (err) {
      notifyError(err, p.failedLoad)
    }
  }, [p])

  useRefreshHotkey(refresh)

  useEffect(() => {
    void refresh()
  }, [refresh])

  const creating = selectedName === NEW_PROFILE

  const selected = useMemo(() => {
    if (!profiles || creating) {
      return null
    }

    return profiles.find(profile => profile.name === selectedName) ?? profiles[0] ?? null
  }, [creating, profiles, selectedName])

  const soul = useSoulEditor(selected?.name ?? null)

  const visibleProfiles = useMemo(() => {
    const needle = normalize(query)

    if (!profiles || !needle) {
      return profiles ?? []
    }

    return profiles.filter(
      profile => profile.name.toLowerCase().includes(needle) || (profile.model ?? '').toLowerCase().includes(needle)
    )
  }, [profiles, query])

  // The shared Create/Rename dialogs own the createProfile / renameProfile /
  // updateProfileSoul calls; the sheet just selects the result and re-pulls.
  const selectAndRefresh = useCallback(
    async (name: string) => {
      setSelectedName(name)
      await refresh()
    },
    [refresh]
  )

  const close = () => {
    triggerHaptic('close')
    onClose()
  }

  return (
    <OverlayView closeLabel={p.close} onClose={onClose} rootClassName="h-[min(40rem,100%)]" size="wide" variant="sheet">
      <SheetHeader
        closeLabel={p.close}
        glyph="people"
        onClose={close}
        subtitle={sp.subtitle}
        title={p.title}
        tone="indigo"
      />

      {!profiles ? (
        <PageLoader label={p.loading} />
      ) : (
        <div className="flex min-h-0 flex-1 gap-3.5 px-[1.125rem] pb-3 pt-1 max-[47.5rem]:flex-col">
          <aside className="flex w-[13.125rem] shrink-0 flex-col gap-1.5 max-[47.5rem]:max-h-[40%] max-[47.5rem]:w-full">
            {profiles.length > 6 && (
              <SearchField
                aria-label={p.search}
                containerClassName="w-full shrink-0"
                onChange={setQuery}
                placeholder={p.search}
                value={query}
                variant="filled"
              />
            )}
            <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain">
              {visibleProfiles.map(profile => (
                <ProfileListRow
                  active={selected?.name === profile.name}
                  key={profile.name}
                  menuItems={
                    profile.is_default
                      ? // Renaming the default profile sets a presentation-only
                        // display name (the canonical id stays "default").
                        [{ icon: 'edit', label: p.renameMenu, onSelect: () => setPendingRename(profile) }]
                      : [
                          { icon: 'edit', label: p.renameMenu, onSelect: () => setPendingRename(profile) },
                          { icon: 'trash', label: t.common.delete, onSelect: () => setPendingDelete(profile), tone: 'danger' }
                        ]
                  }
                  onSelect={() => setSelectedName(profile.name)}
                  profile={profile}
                />
              ))}
              <button
                className={cn(
                  'flex min-h-11 w-full items-center gap-2.5 rounded-[9px] px-2 py-1.5 text-left transition-colors hover:bg-(--ui-hover)',
                  creating && 'bg-(--ui-selected)'
                )}
                onClick={() => setSelectedName(NEW_PROFILE)}
                type="button"
              >
                <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-(--ui-fill) text-(--ui-text-secondary)">
                  <StudioIcon name="plus" size={15} />
                </span>
                <span className="text-[0.8125rem] font-semibold text-(--ui-text-primary)">{p.newProfile}</span>
              </button>
            </div>
            <Button
              className="justify-start"
              onClick={() => void runImportProfileFlow().then(name => (name ? selectAndRefresh(name) : undefined))}
              size="sm"
              variant="ghost"
            >
              <StudioIcon name="import" size={13} />
              {sp.importShort}
            </Button>
          </aside>

          <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pb-1">
            {creating ? (
              <CreateProfilePane onCreated={selectAndRefresh} profiles={profiles} />
            ) : selected ? (
              <ProfileDetail
                key={selected.name}
                onDelete={() => setPendingDelete(selected)}
                onRename={() => setPendingRename(selected)}
                profile={selected}
                soul={soul}
              />
            ) : (
              <p className="m-auto max-w-xs text-center text-[0.8125rem] text-(--ui-text-tertiary)">{p.createDesc}</p>
            )}
          </main>
        </div>
      )}

      {selected && !creating && (
        <SheetFooter className="shadow-[inset_0_0.5px_0_var(--ui-line)]">
          <span className="text-xs text-(--ui-text-tertiary)">{sp.exportNote}</span>
          <span className="flex-1" />
          <Button onClick={close} size="sm" variant="secondary">
            {t.common.done}
          </Button>
          <Button
            aria-label={p.saveSoul}
            disabled={!soul.dirty || soul.saving || soul.loading}
            onClick={() => void soul.save()}
            size="sm"
          >
            {soul.saving ? p.saving : t.common.save}
          </Button>
        </SheetFooter>
      )}

      <RenameProfileDialog
        currentName={pendingRename?.name ?? ''}
        isDefault={pendingRename?.is_default ?? false}
        onClose={() => setPendingRename(null)}
        onRenamed={selectAndRefresh}
        open={pendingRename !== null}
      />

      <DeleteProfileDialog
        onClose={() => setPendingDelete(null)}
        onDeleted={async () => {
          setSelectedName(null)
          await refresh()
        }}
        open={pendingDelete !== null}
        profile={pendingDelete}
      />

      {/* The rail mounts the one "Connect to a remote host" dialog; with the
          rail hidden, this sheet hosts it so the 操作 menu item still works. */}
      {!railVisible && <ProfileRemoteOverrideDialog profileNames={(profiles ?? []).map(profile => profile.name)} />}
    </OverlayView>
  )
}

function ProfileListRow({
  active,
  menuItems,
  onSelect,
  profile
}: {
  active: boolean
  menuItems: PanelMenuItem[]
  onSelect: () => void
  profile: ProfileInfo
}) {
  const { t } = useI18n()
  const sp = t.studio.overlays.profiles
  const remote = useStore($profileRemoteOverrides)[profile.name]
  const label = profileLabel(profile)

  const meta = [profile.is_default ? t.profiles.defaultBadge : '', remote ? sp.remote : '', profile.model ?? '']
    .filter(Boolean)
    .join(' · ')

  return (
    <ActionsContextMenu
      ariaLabel={label}
      contentClassName="w-40"
      items={kit =>
        menuItems.map(item =>
          renderActionItem(kit, {
            icon: item.icon,
            key: item.label,
            label: item.label,
            onSelect: item.onSelect,
            variant: item.tone === 'danger' ? 'destructive' : 'default'
          })
        )
      }
    >
      <div
        className={cn(
          'group/row relative flex w-full items-center rounded-[9px] transition-colors',
          active ? 'bg-(--ui-selected)' : 'hover:bg-(--ui-hover)'
        )}
        data-panel-row={profile.name}
      >
        <RowButton
          aria-label={label}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-[9px] px-2 py-1.5 text-left"
          onClick={onSelect}
        >
          <ProfileAvatar profile={profile} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[0.8125rem] font-semibold text-(--ui-text-primary)">{label}</span>
            {meta && <span className="truncate text-[0.71875rem] text-(--ui-text-tertiary)">{meta}</span>}
          </span>
        </RowButton>
        <div className="shrink-0 pr-1">
          <PanelRowMenu items={menuItems} label={label} />
        </div>
      </div>
    </ActionsContextMenu>
  )
}
