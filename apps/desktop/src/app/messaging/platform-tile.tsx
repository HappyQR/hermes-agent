import { IconTile } from '@/components/studio/pages/tile'
import { monogramFor } from '@/components/ui/avatar-chip'

import { platformBrand } from './platform-icon'

// A platform's mark as a Studio icon tile: white glyph on the brand colour
// (prototype messaging list / detail head / delivery targets).
export function PlatformTile({
  className,
  platformId,
  platformName,
  size = 28
}: {
  className?: string
  platformId: string
  platformName: string
  size?: number
}) {
  const brand = platformBrand(platformId)
  const Icon = brand?.Icon

  return (
    <IconTile
      className={className}
      color={brand?.color}
      icon={
        Icon ? (
          <Icon aria-hidden className="size-[54%]" />
        ) : (
          <span className="font-bold leading-none" style={{ fontSize: Math.round(size * 0.46) }}>
            {brand?.monogram ?? monogramFor(platformName)}
          </span>
        )
      }
      size={size}
      tone="gray"
    />
  )
}
