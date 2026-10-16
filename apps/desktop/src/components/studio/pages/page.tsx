import { type ReactNode, useRef } from 'react'

import { PAGE_INSET_X } from '@/app/layout-constants'
import { useToolbarPageTitle } from '@/app/shell/toolbar/use-toolbar-page-title'
import { cn } from '@/lib/utils'

// Hermes Studio workspace page frame (prototype `.page` / `.page-in` /
// `.page-head`): a large title + subtitle head with its tools on the right, an
// optional toolbar row, then the body — centered at a readable width inside the
// shared PAGE_INSET_X gutters. `layout="split"` is the System Settings
// master/detail page: the head stays put and the body fills the remaining
// height so a list and its detail scroll independently.

export type StudioPageLayout = 'scroll' | 'split'

interface StudioPageProps extends Omit<React.ComponentProps<'section'>, 'title'> {
  children: ReactNode
  layout?: StudioPageLayout
  /** Row under the head: search, filters, scope, page actions. */
  toolbar?: ReactNode
  /** Right side of the head: view switches and the primary action. */
  tools?: ReactNode
  subtitle?: ReactNode
  title: string
  /** `wide` gives boards (kanban) room for many columns. */
  width?: 'default' | 'wide'
}

export function StudioPage({
  children,
  className,
  layout = 'scroll',
  subtitle,
  title,
  toolbar,
  tools,
  width = 'default',
  ...props
}: StudioPageProps) {
  return (
    <section
      {...props}
      className={cn('flex h-full min-w-0 flex-col overflow-hidden bg-(--ui-chat-surface-background)', className)}
      data-layout={layout}
      data-slot="studio-page"
    >
      <div
        className={cn(
          'min-h-0 flex-1 overscroll-contain',
          layout === 'split' ? 'overflow-hidden' : 'overflow-y-auto',
          PAGE_INSET_X
        )}
        data-slot="studio-page-scroll"
      >
        <div
          className={cn(
            // The shell floats the window controls over the top band; the page
            // starts below it (the band stays a window-drag region).
            'mx-auto flex w-full min-w-0 flex-col gap-[1.125rem] pt-[calc(var(--titlebar-height)+0.25rem)]',
            width === 'wide' ? 'max-w-[85rem]' : 'max-w-[61rem]',
            layout === 'split' ? 'h-full pb-0' : 'pb-12'
          )}
          data-slot="studio-page-inner"
        >
          <StudioPageHeader subtitle={subtitle} title={title} tools={tools} />
          {toolbar}
          {children}
        </div>
      </div>
    </section>
  )
}

interface StudioPageHeaderProps {
  subtitle?: ReactNode
  title: string
  tools?: ReactNode
}

/** The page head; its title moves into the toolbar once it scrolls away. */
export function StudioPageHeader({ subtitle, title, tools }: StudioPageHeaderProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useToolbarPageTitle(title, titleRef)

  return (
    <header className="flex flex-wrap items-end gap-x-4 gap-y-3 pt-1.5" data-slot="studio-page-head">
      <div className="flex min-w-60 flex-1 flex-col gap-1">
        <h1
          className="m-0 text-[1.625rem] leading-[1.2] font-bold tracking-[-0.02em] text-(--ui-text-primary)"
          ref={titleRef}
        >
          {title}
        </h1>
        {subtitle ? <p className="m-0 text-[0.84375rem] leading-normal text-(--ui-text-tertiary)">{subtitle}</p> : null}
      </div>
      {tools ? (
        <div className="flex flex-wrap items-center gap-2" data-slot="studio-page-tools">
          {tools}
        </div>
      ) : null}
    </header>
  )
}

/** A wrapping row of page controls (prototype toolbar under the head). */
export function StudioToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} data-slot="studio-page-toolbar">
      {children}
    </div>
  )
}

/** Pushes the following toolbar items to the trailing edge. */
export function ToolbarSpacer() {
  return <span aria-hidden className="flex-1" />
}
