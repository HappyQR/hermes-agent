import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'

import { Loader2 } from '@/lib/icons'
import { cn } from '@/lib/utils'

// Text+icon actions underline the label on hover, not the glyph.
const TEXT_ACTION_ICON = '[&_.codicon]:no-underline [&_svg]:no-underline'

// Hermes Studio: macOS push buttons — 7px corners, 13px medium labels, a quick
// press-in. Text buttons stay sized by padding + line-height (no fixed
// heights) so they scale with content.
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[7px] text-[0.8125rem] leading-4 font-medium whitespace-nowrap shadow-none transition-[background-color,color,box-shadow,transform,filter] duration-[120ms] ease-[cubic-bezier(0.32,0.72,0,1)] outline-none active:scale-[0.97] focus-visible:border-ring focus-visible:ring-[0.1875rem] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-default disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        // Accent push button with the macOS top highlight.
        default:
          'bg-primary text-primary-foreground shadow-[inset_0_0.5px_0_rgb(255_255_255/0.25),0_1px_2px_rgb(0_0_0/0.12)] hover:brightness-[1.06]',
        // Soft danger: red tint, red label (the prototype's .btn.danger).
        destructive:
          'bg-[color-mix(in_srgb,var(--ui-dot-red,var(--dt-destructive))_13%,transparent)] text-(--ui-red) hover:bg-[color-mix(in_srgb,var(--ui-dot-red,var(--dt-destructive))_20%,transparent)]',
        // macOS push/popup look — card fill, 0.5px ring, soft drop.
        outline:
          'bg-(--ui-bg-editor) text-(--ui-text-primary) shadow-[0_0_0_0.5px_var(--ui-line-2),0_1px_1.5px_rgb(0_0_0/0.06)] hover:bg-[color-mix(in_srgb,var(--ui-bg-editor),var(--ui-text-primary)_4%)]',
        // Soft-fill action (the default "non-primary button" look).
        secondary: 'bg-(--ui-fill) text-(--ui-text-primary) hover:bg-(--ui-bg-secondary) hover:text-(--ui-text-primary)',
        ghost:
          'text-(--ui-text-secondary) hover:bg-(--ui-hover) hover:text-(--ui-text-primary) active:bg-(--ui-press)',
        grip: 'bg-transparent text-(--ui-text-tertiary) transition-colors hover:text-(--ui-text-secondary) focus-visible:text-(--ui-text-primary)',
        // A control floating free of any surface (fan-menu discs, detached
        // chips): the menu/popover treatment — opaque popover fill + the
        // shared `shadow-md` ring-and-drop. Hover only lifts the glyph; a fill
        // change on a lone disc reads as a toggle flipping.
        floating:
          'bg-(--ui-glass-strong) text-(--ui-text-secondary) shadow-(--elev-float) backdrop-blur-[20px] hover:text-(--ui-text-primary)',
        link: `text-(--ui-accent-text) underline-offset-4 decoration-current/20 hover:underline active:scale-100 ${TEXT_ACTION_ICON}`,
        // Boxless inline-text action (no bg/border). Quiet by default — reads as
        // muted label text, underlines on hover (e.g. "Cancel", "Clear").
        text: `text-muted-foreground underline-offset-4 hover:text-foreground hover:underline active:scale-100 ${TEXT_ACTION_ICON}`,
        // Emphasized inline-text action: bold + always-underlined link. Use for
        // the actionable affordance in a row ("Change", "Set", "Open logs", …).
        textStrong: `font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground active:scale-100 ${TEXT_ACTION_ICON}`
      },
      size: {
        default: 'px-3 py-1.5 has-[>svg]:px-2.5',
        xs: "gap-1 rounded-[5px] px-2 py-0.5 text-[0.6875rem] leading-4 has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'rounded-[6px] px-2.5 py-1 text-xs has-[>svg]:px-2',
        lg: 'rounded-[9px] px-4 py-2 text-sm leading-[1.125rem] has-[>svg]:px-4',
        // Flush inline text action — no box padding/height. Pair with text/link
        // variants when the button must sit inline in a heading or sentence
        // (replaces ad-hoc `h-auto px-0 py-0` overrides).
        inline: 'h-auto gap-1 p-0 has-[>svg]:px-0',
        // Status-stack headers, table footers — 12px text actions beside a label.
        micro:
          "h-auto gap-0.5 px-1 py-0 text-xs leading-4 font-normal has-[>svg]:px-0.5 [&_svg:not([class*='size-'])]:size-3",
        icon: 'size-9 rounded-[7px]',
        'icon-xs': "size-6 rounded-[6px] [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8 rounded-[7px]',
        'icon-lg': 'size-10 rounded-[9px]',
        grip: 'h-4 w-12 rounded-full p-0',
        'icon-titlebar':
          'titlebar-icon-button h-(--titlebar-control-height) w-(--titlebar-control-size) rounded-[7px] [&_svg:not([class*="size-"])]:size-(--titlebar-icon-size)',
        // Studio toolbar / sidebar top bar glyph button (prototype .ibtn, 28px).
        'icon-toolbar': "size-7 rounded-[7px] [&_svg:not([class*='size-'])]:size-4",
        // A pill segment inside a <Capsule> (prototype .capsule .ibtn, 30×28).
        'icon-capsule': "h-7 w-[1.875rem] rounded-full [&_svg:not([class*='size-'])]:size-4"
      }
    },
    compoundVariants: [
      // textStrong is a boxless link — size variants still inject px-*; strip
      // inline padding so the underline sits flush with the label.
      {
        variant: 'textStrong',
        class: 'px-0 has-[>svg]:px-0'
      }
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Working. The label stays in flow but goes invisible and a spinner
     *  sits over it, so the button keeps its exact width and height — a
     *  label swapped for a glyph reflows every sibling on the row. */
    loading?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), loading && 'relative', className)}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          {/* Same flex + gap as the button itself, so the ghost label measures
              exactly what the live one did. The spinner sits in a wrapper so
              it is never a direct-child svg — the size variants' `has-[>svg]`
              would otherwise switch to icon padding and shave the width. */}
          <span aria-hidden className="invisible inline-flex items-center gap-[inherit]">
            {children}
          </span>
          <span aria-hidden className="absolute inset-0 grid place-items-center">
            <Loader2 className="animate-spin" />
          </span>
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
