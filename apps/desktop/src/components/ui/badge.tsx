import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

// Small status/metadata tag (the prototype's .tag): 6px corners, tones from the
// shared accent/fill/system-colour tokens so badges read consistently.
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1 rounded-[6px] font-medium leading-none whitespace-nowrap [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-(--ui-accent-soft) text-(--ui-accent-text)',
        muted: 'bg-(--ui-fill-2) text-(--ui-text-secondary)',
        success:
          'bg-[color-mix(in_srgb,var(--ui-dot-green,var(--ui-green))_15%,transparent)] text-(--ui-green)',
        warn: 'bg-[color-mix(in_srgb,var(--ui-dot-orange,var(--ui-orange))_15%,transparent)] text-(--ui-orange)',
        destructive:
          'bg-[color-mix(in_srgb,var(--ui-dot-red,var(--dt-destructive))_13%,transparent)] text-(--ui-red)',
        outline: 'shadow-[inset_0_0_0_0.5px_var(--ui-line-2)] text-(--ui-text-secondary)',
        // Solid fill — icon-corner counts (titlebar unread, etc.).
        solid: 'bg-primary text-primary-foreground'
      },
      size: {
        default: 'h-5 px-[7px] text-[0.71875rem] [&_svg]:size-3',
        xs: 'h-4 rounded-[5px] px-1.5 text-[0.65rem] [&_svg]:size-2.5',
        // The macOS count badge: a small accent pill over an icon corner.
        overlay:
          'h-[15px] min-w-[15px] justify-center rounded-full px-1 text-[0.625rem] font-bold tabular-nums shadow-[0_0_0_2px_var(--ui-bg-chrome)]'
      }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  }
)

export interface BadgeProps extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

export function Badge({ asChild = false, className, size, variant, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : 'span'

  return <Comp className={cn(badgeVariants({ size, variant }), className)} data-slot="badge" {...props} />
}

export { badgeVariants }
