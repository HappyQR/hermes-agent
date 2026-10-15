import type { ReactNode } from 'react'

import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
import { cn } from '@/lib/utils'

// Page surfaces from the prototype: card grids (`.grid-cards` / `.gcard`),
// section titles, inset list groups (`.list-group` / `.lg-row`), key/value
// grids (`.kv`), callouts and filter chips (`.pal-scope`). Hairlines between
// rows come from studio/pages.css so conditional rows and wrappers keep them.

export function CardGrid({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('grid grid-cols-[repeat(auto-fill,minmax(14.375rem,1fr))] gap-3', className)}
      data-slot="studio-card-grid"
    >
      {children}
    </div>
  )
}

export function GridCard({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'relative flex min-w-0 flex-col gap-2.5 rounded-[14px] bg-(--pg-card) p-3.5 text-left shadow-(--pg-card-shadow) transition-[transform,box-shadow] duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-(--pg-card-lift) motion-safe:hover:-translate-y-0.5',
        className
      )}
      data-slot="studio-grid-card"
    >
      {children}
    </div>
  )
}

interface GridCardTopProps {
  lead?: ReactNode
  /** Clicking the title opens the item (its sheet). */
  onOpen?: () => void
  openLabel?: string
  subtitle?: ReactNode
  title: ReactNode
  titleClassName?: string
  trailing?: ReactNode
}

export function GridCardTop({ lead, onOpen, openLabel, subtitle, title, titleClassName, trailing }: GridCardTopProps) {
  const text = (
    <>
      <b className={cn('truncate text-[0.84375rem] font-semibold text-(--ui-text-primary)', titleClassName)}>{title}</b>
      {subtitle ? <span className="text-[0.71875rem] leading-snug text-(--ui-text-tertiary)">{subtitle}</span> : null}
    </>
  )

  return (
    <div className="flex items-start gap-2.5">
      {lead}
      {onOpen ? (
        <button
          aria-label={openLabel}
          className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5 rounded-[6px] text-left text-inherit outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          onClick={onOpen}
          type="button"
        >
          {text}
        </button>
      ) : (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">{text}</span>
      )}
      {trailing}
    </div>
  )
}

/** Two-line description (min-height keeps a row of cards aligned). */
export function GridCardText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('pg-clamp-2 m-0 min-h-[3em] text-[0.78125rem] leading-normal text-(--ui-text-secondary)', className)}>
      {children}
    </p>
  )
}

export function GridCardFoot({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mt-auto flex items-center gap-1.5 text-[0.71875rem] text-(--ui-text-tertiary)', className)}>
      {children}
    </div>
  )
}

export function SectionTitle({ children, count, className }: { children: ReactNode; className?: string; count?: ReactNode }) {
  return (
    <div
      className={cn('-mb-1 mt-1.5 flex items-center gap-2 text-[0.8125rem] font-[650] text-(--ui-text-primary)', className)}
      data-slot="studio-section-title"
    >
      {children}
      {count !== undefined && count !== null ? (
        <span className="font-medium text-(--ui-text-tertiary) tabular-nums">{count}</span>
      ) : null}
    </div>
  )
}

export function ListGroup({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('overflow-hidden rounded-xl bg-(--pg-card) shadow-(--pg-card-ring)', className)}
      data-slot="studio-list-group"
    >
      {children}
    </div>
  )
}

interface ListGroupRowProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  lead?: ReactNode
  /** Makes the text column a button (the row's primary action). */
  onOpen?: () => void
  openLabel?: string
  subtitle?: ReactNode
  title?: ReactNode
  trailing?: ReactNode
}

/** One inset-group row: lead · title/subtitle · trailing controls. */
export function ListGroupRow({
  children,
  className,
  lead,
  onOpen,
  openLabel,
  subtitle,
  title,
  trailing,
  ...props
}: ListGroupRowProps) {
  const text =
    title !== undefined ? (
      <>
        <b className="truncate font-medium text-(--ui-text-primary)">{title}</b>
        {subtitle ? <span className="text-xs leading-[1.4] text-(--ui-text-tertiary)">{subtitle}</span> : null}
      </>
    ) : null

  return (
    <div
      {...props}
      className={cn('flex min-h-11 w-full items-center gap-3 px-3.5 py-2 text-left text-[0.8125rem]', className)}
      data-slot="studio-list-row"
    >
      {lead}
      {text &&
        (onOpen ? (
          <button
            aria-label={openLabel}
            className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5 self-stretch justify-center rounded-[6px] text-left text-inherit outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            onClick={onOpen}
            type="button"
          >
            {text}
          </button>
        ) : (
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">{text}</span>
        ))}
      {children}
      {trailing}
    </div>
  )
}

export interface KeyValueRow {
  key: string
  label: ReactNode
  value: ReactNode
}

export function KeyValueList({ className, rows }: { className?: string; rows: KeyValueRow[] }) {
  return (
    <dl
      className={cn(
        'm-0 grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-3.5 gap-y-2 text-[0.8125rem] max-[35rem]:grid-cols-[minmax(0,1fr)]',
        className
      )}
      data-slot="studio-kv"
    >
      {rows.map(row => (
        <div className="contents" key={row.key}>
          <dt className="text-(--ui-text-tertiary)">{row.label}</dt>
          <dd className="m-0 min-w-0 break-words text-(--ui-text-primary)">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

interface CalloutProps {
  children: ReactNode
  className?: string
  icon?: StudioIconName
  tone?: 'info' | 'warn'
}

export function Callout({ children, className, icon, tone = 'info' }: CalloutProps) {
  return (
    <div
      className={cn(
        'flex gap-2.5 rounded-[10px] px-3 py-2.5 text-[0.78125rem] leading-relaxed text-(--ui-text-primary)',
        tone === 'warn'
          ? 'bg-[color-mix(in_srgb,var(--pg-dot-orange)_10%,transparent)]'
          : 'bg-(--ui-accent-softer)',
        className
      )}
      data-slot="studio-callout"
      role={tone === 'warn' ? 'alert' : undefined}
    >
      <StudioIcon
        className={cn('mt-[3px]', tone === 'warn' ? 'text-(--pg-dot-orange)' : 'text-primary')}
        name={icon ?? (tone === 'warn' ? 'warn' : 'info')}
        size={15}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

interface FilterChipOption<T extends string> {
  id: T
  label: ReactNode
  /** Muted count after the label. */
  count?: number
}

interface FilterChipsProps<T extends string> {
  'aria-label'?: string
  className?: string
  onChange: (id: T) => void
  options: readonly FilterChipOption<T>[]
  value: T
}

/** Single-choice pill filters (prototype `.pal-scope`). */
export function FilterChips<T extends string>({
  'aria-label': ariaLabel,
  className,
  onChange,
  options,
  value
}: FilterChipsProps<T>) {
  return (
    <div aria-label={ariaLabel} className={cn('flex flex-wrap gap-1.5', className)} role="group">
      {options.map(option => (
        <FilterChip key={option.id} onClick={() => onChange(option.id)} pressed={option.id === value}>
          {option.label}
          {option.count !== undefined ? (
            <span className={cn('tabular-nums', option.id === value ? 'opacity-70' : 'text-(--ui-text-tertiary)')}>
              {option.count}
            </span>
          ) : null}
        </FilterChip>
      ))}
    </div>
  )
}

export function FilterChip({
  children,
  className,
  pressed,
  ...props
}: React.ComponentProps<'button'> & { pressed: boolean }) {
  return (
    <button
      {...props}
      aria-pressed={pressed}
      className={cn(
        'inline-flex h-6 cursor-pointer items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap transition-colors duration-[120ms] outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        pressed
          ? 'bg-(--ui-text-primary) text-(--ui-bg-editor)'
          : 'text-(--ui-text-secondary) shadow-[inset_0_0_0_0.5px_var(--ui-line-2)] hover:bg-(--ui-hover)',
        className
      )}
      type="button"
    >
      {children}
    </button>
  )
}
