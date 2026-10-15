import { type WritableAtom } from 'nanostores'
import { useCallback, useEffect, useRef } from 'react'

import { useI18n } from '@/i18n'

import { formatDate } from './text'
import { dateAtReveal, type TimeAxis } from './time-axis'
import { Timeline } from './timeline'

// The star map's floating chrome (prototype `.sm-time` / `.sm-legend`): the
// playback bar along the top — play, constellation scrubber, the date reached
// ("now" at the full reveal) — and the legend in the bottom-left corner.

function revealText(axis: TimeAxis, reveal: number, now: string): string {
  if (reveal >= 1) {
    return now
  }

  const date = dateAtReveal(axis, reveal)

  return date !== null ? formatDate(date) : `${Math.round(reveal * axis.size)} / ${axis.size}`
}

function RevealLabel({ axis, now, revealStore }: { axis: TimeAxis; now: string; revealStore: WritableAtom<number> }) {
  const labelRef = useRef<HTMLSpanElement | null>(null)

  const sync = useCallback(
    (reveal: number) => {
      const el = labelRef.current

      if (el) {
        el.textContent = revealText(axis, reveal, now)
      }
    },
    [axis, now]
  )

  // The scrubber drives this label without re-rendering the map.
  useEffect(() => revealStore.subscribe(sync), [revealStore, sync])

  return (
    <span className="shrink-0 tabular-nums text-foreground/80" ref={labelRef}>
      {revealText(axis, revealStore.get(), now)}
    </span>
  )
}

interface StarMapChromeProps {
  axis: TimeAxis
  memoryColor: string
  onScrub: (reveal: number) => void
  onTogglePlay: () => void
  playing: boolean
  revealStore: WritableAtom<number>
  ringStops: number[]
}

export function StarMapChrome({
  axis,
  memoryColor,
  onScrub,
  onTogglePlay,
  playing,
  revealStore,
  ringStops
}: StarMapChromeProps) {
  const { t } = useI18n()
  const m = t.studio.pages.memory

  return (
    <>
      {/* z-20 lifts the bar above the titlebar's app-region drag layer (z-10) so
          the scrubber receives pointer events instead of dragging the window. */}
      <div className="pointer-events-none absolute inset-x-3.5 top-2.5 z-20 flex items-center gap-2.5 text-xs">
        <Timeline
          axis={axis}
          memoryColor={memoryColor}
          onScrub={onScrub}
          onTogglePlay={onTogglePlay}
          playing={playing}
          revealStore={revealStore}
          ringStops={ringStops}
        />
        <RevealLabel axis={axis} now={m.now} revealStore={revealStore} />
      </div>

      <div className="pointer-events-none absolute bottom-3.5 left-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.71875rem] text-foreground/75">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-[var(--theme-primary)]" />
          {m.legendSkill}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rotate-45 rounded-[1px]" style={{ backgroundColor: memoryColor }} />
          {m.legendMemory}
        </span>
        <span>{m.legendRadial}</span>
      </div>
    </>
  )
}
