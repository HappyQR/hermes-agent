import type { ReactNode } from 'react'

import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
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
  /** A Studio icon name, or any glyph node (sized by the caller). */
  icon: ReactNode | StudioIconName
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
      {typeof icon === 'string' ? (
        <StudioIcon name={icon as StudioIconName} size={Math.round(size * 0.5)} stroke={1.8} />
      ) : (
        icon
      )}
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

/** Busy spinner in the current text colour (prototype `.spin`). */
export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('pg-spin', className)} data-slot="studio-spinner" />
}

/** The accent spinner ring (prototype `.ring-run`, foundation `.studio-ring-run`): running now. */
export function RunRing({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn('studio-ring-run', className)}
      data-slot="studio-run-ring"
      style={{ height: size, width: size }}
    />
  )
}
