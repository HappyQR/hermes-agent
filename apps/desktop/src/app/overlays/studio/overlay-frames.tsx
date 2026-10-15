import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type OverlaySheetSize = 'md' | 'wide' | 'xwide'

interface FrameProps {
  children: ReactNode
  /** Close on a click on the backdrop itself (never on bubbled clicks). */
  onBackdropClose: () => void
  rootClassName?: string
  titlebarHeight: number
}

// Every OverlayView root keeps the same contract whatever it looks like:
// `role="presentation"` (tests), `data-overlay-surface` (composer focus guard,
// translucency peek), the real titlebar height re-pinned (zones zero it), and
// a backdrop click that closes.
function rootProps({ onBackdropClose, titlebarHeight }: Pick<FrameProps, 'onBackdropClose' | 'titlebarHeight'>) {
  return {
    'data-overlay-surface': '',
    onClick: (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onBackdropClose()
      }
    },
    role: 'presentation',
    style: { '--titlebar-height': `${titlebarHeight}px` } as CSSProperties
  } as const
}

// The window keeps dragging while an overlay covers it: a drag strip over the
// titlebar band of the backdrop (the card itself never covers that band).
function TitlebarDragBand() {
  return <div aria-hidden className="absolute inset-x-0 top-0 h-(--titlebar-height) [-webkit-app-region:drag]" />
}

/**
 * A macOS-style secondary window floating over the app (Settings): no dimming
 * scrim, window shadow, 13px corners, centered below the titlebar. The page
 * draws its own chrome (close dot, sidebar, header).
 */
export function OverlayWindowFrame({ children, onBackdropClose, rootClassName, titlebarHeight }: FrameProps) {
  return (
    <div className="fixed inset-0 z-50" {...rootProps({ onBackdropClose, titlebarHeight })}>
      <TitlebarDragBand />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 pb-4 pt-[calc(var(--titlebar-height)+0.5rem)]">
        <div
          className={cn(
            'pointer-events-auto relative flex h-[min(40rem,100%)] w-[min(55rem,100%)] min-h-0 flex-col overflow-hidden rounded-[0.8125rem] bg-(--ui-bg-chrome) text-(--ui-text-primary) shadow-(--elev-win) animate-[ov-win-in_300ms_cubic-bezier(0.34,1.32,0.64,1)_both]',
            rootClassName
          )}
          // A RAISED surface for window glass: stays near-opaque while the
          // field behind it thins (see [data-glass-raised] in styles.css).
          data-glass-raised=""
          data-slot="overlay-window"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

const SHEET_SIZE: Record<OverlaySheetSize, string> = {
  md: 'w-[min(35rem,100%)]',
  wide: 'w-[min(55rem,100%)]',
  xwide: 'h-[min(42.5rem,100%)] w-[min(65rem,100%)]'
}

/**
 * A macOS sheet dropping from under the toolbar (route sheets: System Status,
 * Profiles, Import): dimming scrim, frosted glass card, 16px corners. Same
 * surface as every Dialog (studio/foundation.css), sized 560 / 880 / 1040px.
 * The page renders its own header with the close button.
 */
export function OverlaySheetFrame({
  children,
  onBackdropClose,
  rootClassName,
  size = 'md',
  titlebarHeight
}: FrameProps & { size?: OverlaySheetSize }) {
  return (
    <div className="fixed inset-0 z-50 bg-(--ui-scrim)" {...rootProps({ onBackdropClose, titlebarHeight })}>
      <TitlebarDragBand />
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center px-5 pb-5 pt-16">
        <div
          className={cn(
            'pointer-events-auto relative flex max-h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-(--ui-glass-strong) text-(--ui-text-primary) shadow-[var(--elev-pop),var(--hairline-hi)] backdrop-blur-[40px] backdrop-saturate-[1.8] animate-[studio-sheet-in_300ms_cubic-bezier(0.34,1.32,0.64,1)_both]',
            SHEET_SIZE[size],
            rootClassName
          )}
          data-glass-raised=""
          data-slot="route-sheet"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
