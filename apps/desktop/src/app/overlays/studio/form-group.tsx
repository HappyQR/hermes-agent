import { type ReactNode, useState } from 'react'

import { ChevronRight } from '@/lib/icons'
import { cn } from '@/lib/utils'

// The macOS inset grouped form (prototype .form-group / .f-row / .form-sec):
// a rounded card on a 0.5px outline whose rows are split by 0.5px hairlines.
//
// Hairlines survive wrapper <div>s and conditional rows: every row paints its
// own top line, and the group lifts its content by the line's height so the
// first row's line is clipped by the card's rounded overflow.

/** The grouped card. Also a size container (`form-group`) so rows stack when narrow. */
export const FORM_GROUP_CLASS =
  '@container/form-group overflow-hidden rounded-[0.6875rem] bg-(--ui-bg-editor) shadow-[0_0_0_0.5px_var(--ui-line-2)]'

/** Inner wrapper of the card: clips the first row's top hairline. */
export const FORM_GROUP_INNER_CLASS = '-mt-[0.5px] flex flex-col'

/** One row: title column + control, 42px minimum, top hairline. */
export const FORM_ROW_CLASS =
  'flex min-h-[2.625rem] items-center gap-3 px-3.5 py-2 text-[0.8125rem] text-(--ui-text-primary) shadow-[inset_0_0.5px_0_var(--ui-line)] @max-[28rem]/form-group:flex-col @max-[28rem]/form-group:items-stretch @max-[28rem]/form-group:gap-2'

/** A row whose control takes the full width under the title (editors, galleries, long fields). */
export const FORM_ROW_STACK_CLASS = 'flex-col items-stretch gap-2'

export const FORM_ROW_TEXT_CLASS = 'flex min-w-0 flex-1 flex-col gap-0.5'

export const FORM_ROW_TITLE_CLASS = 'min-w-0 text-[0.8125rem] text-(--ui-text-primary)'

export const FORM_ROW_DESC_CLASS = 'text-[0.71875rem] leading-[1.4] text-(--ui-text-tertiary)'

export const FORM_ROW_CONTROL_CLASS =
  'flex min-w-0 max-w-[60%] flex-none flex-wrap items-center justify-end gap-2 @max-[28rem]/form-group:max-w-full @max-[28rem]/form-group:justify-start'

/** A section heading over a group (13px semibold), with an optional right-aligned aside. */
export const FORM_SECTION_TITLE_CLASS =
  'mx-1 flex min-h-5 items-center gap-2 text-[0.8125rem] font-semibold text-(--ui-text-primary)'

export const FORM_SECTION_NOTE_CLASS = 'mx-1 -mt-0.5 text-xs leading-normal text-(--ui-text-tertiary)'

export function FormGroup({
  children,
  className,
  innerClassName
}: {
  children: ReactNode
  className?: string
  innerClassName?: string
}) {
  return (
    <div className={cn(FORM_GROUP_CLASS, className)} data-slot="form-group">
      <div className={cn(FORM_GROUP_INNER_CLASS, innerClassName)}>{children}</div>
    </div>
  )
}

export function FormRow({
  children,
  className,
  description,
  id,
  stack = false,
  title,
  'data-tour': dataTour
}: {
  children?: ReactNode
  className?: string
  description?: ReactNode
  id?: string
  /** Control under the title at full width. */
  stack?: boolean
  title: ReactNode
  'data-tour'?: string
}) {
  return (
    <div
      className={cn(FORM_ROW_CLASS, stack && FORM_ROW_STACK_CLASS, className)}
      data-slot="form-row"
      data-tour={dataTour}
      id={id}
    >
      <div className={FORM_ROW_TEXT_CLASS}>
        <div className={FORM_ROW_TITLE_CLASS}>{title}</div>
        {description ? <div className={FORM_ROW_DESC_CLASS}>{description}</div> : null}
      </div>
      {children ? (
        <div className={cn(FORM_ROW_CONTROL_CLASS, stack && 'max-w-full justify-start')}>{children}</div>
      ) : null}
    </div>
  )
}

/** A plain full-width cell inside a group (lists, galleries, editors) with the row hairline. */
export function FormCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('px-3.5 py-2.5 shadow-[inset_0_0.5px_0_var(--ui-line)]', className)} data-slot="form-cell">
      {children}
    </div>
  )
}

export function FormSection({
  aside,
  children,
  className,
  id,
  note,
  title
}: {
  aside?: ReactNode
  children: ReactNode
  className?: string
  id?: string
  note?: ReactNode
  title?: ReactNode
}) {
  return (
    <section className={cn('flex scroll-mt-4 flex-col gap-2', className)} data-slot="form-section" id={id}>
      {title || aside ? (
        <h4 className={FORM_SECTION_TITLE_CLASS}>
          {title}
          {aside ? (
            <span className="ml-auto inline-flex min-w-0 items-center gap-1 text-[0.71875rem] font-medium text-(--ui-text-tertiary)">
              {aside}
            </span>
          ) : null}
        </h4>
      ) : null}
      {note ? <p className={FORM_SECTION_NOTE_CLASS}>{note}</p> : null}
      {children}
    </section>
  )
}

/**
 * A disclosure row inside a group (prototype .disclosure): a chevron button
 * that reveals the rows after it. Uncontrolled unless `open` is passed.
 */
export function FormDisclosure({
  children,
  defaultOpen = false,
  onOpenChange,
  open: openProp,
  title
}: {
  children: ReactNode
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
  title: ReactNode
}) {
  const [openState, setOpenState] = useState(defaultOpen)
  const open = openProp ?? openState

  return (
    <>
      <button
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 px-3.5 py-2.5 text-left text-[0.8125rem] text-(--ui-text-secondary) shadow-[inset_0_0.5px_0_var(--ui-line)] transition-colors duration-100 hover:bg-(--ui-hover)"
        data-slot="form-disclosure"
        onClick={() => {
          setOpenState(!open)
          onOpenChange?.(!open)
        }}
        type="button"
      >
        <ChevronRight
          className={cn(
            'size-3 shrink-0 transition-transform duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
            open && 'rotate-90'
          )}
        />
        <span className="min-w-0 truncate">{title}</span>
      </button>
      {open ? children : null}
    </>
  )
}
