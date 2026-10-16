import { useStore } from '@nanostores/react'
import type * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { PageLoader } from '@/components/page-loader'
import { StudioPage } from '@/components/studio/pages/page'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { $starmapError, $starmapGraph, $starmapLoading, loadStarmapGraph } from '@/store/starmap'
import type { StarmapGraph } from '@/types/hermes'

import { useRefreshHotkey } from '../hooks/use-refresh-hotkey'
import { useRouteEnumParam } from '../hooks/use-route-enum-param'
import { PanelEmpty } from '../overlays/panel'
import { navigateToWorkspacePage, SETTINGS_ROUTE } from '../routes'
import type { SetStatusbarItemGroup } from '../shell/statusbar-controls'
import { useNodeActions } from '../starmap/node-actions'
import { StarMap } from '../starmap/star-map'

import { filterGraph, graphCounts, MEMORY_FILTERS, type MemoryFilter } from './graph-model'
import { MemoryList } from './memory-list'
import { MemoryShareMenu } from './share-menu'

// Memory (prototype pages.js:389-416): what Hermes remembers, knows about you and
// has learned, as the star map (Map) or an editable list (List). `/starmap`
// renders this page too; `/journey` opens it. The star map engine (simulation,
// renderer, share codes) is app/starmap's.

export const MEMORY_VIEWS = ['graph', 'list'] as const

type MemoryViewMode = (typeof MEMORY_VIEWS)[number]

interface MemoryViewProps extends React.ComponentProps<'section'> {
  setStatusbarItemGroup?: SetStatusbarItemGroup
}

export function MemoryView({ setStatusbarItemGroup: _setStatusbarItemGroup, ...props }: MemoryViewProps) {
  const { t } = useI18n()
  const m = t.studio.pages.memory
  const navigate = useNavigate()
  const graph = useStore($starmapGraph)
  const loading = useStore($starmapLoading)
  const error = useStore($starmapError)
  const [view, setView] = useRouteEnumParam('view', MEMORY_VIEWS, 'graph')
  const [filter, setFilter] = useState<MemoryFilter>('all')
  // A loaded share code replaces the map until "Back to my map"; a fresh
  // profile graph (refresh, profile switch) drops it.
  const [imported, setImported] = useState<StarmapGraph | null>(null)
  const actions = useNodeActions()

  // Load on mount and whenever the cache is dropped (a profile switch resets it).
  useEffect(() => {
    if (!graph && !error) {
      void loadStarmapGraph()
    }
  }, [error, graph])

  useEffect(() => {
    setImported(null)
  }, [graph])

  const refresh = () => void loadStarmapGraph(true)

  useRefreshHotkey(refresh)

  const shownGraph = imported ?? graph
  const mapGraph = useMemo(() => (shownGraph ? filterGraph(shownGraph, filter) : null), [filter, shownGraph])
  const counts = useMemo(() => (shownGraph ? graphCounts(shownGraph) : null), [shownGraph])

  const body = error ? (
    <PanelEmpty description={error} icon="warning" title={t.starmap.loadFailed} />
  ) : !graph ? (
    <PageLoader aria-label={t.starmap.loading} className="min-h-80" />
  ) : graph.nodes.length === 0 && !imported ? (
    <PanelEmpty description={t.starmap.emptyDesc} icon="lightbulb" title={t.starmap.emptyTitle} />
  ) : view === 'list' ? (
    <MemoryList actions={actions} graph={graph} />
  ) : (
    <MemoryGraphView
      counts={counts}
      filter={filter}
      graph={mapGraph!}
      imported={imported !== null}
      onFilterChange={setFilter}
      onResetMap={() => setImported(null)}
    />
  )

  return (
    <StudioPage
      {...props}
      subtitle={m.subtitle}
      title={m.title}
      tools={
        <>
          <SegmentedControl<MemoryViewMode>
            aria-label={m.viewLabel}
            onChange={setView}
            options={[
              { id: 'graph', label: t.starmap.viewGraph },
              { id: 'list', label: m.viewList }
            ]}
            value={view}
          />
          <MemoryShareMenu
            graph={graph}
            onImport={next => {
              setImported(next)
              setView('graph')
            }}
            onRefresh={refresh}
          />
          <Tip label={m.settings}>
            <Button
              aria-label={m.settings}
              onClick={() => navigateToWorkspacePage(navigate, `${SETTINGS_ROUTE}?tab=config:memory`)}
              size="icon-sm"
              variant="ghost"
            >
              <StudioIcon name="gear" size={16} />
            </Button>
          </Tip>
        </>
      }
    >
      {body}
      {loading && graph ? <span className="sr-only">{t.starmap.loading}</span> : null}
      {actions.dialogs}
    </StudioPage>
  )
}

interface MemoryGraphViewProps {
  counts: null | ReturnType<typeof graphCounts>
  filter: MemoryFilter
  graph: StarmapGraph
  imported: boolean
  onFilterChange: (filter: MemoryFilter) => void
  onResetMap: () => void
}

function MemoryGraphView({ counts, filter, graph, imported, onFilterChange, onResetMap }: MemoryGraphViewProps) {
  const { t } = useI18n()
  const m = t.studio.pages.memory

  const filterLabels: Record<MemoryFilter, string> = {
    all: t.starmap.filterAll,
    learned: t.starmap.filterLearned,
    used: t.starmap.filterUsed
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <SegmentedControl<MemoryFilter>
          aria-label={m.filterLabel}
          onChange={onFilterChange}
          options={MEMORY_FILTERS.map(id => ({ id, label: filterLabels[id] }))}
          size="sm"
          value={filter}
        />
        {counts ? (
          <span className="text-xs text-(--ui-text-tertiary)">
            {m.counts(counts.skills, counts.memories, counts.categories)}
          </span>
        ) : null}
        {imported ? (
          <>
            <span className="flex-1" />
            <Badge variant="default">{t.starmap.importedBadge}</Badge>
            <Button onClick={onResetMap} size="sm" variant="link">
              {t.starmap.resetToMine}
            </Button>
          </>
        ) : null}
      </div>
      <div
        className="relative flex h-[28.75rem] min-h-80 flex-col overflow-hidden rounded-2xl shadow-(--pg-card-ring)"
        data-slot="memory-space"
      >
        <StarMap graph={graph} />
      </div>
      <p className="m-0 text-xs text-(--ui-text-tertiary)">{m.graphHint}</p>
    </>
  )
}
