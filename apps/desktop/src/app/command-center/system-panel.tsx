import { useCallback, useEffect, useState } from 'react'

import { FormCell, FormGroup, FormRow, FormSection } from '@/app/overlays/studio/form-group'
import { StatCard } from '@/app/overlays/studio/stat-card'
import { LogSearchField, useLogSearch } from '@/components/chat/log-search'
import { LogTail } from '@/components/chat/log-tail'
import { PageLoader } from '@/components/page-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { getActionStatus, getLogs, getStatus, restartGateway } from '@/hermes'
import type { ActionStatusResponse, StatusResponse } from '@/hermes'
import { useI18n } from '@/i18n'
import { AlertCircle } from '@/lib/icons'
import { upsertDesktopActionTask } from '@/store/activity'
import { notify } from '@/store/notifications'
import { confirmSharedGatewayRestart } from '@/store/system-actions'
import { openUpdatesWindow } from '@/store/updates'

import { useRefreshHotkey } from '../hooks/use-refresh-hotkey'

const LOG_FILES = ['agent', 'errors', 'gateway', 'desktop'] as const
const LOG_LEVELS = ['ALL', 'INFO', 'WARNING', 'ERROR'] as const

type LogFile = (typeof LOG_FILES)[number]
type LogLevel = (typeof LOG_LEVELS)[number]

/** Connected platform names, sorted, from the status snapshot. */
function connectedPlatforms(status: StatusResponse): string[] {
  return Object.entries(status.gateway_platforms ?? {})
    .filter(([, platform]) => platform.state === 'connected')
    .map(([name]) => name)
    .sort((left, right) => left.localeCompare(right))
}

/** System: gateway health cards, gateway actions, and the recent-log tail. */
export function SystemPanel() {
  const { t } = useI18n()
  const cc = t.commandCenter
  const sys = t.studio.overlays.system
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [logFile, setLogFile] = useState<LogFile>('agent')
  const [logLevel, setLogLevel] = useState<LogLevel>('ALL')
  const [logQuery, setLogQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [action, setAction] = useState<ActionStatusResponse | null>(null)
  const logSearch = useLogSearch(logs, logQuery)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [nextStatus, nextLogs] = await Promise.all([
        getStatus(),
        getLogs({ file: logFile, level: logLevel, lines: 200 })
      ])

      setStatus(nextStatus)
      setLogs(nextLogs.lines)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }, [logFile, logLevel])

  // Refetch when the panel opens and whenever the log file/level filters
  // change (refresh's identity tracks them).
  useEffect(() => {
    void refresh()
  }, [refresh])

  useRefreshHotkey(() => void refresh())

  const restart = useCallback(async () => {
    setError('')

    // A profile served by the shared multiplexer restarts every bot on this device: ask first.
    const shared = await confirmSharedGatewayRestart()

    if (shared === false) {
      return
    }

    try {
      const started = await restartGateway()
      let next: ActionStatusResponse | null = null

      for (let attempt = 0; attempt < 18; attempt += 1) {
        await new Promise(resolve => window.setTimeout(resolve, 1200))
        next = await getActionStatus(started.name, 180)
        setAction(next)
        upsertDesktopActionTask(next)

        if (!next.running) {
          break
        }
      }

      if (shared && next && !next.running && (next.exit_code ?? 0) === 0) {
        notify({ kind: 'success', message: cc.sharedGatewayRestarted(shared.length) })
      }

      if (!next) {
        const pending = { exit_code: null, lines: [cc.actionStartedWaiting], name: started.name, pid: started.pid, running: true }

        setAction(pending)
        upsertDesktopActionTask(pending)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      void refresh()
    }
  }, [cc, refresh])

  if (!status) {
    return <PageLoader className="min-h-48" label={cc.loadingStatus} />
  }

  const platforms = connectedPlatforms(status)

  return (
    <>
      <div className="grid grid-cols-4 gap-2.5 max-[47.5rem]:grid-cols-2">
        <StatCard
          dot={status.gateway_running ? 'green' : 'orange'}
          label={sys.statGateway}
          value={status.gateway_running ? sys.running : sys.stopped}
        />
        <StatCard hint={status.release_date || undefined} label={sys.statVersion} value={status.version} />
        <StatCard label={sys.statActiveSessions} value={status.active_sessions} />
        <StatCard
          label={sys.statPlatforms}
          value={platforms.length > 0 ? sys.platformsConnected(platforms.length) : sys.platformsNone}
        />
      </div>

      <FormGroup>
        <FormRow
          description={<span className="capitalize">{platforms.length > 0 ? platforms.join(' · ') : sys.platformsNone}</span>}
          title={sys.statPlatforms}
        >
          {platforms.length > 0 && <Badge variant="success">{sys.platformsConnected(platforms.length)}</Badge>}
        </FormRow>
        <FormRow description={sys.restartDesc} title={cc.restartGateway}>
          <Button onClick={() => void restart()} size="sm" variant="secondary">
            {sys.restart}
          </Button>
        </FormRow>
        {action && (
          <FormCell className="text-[0.71875rem] text-(--ui-text-tertiary)">
            {action.name} · {action.running ? cc.actionRunning : action.exit_code === 0 ? cc.actionDone : cc.actionFailed}
          </FormCell>
        )}
        <FormRow title={cc.updateHermes}>
          <Button onClick={() => openUpdatesWindow()} size="sm" variant="secondary">
            {sys.checkForUpdates}
          </Button>
        </FormRow>
      </FormGroup>

      <FormSection
        aside={
          <SegmentedControl
            aria-label={cc.logFile}
            onChange={setLogFile}
            options={LOG_FILES.map(value => ({ id: value, label: value }))}
            size="sm"
            value={logFile}
          />
        }
        className="min-h-0"
        title={cc.recentLogs}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <SegmentedControl
            aria-label={cc.logLevel}
            onChange={setLogLevel}
            options={LOG_LEVELS.map(value => ({ id: value, label: value === 'ALL' ? 'all' : value.toLowerCase() }))}
            size="sm"
            value={logLevel}
          />
          <LogSearchField
            containerClassName="w-48"
            onChange={setLogQuery}
            placeholder={cc.logSearchPlaceholder}
            search={logSearch}
            value={logQuery}
          />
          {error && (
            <span className="inline-flex items-center gap-1 text-[0.71875rem] text-destructive">
              <AlertCircle className="size-3.5" />
              {error}
            </span>
          )}
        </div>
        <LogTail
          className="h-[11rem] shrink-0 rounded-[0.625rem] bg-(--ui-code-background) shadow-[0_0_0_0.5px_var(--ui-line-2)]"
          emptyLabel={cc.noLogs}
          lines={loading && logs.length === 0 ? null : logs}
          search={logSearch}
        />
      </FormSection>
    </>
  )
}
