import { useStore } from '@nanostores/react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ProfileGlyph } from '@/components/ui/profile-glyph'
import { useI18n } from '@/i18n'
import { Laptop, Person, UpDownChevrons } from '@/lib/icons-studio-overlays'
import { isMacPlatform } from '@/lib/platform'
import { resolveProfileColor } from '@/lib/profile-color'
import { cn } from '@/lib/utils'
import { $profileColors, $profiles, normalizeProfileKey, refreshProfiles } from '@/store/profile'
import {
  $settingsScopeEditsNonDefault,
  $settingsScopeOverride,
  $settingsScopeProfile,
  setSettingsScope
} from '@/store/settings-scope'
import type { ProfileInfo } from '@/types/hermes'

import { settingsScopeLabel } from '../profile-scope'

import { SETTINGS_PAGES, type SettingsPageId } from './categories'

function useScopeProfile(): { label: string; profiles: ProfileInfo[]; selected: string } {
  const profiles = useStore($profiles)
  const selected = useStore($settingsScopeProfile)
  const profile = profiles.find(candidate => normalizeProfileKey(candidate.name) === selected)

  return { label: profile ? settingsScopeLabel(profile) : selected, profiles, selected }
}

/** Right side of a page's first section title: where these settings live. */
export function SettingsScopeBadge({ page }: { page: SettingsPageId }) {
  const { t } = useI18n()
  const w = t.studio.settings.window
  const { label, profiles } = useScopeProfile()
  const scope = SETTINGS_PAGES[page].scope

  if (scope === 'device') {
    return (
      <>
        <Laptop aria-hidden className="size-3" />
        {isMacPlatform() ? w.onlyThisMac : w.onlyThisDevice}
      </>
    )
  }

  // One profile: nothing to disambiguate (today's contract for the chips).
  if (scope !== 'profile' || profiles.length < 2) {
    return null
  }

  return (
    <>
      <Person aria-hidden className="size-3" />
      <span className="truncate">{w.appliesToProfile(label)}</span>
    </>
  )
}

/**
 * The window header's "Applies to <profile>" popup (prototype .popup): picks
 * the profile every profile-scoped page edits. Shown with two or more profiles.
 */
export function SettingsScopePopup() {
  const { t } = useI18n()
  const w = t.studio.settings.window
  const { label, profiles, selected } = useScopeProfile()
  const colors = useStore($profileColors)
  const editingNonDefault = useStore($settingsScopeEditsNonDefault)

  // Refresh lazily so a profile created elsewhere shows up; the cached list paints first.
  useEffect(() => {
    void refreshProfiles().catch(() => undefined)
  }, [])

  if (profiles.length < 2) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            'h-[1.625rem] max-w-60 gap-1.5 rounded-[7px] bg-(--ui-bg-editor) px-2.5 pr-1.5 font-normal shadow-[0_0_0_0.5px_var(--ui-line-2),0_1px_1.5px_rgb(0_0_0/0.06)] hover:bg-(--ui-bg-editor) hover:shadow-[0_0_0_0.5px_var(--ui-line-2),0_1px_3px_rgb(0_0_0/0.1)]',
            editingNonDefault && 'text-(--ui-accent-text)'
          )}
          data-slot="settings-scope-popup"
          size="sm"
          variant="ghost"
        >
          <span className="text-(--ui-text-tertiary)">{w.appliesTo}</span>
          <span className="min-w-0 truncate">{label}</span>
          <UpDownChevrons aria-hidden className="size-3 shrink-0 text-(--ui-text-tertiary)" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel>{w.scopeMenuTitle}</DropdownMenuLabel>
        <DropdownMenuRadioGroup onValueChange={setSettingsScope} value={selected}>
          {profiles.map(profile => (
            <DropdownMenuRadioItem key={profile.name} value={normalizeProfileKey(profile.name)}>
              <ProfileGlyph
                aria-hidden
                color={resolveProfileColor(profile.name, colors)}
                isDefault={profile.is_default}
                name={profile.name}
              />
              <span className="min-w-0 truncate">{settingsScopeLabel(profile)}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * The loud edit-target note under a profile page's hero (#89190: an edit that
 * lands in another profile's config must be stated, not implied). Same truth
 * table as SettingsProfileScope's note.
 */
export function SettingsScopeNote() {
  const { t } = useI18n()
  const { label, profiles } = useScopeProfile()
  const override = useStore($settingsScopeOverride)
  const editingNonDefault = useStore($settingsScopeEditsNonDefault)

  if (profiles.length < 2 || (override === null && !editingNonDefault)) {
    return null
  }

  return (
    <p
      className={cn(
        'mx-auto -mt-2 max-w-[52ch] text-center text-xs leading-normal',
        editingNonDefault ? 'font-medium text-(--ui-accent-text)' : 'text-(--ui-text-tertiary)'
      )}
      data-scope-loud={editingNonDefault ? 'true' : undefined}
      role="status"
    >
      {t.settings.profileScope.editsProfile(label)}
    </p>
  )
}
