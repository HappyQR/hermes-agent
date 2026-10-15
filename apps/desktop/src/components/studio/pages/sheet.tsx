import type { ReactNode } from 'react'

import { SheetHeader as OverlaySheetHeader } from '@/app/overlays/studio/sheet-header'
import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'

// macOS sheet anatomy for page dialogs (prototype `.sheet` / `.sh-head` /
// `.sh-body` / `.sh-foot`), built on the overlays kit's sheet pieces
// (app/overlays/studio/sheet-header) so every sheet in the app shares one
// header, body and footer. The glass surface, top anchoring and motion come
// from `DialogContent` (foundation.css); pass `STUDIO_SHEET_CONTENT[size]` as
// its className and `STUDIO_SHEET_BODY` as its bodyClassName, plus
// `showCloseButton={false}` — the header carries the close button.

export { SheetBody, SheetFooter } from '@/app/overlays/studio/sheet-header'

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

/** A Dialog-hosted sheet header: tile, title (Dialog title) and the close X. */
export function SheetHeader({ closable = true, description, lead, title, trailing }: SheetHeaderProps) {
  const { t } = useI18n()

  const close = closable ? (
    <DialogClose asChild>
      <Button
        aria-label={t.common.close}
        className="size-7 shrink-0 text-(--ui-text-tertiary) hover:bg-(--ui-hover) hover:text-(--ui-text-primary)"
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <StudioIcon name="x" size={14} />
      </Button>
    </DialogClose>
  ) : null

  return (
    <OverlaySheetHeader
      inDialog
      lead={lead}
      right={
        trailing || close ? (
          <>
            {trailing}
            {close}
          </>
        ) : undefined
      }
      subtitle={description}
      title={title}
    />
  )
}
