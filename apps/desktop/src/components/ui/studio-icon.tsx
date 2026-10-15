import { createElement, type CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import { STUDIO_ICON_SHAPES } from './studio-icon-shapes'

export type StudioIconName = keyof typeof STUDIO_ICON_SHAPES

interface StudioIconProps {
  name: StudioIconName
  /** Box size in px (the glyph is drawn on a 24px grid). */
  size?: number
  /** Stroke width in grid units; the prototype draws 1.7. */
  stroke?: number
  className?: string
  style?: CSSProperties
}

/**
 * Hermes Studio's icon set: SF Symbols–style line glyphs (round caps, stroke =
 * currentColor), ported from the design prototype so every surface draws the
 * same symbols. The box size is inline so container rules that size bare
 * `svg`s (Button, menu items) never squash it.
 */
export function StudioIcon({ className, name, size = 16, stroke = 1.7, style }: StudioIconProps) {
  const shapes = STUDIO_ICON_SHAPES[name]

  return (
    <svg
      aria-hidden="true"
      className={cn('shrink-0', className)}
      data-studio-icon={name}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={stroke}
      style={{ height: size, width: size, ...style }}
      viewBox="0 0 24 24"
    >
      {shapes.map(([tag, attrs], index) => createElement(tag, { key: index, ...attrs }))}
    </svg>
  )
}
