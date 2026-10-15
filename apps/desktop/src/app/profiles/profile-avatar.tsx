import { useStore } from '@nanostores/react'

import { IconTile } from '@/app/overlays/studio/icon-tile'
import { resolveProfileColor } from '@/lib/profile-color'
import { profileShortLabel } from '@/lib/profile-short-label'
import { cn } from '@/lib/utils'
import { $profileColors, profileLabel } from '@/store/profile'
import type { ProfileInfo } from '@/types/hermes'

const SIZE = {
  lg: 'size-[30px] rounded-[8px] text-[0.8125rem]',
  xl: 'size-11 rounded-[11px] text-lg'
} as const

/**
 * A profile's tile in the Profiles sheet (prototype .avatar): its colour with
 * a white initial; the default profile keeps its home mark.
 */
export function ProfileAvatar({
  profile,
  size = 'lg'
}: {
  profile: Pick<ProfileInfo, 'display_name' | 'is_default' | 'name'>
  size?: keyof typeof SIZE
}) {
  const colors = useStore($profileColors)

  if (profile.is_default) {
    return <IconTile glyph="house" size={size === 'xl' ? 44 : 30} tone="graphite" />
  }

  const color = resolveProfileColor(profile.name, colors)

  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center font-bold text-white uppercase', SIZE[size])}
      style={{ backgroundColor: color ?? undefined }}
    >
      {profileShortLabel(profileLabel(profile))}
    </span>
  )
}
