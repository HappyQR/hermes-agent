import { createCronTriggerController, type CronTriggerController } from '@hermes/shared'
import { useStore } from '@nanostores/react'
import { useQuery } from '@tanstack/react-query'
import type * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { PageLoader } from '@/components/page-loader'
import { thisDeviceLabel } from '@/components/studio/pages/device'
import { FORM_ROW_CLASS, FormGroup, FormRow, FormSection } from '@/components/studio/pages/form'
import { StudioMasterDetail } from '@/components/studio/pages/master-detail'
import {
  SheetBody,
  SheetFooter,
  SheetHeader,
  STUDIO_SHEET_BODY,
  STUDIO_SHEET_CONTENT
} from '@/components/studio/pages/sheet'
import { Callout } from '@/components/studio/pages/surfaces'
import { IconTile, Spinner } from '@/components/studio/pages/tile'
import { ActionsMenu } from '@/components/ui/actions-menu'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { SearchField } from '@/components/ui/search-field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Textarea } from '@/components/ui/textarea'
import {
  type AutomationBlueprint,
  createCronJob,
  type CronDeliveryTarget,
  type CronJob,
  deleteCronJob,
  getAutomationBlueprints,
  getCronDeliveryTargets,
  getCronJobRuns,
  instantiateAutomationBlueprint,
  pauseCronJob,
  resumeCronJob,
  type SessionInfo,
  updateCronJob
} from '@/hermes'
import { type Translations, useI18n } from '@/i18n'
import { requestModelOptions } from '@/lib/model-options'
import { asText } from '@/lib/text'
import { cn } from '@/lib/utils'
import { $cronFocusJobId, $cronJobs, invalidateCronJobsRequests, setCronFocusJobId } from '@/store/cron'
import { $changeEventsAvailable, $cronChangeTick } from '@/store/live-sync'
import { notify, notifyError } from '@/store/notifications'
import { $profileScope, ALL_PROFILES } from '@/store/profile'

import {
  BlueprintCards,
  CronFailureCallout,
  CronJobDetailView,
  CronJobItem,
  type CronMenuItem,
  cronRowSubtitle,
  CronRunsList,
  DeliveryMark,
  DeliveryTargets,
  renderCronMenu,
  runRowModel
} from '../automations/cron-ui'
import { formatWhen, isoMs } from '../automations/format'
import { $automationCreateRequest, takeAutomationCreateRequest } from '../automations/requests'
import { cronExpr, cronScheduleText, openLatestCronRun, useScheduleCopy } from '../automations/schedule-copy'
import { SchedulePicker } from '../automations/schedule-picker'
import { useRefreshHotkey } from '../hooks/use-refresh-hotkey'
import { PanelEmpty } from '../overlays/panel'
import type { SetStatusbarItemGroup } from '../shell/statusbar-controls'

import { BlueprintSlotControl, blueprintSlotHelp, cleanBlueprintFieldError, initialBlueprintValues } from './blueprints'
import { mutateAndRefreshCronJobs, refreshCronJobs, triggerAndRefreshCronJobs } from './cron-actions'
import {
  cronEditorUpdates,
  cronModelChoiceValue,
  jobDescription,
  jobIsScriptOnly,
  lastErrorSummary,
  parseCronDeliveryTargets,
  parseCronModelChoiceValue,
  toggleCronDeliveryTarget,
  validateCronEditor
} from './cron-job-model'
import { jobState, jobTitle, nextRunOverdueMs, truncateText } from './job-state'
import { isResumableCronRun, openCronRun, reconcileCronRunVerdicts } from './open-cron-run'

const DEFAULT_DELIVER = 'local'

// Radix <SelectItem> rejects empty-string values, so the "no override" row in
// the model picker carries this sentinel and is mapped back to '' on save.
const MODEL_DEFAULT_VALUE = '__default__'

// "Start from" default: the manual editor (blank cron). Any other value is a
// blueprint key. Blueprint keys never collide with this sentinel.
const CUSTOM_TEMPLATE = 'custom'

function cronProfileForScope(scope: string): string {
  return scope === ALL_PROFILES ? 'all' : scope
}

// A blueprint writes a real per-profile job, and "all" is not a writable target —
// collapse it to 'default', matching the manual create path in handleEditorSave.
// The catalog is fetched for the same profile: plugin blueprints are per profile.
function blueprintProfileForScope(scope: string): string {
  return scope === ALL_PROFILES ? 'default' : scope
}

const truncate = (value: string, max = 80): string => truncateText(value, max)

function jobName(job: CronJob): string {
  return asText(job.name).trim()
}

function jobPrompt(job: CronJob): string {
  return asText(job.prompt)
}

function jobScheduleDisplay(job: CronJob): string {
  return asText(job.schedule_display) || asText(job.schedule?.display) || asText(job.schedule?.expr) || '—'
}

function jobScheduleExpr(job: CronJob): string {
  return asText(job.schedule?.expr) || asText(job.schedule_display) || ''
}

function jobDeliver(job: CronJob): string {
  return asText(job.deliver) || DEFAULT_DELIVER
}

function jobModel(job: CronJob): string {
  return asText(job.model).trim()
}

function jobProvider(job: CronJob): string {
  return asText(job.provider).trim()
}

function matchesQuery(job: CronJob, q: string): boolean {
  if (!q) {
    return true
  }

  const needle = q.toLowerCase()

  return [jobTitle(job), jobPrompt(job), jobScheduleDisplay(job), jobScheduleExpr(job), jobDeliver(job)].some(value =>
    value.toLowerCase().includes(needle)
  )
}

interface CronViewProps extends React.ComponentProps<'section'> {
  /** Legacy overlay close; the Automations page hosts the view in place. */
  onClose?: () => void
  onOpenSession?: (sessionId: string, session?: SessionInfo) => void
  /** Which Automations tab this instance paints: the jobs master/detail or the blueprint cards. */
  section?: 'blueprints' | 'jobs'
  setStatusbarItemGroup?: SetStatusbarItemGroup
}

export function CronView({
  onOpenSession,
  section = 'jobs',
  setStatusbarItemGroup: _setStatusbarItemGroup
}: CronViewProps) {
  const { t } = useI18n()
  const c = t.cron
  // Source of truth is the shared atom (also fed by the controller poll), so the
  // sidebar and this page never drift — a delete here clears the sidebar row
  // immediately. `loading` only gates the first paint before the atom is filled.
  const jobs = useStore($cronJobs)
  const [loading, setLoading] = useState(jobs.length === 0)
  const [query, setQuery] = useState('')
  const [busyJobTokens, setBusyJobTokens] = useState<ReadonlyMap<string, symbol>>(() => new Map())
  const [triggeringJobKeys, setTriggeringJobKeys] = useState<ReadonlySet<string>>(() => new Set())
  const triggerControllerRef = useRef<CronTriggerController | null>(null)
  // Accepted-but-unmaterialized triggers, by `${profile}:${jobId}`. The ref is
  // written before the state set, so a queued row appears synchronously with
  // the click and the controller guard has no untracked window.
  const pendingTriggersRef = useRef(new Map<string, number>())
  const [pendingTriggers, setPendingTriggers] = useState<ReadonlyMap<string, number>>(() => new Map())

  // eslint-disable-next-line no-restricted-syntax -- controller mount identity, not an atom mirror
  useEffect(() => {
    const controller = createCronTriggerController((key, running) => {
      if (triggerControllerRef.current !== controller) {
        return
      }

      setTriggeringJobKeys(current => {
        const next = new Set(current)

        if (running) {
          next.add(key)
        } else {
          next.delete(key)
        }

        return next
      })
    })

    triggerControllerRef.current = controller

    return () => {
      triggerControllerRef.current = null
    }
  }, [])

  // Master/detail: the job whose schedule + run history fill the right pane.
  const [selectedJobId, setSelectedJobId] = useState<null | string>(null)
  // Set when a job is opened from the sidebar so we scroll it into view once the
  // row exists. Cleared after the scroll fires.
  const pendingScrollRef = useRef<null | string>(null)
  const focusJobId = useStore($cronFocusJobId)

  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' })
  const [pendingDelete, setPendingDelete] = useState<CronJob | null>(null)

  // The page head's "New scheduled job…" (it may be picked before this tab mounted).
  const createRequest = useStore($automationCreateRequest)

  useEffect(() => {
    if (createRequest === 'cron' && takeAutomationCreateRequest('cron')) {
      setEditor({ mode: 'create' })
    }
  }, [createRequest])

  // Jobs live per-profile on disk and the list endpoint aggregates 'all' by
  // default — scope the fetch to the sidebar's profile scope so this page
  // and the sidebar (which share the $cronJobs atom) agree on what's shown.
  const profileScope = useStore($profileScope)
  const profile = cronProfileForScope(profileScope)

  const refresh = useCallback(async () => {
    const { refreshError, stale } = await refreshCronJobs(profile)

    if (stale) {
      return
    }

    if (refreshError) {
      notifyError(refreshError, c.failedLoad)
    }

    setLoading(false)
  }, [c, profile])

  useRefreshHotkey(refresh)

  useEffect(() => {
    void refresh()
    // Fence the previous profile's request before the next profile effect, and
    // fence every pending completion when the page unmounts.

    return () => invalidateCronJobsRequests()
  }, [refresh])

  // Sidebar → "open this job": resolve the focus id (or name) to a job, select
  // it, queue a scroll, then clear the one-shot focus so re-opening cron
  // normally doesn't re-trigger it.
  // eslint-disable-next-line no-restricted-syntax -- legitimate non-atom ref write (see eslint rule comment)
  useEffect(() => {
    if (!focusJobId) {
      return
    }

    const match = jobs.find(job => job.id === focusJobId || jobName(job) === focusJobId)

    if (match) {
      setSelectedJobId(match.id)
      pendingScrollRef.current = match.id
    }

    setCronFocusJobId(null)
  }, [focusJobId, jobs])

  const visibleJobs = useMemo(
    () => jobs.filter(job => matchesQuery(job, query.trim())).sort((a, b) => jobTitle(a).localeCompare(jobTitle(b))),
    [jobs, query]
  )

  // Blueprint recipes fill the Blueprints tab — "Use" opens the create sheet
  // pre-seeded to that recipe. Same query key as the sheet, so the catalog is
  // fetched once.
  const blueprintProfile = blueprintProfileForScope(profileScope)

  const blueprintsQuery = useQuery({
    queryKey: ['cron-blueprints', blueprintProfile],
    queryFn: async () => (await getAutomationBlueprints(blueprintProfile)).blueprints
  })

  // Detail always reflects a concrete job: the explicitly selected one, else the
  // first visible row, so the right pane is never empty while jobs exist.
  const selectedJob = useMemo(
    () => visibleJobs.find(job => job.id === selectedJobId) ?? visibleJobs[0] ?? null,
    [visibleJobs, selectedJobId]
  )

  // Scroll a sidebar-opened job into view once its list row is mounted.
  // eslint-disable-next-line no-restricted-syntax -- legitimate non-atom ref write (see eslint rule comment)
  useEffect(() => {
    const target = pendingScrollRef.current

    if (!target || selectedJob?.id !== target) {
      return
    }

    pendingScrollRef.current = null
    requestAnimationFrame(() => {
      document.querySelector(`[data-panel-row="${CSS.escape(target)}"]`)?.scrollIntoView({ block: 'nearest' })
    })
  }, [selectedJob])

  function beginJobBusy(jobId: string): symbol {
    const token = Symbol(jobId)

    setBusyJobTokens(current => new Map(current).set(jobId, token))

    return token
  }

  function endJobBusy(jobId: string, token: symbol): void {
    setBusyJobTokens(current => {
      if (current.get(jobId) !== token) {
        return current
      }

      const next = new Map(current)

      next.delete(jobId)

      return next
    })
  }

  async function handlePauseResume(job: CronJob) {
    const busyToken = beginJobBusy(job.id)

    try {
      const isPaused = jobState(job) === 'paused'

      const { refreshError, stale } = await mutateAndRefreshCronJobs(profile, () =>
        isPaused ? resumeCronJob(job.id) : pauseCronJob(job.id)
      )

      if (stale) {
        return
      }

      if (refreshError) {
        notifyError(refreshError, c.failedLoad)
      }

      notify({
        kind: 'success',
        title: isPaused ? c.resumed : c.paused,
        message: truncate(jobTitle(job), 60)
      })
    } catch (err) {
      notifyError(err, c.failedUpdate)
    } finally {
      endJobBusy(job.id, busyToken)
    }
  }

  const settlePendingTrigger = useCallback((key: string, requestedAt: number) => {
    if (pendingTriggersRef.current.get(key) !== requestedAt) {
      return
    }

    pendingTriggersRef.current.delete(key)
    setPendingTriggers(current => {
      if (current.get(key) !== requestedAt) {
        return current
      }

      const next = new Map(current)

      next.delete(key)

      return next
    })
  }, [])

  async function handleTrigger(job: CronJob) {
    const viewProfile = profile
    const key = `${viewProfile}:${job.id}`
    const controller = triggerControllerRef.current

    if (!controller) {
      return
    }

    const requestedAt = Date.now()

    // Optimistic queued-run feedback: the row is painted from the click, not
    // from the backend materializing the session (which can take tens of
    // seconds); it settles when Run History observes the run or times out.
    // Ref first so the busy render and the controller guard share one instant.
    pendingTriggersRef.current.set(key, requestedAt)
    setPendingTriggers(current => new Map(current).set(key, requestedAt))

    try {
      const run = await controller.run(
        key,
        () => triggerAndRefreshCronJobs(job.id, viewProfile),
        () => notify({ kind: 'info', title: c.triggerNow, message: truncate(jobTitle(job), 60) })
      )

      if (
        triggerControllerRef.current !== controller ||
        cronProfileForScope($profileScope.get()) !== viewProfile ||
        !run.started ||
        !run.value
      ) {
        return
      }

      const { refreshError, stale } = run.value

      if (stale) {
        return
      }

      if (refreshError) {
        notifyError(refreshError, c.failedLoad)
      }

      notify({ kind: 'success', title: c.triggered, message: truncate(jobTitle(job), 60) })
    } catch (err) {
      if (triggerControllerRef.current === controller && cronProfileForScope($profileScope.get()) === viewProfile) {
        notifyError(err, c.failedTrigger)
      }

      // The request never reached the backend; the queued row is a lie.
      settlePendingTrigger(key, requestedAt)
    }
  }

  // Throws on failure — ConfirmDialog reports it inline and stays open.
  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return
    }

    const { refreshError, stale } = await mutateAndRefreshCronJobs(profile, () => deleteCronJob(pendingDelete.id))

    if (stale) {
      return
    }

    if (refreshError) {
      notifyError(refreshError, c.failedLoad)
    }

    notify({ kind: 'success', title: c.deleted, message: truncate(jobTitle(pendingDelete), 60) })
  }

  async function handleEditorSave(values: EditorValues) {
    if (editor.mode === 'create') {
      const {
        value: created,
        refreshError,
        stale
      } = await mutateAndRefreshCronJobs(profile, () =>
        createCronJob({
          prompt: values.prompt,
          schedule: values.schedule,
          name: values.name || undefined,
          deliver: values.deliver || DEFAULT_DELIVER,
          ...(values.model.trim() ? { model: values.model.trim(), provider: values.provider.trim() || undefined } : {})
        })
      )

      if (stale || !created) {
        return
      }

      if (refreshError) {
        notifyError(refreshError, c.failedLoad)
      }

      notify({ kind: 'success', title: c.created, message: truncate(jobTitle(created), 60) })
      setSelectedJobId(created.id)
    } else if (editor.mode === 'edit') {
      const scriptOnlyJob = jobIsScriptOnly(editor.job)

      const {
        value: updated,
        refreshError,
        stale
      } = await mutateAndRefreshCronJobs(profile, () =>
        updateCronJob(editor.job.id, cronEditorUpdates(values, { scriptOnlyJob }))
      )

      if (stale || !updated) {
        return
      }

      if (refreshError) {
        notifyError(refreshError, c.failedLoad)
      }

      notify({ kind: 'success', title: c.updated, message: truncate(jobTitle(updated), 60) })
    }

    setEditor({ mode: 'closed' })
  }

  // Blueprint instantiation is a distinct backend path (fills typed slots, then
  // creates the job) so it can't share the raw-cron onSave contract. Merge the
  // created job into $cronJobs like every other create path.
  async function handleBlueprintCreate(blueprint: AutomationBlueprint, values: Record<string, string>) {
    const writableProfile = blueprintProfile

    const {
      value: job,
      refreshError,
      stale
    } = await mutateAndRefreshCronJobs(profile, () =>
      instantiateAutomationBlueprint({ blueprint: blueprint.key, values }, writableProfile)
    )

    if (stale || !job) {
      return
    }

    if (refreshError) {
      notifyError(refreshError, c.failedLoad)
    }

    notify({ kind: 'success', title: c.blueprints.scheduled, message: asText(job.schedule_display) || blueprint.title })
    setEditor({ mode: 'closed' })
  }

  const actions: CronJobActions = {
    onDelete: job => setPendingDelete(job),
    onDuplicate: job => setEditor({ mode: 'create', seed: job }),
    onEdit: job => setEditor({ mode: 'edit', job }),
    onOpenLatestRun: onOpenSession ? job => openLatestRun(job.id, onOpenSession, t) : undefined
  }

  const dialogs = (
    <>
      <CronEditorDialog
        blueprintProfile={blueprintProfile}
        editor={editor}
        onBlueprintCreate={handleBlueprintCreate}
        onClose={() => setEditor({ mode: 'closed' })}
        onSave={handleEditorSave}
      />
      <CronDeleteConfirm job={pendingDelete} onClose={() => setPendingDelete(null)} onConfirm={handleConfirmDelete} />
    </>
  )

  if (section === 'blueprints') {
    return (
      <>
        <p className="m-0 text-[0.84375rem] text-(--ui-text-tertiary)">{t.studio.pages.automations.blueprintsIntro}</p>
        {blueprintsQuery.isPending ? (
          <PageLoader label={c.blueprints.loading} />
        ) : (
          <BlueprintCards
            blueprints={blueprintsQuery.data ?? []}
            onUse={blueprintKey => setEditor({ blueprintKey, mode: 'create' })}
          />
        )}
        {dialogs}
      </>
    )
  }

  const selectedKey = selectedJob ? `${profile}:${selectedJob.id}` : ''

  return (
    <>
      {loading && jobs.length === 0 ? (
        <PageLoader label={c.loading} />
      ) : jobs.length === 0 ? (
        <PanelEmpty
          action={
            <Button onClick={() => setEditor({ mode: 'create' })} size="sm">
              {c.newCron}
            </Button>
          }
          description={c.emptyDescNew}
          icon="watch"
          title={c.emptyTitleNew}
        />
      ) : (
        <StudioMasterDetail
          detail={
            selectedJob ? (
              <CronJobDetail
                actions={actions}
                busy={busyJobTokens.has(selectedJob.id) || triggeringJobKeys.has(selectedKey)}
                c={c}
                job={selectedJob}
                onOpenSession={onOpenSession}
                onPauseResume={() => void handlePauseResume(selectedJob)}
                onPendingRunSettled={settlePendingTrigger}
                onTrigger={() => void handleTrigger(selectedJob)}
                pendingJobKey={selectedKey}
                pendingRunAt={pendingTriggers.get(selectedKey)}
              />
            ) : (
              <PanelEmpty description={c.emptyDescSearch} icon="search" />
            )
          }
          list={
            <CronJobList
              actions={actions}
              jobs={visibleJobs}
              onSelect={setSelectedJobId}
              query={query}
              selectedId={selectedJob?.id ?? null}
            />
          }
          listHeader={
            <SearchField
              aria-label={c.search}
              containerClassName="w-full"
              hints={jobs
                .map(jobTitle)
                .filter(Boolean)
                .slice(0, 5)
                .map(title => t.common.tryHint(title))}
              onChange={setQuery}
              placeholder={c.search}
              value={query}
              variant="filled"
            />
          }
          listLabel={t.studio.pages.cron.listLabel}
        />
      )}
      {dialogs}
    </>
  )
}

interface CronJobActions {
  onDelete: (job: CronJob) => void
  onDuplicate: (job: CronJob) => void
  onEdit: (job: CronJob) => void
  onOpenLatestRun?: (job: CronJob) => void
}

function openLatestRun(jobId: string, open: (sessionId: string, session?: SessionInfo) => void, t: Translations) {
  openLatestCronRun(jobId, open, () =>
    notify({ kind: 'info', title: t.studio.pages.cron.openLatestRun, message: t.studio.pages.cron.noRunsToOpen })
  ).catch(err => notifyError(err, t.cron.failedLoad))
}

function cronMenuItems(job: CronJob, actions: CronJobActions, t: Translations, includeEdit: boolean): CronMenuItem[] {
  const s = t.studio.pages

  return [
    ...(includeEdit
      ? [{ icon: 'pencil' as const, key: 'edit', label: s.common.edit, onSelect: () => actions.onEdit(job) }]
      : []),
    {
      // A script-only job cannot be created from the desktop (no prompt to send).
      disabled: jobIsScriptOnly(job),
      icon: 'copy',
      key: 'duplicate',
      label: s.cron.duplicate,
      onSelect: () => actions.onDuplicate(job)
    },
    {
      disabled: !actions.onOpenLatestRun,
      icon: 'bubbles',
      key: 'latest-run',
      label: s.cron.openLatestRun,
      onSelect: () => actions.onOpenLatestRun?.(job)
    },
    {
      danger: true,
      icon: 'trash',
      key: 'delete',
      label: s.common.deleteEllipsis,
      onSelect: () => actions.onDelete(job),
      separatorBefore: true
    }
  ]
}

function CronJobList({
  actions,
  jobs,
  onSelect,
  query,
  selectedId
}: {
  actions: CronJobActions
  jobs: CronJob[]
  onSelect: (id: string) => void
  query: string
  selectedId: null | string
}) {
  const { locale, t } = useI18n()
  const c = t.cron
  const s = t.studio.pages.cron
  const copy = useScheduleCopy()

  if (jobs.length === 0) {
    return (
      <p className="px-2 py-4 text-center text-xs text-(--ui-text-tertiary)">
        {query.trim() ? c.emptyTitleSearch : c.emptyTitleNew}
      </p>
    )
  }

  return (
    <>
      {jobs.map(job => {
        const state = jobState(job)

        return (
          <CronJobItem
            active={selectedId === job.id}
            key={job.id}
            menuItems={cronMenuItems(job, actions, t, true)}
            menuLabel={t.studio.pages.common.moreActions}
            onSelect={() => onSelect(job.id)}
            rowKey={job.id}
            state={state}
            subtitle={cronRowSubtitle(job, {
              inactiveLabel: INACTIVE_ROW_STATES.has(state) ? (c.states[state] ?? state) : null,
              locale,
              nextAt: s.nextAt,
              overdue: nextRunOverdueMs(job) !== null,
              overdueAt: s.overdueAt,
              scheduleText: cronScheduleText(job, copy)
            })}
            title={jobTitle(job)}
          />
        )
      })}
    </>
  )
}

// Rows of these states say so instead of a next run time.
const INACTIVE_ROW_STATES = new Set(['completed', 'disabled', 'paused'])

function CronDeleteConfirm({
  job,
  onClose,
  onConfirm
}: {
  job: CronJob | null
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const { t } = useI18n()
  const s = t.studio.pages.cron

  return (
    <ConfirmDialog
      busyLabel={t.cron.deleting}
      confirmLabel={t.common.delete}
      description={job ? s.deleteBody : null}
      destructive
      onClose={onClose}
      onConfirm={onConfirm}
      open={job !== null}
      title={job ? s.deleteNamed(truncate(jobTitle(job), 60)) : t.cron.deleteTitle}
    />
  )
}

interface CronJobDetailProps {
  actions: CronJobActions
  busy: boolean
  c: Translations['cron']
  job: CronJob
  onOpenSession?: (sessionId: string, session?: SessionInfo) => void
  onPauseResume: () => void
  onPendingRunSettled: (key: string, requestedAt: number) => void
  onTrigger: () => void
  pendingJobKey?: string
  pendingRunAt?: number
}

function CronJobDetail({
  actions,
  busy,
  c,
  job,
  onOpenSession,
  onPauseResume,
  onPendingRunSettled,
  onTrigger,
  pendingJobKey,
  pendingRunAt
}: CronJobDetailProps) {
  const { locale, t } = useI18n()
  const s = t.studio.pages
  const copy = useScheduleCopy()
  const state = jobState(job)
  const isPaused = state === 'paused'
  const scriptOnly = jobIsScriptOnly(job)
  const modelOverride = jobModel(job)
  const overdue = nextRunOverdueMs(job) !== null
  const nextMs = isoMs(job.next_run_at)
  const lastMs = isoMs(job.last_run_at)
  const pending = pendingRunAt !== undefined

  return (
    <CronJobDetailView
      actions={
        <>
          <Button aria-busy={pending || undefined} disabled={busy} onClick={onTrigger}>
            {pending ? <Spinner /> : <StudioIcon name="play" size={13} />}
            {s.cron.triggerNow}
          </Button>
          <Button disabled={busy} onClick={onPauseResume} variant="secondary">
            {isPaused ? c.resumeTitle : c.pauseTitle}
          </Button>
          <Button disabled={busy} onClick={() => actions.onEdit(job)} variant="secondary">
            {s.common.edit}
          </Button>
          <ActionsMenu
            ariaLabel={s.common.moreActions}
            contentClassName="w-56"
            items={renderCronMenu(cronMenuItems(job, actions, t, false))}
          >
            <Button aria-label={s.common.moreActions} size="icon-sm" variant="ghost">
              <StudioIcon name="more" size={15} />
            </Button>
          </ActionsMenu>
        </>
      }
      description={jobDescription(job)}
      failure={
        job.last_error ? (
          <CronFailureCallout
            actions={
              <>
                <Button disabled={busy} onClick={() => actions.onEdit(job)} size="sm" variant="outline">
                  {c.editJob}
                </Button>
                <Button disabled={busy} onClick={onTrigger} size="sm" variant="outline">
                  {c.runAgain}
                </Button>
              </>
            }
            error={job.last_error}
            summary={lastErrorSummary(job.last_error)}
          />
        ) : null
      }
      job={job}
      kvRows={[
        {
          key: 'next',
          label: overdue ? s.cron.kvOverdue : s.cron.kvNext,
          value: nextMs !== null ? formatWhen(nextMs, locale) : isPaused ? (c.states.paused ?? state) : '—'
        },
        { key: 'last', label: s.cron.kvLast, value: lastMs !== null ? formatWhen(lastMs, locale) : '—' },
        {
          key: 'deliver',
          label: s.cron.kvDeliver,
          value: <DeliveryTargets targets={parseCronDeliveryTargets(jobDeliver(job))} />
        },
        ...(scriptOnly ? [] : [{ key: 'model', label: s.cron.kvModel, value: modelOverride || s.cron.modelDefault }])
      ]}
      runs={
        <CronJobRuns
          c={c}
          jobId={job.id}
          onOpenSession={onOpenSession}
          onPendingRunSettled={onPendingRunSettled}
          pendingJobKey={pendingJobKey}
          pendingRunAt={pendingRunAt}
        />
      }
      scheduleExpr={cronExpr(job)}
      scheduleText={cronScheduleText(job, copy)}
      scriptOnly={scriptOnly}
      state={state}
    />
  )
}

// Script-only (no_agent) jobs have no agent sessions; the runs endpoint
// surfaces their per-fire output docs as rows with source='cron_output'
// (see _list_cron_output_runs in hermes_cli/web_routers/cron.py).
function isSyntheticCronOutputRun(run: SessionInfo): boolean {
  return run.source === 'cron_output'
}

// Runs are produced by the background scheduler tick. cron.changed /
// sessions.changed broadcasts re-load immediately on event-capable backends
// (the tick dep below), so the poll drops to a slow backstop there; older
// backends keep the legacy cadence. While a trigger is queued, poll fast.
const RUNS_POLL_INTERVAL_MS = 8000
const RUNS_BACKSTOP_INTERVAL_MS = 60_000
const PENDING_RUNS_POLL_INTERVAL_MS = 1000
// A run created moments before the click (another surface's trigger, or a
// scheduler tick racing the button) must not be mistaken for this click's run
// — but clock skew between renderer and backend can date it slightly early.
const PENDING_RUN_START_SLACK_MS = 2000
// Bounded even if the backend never materializes the run (claimed by a window
// that died, scheduler paused, …): the queued row is transient feedback, not a
// persistent record.
const PENDING_RUN_TIMEOUT_MS = 90_000

function CronJobRuns({
  c,
  jobId,
  onOpenSession,
  onPendingRunSettled,
  pendingJobKey,
  pendingRunAt
}: {
  c: Translations['cron']
  jobId: string
  onOpenSession?: (sessionId: string, session?: SessionInfo) => void
  onPendingRunSettled: (key: string, requestedAt: number) => void
  pendingJobKey?: string
  pendingRunAt?: number
}) {
  const [runs, setRuns] = useState<null | SessionInfo[]>(null)
  const changeEventsAvailable = useStore($changeEventsAvailable)
  const cronChangeTick = useStore($cronChangeTick)

  const pending = pendingRunAt !== undefined

  useEffect(() => {
    let cancelled = false

    const load = () =>
      getCronJobRuns(jobId)
        .then(result => {
          // A fresh poll re-evaluates every run already opened (#88443).
          reconcileCronRunVerdicts(result)

          if (!cancelled) {
            setRuns(result)

            // The queued row is settled by the run this trigger produced:
            // any run that started after the click. Looking at the whole
            // snapshot (not just a diff against the last poll) avoids
            // missing a run that landed between two loads.
            if (pendingRunAt !== undefined && pendingJobKey !== undefined) {
              const started = result.some(run => {
                const startedAtMs = (run.started_at || run.last_active || 0) * 1000

                return startedAtMs >= pendingRunAt - PENDING_RUN_START_SLACK_MS
              })

              if (started) {
                onPendingRunSettled(pendingJobKey, pendingRunAt)
              }
            }
          }
        })
        .catch(() => {
          if (!cancelled) {
            setRuns(prev => prev ?? [])
          }
        })

    void load()

    const intervalId = window.setInterval(
      () => {
        if (document.visibilityState === 'visible') {
          void load()
        }
      },
      pending
        ? PENDING_RUNS_POLL_INTERVAL_MS
        : changeEventsAvailable
          ? RUNS_BACKSTOP_INTERVAL_MS
          : RUNS_POLL_INTERVAL_MS
    )

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void load()
      }
    }

    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisible)
    }
    // cronChangeTick: a fired run moves jobs.json bookkeeping → reload now.
  }, [changeEventsAvailable, cronChangeTick, jobId, onPendingRunSettled, pending, pendingJobKey, pendingRunAt])

  // Bounded life for the queued row: even on an event-capable backend (where
  // the fast poll above may be the only prober), the feedback disappears and
  // the action unlocks once the wait is clearly unrecoverable.
  useEffect(() => {
    if (pendingRunAt === undefined || pendingJobKey === undefined) {
      return
    }

    const remainingMs = Math.max(0, pendingRunAt + PENDING_RUN_TIMEOUT_MS - Date.now())
    const timeoutId = window.setTimeout(() => onPendingRunSettled(pendingJobKey, pendingRunAt), remainingMs)

    return () => window.clearTimeout(timeoutId)
  }, [onPendingRunSettled, pendingJobKey, pendingRunAt])

  // One click to the run's transcript; a run the scheduler never closed opens
  // view-only (see `openCronRun`, #88443). Output-doc rows (script-only jobs)
  // have no backing session, so they are not clickable.
  const rows = (runs ?? []).map(run =>
    isSyntheticCronOutputRun(run)
      ? runRowModel(run, { live: false, outputOnly: true, viewOnly: false })
      : runRowModel(run, {
          live: run.ended_at == null && isResumableCronRun(run),
          onOpen: onOpenSession ? () => openCronRun(run, onOpenSession) : undefined,
          outputOnly: false,
          viewOnly: !isResumableCronRun(run)
        })
  )

  return (
    <CronRunsList
      count={(runs?.length ?? 0) + (pending ? 1 : 0)}
      loading={runs === null && !pending}
      pendingAt={pendingRunAt}
      rows={rows}
    />
  )
}

// Label a cron delivery target: 'local' → this device, known platforms → their
// delivery label, anything else → the backend name. Configured platforms
// without a cron home channel get a "set a home channel first" hint.
function deliverTargetLabel(target: CronDeliveryTarget, t: Translations): string {
  const c = t.cron

  const base = target.id === 'local' ? thisDeviceLabel(t) : (c.deliveryLabels[target.id] ?? target.name)

  return target.id !== 'local' && !target.home_target_set ? `${base} — ${c.deliverNeedsHomeChannel}` : base
}

// The delivery-target checkbox group, shared by the manual cron editor and the
// blueprint form. The scheduler accepts comma-separated targets, so users can
// keep results local while also sending them to connected platforms. Preserve
// selected targets missing from discovery so editing never drops a saved route.
// The group is named by the element `${id}-label` (the section heading).
export function DeliverCheckboxes({
  c,
  id,
  onChange,
  targets,
  value
}: {
  c: Translations['cron']
  id: string
  onChange: (next: string) => void
  targets: CronDeliveryTarget[]
  value: string
}) {
  const { t } = useI18n()
  const selected = parseCronDeliveryTargets(value)
  const knownIds = new Set(targets.map(target => target.id))

  const options = [
    ...targets,
    ...selected
      .filter(target => !knownIds.has(target))
      .map(target => ({ home_env_var: null, home_target_set: true, id: target, name: target }))
  ]

  return (
    <FormGroup aria-labelledby={`${id}-label`} id={id} role="group">
      {options.map((target, index) => {
        const checked = selected.includes(target.id)
        const checkboxId = `${id}-${index}`

        return (
          <label
            className={cn(
              FORM_ROW_CLASS,
              'cursor-pointer @max-[28rem]/form-group:flex-row @max-[28rem]/form-group:items-center'
            )}
            data-slot="form-row"
            htmlFor={checkboxId}
            key={target.id}
          >
            <Checkbox
              checked={checked}
              id={checkboxId}
              onCheckedChange={next => onChange(toggleCronDeliveryTarget(value, target.id, next === true))}
            />
            <DeliveryMark target={target.id} />
            <span className="min-w-0 flex-1">{deliverTargetLabel(target, t)}</span>
          </label>
        )
      })}
    </FormGroup>
  )
}

// The per-job model override as a provider/model select (configured providers
// with available models only — the chat model picker's gate).
function CronModelSelect({
  c,
  modelChoice,
  modelProviders,
  onChange
}: {
  c: Translations['cron']
  modelChoice: string
  modelProviders: { models?: string[]; name: string; slug: string }[]
  onChange: (value: string) => void
}) {
  // A previously pinned model that has since left the catalog (provider
  // removed / model retired) would render Radix's blank trigger. Keep the
  // stored pin visible and re-selectable rather than silently dropping it.
  const modelChoiceKnown =
    modelChoice === MODEL_DEFAULT_VALUE ||
    modelProviders.some(provider =>
      (provider.models ?? []).some(model => cronModelChoiceValue(provider.slug, model) === modelChoice)
    )

  return (
    <Select onValueChange={onChange} value={modelChoice}>
      <SelectTrigger className="h-7 w-56 max-w-full rounded-[7px]" id="cron-model">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={MODEL_DEFAULT_VALUE}>{c.modelDefault}</SelectItem>
        {!modelChoiceKnown && (
          <SelectItem className="font-mono" value={modelChoice}>
            {parseCronModelChoiceValue(modelChoice)?.model ?? modelChoice}
          </SelectItem>
        )}
        {modelProviders.map(provider => (
          <SelectGroup key={provider.slug}>
            <SelectLabel>{provider.name}</SelectLabel>
            {(provider.models ?? []).map(model => {
              const value = cronModelChoiceValue(provider.slug, model)

              return (
                <SelectItem className="font-mono" key={value} value={value}>
                  {model}
                </SelectItem>
              )
            })}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

function CronEditorDialog({
  blueprintProfile,
  editor,
  onBlueprintCreate,
  onClose,
  onSave
}: {
  blueprintProfile: string
  editor: EditorState
  onBlueprintCreate: (blueprint: AutomationBlueprint, values: Record<string, string>) => Promise<void>
  onClose: () => void
  onSave: (values: EditorValues) => Promise<void>
}) {
  const { t } = useI18n()
  const c = t.cron
  const s = t.studio.pages.cron.sheet
  const open = editor.mode !== 'closed'
  const isEdit = editor.mode === 'edit'
  const initial = isEdit ? editor.job : null
  // "Duplicate job" opens the create sheet seeded from an existing job.
  const seed = editor.mode === 'create' ? (editor.seed ?? null) : null
  const scriptOnlyJob = initial ? jobIsScriptOnly(initial) : false

  const [name, setName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [schedule, setSchedule] = useState('')
  // Remounts the schedule picker so its draft re-seeds for each opened job.
  const [pickerKey, setPickerKey] = useState(0)
  const [deliver, setDeliver] = useState(DEFAULT_DELIVER)
  // Per-job model override encoded as an opaque provider/model pair.
  // MODEL_DEFAULT_VALUE = follow the global default.
  const [modelChoice, setModelChoice] = useState(MODEL_DEFAULT_VALUE)
  // Blueprint fills typed slots (time/enum/weekdays/text) instead of the raw
  // cron fields; the backend renders the prompt + schedule from them.
  const [slotValues, setSlotValues] = useState<Record<string, string>>({})
  // Create mode can start from a ready-made blueprint instead of a blank cron:
  // CUSTOM_TEMPLATE = the manual editor; any other value is a blueprint key
  // (set by a Blueprints card's "Use") that swaps the form for its typed slots.
  const [templateChoice, setTemplateChoice] = useState(CUSTOM_TEMPLATE)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<null | string>(null)

  // The blueprint catalog resolves a card's key; it's meaningless when editing
  // an existing job, so skip the fetch there.
  const blueprintsQuery = useQuery({
    queryKey: ['cron-blueprints', blueprintProfile],
    queryFn: async () => (await getAutomationBlueprints(blueprintProfile)).blueprints,
    enabled: open && !isEdit
  })

  const blueprintList = blueprintsQuery.data ?? []

  const blueprint =
    templateChoice === CUSTOM_TEMPLATE ? null : (blueprintList.find(item => item.key === templateChoice) ?? null)

  const isBlueprint = blueprint !== null

  // Same catalog the chat model picker uses: configured providers and their
  // actually-available models only. Script-only + blueprint forms never pick a
  // model here, so skip the fetch entirely for them.
  const modelOptions = useQuery({
    queryKey: ['model-options', 'global'],
    queryFn: () => requestModelOptions({}),
    enabled: open && !scriptOnlyJob && !isBlueprint
  })

  // Single source of truth for where a cron can deliver (local + configured
  // gateways) — same endpoint the dashboard uses, so no sheet offers a platform
  // that isn't connected. Shared by the manual editor and the blueprint form.
  const deliveryTargets = useQuery({
    queryKey: ['cron-delivery-targets'],
    queryFn: getCronDeliveryTargets,
    enabled: open
  })

  useEffect(() => {
    if (!open) {
      return
    }

    const source = initial ?? seed

    setName(initial ? jobName(initial) : seed ? t.studio.pages.cron.copyName(jobTitle(seed)) : '')
    setPrompt(source ? jobPrompt(source) : '')
    setSchedule(source ? jobScheduleExpr(source) : DEFAULT_SCHEDULE)
    setPickerKey(key => key + 1)
    setDeliver(source ? jobDeliver(source) : DEFAULT_DELIVER)
    setModelChoice(
      source && jobModel(source) ? cronModelChoiceValue(jobProvider(source), jobModel(source)) : MODEL_DEFAULT_VALUE
    )
    setSlotValues({})
    setTemplateChoice(editor.mode === 'create' ? (editor.blueprintKey ?? CUSTOM_TEMPLATE) : CUSTOM_TEMPLATE)
    setError(null)
    setSaving(false)
  }, [editor, initial, open, seed, t])

  // Seed the typed slots with the blueprint's defaults once it resolves.
  useEffect(() => {
    setSlotValues(blueprint ? initialBlueprintValues(blueprint) : {})
    setError(null)
  }, [blueprint])

  // Configured providers with at least one available model — mirrors the chat
  // model picker's gate so only actually-selectable models are offered.
  const modelProviders = (modelOptions.data?.providers ?? []).filter(
    provider => provider.authenticated !== false && (provider.models ?? []).length > 0
  )

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const validationError = validateCronEditor({
      prompt,
      schedule,
      scriptOnlyJob
    })

    if (validationError) {
      setError(
        validationError === 'schedule'
          ? c.scheduleRequired
          : validationError === 'prompt'
            ? c.promptRequired
            : c.promptScheduleRequired
      )

      return
    }

    const override = parseCronModelChoiceValue(modelChoice)

    setSaving(true)
    setError(null)

    try {
      await onSave({
        deliver,
        model: override?.model ?? '',
        name: name.trim(),
        prompt: prompt.trim(),
        provider: override?.provider ?? '',
        schedule: schedule.trim()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : c.failedSave)
    } finally {
      setSaving(false)
    }
  }

  async function handleBlueprintSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!blueprint) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      await onBlueprintCreate(blueprint, slotValues)
    } catch (err) {
      // 422 carries the slot-level validation message; surface it inline.
      setError(cleanBlueprintFieldError(err instanceof Error ? err.message : String(err)))
    } finally {
      setSaving(false)
    }
  }

  const title = isEdit ? s.editTitle : blueprint ? s.blueprintTitle(blueprint.title) : s.newTitle
  const errorCallout = error ? <Callout tone="warn">{error}</Callout> : null

  const footer = (submitLabel: string) => (
    <SheetFooter>
      <span className="flex-1" />
      <Button disabled={saving} onClick={onClose} type="button" variant="secondary">
        {t.common.cancel}
      </Button>
      <Button disabled={saving} type="submit">
        {submitLabel}
      </Button>
    </SheetFooter>
  )

  return (
    <Dialog onOpenChange={value => !value && !saving && onClose()} open={open}>
      <DialogContent bodyClassName={STUDIO_SHEET_BODY} className={STUDIO_SHEET_CONTENT.md} showCloseButton={false}>
        <SheetHeader closable={!saving} lead={<IconTile icon="clock" size={30} tone="orange" />} title={title} />
        {isBlueprint && blueprint ? (
          <form className="contents" onSubmit={handleBlueprintSubmit}>
            <SheetBody>
              {blueprint.description ? (
                <p className="m-0 text-[0.78125rem] text-(--ui-text-tertiary)">{blueprint.description}</p>
              ) : null}
              <FormGroup>
                {blueprint.fields.map(field => {
                  const fieldId = `blueprint-${blueprint.key}-${field.name}`
                  const onFieldChange = (next: string) => setSlotValues(prev => ({ ...prev, [field.name]: next }))

                  return field.name === 'deliver' ? (
                    // The shared, backend-sourced delivery targets (same as the
                    // manual editor) rather than the blueprint's static options.
                    <FormRow key={field.name} stack title={<span id={`${fieldId}-label`}>{field.label}</span>}>
                      <div className="w-full">
                        <DeliverCheckboxes
                          c={c}
                          id={fieldId}
                          onChange={onFieldChange}
                          targets={deliveryTargets.data ?? []}
                          value={slotValues[field.name] ?? DEFAULT_DELIVER}
                        />
                      </div>
                    </FormRow>
                  ) : (
                    <FormRow
                      description={blueprintSlotHelp(field)}
                      htmlFor={fieldId}
                      key={field.name}
                      title={field.label}
                    >
                      <div className="w-52 max-w-full">
                        <BlueprintSlotControl
                          field={field}
                          id={fieldId}
                          onChange={onFieldChange}
                          value={slotValues[field.name] ?? ''}
                        />
                      </div>
                    </FormRow>
                  )
                })}
              </FormGroup>
              {errorCallout}
            </SheetBody>
            {footer(saving ? c.blueprints.scheduling : c.blueprints.scheduleIt)}
          </form>
        ) : (
          <form className="contents" onSubmit={handleSubmit}>
            <SheetBody>
              <FormGroup>
                <FormRow htmlFor="cron-name" title={s.name}>
                  <Input
                    autoFocus
                    className="w-60 max-w-full"
                    id="cron-name"
                    onChange={event => setName(event.target.value)}
                    placeholder={c.optional}
                    value={name}
                  />
                </FormRow>
                <FormRow htmlFor="cron-prompt" stack title={s.promptQuestion}>
                  <Textarea
                    className="min-h-20 w-full"
                    id="cron-prompt"
                    onChange={event => setPrompt(event.target.value)}
                    placeholder={s.promptPlaceholder}
                    value={prompt}
                  />
                </FormRow>
              </FormGroup>
              {scriptOnlyJob && initial ? (
                <p className="mx-1 -mt-1 mb-0 text-xs text-(--ui-text-tertiary)">
                  {c.scriptOnlyEditHint} <span className="font-mono">{initial.id}</span>
                </p>
              ) : null}
              <FormSection title={s.when}>
                <SchedulePicker id="cron-schedule" initialExpr={schedule} key={pickerKey} onChange={setSchedule} />
              </FormSection>
              <FormSection title={<span id="cron-deliver-label">{s.deliverTo}</span>}>
                <DeliverCheckboxes
                  c={c}
                  id="cron-deliver"
                  onChange={setDeliver}
                  targets={deliveryTargets.data ?? []}
                  value={deliver}
                />
              </FormSection>
              {!scriptOnlyJob && (
                <FormGroup>
                  <FormRow htmlFor="cron-model" title={s.model}>
                    <CronModelSelect
                      c={c}
                      modelChoice={modelChoice}
                      modelProviders={modelProviders}
                      onChange={setModelChoice}
                    />
                  </FormRow>
                </FormGroup>
              )}
              {errorCallout}
            </SheetBody>
            {footer(saving ? t.common.saving : isEdit ? s.save : s.create)}
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

const DEFAULT_SCHEDULE = '0 9 * * *'

type EditorState =
  | { job: CronJob; mode: 'edit' }
  | { mode: 'closed' }
  // `blueprintKey` opens the create sheet on that blueprint (a Blueprints card's
  // "Use"); `seed` pre-fills it from an existing job ("Duplicate job").
  | { blueprintKey?: string; mode: 'create'; seed?: CronJob }

interface EditorValues {
  deliver: string
  /** Per-job model override ('' = follow the global default). */
  model: string
  name: string
  prompt: string
  /** Provider slug for the model override ('' = none). */
  provider: string
  schedule: string
}
