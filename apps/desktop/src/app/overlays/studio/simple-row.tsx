import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * A one-line row inside a FormGroup (prototype .lg-row / dense .f-row): label
 * left, value right, never stacking — for read-only lists in narrow columns
 * (shortcut maps, top models). Shares the group's hairline convention.
 */
export function SimpleRow({ children, className, title }: { children?: ReactNode; className?: string; title: ReactNode }) {
  return (
    <div
      className={cn(
        'flex min-h-[2.125rem] items-center gap-3 px-3.5 py-1.5 text-[0.8125rem] text-(--ui-text-primary) shadow-[inset_0_0.5px_0_var(--ui-line)]',
        className
      )}
      data-slot="simple-row"
    >
      <div className="min-w-0 flex-1 truncate">{title}</div>
      {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
    </div>
  )
}
