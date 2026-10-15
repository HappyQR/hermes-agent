import type { ReactNode } from 'react'

import { Codicon } from '@/components/ui/codicon'
import { cn } from '@/lib/utils'

// Grouped-inset forms (System Settings; prototype `.form-sec` / `.form-group` /
// `.f-row` / `.disclosure`): a titled section, a rounded group, rows that read
// label/description on the left and the control on the right.

interface FormSectionProps {
  children: ReactNode
  className?: string
  /** Muted trailing detail in the heading row (scope, counts). */
  meta?: ReactNode
  note?: ReactNode
  title?: ReactNode
}

export function FormSection({ children, className, meta, note, title }: FormSectionProps) {
  return (
    <section className={cn('flex min-w-0 flex-col gap-2', className)} data-slot="studio-form-section">
      {title || meta ? (
        <h4 className="mx-1 my-0 flex items-center gap-2 text-[0.8125rem] font-[650] text-(--ui-text-primary)">
          {title}
          {meta ? (
            <span className="ml-auto inline-flex items-center gap-1 text-[0.71875rem] font-medium text-(--ui-text-tertiary)">
              {meta}
            </span>
          ) : null}
        </h4>
      ) : null}
      {children}
      {note ? <p className="mx-1 -mt-0.5 mb-0 text-xs leading-normal text-(--ui-text-tertiary)">{note}</p> : null}
    </section>
  )
}

export function FormGroup({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('min-w-0 overflow-hidden rounded-[11px] bg-(--pg-card) shadow-(--pg-card-ring)', className)}
      data-slot="studio-form-group"
    >
      {children}
    </div>
  )
}

interface FormRowProps {
  children?: ReactNode
  className?: string
  description?: ReactNode
  /** Associates the visible label with a control id. */
  htmlFor?: string
  id?: string
  /** Label on top, control full-width below (lists, text areas). */
  stack?: boolean
  title?: ReactNode
}

export function FormRow({ children, className, description, htmlFor, id, stack = false, title }: FormRowProps) {
  const Label = htmlFor ? 'label' : 'div'

  return (
    <div
      className={cn(
        'flex min-h-[2.625rem] items-center gap-3 px-3.5 py-2 text-[0.8125rem]',
        stack && 'flex-col items-stretch',
        className
      )}
      data-slot="studio-form-row"
      id={id}
    >
      {title || description ? (
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {title ? (
            <Label className="text-(--ui-text-primary)" htmlFor={htmlFor}>
              {title}
            </Label>
          ) : null}
          {description ? (
            <span className="text-[0.71875rem] leading-[1.4] text-(--ui-text-tertiary)">{description}</span>
          ) : null}
        </div>
      ) : null}
      {children ? (
        <div className={cn('flex min-w-0 items-center gap-2', stack ? 'max-w-full' : 'max-w-[60%] flex-none')}>
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
        className="flex w-full cursor-pointer items-center gap-1.5 px-3.5 py-2.5 text-left text-[0.8125rem] text-(--ui-text-secondary) outline-none hover:bg-(--ui-hover) focus-visible:bg-(--ui-hover)"
        data-slot="studio-form-disclosure"
        onClick={() => onOpenChange(!open)}
        type="button"
      >
        <Codicon
          className={cn(
            'transition-transform duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
            open && 'rotate-90'
          )}
          name="chevron-right"
          size="0.75rem"
        />
        {label}
      </button>
      {open ? children : null}
    </>
  )
}
