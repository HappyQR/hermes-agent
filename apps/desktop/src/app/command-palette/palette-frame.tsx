import { Dialog as DialogPrimitive } from 'radix-ui'
import { type KeyboardEvent, type ReactNode, type RefObject, useState } from 'react'

import { ScopeChips } from '@/app/overlays/studio/scope-chips'
import { Command, CommandInput, CommandList } from '@/components/ui/command'
import { Kbd } from '@/components/ui/kbd'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { formatCombo } from '@/lib/keybinds/combo'

import { HighlightWatcher } from './highlight-watcher'
import { PALETTE_SCOPES, type PaletteScopeId } from './scopes'
import { useFirstRowHighlight } from './use-first-row-highlight'

// The macOS spotlight-style panel (prototype .pal): frosted glass, 18px
// corners, 14% down the window, no dimming backdrop. Open/close keep the
// animate-in/out pair: the close animation's end retires the body.
const PAL_SURFACE =
  'fixed left-1/2 top-[14vh] z-(--z-over-modal-content) flex max-h-[72vh] w-[min(41.25rem,calc(100vw-2rem))] -translate-x-1/2 flex-col overflow-hidden rounded-[18px] bg-(--ui-glass-strong) shadow-[var(--elev-pop),var(--hairline-hi)] backdrop-blur-[44px] backdrop-saturate-[1.8] [-webkit-app-region:no-drag] duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2 data-[state=open]:zoom-in-95'

interface PaletteFrameProps {
  /** Nested page title (theme, pets, …): shows the Back row and hides the scopes. */
  activePageTitle: null | string
  children: ReactNode
  inputRef: RefObject<HTMLInputElement | null>
  onBack: () => void
  onExited: () => void
  onHighlight: (value: string) => void
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onScopeChange: (scope: PaletteScopeId) => void
  onSearchChange: (value: string) => void
  placeholder: string
  /** Replaces the esc hint on the input row (e.g. the pets on/off toggle). */
  right?: ReactNode
  scope: PaletteScopeId
  search: string
}

/** The palette chrome: input, scope chips, the row list and the key-hint footer. */
export function PaletteFrame({
  activePageTitle,
  children,
  inputRef,
  onBack,
  onExited,
  onHighlight,
  onInputKeyDown,
  onScopeChange,
  onSearchChange,
  placeholder,
  right,
  scope,
  search
}: PaletteFrameProps) {
  const { t } = useI18n()
  const pal = t.studio.overlays.palette
  // cmdk's highlight, held here so a list swap can never leave it stranded
  // (see useFirstRowHighlight). The HighlightWatcher still reports it.
  const [highlight, setHighlight] = useState('')
  const listRef = useFirstRowHighlight(setHighlight)

  return (
    <DialogPrimitive.Portal>
      {/* Transparent overlay: keeps click-away + focus trap, but no dim/blur. */}
      <DialogPrimitive.Overlay className="fixed inset-0 z-(--z-over-modal)" />
      <DialogPrimitive.Content
        aria-describedby={undefined}
        className={PAL_SURFACE}
        data-slot="command-palette"
        // The close animation finishing is what retires this whole subtree —
        // the CSS owns the duration, not a hardcoded timer. Guarded on the
        // content itself (descendants animate too) and on the closed state, so
        // an OPEN animation never unmounts the palette we just opened.
        onAnimationEnd={event => {
          if (event.target === event.currentTarget && event.currentTarget.dataset.state === 'closed') {
            onExited()
          }
        }}
      >
        <DialogPrimitive.Title className="sr-only">{t.commandCenter.paletteTitle}</DialogPrimitive.Title>
        <Command
          className="flex min-h-0 flex-1 flex-col bg-transparent"
          loop
          onValueChange={setHighlight}
          shouldFilter={false}
          value={highlight}
        >
          <HighlightWatcher onValue={onHighlight} />
          {activePageTitle && (
            <button
              className="flex w-full items-center gap-1.5 px-4 pt-3 text-left text-xs text-(--ui-text-tertiary) transition-colors hover:text-(--ui-text-primary)"
              onClick={onBack}
              type="button"
            >
              <StudioIcon name="chev-l" size={13} />
              <span>{t.commandCenter.back}</span>
              <span className="opacity-50">/</span>
              <span className="font-medium text-(--ui-text-primary)">{activePageTitle}</span>
            </button>
          )}
          <CommandInput
            onKeyDown={onInputKeyDown}
            onValueChange={onSearchChange}
            placeholder={placeholder}
            ref={inputRef}
            right={right ?? <Kbd className="lowercase">{formatCombo('escape')}</Kbd>}
            value={search}
          />
          {!activePageTitle && (
            <ScopeChips
              aria-label={pal.scopesLabel}
              className="shrink-0 px-3.5 pb-2.5"
              onChange={onScopeChange}
              options={PALETTE_SCOPES.map(id => ({ id, label: pal.scopes[id] }))}
              value={scope}
            />
          )}
          <CommandList
            className="dt-portal-scrollbar max-h-none min-h-0 flex-1 overscroll-contain px-2 pb-2 shadow-[inset_0_0.5px_0_var(--ui-line)]"
            ref={listRef}
          >
            {children}
          </CommandList>
          <PaletteFooter />
        </Command>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function PaletteFooter() {
  const { t } = useI18n()
  const pal = t.studio.overlays.palette

  return (
    <div className="flex shrink-0 items-center gap-3.5 px-3.5 py-2 text-[0.71875rem] text-(--ui-text-tertiary) shadow-[inset_0_0.5px_0_var(--ui-line)]">
      <span>
        {formatCombo('up')}
        {formatCombo('down')} {pal.footerSelect}
      </span>
      <span>
        {formatCombo('enter')} {pal.footerOpen}
      </span>
      <span>
        {formatCombo('tab')} {pal.footerScope}
      </span>
      <span className="flex-1" />
      <span className="truncate">{pal.footerPaste}</span>
    </div>
  )
}
