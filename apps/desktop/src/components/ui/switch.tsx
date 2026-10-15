import { cva, type VariantProps } from 'class-variance-authority'
import { Switch as SwitchPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/utils'

// Hermes Studio: the macOS switch — a fill track that turns accent when on and
// a white knob that springs across (and stretches while pressed).
const switchVariants = cva(
  'group peer inline-flex shrink-0 items-center rounded-full border-0 bg-(--ui-fill) p-0.5 shadow-[inset_0_0_0_0.5px_var(--ui-line)] transition-colors duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)] outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:shadow-none disabled:data-[state=checked]:bg-(--ui-text-tertiary)',
  {
    variants: {
      size: {
        default: 'h-[22px] w-[38px]',
        xs: 'h-[18px] w-[30px]'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
)

const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.22),0_0_0_0.5px_rgb(0_0_0/0.06)] ring-0 transition-[transform,width] duration-[220ms] ease-[cubic-bezier(0.34,1.32,0.64,1)] data-[state=unchecked]:translate-x-0',
  {
    variants: {
      size: {
        default:
          'h-[18px] w-[18px] group-active:w-[21px] data-[state=checked]:translate-x-4 group-active:data-[state=checked]:translate-x-[13px]',
        xs: 'h-[14px] w-[14px] group-active:w-[17px] data-[state=checked]:translate-x-3 group-active:data-[state=checked]:translate-x-[9px]'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
)

function Switch({
  className,
  size,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof switchVariants>) {
  return (
    <SwitchPrimitive.Root className={cn(switchVariants({ size }), className)} data-slot="switch" {...props}>
      <SwitchPrimitive.Thumb className={switchThumbVariants({ size })} data-slot="switch-thumb" />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
