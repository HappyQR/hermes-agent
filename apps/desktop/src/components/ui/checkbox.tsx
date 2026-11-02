import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import * as React from 'react'

import { Codicon } from '@/components/ui/codicon'
import { cn } from '@/lib/utils'

// Hermes Studio: macOS check box — 15px, 4px corners, card fill with a 0.5px
// ring; checked fills with the accent and drops the ring.
const BOX =
  'group peer size-[15px] shrink-0 rounded-[4px] border-0 bg-(--ui-bg-editor) text-white shadow-[inset_0_0_0_0.5px_var(--ui-line-2),0_0.5px_1px_rgb(0_0_0/0.08)] outline-none transition-[background-color,box-shadow] duration-[120ms] data-[state=checked]:bg-primary data-[state=checked]:shadow-none data-[state=indeterminate]:bg-primary data-[state=indeterminate]:shadow-none'

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        BOX,
        'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:shadow-[inset_0_0_0_1px_var(--ui-red)]',
        className
      )}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="flex items-center justify-center text-current"
        data-slot="checkbox-indicator"
      >
        {/* codicon.css sets `display: inline-block` at higher specificity than a bare
            `hidden`, so both glyphs paint at once without the important modifier. */}
        <Codicon className="hidden! group-data-[state=checked]:block!" name="check" size="0.6875rem" />
        <Codicon className="hidden! group-data-[state=indeterminate]:block!" name="dash" size="0.6875rem" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

/** The Checkbox look without a control, for rows that are themselves the toggle
 *  (a real Checkbox is a button and can't nest inside one). */
function CheckboxMark({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(BOX, 'grid place-items-center', className)}
      data-slot="checkbox-mark"
      data-state={checked ? 'checked' : 'unchecked'}
    >
      {checked && <Codicon name="check" size="0.6875rem" />}
    </span>
  )
}

export { Checkbox, CheckboxMark }
