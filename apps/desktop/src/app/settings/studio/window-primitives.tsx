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
  FORM_SECTION_TITLE_CLASS
} from '@/app/overlays/studio/form-group'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// The Settings window renderings of the shared settings primitives
// (app/settings/primitives.tsx delegates here when SettingsWindowContext is
// set). Same props, the prototype's grouped-form look (.f-row / .form-group).

export interface WindowListRowProps {
  action?: ReactNode
  below?: ReactNode
  className?: string
  'data-tour'?: string
  description?: ReactNode
  hint?: ReactNode
  id?: string
  title: ReactNode
  wide?: boolean
}

/** ListRow / ToggleRow in the window: a 42px form row with a top hairline. */
export function WindowListRow({
  action,
  below,
  className,
  'data-tour': dataTour,
  description,
  hint,
  id,
  title,
  wide = false
}: WindowListRowProps) {
  return (
    <div
      className={cn(FORM_ROW_CLASS, wide && FORM_ROW_STACK_CLASS, 'scroll-mt-4', className)}
      data-slot="form-row"
      data-tour={dataTour}
      id={id}
    >
      <div className={FORM_ROW_TEXT_CLASS}>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className={FORM_ROW_TITLE_CLASS}>{title}</div>
          {wide && action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
        </div>
        {description ? <div className={FORM_ROW_DESC_CLASS}>{description}</div> : null}
        {hint ? <div className="font-mono text-[0.6875rem] text-(--ui-text-quaternary)">{hint}</div> : null}
        {below}
      </div>
      {!wide && action ? <div className={FORM_ROW_CONTROL_CLASS}>{action}</div> : null}
    </div>
  )
}

/**
 * SectionHeading in the window. Page headings are owned by the window's own
 * section titles, so only their trailing actions/counts survive (as a quiet
 * toolbar row); other headings become a sub-group header row (the prototype's
 * shortcut-category strip).
 */
export function WindowSectionHeading({
  aside,
  meta,
  page,
  title
}: {
  aside?: ReactNode
  meta?: string
  page: boolean
  title: string
}) {
  if (page) {
    return aside || meta ? (
      <div
        className="flex min-h-9 items-center justify-end gap-2 px-3.5 py-1.5 shadow-[inset_0_0.5px_0_var(--ui-line)]"
        data-slot="form-toolbar"
      >
        {meta ? <Badge variant="muted">{meta}</Badge> : null}
        {aside}
      </div>
    ) : null
  }

  return (
    <div
      className="flex min-h-[1.875rem] items-center gap-2 bg-(--ui-fill-2) px-3.5 py-1 text-xs font-semibold text-(--ui-text-primary) shadow-[inset_0_0.5px_0_var(--ui-line)]"
      data-slot="form-subheading"
    >
      <span className="min-w-0 truncate">{title}</span>
      {meta ? <Badge variant="muted">{meta}</Badge> : null}
      {aside ? <div className="ml-auto flex min-w-0 items-center gap-2 font-normal">{aside}</div> : null}
    </div>
  )
}

/** SettingsSection in the window: a titled section over a grouped card. */
export function WindowSettingsSection({
  aside,
  children,
  meta,
  title
}: {
  aside?: ReactNode
  children: ReactNode
  meta?: string
  title: string
}) {
  return (
    <section className="flex flex-col gap-2" data-slot="form-section">
      <h4 className={FORM_SECTION_TITLE_CLASS}>
        <span className="min-w-0 truncate">{title}</span>
        {meta ? <Badge variant="muted">{meta}</Badge> : null}
        {aside ? <span className="ml-auto flex min-w-0 items-center gap-2 font-normal">{aside}</span> : null}
      </h4>
      <div className={FORM_GROUP_CLASS} data-slot="form-group">
        <div className={FORM_GROUP_INNER_CLASS}>{children}</div>
      </div>
    </section>
  )
}

export function WindowListRowSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div className={cn(FORM_ROW_CLASS, wide && FORM_ROW_STACK_CLASS)} data-slot="form-row">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-40 max-w-full" />
        <Skeleton className="h-3 w-56 max-w-full" />
      </div>
      {!wide && <Skeleton className="h-6 w-24 shrink-0" />}
    </div>
  )
}

export function WindowSettingsSkeleton({ sections }: { sections: { heading?: boolean; rows: number }[] }) {
  // Always inside a window section's card already: rows only, never a card in a card.
  const rows = sections.reduce((sum, section) => sum + section.rows, 0)

  return (
    <>
      {Array.from({ length: Math.min(rows, 6) }, (_, index) => (
        <WindowListRowSkeleton key={index} />
      ))}
    </>
  )
}
