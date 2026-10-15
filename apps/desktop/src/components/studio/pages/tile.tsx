import type { ReactNode } from 'react'

import { Codicon } from '@/components/ui/codicon'
import { cn } from '@/lib/utils'

// Coloured icon tiles (prototype `.gc-ic`): the app-icon-like squares that lead
// cards, master rows, detail heads and sheet heads. Tones are the page palette
// tokens in studio/pages.css; third-party brands pass their own `color`.

export type TileTone =
  | 'accent'
  | 'blue'
  | 'brown'
  | 'cyan'
  | 'graphite'
  | 'gray'
  | 'green'
  | 'indigo'
  | 'mint'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow'

export const TILE_TONES: readonly TileTone[] = [
  'blue',
  'indigo',
  'purple',
  'pink',
  'red',
  'orange',
  'green',
  'mint',
  'teal',
  'cyan',
  'brown',
  'gray',
  'graphite'
]

/** Stable tone for a free-form key (category, name) when no mapping exists. */
export function toneForKey(key: string): TileTone {
  let hash = 0

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) | 0
  }

  return TILE_TONES[Math.abs(hash) % TILE_TONES.length]
}

interface IconTileProps {
  className?: string
  /** A brand colour (third-party platforms); wins over `tone`. */
  color?: string
  /** A codicon name, or any glyph node (sized by the caller). */
  icon: ReactNode | string
  size?: number
  tone?: TileTone
}

export function IconTile({ className, color, icon, size = 36, tone = 'gray' }: IconTileProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center text-white shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.08)]',
        className
      )}
      data-slot="studio-icon-tile"
      style={{
        background: color ?? `var(--pg-tile-${tone})`,
        borderRadius: Math.round(size * 0.26),
        height: size,
        width: size
      }}
    >
      {typeof icon === 'string' ? <Codicon name={icon} size={`${Math.round(size * 0.5)}px`} /> : icon}
    </span>
  )
}

export type DotTone = 'gray' | 'green' | 'orange' | 'purple' | 'red' | 'teal'

/** 7px status dot (prototype `.dot`). Decorative: pair it with visible or sr-only text. */
export function Dot({ className, pulse = false, tone }: { className?: string; pulse?: boolean; tone: DotTone }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-[7px] shrink-0 rounded-full', pulse && 'motion-safe:animate-pulse', className)}
      data-slot="studio-dot"
      style={{ background: `var(--pg-dot-${tone})` }}
    />
  )
}

/** The accent spinner ring (prototype `.ring-run`): something is running now. */
export function RunRing({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block shrink-0 animate-spin rounded-full border-[1.8px] border-(--ui-accent-soft) border-t-primary [animation-duration:900ms] motion-reduce:animate-none',
        className
      )}
      data-slot="studio-run-ring"
      style={{ height: size, width: size }}
    />
  )
}
