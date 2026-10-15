import { type ReactNode, useRef, useState } from 'react'

import { HERMES_CONTEXT_MENU_TRIGGER_ATTR } from '@/components/ui/context-menu'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface ContextDropdownProps {
  /** The control. Its own click stays its primary action. */
  children: ReactNode
  /** The menu rows (DropdownMenu primitives). */
  content: ReactNode
  contentClassName?: string
  disabled?: boolean
  label: string
}

const TRIGGER_ATTR = { [HERMES_CONTEXT_MENU_TRIGGER_ATTR]: '' }

/**
 * A menu that opens on right-click — or Shift+F10 / the context-menu key, or
 * ↓ while the control has focus — of a control whose click does something
 * else (the mic dictates, the talk button starts a voice chat). The menu
 * anchors to an inert overlay of the control, so a left click is never read
 * as "toggle the menu". The wrapper claims the gesture from the app's
 * fallback context menu (the trigger attribute), and focus returns to where
 * it was when the menu closes.
 */
export function ContextDropdown({ children, content, contentClassName, disabled, label }: ContextDropdownProps) {
  const [open, setOpen] = useState(false)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const openMenu = () => {
    if (disabled) {
      return
    }

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setOpen(true)
  }

  return (
    <span
      className="relative inline-flex shrink-0"
      onContextMenu={event => {
        event.preventDefault()
        openMenu()
      }}
      onKeyDown={event => {
        if (event.key === 'ArrowDown' && !open) {
          event.preventDefault()
          openMenu()
        }
      }}
      {...TRIGGER_ATTR}
    >
      {children}
      <DropdownMenu onOpenChange={setOpen} open={open}>
        <DropdownMenuTrigger asChild>
          <span aria-hidden className="pointer-events-none absolute inset-0" tabIndex={-1} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          aria-label={label}
          className={contentClassName}
          onCloseAutoFocus={event => {
            event.preventDefault()
            const target = returnFocusRef.current
            returnFocusRef.current = null

            if (target?.isConnected) {
              target.focus({ preventScroll: true })
            }
          }}
          side="top"
          sideOffset={8}
        >
          {content}
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  )
}
