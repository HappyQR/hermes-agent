import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// macOS pop-up button (prototype `.popup`): a card-filled trigger with an
// up/down chevron that opens a menu of choices. Built on Button `outline` so it
// shares the push-button skin, and on DropdownMenu so the menu paints through
// components/ui/menu.ts like every other list.

interface PopupButtonProps extends Omit<React.ComponentProps<typeof Button>, 'prefix'> {
  /** Muted lead-in ("Applies to"). */
  lead?: ReactNode
}

export function PopupButton({ children, className, lead, ...props }: PopupButtonProps) {
  return (
    <Button
      {...props}
      className={cn('max-w-full justify-start font-normal', className)}
      data-slot="studio-popup-button"
      size="sm"
      variant="outline"
    >
      {lead ? <span className="shrink-0 text-(--ui-text-tertiary)">{lead}</span> : null}
      <span className="min-w-0 truncate">{children}</span>
      <Codicon className="shrink-0 text-(--ui-text-tertiary)" name="unfold" size="0.75rem" />
    </Button>
  )
}

export interface PopupChoice<T extends string> {
  id: T
  label: string
}

interface PopupSelectProps<T extends string> {
  'aria-label': string
  align?: 'center' | 'end' | 'start'
  /** Heading inside the menu. */
  heading?: ReactNode
  onChange: (id: T) => void
  options: readonly PopupChoice<T>[]
  lead?: ReactNode
  value: T
}

/** A pop-up button + radio menu for a small single choice (sort order, view). */
export function PopupSelect<T extends string>({
  'aria-label': ariaLabel,
  align = 'start',
  heading,
  onChange,
  lead,
  options,
  value
}: PopupSelectProps<T>) {
  const current = options.find(option => option.id === value) ?? options[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PopupButton aria-label={ariaLabel} lead={lead}>
          {current?.label}
        </PopupButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-40">
        {heading ? <DropdownMenuLabel>{heading}</DropdownMenuLabel> : null}
        <DropdownMenuRadioGroup onValueChange={next => onChange(next as T)} value={value}>
          {options.map(option => (
            <DropdownMenuRadioItem key={option.id} value={option.id}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
