import type { ComponentProps, ReactNode, Ref } from 'react'

import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
import { cn } from '@/lib/utils'

/** The running ring (prototype `.ring-run`): an accent arc on a soft track —
 *  distinct from the context gauge's static pie. */
export function RingSpinner({ className }: { className?: string }) {
  return <span aria-hidden className={cn('studio-ring-run size-[0.6875rem]', className)} />
}

interface TrayChipButtonProps extends Omit<ComponentProps<'button'>, 'id' | 'onClick'> {
  children?: ReactNode
  /** Set for chips that open the panel; omitted for jump chips. */
  controls?: string
  expanded?: boolean
  icon: StudioIconName
  id: string
  label: string
  live?: boolean
  onClick: () => void
  progress?: number
  ref?: Ref<HTMLButtonElement>
  tone?: 'error' | 'muted' | 'warn'
}

/** One activity chip: glyph (or the running ring), label, optional progress
 *  track. An expanded chip inverts, like the prototype's pressed pill. */
export function TrayChipButton({
  children,
  controls,
  expanded,
  icon,
  id,
  label,
  live,
  onClick,
  progress,
  ref,
  tone,
  ...rest
}: TrayChipButtonProps) {
  return (
    <button
      aria-controls={controls}
      aria-expanded={controls ? Boolean(expanded) : undefined}
      className="tray-chip"
      data-live={live ? '' : undefined}
      data-tone={tone}
      data-tray-chip={id}
      onClick={onClick}
      ref={ref}
      type="button"
      {...rest}
    >
      {live ? <RingSpinner /> : <StudioIcon className="tray-chip-icon" name={icon} size={13} />}
      <span className="tray-chip-label">{label}</span>
      {children}
      {progress !== undefined && (
        <span aria-hidden className="tray-chip-progress">
          <i style={{ width: `${Math.round(progress * 100)}%` }} />
        </span>
      )}
    </button>
  )
}
