import type { ReactNode } from 'react'

import { FormGroup, FormSection } from '@/app/overlays/studio/form-group'
import { cn } from '@/lib/utils'

/** DOM id of a window section, the scroll target of `?section=`. */
export const settingsSectionElementId = (page: string, section: string) => `settings-section-${page}-${section}`

/**
 * One section of a Settings window page (prototype .form-sec): an h4 title
 * with an optional right-aligned aside (the scope badge on a page's first
 * section), an optional note, then the rows on one grouped card. `bare`
 * sections render children without the card (components that lay out their
 * own cards, e.g. billing or local models).
 */
export function SettingsWindowSection({
  aside,
  bare = false,
  children,
  className,
  id,
  note,
  page,
  title
}: {
  aside?: ReactNode
  bare?: boolean
  children: ReactNode
  className?: string
  id: string
  note?: ReactNode
  page: string
  title?: ReactNode
}) {
  return (
    <FormSection
      aside={aside}
      className={cn('scroll-mt-3', className)}
      id={settingsSectionElementId(page, id)}
      note={note}
      title={title}
    >
      {bare ? children : <FormGroup>{children}</FormGroup>}
    </FormSection>
  )
}
