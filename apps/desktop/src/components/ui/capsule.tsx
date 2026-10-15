import type * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Hermes Studio: a glass pill that groups toolbar buttons (prototype
 * `.capsule`) — frosted fill, soft drop + top hairline, 2px inset. Children
 * are `<Button size="icon-capsule" variant="ghost">` segments split by
 * `<CapsuleSeparator />`.
 */
export function Capsule({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center rounded-full bg-(--ui-glass) p-0.5 shadow-[var(--elev-soft),var(--hairline-hi)] backdrop-blur-[20px] backdrop-saturate-[1.6]',
        className
      )}
      data-slot="capsule"
      role="group"
      {...props}
    />
  )
}

export function CapsuleSeparator({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('mx-px h-4 w-[0.5px] shrink-0 bg-(--ui-line-2)', className)}
      data-slot="capsule-separator"
    />
  )
}
