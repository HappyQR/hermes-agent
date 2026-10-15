import type { ReactNode } from 'react'

import type { IconComponent } from '@/lib/icons'
import { cn } from '@/lib/utils'

/**
 * Fixed macOS System Settings tile colours (tokens in studio/overlays.css).
 * They do not follow the accent on purpose — a category keeps its colour —
 * except `accent`, which paints with the theme's primary.
 */
export type TileTone =
  | 'accent'
  | 'black'
  | 'blue'
  | 'brown'
  | 'graphite'
  | 'gray'
  | 'green'
  | 'indigo'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow'

export type TileSize = 22 | 24 | 28 | 30 | 36 | 38 | 44 | 54

const TONE_CLASS: Record<TileTone, string> = {
  accent: 'bg-primary',
  black: 'bg-(--ov-tile-black)',
  blue: 'bg-(--ov-tile-blue)',
  brown: 'bg-(--ov-tile-brown)',
  graphite: 'bg-(--ov-tile-graphite)',
  gray: 'bg-(--ov-tile-gray)',
  green: 'bg-(--ov-tile-green)',
  indigo: 'bg-(--ov-tile-indigo)',
  orange: 'bg-(--ov-tile-orange)',
  pink: 'bg-(--ov-tile-pink)',
  purple: 'bg-(--ov-tile-purple)',
  red: 'bg-(--ov-tile-red)',
  teal: 'bg-(--ov-tile-teal)',
  yellow: 'bg-(--ov-tile-yellow)'
}

// Tile box, corner radius and glyph size per tile size (prototype .set-ico,
// .sh-head tile, .ch-ic, .t-ic, hero 54px).
const SIZE_CLASS: Record<TileSize, string> = {
  22: 'size-[22px] rounded-[6px] [&>svg]:size-[14px]',
  24: 'size-6 rounded-[6px] [&>svg]:size-[14px]',
  28: 'size-7 rounded-[7px] [&>svg]:size-4',
  30: 'size-[30px] rounded-[8px] [&>svg]:size-4',
  36: 'size-9 rounded-[9px] [&>svg]:size-5',
  38: 'size-[38px] rounded-[10px] [&>svg]:size-5',
  44: 'size-11 rounded-[11px] [&>svg]:size-6',
  54: 'size-[54px] rounded-[14px] [&>svg]:size-[30px]'
}

interface IconTileProps {
  className?: string
  /** Custom glyph content (a brand mark, a letter) instead of `icon`. */
  children?: ReactNode
  icon?: IconComponent
  size?: TileSize
  tone?: TileTone
}

/** A coloured rounded-square icon tile: settings categories, sheet headers, choices. */
export function IconTile({ className, children, icon: Icon, size = 22, tone = 'accent' }: IconTileProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center text-white shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.08)] [&>svg]:shrink-0 [&>svg]:stroke-[1.75]',
        TONE_CLASS[tone],
        SIZE_CLASS[size],
        className
      )}
      data-slot="icon-tile"
      data-tone={tone}
    >
      {Icon ? <Icon /> : children}
    </span>
  )
}
