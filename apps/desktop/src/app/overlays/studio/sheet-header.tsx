import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { IconComponent } from '@/lib/icons'
import { X } from '@/lib/icons'
import { cn } from '@/lib/utils'

import { IconTile, type TileTone } from './icon-tile'

interface SheetHeaderProps {
  className?: string
  /** Accessible name of the close button (the X carries no tooltip). */
  closeLabel?: string
  icon?: IconComponent
  /** Render the title/subtitle as Radix Dialog title/description (Dialog-hosted sheets). */
  inDialog?: boolean
  /** Custom leading tile (brand mark, avatar) instead of `icon`. */
  lead?: ReactNode
  onClose?: () => void
  /** Controls on the header row, before the close button (segmented control, search). */
  right?: ReactNode
  subtitle?: ReactNode
  title: ReactNode
  tone?: TileTone
}

/**
 * The macOS sheet header (prototype .sh-head): a 30px tile, a 15px title with
 * an optional tertiary subtitle, a right-hand control slot and the close X.
 */
export function SheetHeader({
  className,
  closeLabel,
  icon,
  inDialog = false,
  lead,
  onClose,
  right,
  subtitle,
  title,
  tone = 'accent'
}: SheetHeaderProps) {
  const titleClass = 'm-0 truncate text-[0.9375rem] font-[650] leading-tight text-(--ui-text-primary)'
  const subtitleClass = 'm-0 mt-0.5 text-[0.78125rem] leading-snug text-(--ui-text-tertiary)'

  return (
    <div className={cn('flex shrink-0 items-center gap-2.5 px-[1.125rem] pb-2.5 pt-4', className)} data-slot="sheet-header">
      {lead ?? (icon ? <IconTile icon={icon} size={30} tone={tone} /> : null)}
      <div className="min-w-0 flex-1">
        {inDialog ? (
          <DialogTitle className={titleClass}>{title}</DialogTitle>
        ) : (
          <h2 className={titleClass}>{title}</h2>
        )}
        {subtitle ? (
          inDialog ? (
            <DialogDescription className={subtitleClass}>{subtitle}</DialogDescription>
          ) : (
            <p className={subtitleClass}>{subtitle}</p>
          )
        ) : null}
      </div>
      {right ? <div className="flex shrink-0 items-center gap-2">{right}</div> : null}
      {onClose ? (
        <Button
          aria-label={closeLabel}
          className="size-7 shrink-0 text-(--ui-text-tertiary) hover:bg-(--ui-hover) hover:text-(--ui-text-primary)"
          onClick={onClose}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}

/** The scrolling body of a sheet (prototype .sh-body). */
export function SheetBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-[1.125rem] pb-4 pt-1',
        className
      )}
      data-slot="sheet-body"
    >
      {children}
    </div>
  )
}

/** The footer row of a sheet (prototype .sh-foot): leading note, spacer, actions. */
export function SheetFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('flex shrink-0 items-center gap-2 px-[1.125rem] pb-4 pt-3', className)}
      data-slot="sheet-footer"
    >
      {children}
    </div>
  )
}
