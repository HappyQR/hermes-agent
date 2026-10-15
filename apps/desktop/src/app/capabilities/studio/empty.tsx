import { useI18n } from '@/i18n'

import { PanelEmpty } from '../../overlays/panel'

/** Nothing to list: says whether the search or the profile is empty. */
export function CapabilityPageEmpty({ none, query }: { none: string; query: string }) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities
  const q = query.trim()

  return (
    <div className="flex min-h-64 flex-col">
      <PanelEmpty description={q ? c.emptyNoMatch(q) : none} icon="search" title={c.emptyTitle} />
    </div>
  )
}
