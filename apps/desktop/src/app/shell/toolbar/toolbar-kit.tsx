import type * as React from 'react'

import { DROPDOWN_KIT, type MenuKit } from '@/components/ui/actions-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useKeybindHint } from '@/lib/keybinds/use-keybind-hint'
import { cn } from '@/lib/utils'

/** Prototype `.tb-chip`: a quiet 24px label button with a leading glyph. */
export const toolbarChipClass =
  'inline-flex h-6 min-w-0 shrink items-center gap-[5px] rounded-[6px] px-2 text-xs whitespace-nowrap text-(--ui-text-secondary) transition-colors duration-[120ms] hover:bg-(--ui-hover) hover:text-(--ui-text-primary) data-[state=open]:bg-(--ui-hover) data-[state=open]:text-(--ui-text-primary) [&_[data-studio-icon]]:text-(--ui-text-tertiary)'

/** A chip button: glyph + truncating label. */
export function ToolbarChip({
  className,
  icon,
  label,
  ...props
}: Omit<React.ComponentProps<'button'>, 'children'> & { icon: StudioIconName; label: React.ReactNode }) {
  return (
    <button className={cn(toolbarChipClass, className)} type="button" {...props}>
      <StudioIcon name={icon} size={13} />
      <span className="min-w-0 truncate">{label}</span>
    </button>
  )
}

/**
 * A toolbar dropdown whose trigger also carries a tooltip. The tooltip wraps
 * the dropdown trigger (not the other way round) so both Radix triggers merge
 * onto the one button.
 */
export function ToolbarMenu({
  align = 'start',
  ariaLabel,
  children,
  contentClassName,
  items,
  tip
}: {
  align?: 'center' | 'end' | 'start'
  ariaLabel: string
  children: React.ReactElement
  contentClassName?: string
  items: (kit: MenuKit) => React.ReactNode
  tip?: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <Tip label={tip} side="bottom">
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      </Tip>
      <DropdownMenuContent align={align} aria-label={ariaLabel} className={contentClassName} sideOffset={6}>
        {items(DROPDOWN_KIT)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** The current shortcut for an action, right-aligned in a menu row. */
export function MenuHint({ actionId }: { actionId: string }) {
  const hint = useKeybindHint(actionId)

  return hint ? <DropdownMenuShortcut>{hint}</DropdownMenuShortcut> : null
}
