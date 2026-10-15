import type { ReactNode } from 'react'

import {
  FORM_GROUP_CLASS,
  FORM_GROUP_INNER_CLASS,
  FORM_ROW_CLASS,
  FORM_ROW_CONTROL_CLASS,
  FORM_ROW_DESC_CLASS,
  FORM_ROW_STACK_CLASS,
  FORM_ROW_TEXT_CLASS,
  FORM_ROW_TITLE_CLASS,
  FORM_SECTION_NOTE_CLASS,
  FORM_SECTION_TITLE_CLASS
} from '@/app/overlays/studio/form-group'
import { StudioIcon } from '@/components/ui/studio-icon'
import { cn } from '@/lib/utils'

// Grouped-inset forms for the workspace pages and their sheets (System
// Settings; prototype `.form-sec` / `.form-group` / `.f-row` / `.disclosure`).
// The look is the overlays kit's (app/overlays/studio/form-group) — one inset
// group for Settings, sheets and pages; these wrappers add what page forms
// need on top: real <label htmlFor> titles, label-less control rows, a note
// under the group and pass-through group attributes (role, aria-*).

/** The row look (padding, 42px minimum, own top hairline) for hand-built rows. */
export { FORM_ROW_CLASS }

interface FormSectionProps {
  children: ReactNode
  className?: string
  /** Muted trailing detail in the heading row (scope, counts). */
  meta?: ReactNode
  /** Under the group (prototype `.form-sec .note`). */
  note?: ReactNode
  title?: ReactNode
}

export function FormSection({ children, className, meta, note, title }: FormSectionProps) {
  return (
    <section className={cn('flex min-w-0 flex-col gap-2', className)} data-slot="form-section">
      {title || meta ? (
        <h4 className={cn(FORM_SECTION_TITLE_CLASS, 'my-0')}>
          {title}
          {meta ? (
            <span className="ml-auto inline-flex min-w-0 items-center gap-1 text-[0.71875rem] font-medium text-(--ui-text-tertiary)">
              {meta}
            </span>
          ) : null}
        </h4>
      ) : null}
      {children}
      {note ? <p className={cn(FORM_SECTION_NOTE_CLASS, 'mb-0')}>{note}</p> : null}
    </section>
  )
}

export function FormGroup({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div {...props} className={cn(FORM_GROUP_CLASS, 'min-w-0', className)} data-slot="form-group">
      <div className={FORM_GROUP_INNER_CLASS}>{children}</div>
    </div>
  )
}

interface FormRowProps {
  children?: ReactNode
  className?: string
  description?: ReactNode
  /** Makes the title a <label> for this control id. */
  htmlFor?: string
  id?: string
  /** Label on top, control full-width below (lists, text areas). */
  stack?: boolean
  title?: ReactNode
}

export function FormRow({ children, className, description, htmlFor, id, stack = false, title }: FormRowProps) {
  const Label = htmlFor ? 'label' : 'div'
  const bare = !title && !description

  return (
    <div className={cn(FORM_ROW_CLASS, stack && FORM_ROW_STACK_CLASS, className)} data-slot="form-row" id={id}>
      {bare ? null : (
        <div className={FORM_ROW_TEXT_CLASS}>
          {title ? (
            <Label className={FORM_ROW_TITLE_CLASS} htmlFor={htmlFor}>
              {title}
            </Label>
          ) : null}
          {description ? <div className={FORM_ROW_DESC_CLASS}>{description}</div> : null}
        </div>
      )}
      {children ? (
        <div
          className={cn(
            // A row without a label is all control.
            bare ? 'flex min-w-0 flex-1 flex-wrap items-center gap-2' : FORM_ROW_CONTROL_CLASS,
            stack && !bare && 'max-w-full justify-start'
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

interface FormDisclosureProps {
  children: ReactNode
  label: ReactNode
  onOpenChange: (open: boolean) => void
  open: boolean
}

/** "Advanced (N)" row that reveals more rows inside the same group. */
export function FormDisclosure({ children, label, onOpenChange, open }: FormDisclosureProps) {
  return (
    <>
      <button
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-1.5 px-3.5 py-2.5 text-left text-[0.8125rem] text-(--ui-text-secondary) shadow-[inset_0_0.5px_0_var(--ui-line)] outline-none transition-colors duration-100 hover:bg-(--ui-hover) focus-visible:bg-(--ui-hover)"
        data-slot="form-disclosure"
        onClick={() => onOpenChange(!open)}
        type="button"
      >
        <StudioIcon
          className={cn(
            'transition-transform duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
            open && 'rotate-90'
          )}
          name="chev-r"
          size={12}
        />
        {label}
      </button>
      {open ? children : null}
    </>
  )
}
