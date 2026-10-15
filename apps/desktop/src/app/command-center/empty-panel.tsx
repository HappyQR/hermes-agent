import type { ReactNode } from 'react'

/** A quiet centered empty/error state inside a System Status tab. */
export function EmptyPanel({ action, description, title }: { action?: ReactNode; description: string; title?: string }) {
  return (
    <div className="grid min-h-48 place-items-center px-6 text-center">
      <div>
        {title && <div className="text-[0.8125rem] font-medium text-(--ui-text-primary)">{title}</div>}
        <div className="mt-1 text-[0.75rem] leading-normal text-(--ui-text-tertiary)">{description}</div>
        {action && <div className="mt-3 flex justify-center">{action}</div>}
      </div>
    </div>
  )
}
