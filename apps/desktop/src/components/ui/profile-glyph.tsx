import { profileColorSoft } from '@/lib/profile-color'
import { profileShortLabel } from '@/lib/profile-short-label'
import { cn } from '@/lib/utils'

import { Codicon } from './codicon'

/** A profile's mark, in one place: its picture when it has one; else the
 *  default profile is the `home` icon (it has no color of its own and an
 *  initial would read as just another named profile); every other profile is
 *  a soft tint of its color carrying its initial. Presentational — callers
 *  resolve the color from `$profileColors` and the picture from the gateway. */
export function ProfileGlyph({
  className,
  color,
  isDefault,
  name,
  picture,
  ...props
}: Omit<React.ComponentProps<'span'>, 'color'> & {
  color: null | string
  isDefault: boolean
  name: string
  picture?: null | string
}) {
  if (picture) {
    return (
      <span className={cn('grid size-4 shrink-0 overflow-hidden rounded-[3px]', className)} {...props}>
        <img alt="" className="size-full object-cover" draggable={false} src={picture} />
      </span>
    )
  }

  if (isDefault) {
    return (
      <span className={cn('grid size-4 shrink-0 place-items-center', className)} {...props}>
        <Codicon className="text-(--ui-text-quaternary)" name="home" size="0.75rem" />
      </span>
    )
  }

  const initial = profileShortLabel(name)

  return (
    <span
      className={cn(
        'grid size-4 shrink-0 place-items-center rounded-[3px] text-[0.5rem] font-semibold uppercase leading-none',
        className
      )}
      style={{ backgroundColor: profileColorSoft(color ?? 'var(--ui-text-quaternary)', 22), color: color ?? undefined }}
      {...props}
    >
      {initial}
    </span>
  )
}
