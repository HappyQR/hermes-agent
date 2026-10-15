import { cva, type VariantProps } from 'class-variance-authority'

// Single source of truth for non-composer form-control chrome — Input,
// Textarea, and SelectTrigger all consume this. Mirrors `buttonVariants`:
// 7px radius, 13px text, padding-driven sizing (no fixed heights). The visual
// chrome (card fill, 0.5px ring, macOS focus halo, invalid state) comes from
// the `desktop-input-chrome` CSS (studio.css) so every control shares one look.
export const controlVariants = cva(
  'desktop-input-chrome w-full min-w-0 rounded-[7px] border border-transparent text-[0.8125rem] leading-4 text-foreground outline-none placeholder:text-(--ui-text-quaternary) disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        xs: 'rounded-[5px] px-2 py-0.5 text-[0.6875rem] leading-4',
        sm: 'rounded-[6px] px-2 py-1 text-xs',
        default: 'px-[9px] py-1.5',
        lg: 'rounded-[9px] px-3 py-2 text-sm leading-5'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
)

export type ControlVariantProps = VariantProps<typeof controlVariants>
