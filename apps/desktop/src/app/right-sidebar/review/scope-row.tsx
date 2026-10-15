import { useStore } from '@nanostores/react'
import type { ReactNode } from 'react'

import { SegmentedControl } from '@/components/ui/segmented-control'
import { TabDropdown } from '@/components/ui/tab-dropdown'
import type { HermesReviewScope } from '@/global'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { $reviewScope, clearReviewSelection, refreshReview } from '@/store/review'

function selectScope(id: HermesReviewScope) {
  $reviewScope.set(id)
  clearReviewSelection()
  void refreshReview()
}

/** Scope switcher row under the Review header. Label + tabs + icons can't share
 *  the 28px header in a pane that narrows to 10rem, so the tabs get their own
 *  row; below their natural width it collapses to the app's narrow-width tab
 *  dropdown rather than ellipsizing every option. */
export function ReviewScopeRow({ trailing }: { trailing?: ReactNode } = {}) {
  const { t } = useI18n()
  const c = t.statusStack.coding
  const scope = useStore($reviewScope)

  const options: { id: HermesReviewScope; label: string }[] = [
    { id: 'uncommitted', label: c.scopeUncommitted },
    { id: 'branch', label: c.scopeBranch },
    { id: 'lastTurn', label: c.scopeLastTurn }
  ]

  // With `trailing` (the inspector) the row is the pane's only header: a
  // compact scope switch, then the review actions (prototype .review-scope).
  return (
    <div
      className={cn('@container shrink-0 px-2 pb-1.5', trailing && 'flex items-center gap-1 pt-2')}
      data-suppress-pane-reveal-side=""
    >
      <SegmentedControl<HermesReviewScope>
        className={cn(
          'hidden auto-cols-[minmax(0,auto)] @[13.5rem]:grid [&>button]:px-2',
          trailing ? 'shrink-0' : 'w-full'
        )}
        onChange={selectScope}
        options={options}
        size={trailing ? 'sm' : 'default'}
        value={scope}
      />
      <div className="flex h-[1.5625rem] items-center pl-1.5 @[13.5rem]:hidden">
        <TabDropdown
          align="start"
          items={options.map(option => ({
            active: option.id === scope,
            id: option.id,
            label: option.label,
            onSelect: () => selectScope(option.id)
          }))}
        />
      </div>
      {trailing ? (
        <>
          <span className="min-w-0 flex-1" />
          {trailing}
        </>
      ) : null}
    </div>
  )
}
