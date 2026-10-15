import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Switch } from '@/components/ui/switch'

// The toolbar's ⋯ menu for tab-wide actions: one "all on" switch line (the
// whole tab, never just the search results) and a few commands.

export interface CapBulkToggle {
  checked: boolean
  disabled?: boolean
  label: string
  onToggle: (checked: boolean) => void
}

export interface CapBulkItem {
  disabled?: boolean
  label: string
  onSelect: () => void
}

export function CapBulkMenu({
  items = [],
  label,
  toggle
}: {
  items?: CapBulkItem[]
  label: string
  toggle?: CapBulkToggle
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={label} className="data-[state=open]:bg-(--ui-press)" size="icon-toolbar" variant="ghost">
          <StudioIcon name="more" size={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        {toggle ? (
          <DropdownMenuItem
            disabled={toggle.disabled}
            onSelect={event => {
              // Keep the menu open so the switch is seen flipping.
              event.preventDefault()
              toggle.onToggle(!toggle.checked)
            }}
          >
            <span className="min-w-0 flex-1 truncate">{toggle.label}</span>
            <Switch checked={toggle.checked} className="pointer-events-none shrink-0" size="xs" tabIndex={-1} />
          </DropdownMenuItem>
        ) : null}
        {toggle && items.length > 0 ? <DropdownMenuSeparator /> : null}
        {items.map(item => (
          <DropdownMenuItem disabled={item.disabled} key={item.label} onSelect={item.onSelect}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
