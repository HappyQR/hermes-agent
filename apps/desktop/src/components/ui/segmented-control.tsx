import { useLayoutEffect, useRef, useState } from 'react'

import type { IconComponent } from '@/lib/icons'
import { cn } from '@/lib/utils'

export interface SegmentedControlOption<T extends string> {
  id: T
  label: string
  icon?: IconComponent
  /** Tour handle for this option's button (`data-tour`). */
  dataTour?: string
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[]
  value: T
  onChange: (id: T) => void
  className?: string
  /** Dims the whole track and blocks selection (e.g. gated behind a prerequisite). */
  disabled?: boolean
  /** `sm` is the compact 20px row used inside dense rows and headers. */
  size?: 'default' | 'sm'
  /** Names the group for assistive tech (the visible options are its members). */
  'aria-label'?: string
}

interface ThumbBox {
  left: number
  width: number
}

/**
 * Track the pressed option's box so a single thumb can slide between options.
 * Re-measures on value changes and whenever the track resizes (zoom, font,
 * locale), so the thumb never lands short of its option.
 */
export function useSegmentThumb(value: string, optionCount: number, selectedSelector = '[aria-pressed="true"]') {
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState<null | ThumbBox>(null)

  useLayoutEffect(() => {
    const track = trackRef.current

    if (!track) {
      return
    }

    const measure = () => {
      const pressed = track.querySelector<HTMLElement>(selectedSelector)

      setThumb(previous => {
        if (!pressed) {
          return null
        }

        const next = { left: pressed.offsetLeft, width: pressed.offsetWidth }

        return previous && previous.left === next.left && previous.width === next.width ? previous : next
      })
    }

    measure()

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(measure)
    observer.observe(track)

    return () => observer.disconnect()
  }, [value, optionCount, selectedSelector])

  return { thumb, trackRef }
}

/**
 * Grouped one-row toggle used for small mutually-exclusive choices
 * (color mode, tool-call display, usage period, etc.). The macOS segmented
 * control: a fill track with one raised thumb that slides to the pressed
 * option. Options stay plain `<button aria-pressed>` so tests and assistive
 * tech read them as before; the thumb is an empty decorative span.
 */
export function SegmentedControl<T extends string>({
  className,
  disabled = false,
  onChange,
  options,
  size = 'default',
  value,
  'aria-label': ariaLabel
}: SegmentedControlProps<T>) {
  const { thumb, trackRef } = useSegmentThumb(value, options.length)

  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        'relative inline-grid w-fit auto-cols-fr grid-flow-col rounded-[8px] bg-(--ui-fill) p-0.5',
        disabled && 'opacity-50',
        className
      )}
      data-slot="segmented-control"
      ref={trackRef}
      role="group"
    >
      {thumb && (
        <span
          aria-hidden
          className="absolute inset-y-0.5 rounded-[6px] bg-(--ui-bg-editor) shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.06)] transition-[left,width] duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none dark:bg-[color-mix(in_srgb,var(--ui-text-primary)_22%,var(--ui-bg-editor))]"
          data-slot="segmented-thumb"
          style={{ left: thumb.left, width: thumb.width }}
        />
      )}
      {options.map(({ dataTour, id, label, icon: Icon }) => {
        const active = value === id

        return (
          <button
            aria-pressed={active}
            className={cn(
              'relative z-1 flex min-w-0 items-center justify-center gap-1.5 rounded-[6px] font-medium whitespace-nowrap transition-colors duration-[120ms] disabled:cursor-default',
              size === 'sm' ? 'h-5 px-[9px] text-xs' : 'h-6 px-3 text-[0.78125rem]',
              active ? 'text-foreground' : 'text-(--ui-text-secondary) hover:text-foreground',
              // Before the first measure the thumb is absent: paint the pressed
              // option itself so the choice is never invisible.
              active && !thumb && 'bg-(--ui-bg-editor) shadow-[0_1px_3px_rgb(0_0_0/0.12)]'
            )}
            data-tour={dataTour}
            disabled={disabled}
            key={id}
            onClick={() => onChange(id)}
            type="button"
          >
            {Icon && <Icon className="size-3.5 shrink-0" />}
            {/* A squeezed track ellipsizes a label inside its own cell; it never
                wraps or paints across the neighbouring option. */}
            <span className="min-w-0 truncate">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
