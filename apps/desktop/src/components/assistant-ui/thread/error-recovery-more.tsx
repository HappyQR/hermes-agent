import { type ReactNode, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { StudioIcon } from '@/components/ui/studio-icon'

/**
 * The error card's secondary recoveries (prototype "More recovery options ▾"):
 * the card's own action buttons, listed in a small popover under one trigger
 * so the card leads with a single primary fix. Picking one closes the list
 * without pulling focus back to the trigger — the action may have moved it
 * on purpose (the edit composer, a settings page, the model menu).
 */
export function RecoveryMore({ children, label }: { children: ReactNode; label: string }) {
  const [open, setOpen] = useState(false)
  const picked = useRef(false)

  return (
    // Modal: the pane's hover focus-follow would otherwise pull focus back to
    // the editor and dismiss the list as a focus-outside.
    <Popover modal onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button className="studio-err-more" size="xs" type="button" variant="ghost">
          {label}
          <StudioIcon name="chev-d" size={11} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="studio-err-menu w-auto p-1"
        onCloseAutoFocus={event => {
          if (picked.current) {
            event.preventDefault()
          }

          picked.current = false
        }}
        side="bottom"
        sideOffset={6}
      >
        <div
          className="flex flex-col"
          onClickCapture={event => {
            if ((event.target as HTMLElement).closest('button')) {
              picked.current = true
              setOpen(false)
            }
          }}
        >
          {children}
        </div>
      </PopoverContent>
    </Popover>
  )
}
