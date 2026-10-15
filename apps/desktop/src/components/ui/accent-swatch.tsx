import { Codicon } from '@/components/ui/codicon'
import { Tip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { readableInk } from '@/themes/color'

/**
 * One accent colour as a round swatch; with `onColorChange` it is the
 * custom-colour well. `size="sm"` is the macOS Appearance row: a 20px dot
 * whose selection is a white centre (System Settings), not an outer ring.
 */
export function AccentSwatch({
  active,
  hex,
  name,
  onColorChange,
  onPick,
  size = 'default'
}: {
  active: boolean
  hex: string
  name: string
  onColorChange?: (hex: string) => void
  onPick?: () => void
  size?: 'default' | 'sm'
}) {
  const small = size === 'sm'

  const className = cn(
    'relative inline-flex items-center justify-center rounded-full transition-transform duration-150',
    small
      ? 'size-5 shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.15)] hover:scale-110 motion-reduce:hover:scale-100'
      : 'size-9 border border-foreground/15',
    !small && !active && 'hover:scale-105'
  )

  const style = {
    background: hex,
    boxShadow: active && !small ? `0 0 0 2px var(--dt-background), 0 0 0 4px ${hex}` : undefined
  }

  return (
    <Tip label={name}>
      {onColorChange ? (
        <label className={cn(className, 'focus-within:outline-2 focus-within:outline-ring')} style={style}>
          <span className="flex" style={{ color: readableInk(hex) }}>
            <Codicon name="add" size="1rem" />
          </span>
          <input
            aria-label={name}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
            onChange={event => onColorChange(event.target.value)}
            type="color"
            value={hex}
          />
        </label>
      ) : (
        <button
          aria-label={name}
          aria-pressed={active}
          className={className}
          onClick={onPick}
          style={style}
          type="button"
        >
          {small && active && <span aria-hidden className="size-2 rounded-full bg-(--ui-on-accent)" />}
        </button>
      )}
    </Tip>
  )
}
