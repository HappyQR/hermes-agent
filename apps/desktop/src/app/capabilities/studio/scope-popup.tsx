import { useStore } from '@nanostores/react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useI18n } from '@/i18n'
import { resolveProfileColor } from '@/lib/profile-color'
import { $profileColors, normalizeProfileKey } from '@/store/profile'

import type { CapabilityScope } from '../scope-selector'

// 应用于 (prototype pages.js:13-19): which profile the page edits, as a pop-up
// button in the toolbar — the muted lead-in, the profile's tile and its name.
// With one profile there is nothing to choose: the same chip, read-only. A
// pinned scope (Bot Mode) shows none — its host already names the bot.

/** The profile part of a scope value (`connection::profile` or a bare name). */
function profileOf(value: string): string {
  const separator = value.indexOf('::')

  return normalizeProfileKey(separator >= 0 ? value.slice(separator + 2) : value)
}

function ProfileTile({ profile }: { profile: string }) {
  const colors = useStore($profileColors)
  const isDefault = profile === 'default'
  const color = isDefault ? null : resolveProfileColor(profile, colors)

  return (
    <span
      aria-hidden="true"
      className="grid size-4 shrink-0 place-items-center rounded-[4px] text-[0.5625rem] leading-none font-bold text-white uppercase"
      style={{ background: color ?? 'var(--dt-primary, var(--theme-primary))' }}
    >
      {isDefault ? 'H' : profile.trim().charAt(0)}
    </span>
  )
}

export function CapabilityScopePopup({ scope }: { scope: CapabilityScope }) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities
  const lead = <span className="shrink-0 text-(--ui-text-tertiary)">{t.studio.pages.common.appliesTo}</span>

  if (scope.options.length <= 1) {
    const profile = normalizeProfileKey(typeof scope.profile === 'object' ? scope.profile?.profile : scope.profile)

    return (
      <span
        aria-label={c.scopeAria}
        className="inline-flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-[7px] px-2.5 text-xs text-(--ui-text-primary) shadow-[0_0_0_0.5px_var(--ui-line-2)]"
        data-slot="capabilities-scope"
        role="group"
      >
        {lead}
        <ProfileTile profile={profile} />
        <span className="min-w-0 truncate">{profile === 'default' ? 'Hermes' : profile}</span>
      </span>
    )
  }

  return (
    <Select onValueChange={scope.onChange} value={scope.value}>
      <SelectTrigger
        aria-label={c.scopeAria}
        className="h-7 w-auto max-w-80 min-w-0 justify-start gap-1.5 text-xs"
        data-slot="capabilities-scope"
      >
        {lead}
        <ProfileTile profile={profileOf(scope.value)} />
        <span className="min-w-0 truncate">
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent align="end" className="max-w-(--radix-select-content-available-width)">
        {scope.options.map(option => (
          <SelectItem key={option.key} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
