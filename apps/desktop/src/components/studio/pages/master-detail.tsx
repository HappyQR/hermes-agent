import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

// System Settings master/detail (prototype `.master` / `.m-item` / `.detail` /
// `.detail-head`): a 260px list column beside the detail. Inside a
// `StudioPage layout="split"` both columns fill the page height and scroll on
// their own; below 860px they stack into the page scroll (studio/pages.css).

interface StudioMasterDetailProps {
  className?: string
  detail: ReactNode
  /** Pinned above the list (search). */
  listHeader?: ReactNode
  list: ReactNode
  /** Accessible name of the list column. */
  listLabel?: string
}

export function StudioMasterDetail({ className, detail, list, listHeader, listLabel }: StudioMasterDetailProps) {
  return (
    <div
      className={cn(
        'grid min-h-0 flex-1 grid-cols-[16.25rem_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] items-stretch gap-4',
        className
      )}
      data-slot="studio-master"
    >
      <div aria-label={listLabel} className="flex min-h-0 flex-col gap-0.5" role={listLabel ? 'region' : undefined}>
        {listHeader ? <div className="mb-1.5 shrink-0">{listHeader}</div> : null}
        <div
          className="-mx-1 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-1 pb-1.5 [scrollbar-width:thin]"
          data-slot="studio-master-items"
        >
          {list}
        </div>
      </div>
      <div
        className="-mr-2.5 flex min-h-0 min-w-0 flex-col gap-3.5 overflow-y-auto overscroll-contain pt-px pr-2.5 pb-8 pl-px [scrollbar-width:thin]"
        data-slot="studio-detail"
      >
        {detail}
      </div>
    </div>
  )
}

interface MasterItemProps extends Omit<React.ComponentProps<'button'>, 'title'> {
  active: boolean
  lead?: ReactNode
  subtitle?: ReactNode
  title: ReactNode
  trailing?: ReactNode
}

/** One list row: lead · title/subtitle · trailing (count tag or status dot). */
export function MasterItem({ active, className, lead, subtitle, title, trailing, ...props }: MasterItemProps) {
  return (
    <button
      {...props}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] px-[9px] py-[7px] text-left text-[0.8125rem] text-(--ui-text-primary) outline-none transition-colors duration-[120ms] focus-visible:ring-2 focus-visible:ring-ring/40',
        active ? 'bg-(--ui-selected)' : 'hover:bg-(--ui-hover)',
        className
      )}
      data-slot="studio-master-item"
      type="button"
    >
      {lead}
      <span className="flex min-w-0 flex-1 flex-col">
        <b className="truncate font-medium">{title}</b>
        {subtitle ? <span className="truncate text-[0.71875rem] text-(--ui-text-tertiary)">{subtitle}</span> : null}
      </span>
      {trailing}
    </button>
  )
}

interface DetailHeadProps {
  className?: string
  lead?: ReactNode
  /** Badges and switches on the right. */
  trailing?: ReactNode
  subtitle?: ReactNode
  title: ReactNode
  titleClassName?: string
}

export function DetailHead({ className, lead, subtitle, title, titleClassName, trailing }: DetailHeadProps) {
  return (
    <div className={cn('flex items-center gap-3', className)} data-slot="studio-detail-head">
      {lead}
      <div className="min-w-0 flex-1">
        <h2
          className={cn(
            'm-0 truncate text-[1.1875rem] font-[650] tracking-[-0.01em] text-(--ui-text-primary)',
            titleClassName
          )}
        >
          {title}
        </h2>
        {subtitle ? <p className="mt-0.5 mb-0 text-[0.78125rem] text-(--ui-text-tertiary)">{subtitle}</p> : null}
      </div>
      {trailing ? <div className="flex shrink-0 items-center gap-2.5">{trailing}</div> : null}
    </div>
  )
}

/** Detail column body that fades in when the selection changes (`key` it by id). */
export function DetailBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-3.5', className)} data-slot="studio-detail-body">
      {children}
    </div>
  )
}
