import type { ReactNode } from 'react'

import { thisDeviceLabel } from '@/components/studio/pages/device'
import { FormSection } from '@/components/studio/pages/form'
import { DetailBody, DetailHead } from '@/components/studio/pages/master-detail'
import { Callout, CardGrid, GridCard, GridCardFoot, GridCardText, GridCardTop, KeyValueList, ListGroup, ListGroupRow } from '@/components/studio/pages/surfaces'
import { Dot, type DotTone, IconTile, RunRing, Spinner, type TileTone } from '@/components/studio/pages/tile'
import { ActionsContextMenu, ActionsMenu, type MenuKit, renderActionItem } from '@/components/ui/actions-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
import type { AutomationBlueprint, CronJob, SessionInfo } from '@/hermes'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

import { PlatformTile } from '../messaging/platform-tile'
import { PanelEmpty } from '../overlays/panel'

import { formatDuration, formatWhen, isoMs } from './format'

// Presentation of the Automations › Scheduled tab (prototype pages.js:213-247):
// master rows, the job detail, run history rows and blueprint cards. CronView
// (app/cron) keeps every handler, poll and guard; these components only paint.

export interface CronMenuItem {
  danger?: boolean
  disabled?: boolean
  icon: StudioIconName
  key: string
  label: string
  onSelect: () => void
  separatorBefore?: boolean
}

export function renderCronMenu(items: CronMenuItem[]) {
  return (kit: MenuKit) =>
    items.flatMap(item => [
      ...(item.separatorBefore ? [<kit.Separator key={`${item.key}-sep`} />] : []),
      renderActionItem(kit, {
        disabled: item.disabled,
        iconNode: <StudioIcon name={item.icon} size={14} />,
        key: item.key,
        label: item.label,
        onSelect: item.onSelect,
        variant: item.danger ? 'destructive' : 'default'
      })
    ])
}

const DOT_BY_STATE: Record<string, DotTone> = {
  completed: 'gray',
  disabled: 'gray',
  enabled: 'green',
  error: 'red',
  paused: 'gray',
  running: 'green',
  scheduled: 'green'
}

export function cronStateDot(state: string): DotTone {
  return DOT_BY_STATE[state] ?? 'gray'
}

interface CronJobItemProps {
  active: boolean
  menuItems: CronMenuItem[]
  menuLabel: string
  onSelect: () => void
  rowKey: string
  state: string
  subtitle: ReactNode
  title: string
}

/** A job row: status dot · title · schedule and next run. Right-click and the
 *  hover ⋯ open the same actions. */
export function CronJobItem({ active, menuItems, menuLabel, onSelect, rowKey, state, subtitle, title }: CronJobItemProps) {
  return (
    <ActionsContextMenu ariaLabel={menuLabel} contentClassName="w-48" items={renderCronMenu(menuItems)}>
      <div
        className={cn(
          'group/row relative flex w-full items-center rounded-[9px] transition-colors duration-[120ms]',
          active ? 'bg-(--ui-selected)' : 'hover:bg-(--ui-hover)'
        )}
        data-panel-row={rowKey}
      >
        <button
          aria-current={active ? 'true' : undefined}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-[9px] py-[7px] pr-1 pl-[9px] text-left text-[0.8125rem] outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          onClick={onSelect}
          type="button"
        >
          <Dot pulse={state === 'running'} tone={cronStateDot(state)} />
          <span className="flex min-w-0 flex-1 flex-col">
            <b className="truncate font-medium text-(--ui-text-primary)">{title}</b>
            <span className="truncate text-[0.71875rem] text-(--ui-text-tertiary)">{subtitle}</span>
          </span>
        </button>
        <div className="shrink-0 pr-1.5 opacity-0 transition-opacity duration-100 group-focus-within/row:opacity-100 group-hover/row:opacity-100 has-[[data-state=open]]:opacity-100">
          <ActionsMenu ariaLabel={menuLabel} contentClassName="w-48" items={renderCronMenu(menuItems)}>
            <Button aria-label={menuLabel} size="icon-xs" variant="ghost">
              <StudioIcon name="more" size={14} />
            </Button>
          </ActionsMenu>
        </div>
      </div>
    </ActionsContextMenu>
  )
}

interface CronStateTagProps {
  scriptOnly: boolean
  state: string
}

export function CronStateTags({ scriptOnly, state }: CronStateTagProps) {
  const { t } = useI18n()
  const c = t.cron
  const s = t.studio.pages.cron

  const tag =
    state === 'error' ? (
      <Badge size="lg" variant="destructive">
        {s.tagFailed}
      </Badge>
    ) : state === 'scheduled' || state === 'enabled' ? (
      <Badge size="lg" variant="success">
        {s.tagHealthy}
      </Badge>
    ) : state === 'running' ? (
      <Badge size="lg" variant="default">
        {c.states.running ?? state}
      </Badge>
    ) : (
      <Badge size="lg" variant="muted">
        {c.states[state] ?? state}
      </Badge>
    )

  return (
    <>
      {scriptOnly ? (
        <Badge size="lg" variant="muted">
          {c.scriptBadge}
        </Badge>
      ) : null}
      {tag}
    </>
  )
}

/** A delivery target's mark: this device, or the platform's brand tile. */
export function DeliveryMark({ target }: { target: string }) {
  const { t } = useI18n()
  const [platform] = target.split(':')

  if (platform === 'local') {
    return <StudioIcon className="text-(--ui-text-tertiary)" name="window" size={15} />
  }

  return <PlatformTile platformId={platform} platformName={t.cron.deliveryLabels[platform] ?? platform} size={16} />
}

/** Delivery targets with their platform marks ("This Mac", Telegram, …). */
export function DeliveryTargets({ targets }: { targets: string[] }) {
  const { t } = useI18n()
  const labels = t.cron.deliveryLabels

  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {targets.map(target => {
        const [platform] = target.split(':')
        const label = platform === 'local' ? thisDeviceLabel(t) : (labels[platform] ?? target)

        return (
          <span className="inline-flex items-center gap-1.5" key={target}>
            <DeliveryMark target={target} />
            {label}
          </span>
        )
      })}
    </span>
  )
}

interface CronJobDetailViewProps {
  actions: ReactNode
  description: string
  failure: ReactNode
  job: CronJob
  kvRows: { key: string; label: string; value: ReactNode }[]
  runs: ReactNode
  scheduleExpr: string
  scheduleText: string
  scriptOnly: boolean
  state: string
}

export function CronJobDetailView({
  actions,
  description,
  failure,
  job,
  kvRows,
  runs,
  scheduleExpr,
  scheduleText,
  scriptOnly,
  state
}: CronJobDetailViewProps) {
  const { t } = useI18n()
  const s = t.studio.pages.cron
  const showExpr = Boolean(scheduleExpr) && scheduleExpr !== scheduleText

  return (
    <DetailBody key={job.id}>
      <DetailHead
        subtitle={
          <>
            {scheduleText}
            {showExpr ? (
              <>
                {' · '}
                <span className="font-mono">{scheduleExpr}</span>
              </>
            ) : null}
          </>
        }
        title={job.name?.trim() || job.id}
        trailing={<CronStateTags scriptOnly={scriptOnly} state={state} />}
      />
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
      {failure}
      <KeyValueList rows={kvRows} />
      {description ? (
        <FormSection title={scriptOnly && !job.prompt ? s.script : s.prompt}>
          <div className="max-h-56 overflow-auto rounded-xl bg-(--pg-card) px-3.5 py-3 text-[0.8125rem] leading-relaxed whitespace-pre-wrap break-words text-(--ui-text-primary) shadow-(--pg-card-ring)">
            {description}
          </div>
        </FormSection>
      ) : null}
      {runs}
    </DetailBody>
  )
}

export function CronFailureCallout({
  actions,
  error,
  summary
}: {
  actions: ReactNode
  error: string
  summary: string
}) {
  const { t } = useI18n()

  return (
    <Callout tone="warn">
      <span className="break-words" title={error}>
        <b className="font-semibold">{t.studio.pages.cron.lastRunFailed}</b>
        {t.studio.pages.cron.failureSeparator}
        {summary}
      </span>
      <div className="mt-2 flex flex-wrap gap-2">{actions}</div>
    </Callout>
  )
}

// ── Run history ────────────────────────────────────────────────────────────

export interface CronRunRowModel {
  /** Closed run → elapsed seconds; null while it runs or when unknown. */
  durationSeconds: null | number
  live: boolean
  onOpen?: () => void
  outputOnly: boolean
  run: SessionInfo
  startedMs: null | number
  title: string
  viewOnly: boolean
}

function RunLead({ row }: { row: CronRunRowModel }) {
  if (row.live) {
    return <RunRing />
  }

  const name: StudioIconName = row.outputOnly ? 'doc' : row.viewOnly ? 'lock' : 'clock'

  return <StudioIcon className="text-(--ui-text-tertiary)" name={name} size={16} />
}

interface CronRunsListProps {
  count: number
  loading: boolean
  pendingAt?: number
  rows: CronRunRowModel[]
}

export function CronRunsList({ count, loading, pendingAt, rows }: CronRunsListProps) {
  const { locale, t } = useI18n()
  const c = t.cron
  const s = t.studio.pages.cron

  return (
    <FormSection meta={count > 0 ? <span className="tabular-nums">{count}</span> : undefined} title={s.runs}>
      {loading ? (
        <div className="flex items-center gap-1.5 px-1 py-1 text-xs text-(--ui-text-tertiary)">
          <Spinner />
        </div>
      ) : rows.length === 0 && pendingAt === undefined ? (
        <p className="m-0 px-1 text-[0.78125rem] text-(--ui-text-tertiary)">{c.noRuns}</p>
      ) : (
        <ListGroup>
          {pendingAt !== undefined ? (
            // Transient feedback for a trigger the backend accepted but has not
            // turned into a session yet; replaced once the run appears.
            <ListGroupRow>
              <span
                aria-live="polite"
                className="flex min-w-0 flex-1 items-center gap-3"
                data-slot="cron-run-pending"
                role="status"
              >
                <RunRing />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <b className="truncate font-medium text-(--ui-text-primary)">{c.queuedRun}</b>
                  <span className="text-xs text-(--ui-text-tertiary)">{formatWhen(pendingAt, locale)}</span>
                </span>
              </span>
            </ListGroupRow>
          ) : null}
          {rows.map(row => (
            <CronRunRow key={row.run.id} row={row} />
          ))}
        </ListGroup>
      )}
    </FormSection>
  )
}

function CronRunRow({ row }: { row: CronRunRowModel }) {
  const { locale, t } = useI18n()
  const s = t.studio.pages.cron

  const status = row.live
    ? s.runRunning
    : row.durationSeconds !== null
      ? formatDuration(row.durationSeconds, s)
      : row.outputOnly
        ? s.runOutputOnly
        : null

  const subtitle = (
    <>
      {status ? <span>{status}</span> : null}
      {status && row.title ? ' · ' : null}
      {row.title ? <span>{row.title}</span> : null}
      {row.viewOnly ? <span>{` · ${s.runViewOnly}`}</span> : null}
    </>
  )

  const title = row.startedMs !== null ? formatWhen(row.startedMs, locale) : row.run.id

  if (!row.onOpen) {
    return <ListGroupRow lead={<RunLead row={row} />} subtitle={subtitle} title={title} />
  }

  return (
    <ListGroupRow className="p-0" lead={null}>
      <button
        className="flex min-h-11 w-full cursor-pointer items-center gap-3 px-3.5 py-2 text-left outline-none hover:bg-(--ui-hover) focus-visible:bg-(--ui-hover)"
        onClick={row.onOpen}
        type="button"
      >
        <RunLead row={row} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <b className="truncate font-medium text-(--ui-text-primary)">{title}</b>
          <span className="truncate text-xs text-(--ui-text-tertiary)">{subtitle}</span>
        </span>
        <StudioIcon className="text-(--ui-text-tertiary)" name="chev-r" size={12} />
      </button>
    </ListGroupRow>
  )
}

export function runRowModel(
  run: SessionInfo,
  opts: { live: boolean; onOpen?: () => void; outputOnly: boolean; viewOnly: boolean }
): CronRunRowModel {
  const started = run.started_at ?? null
  const ended = run.ended_at ?? null

  return {
    durationSeconds: started !== null && ended !== null && ended >= started ? ended - started : null,
    live: opts.live,
    onOpen: opts.onOpen,
    outputOnly: opts.outputOnly,
    run,
    startedMs: started !== null ? started * 1000 : run.last_active ? run.last_active * 1000 : null,
    title: run.title?.trim() || run.preview?.trim() || '',
    viewOnly: opts.viewOnly
  }
}

// ── Blueprints ─────────────────────────────────────────────────────────────

interface Tile {
  icon: StudioIconName
  tone: TileTone
}

const BLUEPRINT_TILES: Record<string, Tile> = {
  'bill-renewal-watch': { icon: 'card', tone: 'green' },
  'competitor-watch': { icon: 'eye', tone: 'graphite' },
  'custom-reminder': { icon: 'bell', tone: 'orange' },
  'evening-winddown': { icon: 'moon', tone: 'indigo' },
  'gratitude-journal': { icon: 'heart', tone: 'pink' },
  'habit-checkin': { icon: 'check-circle', tone: 'green' },
  'hydration-move': { icon: 'pulse', tone: 'cyan' },
  'important-mail': { icon: 'mail', tone: 'blue' },
  'learn-daily': { icon: 'cap', tone: 'blue' },
  'meal-plan': { icon: 'todo', tone: 'orange' },
  'morning-brief': { icon: 'sun', tone: 'orange' },
  'news-digest': { icon: 'globe', tone: 'red' },
  'on-this-day': { icon: 'rewind', tone: 'brown' },
  'price-watch': { icon: 'chart', tone: 'pink' },
  'weekly-review': { icon: 'graph', tone: 'indigo' },
  'workday-start': { icon: 'bolt', tone: 'teal' }
}

const CATEGORY_TILES: Record<string, Tile> = {
  daily: { icon: 'calendar', tone: 'blue' },
  email: { icon: 'mail', tone: 'blue' },
  weekly: { icon: 'calendar', tone: 'indigo' }
}

export function blueprintTile(blueprint: AutomationBlueprint): Tile {
  const bareKey = blueprint.key.includes(':') ? blueprint.key.split(':').pop()! : blueprint.key

  return BLUEPRINT_TILES[bareKey] ?? CATEGORY_TILES[blueprint.category] ?? { icon: 'sparkle', tone: 'accent' }
}

interface BlueprintCardsProps {
  blueprints: AutomationBlueprint[]
  onUse: (key: string) => void
}

export function BlueprintCards({ blueprints, onUse }: BlueprintCardsProps) {
  const { t } = useI18n()
  const b = t.cron.blueprints
  const a = t.studio.pages.automations

  if (blueprints.length === 0) {
    return <PanelEmpty description={b.emptyDesc} icon="rocket" title={b.emptyTitle} />
  }

  return (
    <CardGrid data-slot="automation-blueprints">
      {blueprints.map(blueprint => {
        const tile = blueprintTile(blueprint)

        return (
          <GridCard data-blueprint={blueprint.key} key={blueprint.key}>
            <GridCardTop
              lead={<IconTile icon={tile.icon} tone={tile.tone} />}
              subtitle={blueprint.plugin ? `${a.blueprintKind} · ${blueprint.plugin}` : a.blueprintKind}
              title={blueprint.title}
            />
            <GridCardText>{blueprint.description}</GridCardText>
            <GridCardFoot>
              <span className="flex-1" />
              <Button aria-label={a.useBlueprintAria(blueprint.title)} onClick={() => onUse(blueprint.key)} size="sm">
                {a.useBlueprint}
              </Button>
            </GridCardFoot>
          </GridCard>
        )
      })}
    </CardGrid>
  )
}

interface CronRowSubtitleOptions {
  inactiveLabel: null | string
  locale?: string
  nextAt: (when: string) => string
  overdue: boolean
  overdueAt: (when: string) => string
  scheduleText: string
}

/** "Every day 9:00 · next tomorrow 9:00" for a list row. */
export function cronRowSubtitle(job: CronJob, opts: CronRowSubtitleOptions): string {
  const nextMs = isoMs(job.next_run_at)

  const tail = opts.inactiveLabel
    ? opts.inactiveLabel
    : nextMs !== null
      ? (opts.overdue ? opts.overdueAt : opts.nextAt)(formatWhen(nextMs, opts.locale))
      : null

  return tail ? `${opts.scheduleText} · ${tail}` : opts.scheduleText
}
