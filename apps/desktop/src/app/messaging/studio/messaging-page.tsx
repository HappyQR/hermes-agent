import type { ReactNode } from 'react'

import { SettingsScopeNote, SettingsScopePopup } from '@/app/settings/studio/scope'
import { PageLoader } from '@/components/page-loader'
import type { StatusTone } from '@/components/status-dot'
import { MasterItem, StudioMasterDetail } from '@/components/studio/pages/master-detail'
import { StudioPage } from '@/components/studio/pages/page'
import { FilterChips } from '@/components/studio/pages/surfaces'
import { Dot, type DotTone } from '@/components/studio/pages/tile'
import { Badge } from '@/components/ui/badge'
import { SearchField } from '@/components/ui/search-field'
import { useI18n } from '@/i18n'
import { platformStatusTone } from '@/lib/platform-status'
import type { MessagingPlatformInfo } from '@/types/hermes'

import { PlatformTile } from '../platform-tile'

// Messaging (prototype pages.js:111-193): System Settings master/detail — the
// platform list (search, status filter, tile · name · state, a pending-pairing
// count or a status dot) beside the selected platform's detail. Data, writes
// and scope guards stay in MessagingView; this is the page around them.

export const STATUS_DOT: Record<StatusTone, DotTone> = {
  bad: 'red',
  good: 'green',
  muted: 'gray',
  warn: 'orange'
}

interface MessagingPageProps extends Omit<React.ComponentProps<'section'>, 'onSelect' | 'title'> {
  /** The selected platform's detail pane. */
  detail: ReactNode
  filter: { active: 'all' | StatusTone; onChange: (next: 'all' | StatusTone) => void; tones: StatusTone[] }
  onQueryChange: (query: string) => void
  onSelect: (id: string) => void
  pendingCount: (id: string) => number
  /** Null while the first load is in flight. */
  platforms: MessagingPlatformInfo[] | null
  query: string
  selectedId: null | string
  stateLabel: (platform: MessagingPlatformInfo) => string
  /** Every platform matching search + filter (the list). */
  visible: MessagingPlatformInfo[]
}

export function MessagingPage({
  children,
  detail,
  filter,
  onQueryChange,
  onSelect,
  pendingCount,
  platforms,
  query,
  selectedId,
  stateLabel,
  visible,
  ...props
}: MessagingPageProps) {
  const { t } = useI18n()
  const m = t.messaging
  const s = t.studio.pages.messaging

  const listHeader = (
    <div className="flex flex-col gap-2">
      <SearchField
        aria-label={s.searchPlatforms}
        containerClassName="w-full"
        onChange={onQueryChange}
        placeholder={s.searchPlatforms}
        value={query}
        variant="filled"
      />
      {filter.tones.length > 1 ? (
        <FilterChips
          aria-label={s.filterLabel}
          onChange={filter.onChange}
          options={(['all', ...filter.tones] as const).map(id => ({ id, label: m.statusFilter[id] }))}
          value={filter.active}
        />
      ) : null}
    </div>
  )

  return (
    <StudioPage {...props} layout="split" subtitle={s.subtitle} title={s.title} tools={<SettingsScopePopup />}>
      <SettingsScopeNote />
      {platforms ? (
        <StudioMasterDetail
          detail={detail}
          list={
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {visible.map(platform => {
                const pending = pendingCount(platform.id)

                return (
                  <li key={platform.id}>
                    <MasterItem
                      active={selectedId === platform.id}
                      lead={<PlatformTile platformId={platform.id} platformName={platform.name} size={28} />}
                      onClick={() => onSelect(platform.id)}
                      subtitle={stateLabel(platform)}
                      title={platform.name}
                      trailing={
                        pending > 0 ? (
                          // Someone is waiting to be let in — the only sign of it before the platform is open.
                          <Badge aria-label={m.pendingAria(pending)} className="rounded-full" variant="warn">
                            {pending}
                          </Badge>
                        ) : (
                          <Dot tone={STATUS_DOT[platformStatusTone(platform)]} />
                        )
                      }
                    />
                  </li>
                )
              })}
            </ul>
          }
          listHeader={listHeader}
          listLabel={s.listLabel}
        />
      ) : (
        <PageLoader className="min-h-80" label={m.loading} />
      )}
      {children}
    </StudioPage>
  )
}
