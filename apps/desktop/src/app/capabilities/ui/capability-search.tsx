import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { SearchField } from '@/components/ui/search-field'

/** The catalog's search field: the boxed SearchField (Studio draws it as the
 *  roomy macOS field) with the catalog's name as a scope badge and its own
 *  actions (view toggle, …) at the end. Callers own the column it sits in and
 *  the query. In Studio the page toolbar searches the tabs; this field lives
 *  in the catalog sheets. */
export function CapabilitySearch({
  actions,
  hints,
  onChange,
  placeholder,
  scope,
  value
}: {
  actions?: ReactNode
  hints?: string[]
  onChange: (value: string) => void
  placeholder: string
  scope: string
  value: string
}) {
  return (
    <SearchField
      containerClassName="w-full min-w-0"
      hints={hints}
      leadingContent={
        <Badge size="xs" variant="muted">
          {scope}
        </Badge>
      }
      onChange={onChange}
      placeholder={placeholder}
      trailingAction={
        actions ? (
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-3 justify-self-end" data-catalog-actions>
            {actions}
          </div>
        ) : undefined
      }
      value={value}
      variant="box"
    />
  )
}
