import { useCallback, useEffect, useState } from 'react'

import { FormCell, FormGroup, FormRow } from '@/app/overlays/studio/form-group'
import { PageLoader } from '@/components/page-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  type ActionResponse,
  type CuratorStatusResponse,
  type DebugShareResponse,
  getActionStatus,
  getCuratorStatus,
  getMemoryStatus,
  type MemoryStatusResponse,
  resetMemory,
  runBackup,
  runCurator,
  runDebugShare,
  runDoctor,
  runSecurityAudit,
  setCuratorPaused
} from '@/hermes'
import { useI18n } from '@/i18n'
import { AlertCircle } from '@/lib/icons'
import { upsertDesktopActionTask } from '@/store/activity'
import { confirm } from '@/store/confirm'
import { notify, notifyError } from '@/store/notifications'
import type { ActionStatusResponse } from '@/types/hermes'

const ACTION_POLL_MS = 1200
const ACTION_POLL_LIMIT = 240 // ~5 minutes of polling before giving up.

function formatBytes(size: number): string {
  if (size <= 0) {
    return ''
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${size} B`
}

/** Maintenance panel — desktop parity for `hermes doctor` / `security audit` /
 *  `backup` / `debug share` / `curator` / `memory` (the dashboard System page's
 *  ops section). Spawn-based actions tail their logs inline via the shared
 *  /api/actions status endpoint. */
export function MaintenancePanel({ onManageMemory }: { onManageMemory?: () => void } = {}) {
  const { t } = useI18n()
  const mm = t.commandCenter.maintenance

  // A fresh object per launch: the backend reuses one fixed name per op, so a bare name
  // would leave the tail effect's deps unchanged when the same op runs again.
  const [tailTarget, setTailTarget] = useState<null | { name: string }>(null)
  const [actionStatus, setActionStatus] = useState<ActionStatusResponse | null>(null)
  const [curator, setCurator] = useState<CuratorStatusResponse | null>(null)
  const [curatorBusy, setCuratorBusy] = useState(false)
  const [memory, setMemory] = useState<MemoryStatusResponse | null>(null)
  const [memoryBusy, setMemoryBusy] = useState(false)
  const [share, setShare] = useState<DebugShareResponse | null>(null)
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    getCuratorStatus()
      .then(next => !cancelled && setCurator(next))
      .catch(() => {})
    getMemoryStatus()
      .then(next => !cancelled && setMemory(next))
      .catch(() => {})

    return () => void (cancelled = true)
  }, [])

  // Tail the most recently launched spawn action.
  useEffect(() => {
    if (!tailTarget) {
      return
    }

    const { name } = tailTarget
    let cancelled = false
    let polls = 0
    let timer: null | number = null

    const poll = async () => {
      try {
        const status = await getActionStatus(name, 200)

        if (cancelled) {
          return
        }

        setActionStatus(status)
        upsertDesktopActionTask(status)
        polls += 1

        if (status.running && polls < ACTION_POLL_LIMIT) {
          timer = window.setTimeout(() => void poll(), ACTION_POLL_MS)
        }
      } catch {
        // Status endpoint hiccup — stop tailing; the activity rail still has the task.
      }
    }

    void poll()

    return () => {
      cancelled = true

      if (timer !== null) {
        window.clearTimeout(timer)
      }
    }
  }, [tailTarget])

  const launch = useCallback(
    async (label: string, start: () => Promise<ActionResponse>) => {
      setError('')

      try {
        const started = await start()
        setActionStatus(null)
        setTailTarget({ name: started.name })
        notify({ kind: 'success', title: mm.actionStarted(label), message: '' })
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        notifyError(err, mm.actionFailed(label))
      }
    },
    [mm]
  )

  const shareDebug = useCallback(async () => {
    setSharing(true)
    setShare(null)
    setError('')

    try {
      setShare(await runDebugShare())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      notifyError(err, mm.debugShareFailed)
    } finally {
      setSharing(false)
    }
  }, [mm])

  const toggleCurator = useCallback(async () => {
    if (!curator) {
      return
    }

    setCuratorBusy(true)

    try {
      const next = !curator.paused
      await setCuratorPaused(next)
      setCurator({ ...curator, paused: next })
    } catch (err) {
      notifyError(err, mm.actionFailed(mm.curator))
    } finally {
      setCuratorBusy(false)
    }
  }, [curator, mm])

  const doResetMemory = useCallback(
    async (target: 'all' | 'memory' | 'user', label: string) => {
      if (!(await confirm({ destructive: true, title: mm.resetConfirm(label) }))) {
        return
      }

      setMemoryBusy(true)

      try {
        const result = await resetMemory(target)
        notify({ kind: 'success', title: mm.resetDone(result.deleted.join(', ') || label), message: '' })
        setMemory(await getMemoryStatus())
      } catch (err) {
        notifyError(err, mm.resetFailed)
      } finally {
        setMemoryBusy(false)
      }
    },
    [mm]
  )

  const busy = actionStatus?.running === true

  return (
    <>
      {error && (
        <span className="inline-flex items-center gap-1 text-[0.71875rem] text-destructive">
          <AlertCircle className="size-3.5" />
          {error}
        </span>
      )}

      <FormGroup>
        <OpRow description={mm.doctorDesc} disabled={busy} label={mm.doctor} onRun={() => void launch(mm.doctor, runDoctor)} />
        <OpRow
          description={mm.securityAuditDesc}
          disabled={busy}
          label={mm.securityAudit}
          onRun={() => void launch(mm.securityAudit, runSecurityAudit)}
        />
        <OpRow description={mm.backupDesc} disabled={busy} label={mm.backup} onRun={() => void launch(mm.backup, runBackup)} />
        <OpRow
          description={mm.debugShareDesc}
          disabled={sharing}
          label={sharing ? mm.debugShareRunning : mm.debugShare}
          onRun={() => void shareDebug()}
        />

        {share && Object.keys(share.urls).length > 0 && (
          <FormCell>
            <div className="mb-1 text-[0.71875rem] font-semibold text-(--ui-text-tertiary)">{mm.debugShareLinks}</div>
            {Object.entries(share.urls).map(([key, url]) => (
              <div className="flex items-center justify-between gap-2 py-1" key={key}>
                <span className="min-w-0 truncate font-mono text-[0.71875rem]">
                  {key}: {url}
                </span>
                <Button
                  onClick={() => {
                    void window.hermesDesktop.writeClipboard(url)
                    notify({ durationMs: 1500, kind: 'success', message: mm.linkCopied })
                  }}
                  size="xs"
                  variant="text"
                >
                  {mm.copyLink}
                </Button>
              </div>
            ))}
          </FormCell>
        )}

        {actionStatus && (
          <FormCell>
            <div className="mb-1.5 flex items-center gap-2 text-[0.71875rem] font-semibold text-(--ui-text-tertiary)">
              {mm.viewLog}
              {actionStatus.running && <span className="font-normal">{mm.running}</span>}
            </div>
            <pre
              className="max-h-48 overflow-auto rounded-[0.5rem] bg-(--ui-code-background) p-2.5 font-mono text-[0.6875rem] leading-relaxed whitespace-pre-wrap wrap-break-word text-(--ui-text-secondary) shadow-[0_0_0_0.5px_var(--ui-line-2)]"
              data-selectable-text="true"
            >
              {actionStatus.lines.join('\n')}
            </pre>
          </FormCell>
        )}

        {!curator ? (
          <FormCell>
            <PageLoader className="min-h-16" label={mm.curator} />
          </FormCell>
        ) : (
          <FormRow
            description={`${mm.curatorDesc} · ${curator.last_run_at ? mm.curatorLastRun(curator.last_run_at) : mm.curatorNeverRan}`}
            title={mm.curator}
          >
            <Badge variant={!curator.enabled ? 'muted' : curator.paused ? 'warn' : 'success'}>
              {!curator.enabled ? mm.curatorDisabled : curator.paused ? mm.curatorPaused : mm.curatorActive}
            </Badge>
            {curator.enabled && (
              <Button disabled={curatorBusy} onClick={() => void toggleCurator()} size="sm" variant="ghost">
                {curator.paused ? mm.resume : mm.pause}
              </Button>
            )}
            <Button disabled={busy} onClick={() => void launch(mm.curator, runCurator)} size="sm" variant="secondary">
              {mm.runNow}
            </Button>
          </FormRow>
        )}

        {!memory ? (
          <FormCell>
            <PageLoader className="min-h-16" label={mm.memoryData} />
          </FormCell>
        ) : (
          <FormRow
            description={[
              `MEMORY.md ${memory.builtin_files.memory > 0 ? formatBytes(memory.builtin_files.memory) : mm.empty}`,
              `USER.md ${memory.builtin_files.user > 0 ? formatBytes(memory.builtin_files.user) : mm.empty}`,
              mm.memoryProvider(memory.active || mm.builtinMemory)
            ].join(' · ')}
            title={mm.memoryData}
          >
            {onManageMemory && (
              <Button onClick={onManageMemory} size="sm" variant="ghost">
                {t.studio.overlays.system.manageMemory}
              </Button>
            )}
            <Button
              className="text-destructive hover:text-destructive"
              disabled={memoryBusy || memory.builtin_files.memory <= 0}
              onClick={() => void doResetMemory('memory', mm.memoryFile)}
              size="sm"
              variant="ghost"
            >
              {mm.resetMemory}
            </Button>
            <Button
              className="text-destructive hover:text-destructive"
              disabled={memoryBusy || memory.builtin_files.user <= 0}
              onClick={() => void doResetMemory('user', mm.userFile)}
              size="sm"
              variant="ghost"
            >
              {mm.resetUser}
            </Button>
          </FormRow>
        )}
      </FormGroup>
    </>
  )
}

/** One maintenance op: title + description, and a "Run" button named after the op. */
function OpRow({
  description,
  disabled,
  label,
  onRun
}: {
  description: string
  disabled?: boolean
  label: string
  onRun: () => void
}) {
  const { t } = useI18n()

  return (
    <FormRow description={description} title={label}>
      <Button aria-label={label} disabled={disabled} onClick={onRun} size="sm" variant="secondary">
        {t.studio.overlays.system.run}
      </Button>
    </FormRow>
  )
}
