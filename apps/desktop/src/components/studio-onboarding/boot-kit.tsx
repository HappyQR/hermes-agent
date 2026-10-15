import type { ComponentProps, ReactNode } from 'react'

import { IconTile, type TileTone } from '@/app/overlays/studio/icon-tile'
import { BrandMark } from '@/components/brand-mark'
import type { StudioIconName } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import type { IconComponent } from '@/lib/icons'
import { cn } from '@/lib/utils'

// Hermes Studio — the shared look of the first-run and boot surfaces
// (prototype .onb / .onb-card / .choice / .onb-steps): an opaque window-filling
// surface, a centered column led by the brand mark, and choice rows. Each
// surface keeps its own z-rung, glass contract, dismissability and exit
// choreography; only the presentation is shared.

/** The opaque field behind a boot surface (it masks the app until it is done). */
export const BOOT_SURFACE_CLASS = 'bg-(--ui-bg-chrome) text-(--ui-text-primary)'

/** The centered content column (520px). */
export const BOOT_COLUMN_CLASS = 'flex w-[min(32.5rem,100%)] flex-col items-center gap-[1.125rem] text-center'

/** A card for the denser boot screens (install progress, recovery). */
export const BOOT_CARD_CLASS =
  'rounded-2xl bg-(--ui-bg-editor) shadow-[0_0_0_0.5px_var(--ui-line-2),0_16px_40px_-14px_rgb(0_0_0/0.22)]'

/** The 72px brand tile (the PNG carries its own squircle, so the shadow follows its alpha). */
export function BootMark({ className }: { className?: string }) {
  return (
    <BrandMark
      className={cn(
        'size-[4.5rem] drop-shadow-[0_8px_16px_rgb(0_0_0/0.16)] motion-safe:animate-[studio-pop-in_500ms_cubic-bezier(0.34,1.32,0.64,1)_both]',
        className
      )}
    />
  )
}

/** Brand mark, 28px display title and lead line. */
export function BootHero({
  className,
  lead,
  title
}: {
  className?: string
  lead?: ReactNode
  title: ReactNode
}) {
  return (
    <div className={cn('flex flex-col items-center gap-[1.125rem]', className)}>
      <BootMark />
      <h1 className="m-0 text-[1.75rem] leading-tight font-bold tracking-[-0.02em] text-(--ui-text-primary)">{title}</h1>
      {lead ? <p className="m-0 max-w-[44ch] text-sm leading-[1.55] text-(--ui-text-tertiary)">{lead}</p> : null}
    </div>
  )
}

interface ChoiceRowProps extends Omit<ComponentProps<'button'>, 'title'> {
  description?: ReactNode
  /** A prototype glyph for the tile (preferred over `icon`). */
  glyph?: StudioIconName
  icon?: IconComponent
  /** Custom leading media in place of the icon tile (a brand image, a spinner tile). */
  media?: ReactNode
  selected?: boolean
  title: ReactNode
  /** Badges beside the title. */
  titleAside?: ReactNode
  tone?: TileTone
  trailing?: ReactNode
}

/** A large choice row: coloured tile, title + description, optional trailing glyph. */
export function ChoiceRow({
  className,
  description,
  glyph,
  icon,
  media,
  selected = false,
  title,
  titleAside,
  tone = 'accent',
  trailing,
  type = 'button',
  ...props
}: ChoiceRowProps) {
  return (
    <button
      className={cn(
        'group flex w-full items-center gap-3.5 rounded-[14px] p-3.5 text-left transition-[background-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:cursor-not-allowed disabled:opacity-60',
        selected
          ? 'bg-(--ui-accent-softer) shadow-[inset_0_0_0_2px_var(--dt-primary)]'
          : 'bg-(--ui-bg-inspector) shadow-[inset_0_0_0_0.5px_var(--ui-line-2)] enabled:hover:bg-(--ui-bg-editor) enabled:hover:shadow-[0_0_0_0.5px_var(--ui-line-2),0_10px_24px_-14px_rgb(0_0_0/0.3)] motion-safe:enabled:hover:-translate-y-px',
        className
      )}
      data-slot="choice-row"
      type={type}
      {...props}
    >
      {media ?? (glyph || icon ? <IconTile glyph={glyph} icon={icon} size={38} tone={tone} /> : null)}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-(--ui-text-primary)">{title}</span>
          {titleAside}
        </span>
        {description ? (
          <span className="text-[0.78125rem] leading-[1.45] text-(--ui-text-tertiary)">{description}</span>
        ) : null}
      </span>
      {trailing}
    </button>
  )
}

/** Step position for a flow the user is actually walking through (never time-based progress). */
export function StepDots({ current, total }: { current: number; total: number }) {
  const { t } = useI18n()

  return (
    <div aria-label={t.studio.overlays.aux.boot.step(current + 1, total)} className="flex gap-1.5" role="img">
      {Array.from({ length: total }, (_, index) => (
        <i
          className={cn(
            'block h-1.5 rounded-[3px] transition-[width,background-color] duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
            index === current ? 'w-5 bg-primary' : 'w-1.5 bg-(--ui-fill)'
          )}
          key={index}
        />
      ))}
    </div>
  )
}
