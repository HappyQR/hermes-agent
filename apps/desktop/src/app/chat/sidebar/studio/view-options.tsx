import { useStore } from '@nanostores/react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { type ReactNode, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Switch } from '@/components/ui/switch'
import { Tip } from '@/components/ui/tooltip'
import { type Translations, useI18n } from '@/i18n'
import { desktopGit } from '@/lib/desktop-git'
import { cn } from '@/lib/utils'
import { $showsAdvancedChrome } from '@/store/interface-mode'
import {
  $sidebarCardRows,
  $sidebarOrdering,
  $sidebarPrFilter,
  $sidebarProfileFilter,
  $sidebarProjectFilter,
  $sidebarRowMeta,
  $sidebarShowAllSessions,
  $sidebarShowArchived,
  $sidebarStatusFilter,
  setSidebarCardRows,
  setSidebarOrdering,
  setSidebarShowAllSessions,
  setSidebarShowArchived,
  type SidebarOrdering,
  type SidebarRowMeta,
  toggleSidebarPrFilter,
  toggleSidebarProfileFilter,
  toggleSidebarProjectFilter,
  toggleSidebarRowMeta,
  toggleSidebarStatusFilter
} from '@/store/layout'
import { $profiles, $showAllProfiles, normalizeProfileKey } from '@/store/profile'
import { $projectTree } from '@/store/projects'
import type { PullRequestBucket } from '@/store/pull-requests'
import type { SessionStatusBucket } from '@/store/session-dot-state'
import { $sessionListDensity, type SessionListDensity, setSessionListDensity } from '@/store/session-list-density'
import { $sessionsHaveCost } from '@/store/sidebar-archive'
import {
  $sidebarEffectiveGrouping,
  $sidebarPreviewLine,
  $sidebarSourceFilter,
  $studioViewCustomized,
  resetStudioSidebarView,
  setSidebarPreviewLine,
  setStudioGrouping,
  type StudioGrouping,
  toggleSidebarSourceFilter
} from '@/store/sidebar-studio'

import { sourceBucketLabel } from './session-source'

type SidebarCopy = Translations['sidebar']
type StudioCopy = Translations['studio']['sidebar']

const GROUPINGS: readonly StudioGrouping[] = ['time', 'project', 'status', 'source', 'profile', 'none']
const ORDERINGS: readonly SidebarOrdering[] = ['updated', 'created', 'status', 'tokens', 'cost', 'manual']
const STATUSES: readonly SessionStatusBucket[] = ['needs-input', 'working', 'unread', 'draft', 'idle']
const PR_STATES: readonly PullRequestBucket[] = ['open', 'draft', 'merged', 'closed', 'none']
const DENSITIES: readonly SessionListDensity[] = ['compact', 'comfortable', 'detailed']

const orderingLabel = (ordering: SidebarOrdering, f: SidebarCopy['filter']) =>
  ({ cost: f.cost, created: f.created, manual: f.manual, status: f.status, tokens: f.tokens, updated: f.updated })[
    ordering
  ]

const statusLabel = (status: SessionStatusBucket, f: SidebarCopy['filter']) =>
  ({ draft: f.draft, idle: f.idle, 'needs-input': f.needsInput, unread: f.unread, working: f.working })[status]

const prLabel = (bucket: PullRequestBucket, f: SidebarCopy['filter']) =>
  ({ closed: f.closed, draft: f.draft, merged: f.merged, none: f.noPR, open: f.open })[bucket]

/** A filter chip (prototype `.tag.pill.lg`): outlined off, accent-soft on. */
function FilterChip({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      aria-pressed={on}
      className={cn(
        'inline-flex h-6 max-w-full items-center rounded-full px-2.25 text-xs font-medium whitespace-nowrap transition-colors duration-[120ms]',
        on
          ? 'bg-(--ui-accent-soft) text-(--ui-accent-text)'
          : 'text-(--ui-text-secondary) shadow-[inset_0_0_0_0.5px_var(--ui-line-2)] hover:bg-(--ui-hover)'
      )}
      onClick={onToggle}
      type="button"
    >
      <span className="truncate">{label}</span>
    </button>
  )
}

function Caption({ children }: { children: ReactNode }) {
  return <span className="text-[0.71875rem] font-semibold text-(--ui-text-tertiary)">{children}</span>
}

function GroupingChoices({ copy }: { copy: StudioCopy }) {
  const grouping = useStore($sidebarEffectiveGrouping)

  const labels: Record<StudioGrouping, string> = {
    none: copy.grouping.none,
    profile: copy.grouping.profile,
    project: copy.grouping.project,
    source: copy.grouping.source,
    status: copy.grouping.status,
    time: copy.grouping.time
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Caption>{copy.grouping.label}</Caption>
      <RadioGroupPrimitive.Root
        aria-label={copy.grouping.label}
        className="grid grid-cols-2 gap-x-3 gap-y-1"
        onValueChange={value => setStudioGrouping(value as StudioGrouping)}
        value={grouping}
      >
        {GROUPINGS.map(id => (
          <label className="flex h-6 cursor-pointer items-center gap-2 text-[0.8125rem]" key={id}>
            <RadioGroupPrimitive.Item
              className="relative size-[15px] shrink-0 rounded-full bg-(--ui-bg-editor) shadow-[inset_0_0_0_0.5px_var(--ui-line-2),0_0.5px_1px_rgb(0_0_0/0.08)] outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=checked]:bg-primary data-[state=checked]:shadow-none"
              value={id}
            >
              <RadioGroupPrimitive.Indicator className="absolute inset-[4.5px] rounded-full bg-white" />
            </RadioGroupPrimitive.Item>
            <span className="min-w-0 truncate">{labels[id]}</span>
          </label>
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  )
}

function SortChoice({ copy, f }: { copy: StudioCopy; f: SidebarCopy['filter'] }) {
  const ordering = useStore($sidebarOrdering)
  const hasCost = useStore($sessionsHaveCost)

  // Dragging a row is what picks manual, so it only shows as a way back out
  // once there is a hand-picked order; cost waits until a session reports spend.
  const options = ORDERINGS.filter(id =>
    id === 'manual' ? ordering === 'manual' : id !== 'cost' || hasCost || ordering === 'cost'
  )

  return (
    <div className="flex items-center gap-2.5">
      <span className="flex-1">
        <Caption>{copy.view.sort}</Caption>
      </span>
      <Select onValueChange={value => setSidebarOrdering(value as SidebarOrdering)} value={ordering}>
        <SelectTrigger aria-label={copy.view.sort} className="w-auto min-w-28" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(id => (
            <SelectItem key={id} value={id}>
              {orderingLabel(id, f)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function ShowChoices({ copy, f }: { copy: StudioCopy; f: SidebarCopy['filter'] }) {
  const rowMeta = useStore($sidebarRowMeta)
  const cardRows = useStore($sidebarCardRows)
  const previewLine = useStore($sidebarPreviewLine)
  const density = useStore($sessionListDensity)
  const showsAdvanced = useStore($showsAdvancedChrome)
  const hasCost = useStore($sessionsHaveCost)
  // PR state comes from `gh` where the checkout lives; resolved per render.
  const prAvailable = Boolean(desktopGit()?.review?.prList)

  // Preview: the card keeps upstream's preview row meta; one-line rows add
  // the first-message line.
  const preview = {
    checked: cardRows ? rowMeta.includes('preview') : previewLine,
    toggle: () => (cardRows ? toggleSidebarRowMeta('preview') : setSidebarPreviewLine(!previewLine))
  }

  const fields: { id: SidebarRowMeta; label: string; shown: boolean }[] = [
    { id: 'updated', label: copy.view.time, shown: true },
    { id: 'tokens', label: f.tokens, shown: true },
    { id: 'cost', label: f.cost, shown: hasCost || rowMeta.includes('cost') },
    { id: 'pr', label: f.pr, shown: prAvailable },
    { id: 'profile', label: f.profile, shown: true }
  ]

  return (
    <div className="flex flex-col gap-1.5">
      <Caption>{copy.view.show}</Caption>
      {/* Simple mode pins the row readouts; the fields wait for Advanced. */}
      {showsAdvanced && (
        <div className="grid grid-cols-3 gap-x-2.5 gap-y-1">
          <label className="flex h-6 cursor-pointer items-center gap-1.75 text-[0.8125rem]">
            <Checkbox checked={preview.checked} onCheckedChange={preview.toggle} />
            <span className="truncate">{f.preview}</span>
          </label>
          {fields
            .filter(field => field.shown)
            .map(field => (
              <label className="flex h-6 cursor-pointer items-center gap-1.75 text-[0.8125rem]" key={field.id}>
                <Checkbox checked={rowMeta.includes(field.id)} onCheckedChange={() => toggleSidebarRowMeta(field.id)} />
                <span className="truncate">{field.label}</span>
              </label>
            ))}
        </div>
      )}
      <div className="mt-1 flex items-center gap-2.5">
        <SegmentedControl
          aria-label={copy.view.density}
          onChange={setSessionListDensity}
          options={DENSITIES.map(id => ({ id, label: copy.view[id] }))}
          size="sm"
          value={density}
        />
        <span className="flex-1" />
        <span className="text-xs">{f.inboxStyle}</span>
        <Switch aria-label={f.inboxStyle} checked={cardRows} onCheckedChange={setSidebarCardRows} size="xs" />
      </div>
    </div>
  )
}

function ChipRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div aria-label={label} className="flex flex-wrap gap-1.25" role="group">
      {children}
    </div>
  )
}

function FilterChoices({ copy, f, sources }: { copy: StudioCopy; f: SidebarCopy['filter']; sources: readonly string[] }) {
  const { t } = useI18n()
  const statusFilter = useStore($sidebarStatusFilter)
  const sourceFilter = useStore($sidebarSourceFilter)
  const prFilter = useStore($sidebarPrFilter)
  const showArchived = useStore($sidebarShowArchived)
  const showsAdvanced = useStore($showsAdvancedChrome)
  const prAvailable = Boolean(desktopGit()?.review?.prList) && showsAdvanced
  // A source that is filtered on stays listed even when no row of it is loaded.
  const sourceChips = [...new Set([...sources, ...sourceFilter])]

  return (
    <div className="flex flex-col gap-1.5">
      <Caption>{copy.view.filters}</Caption>
      <ChipRow label={f.status}>
        {STATUSES.map(id => (
          <FilterChip
            key={id}
            label={statusLabel(id, f)}
            on={statusFilter.includes(id)}
            onToggle={() => toggleSidebarStatusFilter(id)}
          />
        ))}
      </ChipRow>
      {sourceChips.length > 1 || sourceFilter.length > 0 ? (
        <ChipRow label={copy.view.sources}>
          {sourceChips.map(id => (
            <FilterChip
              key={id}
              label={sourceBucketLabel(id, copy)}
              on={sourceFilter.includes(id)}
              onToggle={() => toggleSidebarSourceFilter(id)}
            />
          ))}
        </ChipRow>
      ) : null}
      {/* PR state stays multi-select: one chip per state. */}
      {prAvailable && (
        <div className="mt-1 flex flex-col gap-1.25">
          <span className="text-[0.78125rem]">{copy.view.prStatus}</span>
          <ChipRow label={copy.view.prStatus}>
            {PR_STATES.map(id => (
              <FilterChip
                key={id}
                label={prLabel(id, f)}
                on={prFilter.includes(id)}
                onToggle={() => toggleSidebarPrFilter(id)}
              />
            ))}
          </ChipRow>
        </div>
      )}
      <div className="mt-1 flex items-center gap-2">
        <span className="flex-1 text-[0.78125rem]">{copy.view.showArchived}</span>
        <Switch
          aria-label={copy.view.showArchived}
          checked={showArchived}
          onCheckedChange={setSidebarShowArchived}
          size="xs"
        />
      </div>
      <MoreFilters copy={copy} f={f} projectsLabel={t.sidebar.projects.home} />
    </div>
  )
}

/** Kept, not in the prototype: per-profile and per-project chips (the scope
 *  chip is the primary project control), and "Show all sessions" for the
 *  project overview — under one disclosure so nothing is lost. */
function MoreFilters({ copy, f, projectsLabel }: { copy: StudioCopy; f: SidebarCopy['filter']; projectsLabel: string }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const showAllProfiles = useStore($showAllProfiles)
  const profileNames = useStore($profiles).map(profile => normalizeProfileKey(profile.name))
  const profileFilter = useStore($sidebarProfileFilter)
  const projects = useStore($projectTree)
  const projectFilter = useStore($sidebarProjectFilter)
  const grouping = useStore($sidebarEffectiveGrouping)
  const showAllSessions = useStore($sidebarShowAllSessions)
  const narrowsByProfile = showAllProfiles && profileNames.length > 1
  const active = profileFilter.length + projectFilter.length > 0

  if (!narrowsByProfile && projects.length <= 1 && grouping !== 'project') {
    return null
  }

  return (
    <div className="mt-1 flex flex-col gap-1.5">
      <button
        aria-expanded={open || active}
        className="flex items-center gap-1 self-start text-[0.78125rem] text-(--ui-text-secondary) hover:text-foreground"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <StudioIcon
          className={cn('transition-transform duration-150', !(open || active) && '-rotate-90')}
          name="chev-d"
          size={11}
          stroke={2.2}
        />
        {copy.view.moreFilters}
      </button>
      {(open || active) && (
        <>
          {grouping === 'project' && (
            <label className="flex h-6 cursor-pointer items-center gap-1.75 text-[0.8125rem]">
              <Checkbox checked={showAllSessions} onCheckedChange={() => setSidebarShowAllSessions(!showAllSessions)} />
              <span>{t.sidebar.projects.showAllSessions}</span>
            </label>
          )}
          {narrowsByProfile && (
            <ChipRow label={f.profile}>
              {profileNames.map(name => (
                <FilterChip
                  key={name}
                  label={name}
                  on={profileFilter.includes(name)}
                  onToggle={() => toggleSidebarProfileFilter(name)}
                />
              ))}
            </ChipRow>
          )}
          {projects.length > 1 && (
            <ChipRow label={f.project}>
              {projects.map(project => (
                <FilterChip
                  key={project.id}
                  // Home is synthetic, so its label is ours to translate.
                  label={project.isNoProject ? projectsLabel : project.label}
                  on={projectFilter.includes(project.id)}
                  onToggle={() => toggleSidebarProjectFilter(project.id)}
                />
              ))}
            </ChipRow>
          )}
        </>
      )}
    </div>
  )
}

interface SidebarViewOptionsProps {
  /** Source buckets present in the list (filter chips). */
  sources: readonly string[]
}

/**
 * View options (prototype `HP.ViewOptions`): one 320px panel for grouping,
 * sorting, row fields, density, inbox style and the filters. Choices apply
 * live and never close the panel; Restore defaults puts everything back.
 */
export function SidebarViewOptions({ sources }: SidebarViewOptionsProps) {
  const { t } = useI18n()
  const copy = t.studio.sidebar
  const f = t.sidebar.filter
  const customized = useStore($studioViewCustomized)
  const grouping = useStore($sidebarEffectiveGrouping)
  const statusFilter = useStore($sidebarStatusFilter)
  const sourceFilter = useStore($sidebarSourceFilter)
  const prFilter = useStore($sidebarPrFilter)
  const profileFilter = useStore($sidebarProfileFilter)
  const projectFilter = useStore($sidebarProjectFilter)
  const showArchived = useStore($sidebarShowArchived)

  const narrowing =
    statusFilter.length + sourceFilter.length + prFilter.length + profileFilter.length + projectFilter.length

  // The trigger turns accent while the view is grouped or narrowed off the default.
  const engaged = grouping !== 'time' || narrowing > 0 || showArchived

  return (
    <Popover>
      <Tip label={copy.sessions.viewOptionsTip} placement="row">
        <PopoverTrigger asChild>
          <Button
            aria-label={copy.sessions.viewOptions}
            className={cn(
              'size-5.5 rounded-[6px] text-(--ui-text-tertiary) hover:bg-(--ui-hover) hover:text-foreground data-[state=open]:bg-(--ui-press)',
              engaged && 'text-(--ui-accent) hover:text-(--ui-accent)'
            )}
            data-slot="sidebar-view-options"
            size="icon-xs"
            variant="ghost"
          >
            <StudioIcon name="filter" size={14} />
          </Button>
        </PopoverTrigger>
      </Tip>
      <PopoverContent
        align="start"
        aria-label={copy.sessions.viewOptions}
        className="flex w-80 flex-col gap-3.5 px-3.5 pt-3 pb-3.5"
        role="dialog"
        variant="menu"
      >
        <div className="flex items-center">
          <span className="flex-1 text-[0.8125rem] font-semibold">{copy.sessions.viewOptions}</span>
          <Button disabled={!customized} onClick={resetStudioSidebarView} size="xs" variant="text">
            {copy.view.reset}
          </Button>
        </div>
        <GroupingChoices copy={copy} />
        <SortChoice copy={copy} f={f} />
        <ShowChoices copy={copy} f={f} />
        <FilterChoices copy={copy} f={f} sources={sources} />
      </PopoverContent>
    </Popover>
  )
}
