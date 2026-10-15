import { type KeyboardEventHandler, type ReactNode, type RefObject, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { Loader2, Search } from '@/lib/icons'
import { cn } from '@/lib/utils'

interface SearchFieldProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  /**
   * Data-driven placeholder suggestions ("Try \u201ccreative\u201d") — one is picked at
   * random per mount, the nudge that search understands more than names.
   * Falls back to `placeholder` when absent/empty.
   */
  hints?: string[]
  containerClassName?: string
  inputClassName?: string
  loading?: boolean
  onClear?: () => void
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  inputRef?: RefObject<HTMLInputElement | null>
  trailingAction?: ReactNode
  'aria-label'?: string
  /**
   * `bare` (default): borderless, recedes until used — inline toolbars.
   * `filled`: the macOS search field (fill, 8px corners, focus halo) — sidebar,
   * settings and inspector filters.
   */
  variant?: 'bare' | 'filled'
}

/**
 * Shared search field used everywhere (sessions sidebar, pages, overlays,
 * command center, cron). No box — borderless until focus, then an underline.
 * Rests at low opacity until focused or filled. Width/placement come from
 * `containerClassName`.
 */
export function SearchField({
  placeholder,
  value,
  onChange,
  hints,
  containerClassName,
  inputClassName,
  loading = false,
  onClear,
  onKeyDown,
  inputRef,
  trailingAction,
  'aria-label': ariaLabel,
  variant = 'bare'
}: SearchFieldProps) {
  const { t } = useI18n()
  const clear = onClear ?? (() => onChange(''))

  // One hint per mount, picked at random — fresh nudge every visit, no
  // mid-page carousel.
  const [hintIndex] = useState(() => Math.floor(Math.random() * 4096))
  const hintCount = hints?.length ?? 0
  const effectivePlaceholder = hintCount > 0 ? hints![hintIndex % hintCount] : placeholder

  return (
    <div
      className={cn(
        // min-w-0 is load-bearing: without it the content-sized input sets the
        // container's flex min-width and the field bulldozes its siblings
        // instead of shrinking to fit its context.
        'inline-flex min-w-0 max-w-full items-center gap-1.5 border-b border-transparent px-0.5 transition-[color,border-color,opacity]',
        variant === 'filled' &&
          'h-7 rounded-[8px] border-b-0 bg-(--ui-fill-2) px-2 transition-[background-color,box-shadow] duration-[120ms] focus-within:bg-(--ui-bg-editor) focus-within:shadow-[0_0_0_0.5px_color-mix(in_srgb,var(--dt-primary)_60%,transparent),0_0_0_3px_color-mix(in_srgb,var(--dt-primary)_25%,transparent)]',
        // Recede until the user reaches for it (bare only — a filled field is
        // already quiet).
        !value && variant === 'bare' && 'opacity-30 focus-within:opacity-100',
        containerClassName
      )}
    >
      <Search className="pointer-events-none size-3.5 shrink-0 text-muted-foreground/70" />
      <input
        aria-label={ariaLabel ?? placeholder}
        className={cn(
          // `field-sizing: content` sizes the input to its placeholder/typed
          // text, so a width-less caller's row stays compact; `flex-1` +
          // `min-w-0` make the input ABSORB the extra space when the caller
          // does stretch the row (w-full/flex-1 callers), pinning the clear
          // button to the row's right edge instead of trailing the typed
          // text (#119204). Long queries scroll inside the field.
          // text-xs matches the form controls (Input/Select via controlVariants).
          'h-7 min-w-0 max-w-full flex-1 bg-transparent text-xs text-foreground [field-sizing:content] placeholder:text-muted-foreground focus:outline-none',
          variant === 'filled' && 'h-6 text-[0.8125rem] placeholder:text-(--ui-text-tertiary)',
          inputClassName
        )}
        onChange={event => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={effectivePlaceholder}
        ref={inputRef}
        type="text"
        value={value}
      />
      {trailingAction}
      {loading ? (
        <Loader2 className="pointer-events-none size-3.5 shrink-0 animate-spin text-muted-foreground/70" />
      ) : value ? (
        <Tip label={t.ui.search.clear}>
          <Button
            aria-label={t.ui.search.clear}
            className="shrink-0 text-muted-foreground/85 hover:bg-accent/60 hover:text-foreground"
            onClick={clear}
            size="icon-xs"
            variant="ghost"
          >
            <Codicon name="close" size="0.875rem" />
          </Button>
        </Tip>
      ) : null}
    </div>
  )
}
