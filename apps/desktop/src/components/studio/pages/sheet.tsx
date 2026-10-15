import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { DialogClose, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from '@/i18n'
import { X } from '@/lib/icons'
import { cn } from '@/lib/utils'

// macOS sheet anatomy for page dialogs (prototype `.sheet` / `.sh-head` /
// `.sh-body` / `.sh-foot`). The glass surface, top anchoring and motion come
// from `DialogContent` (foundation.css); pass `STUDIO_SHEET_CONTENT[size]` as
// its className and `STUDIO_SHEET_BODY` as its bodyClassName, plus
// `showCloseButton={false}` — the header carries the close button.

export type StudioSheetSize = 'md' | 'wide' | 'xwide'

export const STUDIO_SHEET_CONTENT: Record<StudioSheetSize, string> = {
  md: 'max-w-[35rem]',
  wide: 'max-w-[55rem]',
  xwide: 'h-[min(42.5rem,calc(100vh-5rem))] max-w-[65rem]'
}

/** The sheet owns its own scroll (body) and pinned footer. */
export const STUDIO_SHEET_BODY = 'flex min-h-0 flex-col gap-0 overflow-hidden p-0'

interface SheetHeaderProps {
  /** Hidden when the sheet cannot be dismissed (applying). */
  closable?: boolean
  description?: ReactNode
  lead?: ReactNode
  /** Controls before the close button (switches, a ⋯ menu, a primary action). */
  trailing?: ReactNode
  title: ReactNode
}

export function SheetHeader({ closable = true, description, lead, title, trailing }: SheetHeaderProps) {
  const { t } = useI18n()

  return (
    <div className="flex shrink-0 items-center gap-2.5 px-[18px] pt-4 pb-2.5" data-slot="studio-sheet-head">
      {lead}
      <div className="min-w-0 flex-1">
        <DialogTitle className="m-0 truncate text-[0.9375rem] font-[650] tracking-normal">{title}</DialogTitle>
        {description ? (
          <DialogDescription className="mt-0.5 text-[0.78125rem] leading-normal text-(--ui-text-tertiary)">
            {description}
          </DialogDescription>
        ) : null}
      </div>
      {trailing}
      {closable ? (
        <DialogClose asChild>
          <Button
            aria-label={t.common.close}
            className="text-(--ui-text-tertiary) hover:text-(--ui-text-primary)"
            size="icon-xs"
            variant="ghost"
          >
            <X className="size-3.5" />
          </Button>
        </DialogClose>
      ) : null}
    </div>
  )
}

export function SheetBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-[18px] pt-1 pb-4 [scrollbar-width:thin]',
        className
      )}
      data-slot="studio-sheet-body"
    >
      {children}
    </div>
  )
}

export function SheetFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('flex shrink-0 flex-wrap items-center gap-2 px-[18px] pt-3 pb-4', className)}
      data-slot="studio-sheet-foot"
    >
      {children}
    </div>
  )
}
