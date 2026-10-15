import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type StatusDotTone = 'gray' | 'green' | 'orange' | 'red'

const DOT_TONE: Record<StatusDotTone, string> = {
  gray: 'bg-(--ui-text-quaternary)',
  green: 'bg-(--ui-dot-green)',
  orange: 'bg-(--ui-dot-orange)',
  red: 'bg-(--ui-dot-red)'
}

/** A 7px status dot (prototype .dot). */
export function StatusDot({ className, pulse = false, tone }: { className?: string; pulse?: boolean; tone: StatusDotTone }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block size-[7px] shrink-0 rounded-full',
        DOT_TONE[tone],
        pulse && 'motion-safe:animate-pulse',
        className
      )}
    />
  )
}

/** The raised card surface (prototype .card): card fill on a 0.5px outline and a soft drop. */
export const CARD_SURFACE_CLASS =
  'rounded-[0.75rem] bg-(--ui-bg-editor) shadow-[0_0_0_0.5px_var(--ui-line-2),0_2px_8px_-4px_rgb(0_0_0/0.08)]'

/** A label over one big number (System Status, Billing). */
export function StatCard({
  className,
  dot,
  hint,
  label,
  value
}: {
  className?: string
  dot?: StatusDotTone
  hint?: ReactNode
  label: ReactNode
  value: ReactNode
}) {
  return (
    <div className={cn('min-w-0 px-3.5 py-3', CARD_SURFACE_CLASS, className)} data-slot="stat-card">
      <div className="truncate text-[0.71875rem] text-(--ui-text-tertiary)">{label}</div>
      <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-base font-[650] tabular-nums text-(--ui-text-primary)">
        {dot ? <StatusDot tone={dot} /> : null}
        <span className="min-w-0 truncate">{value}</span>
      </div>
      {hint ? <div className="mt-0.5 truncate text-[0.6875rem] text-(--ui-text-tertiary)">{hint}</div> : null}
    </div>
  )
}
