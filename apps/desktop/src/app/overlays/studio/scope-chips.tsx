import { cn } from '@/lib/utils'

export interface ScopeChipOption<T extends string> {
  id: T
  label: string
}

/**
 * A row of pill filters (prototype .pal-scope): outlined chips, the selected
 * one filled with the text colour. A tablist: one selection at a time.
 */
export function ScopeChips<T extends string>({
  'aria-label': ariaLabel,
  className,
  onChange,
  options,
  value
}: {
  'aria-label': string
  className?: string
  onChange: (id: T) => void
  options: readonly ScopeChipOption<T>[]
  value: T
}) {
  return (
    <div
      aria-label={ariaLabel}
      className={cn('flex min-w-0 gap-1.5 overflow-x-auto [scrollbar-width:none]', className)}
      data-slot="scope-chips"
      role="tablist"
    >
      {options.map(option => {
        const selected = option.id === value

        return (
          <button
            aria-selected={selected}
            className={cn(
              'h-6 shrink-0 cursor-pointer rounded-full px-2.5 text-xs font-medium whitespace-nowrap transition-colors duration-100 outline-none focus-visible:ring-[0.1875rem] focus-visible:ring-ring/50',
              selected
                ? 'bg-(--ui-text-primary) text-(--ui-bg-chrome)'
                : 'text-(--ui-text-secondary) shadow-[inset_0_0_0_0.5px_var(--ui-line-2)] hover:bg-(--ui-hover)'
            )}
            key={option.id}
            onClick={() => onChange(option.id)}
            // Chips are switched with Tab from the input (the palette owns that
            // key), so the chips themselves stay out of the tab order.
            tabIndex={-1}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
