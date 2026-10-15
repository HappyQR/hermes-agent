import { compactNumber } from '@hermes/shared'
import { useStore } from '@nanostores/react'
import { type ReactNode, useMemo, useState } from 'react'

import { useElapsedSeconds } from '@/components/chat/activity-timer'
import { RunRing } from '@/components/studio/pages/tile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StudioIcon } from '@/components/ui/studio-icon'
import { type Translations, useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { $activeSessionId, $sessions, sessionMatchesStoredId } from '@/store/session'
import { requestForOwnedSession, storedSessionIdForRuntimeId } from '@/store/session-states'
import {
  $subagentsBySession,
  buildSubagentTree,
  type SubagentNode,
  type SubagentProgress,
  type SubagentStatus,
  type SubagentStreamEntry
} from '@/store/subagents'
import { canOpenSessionWindow, openSessionInNewWindow } from '@/store/windows'

import { SubagentTranscript } from '../chat/composer/status-stack/subagent-transcript'
import { PanelEmpty } from '../overlays/panel'

// The inspector's 代理 pane body (prototype inspector.js:329-367): a summary
// strip, then one card per sub-agent — goal and meta on the head, the live
// stream, touched files, steer/stop while it runs and its full transcript when
// expanded. Same scope as the /agents overlay: live work from every session
// plus finished work of the session in view.

const isLive = (status: SubagentStatus) => status === 'running' || status === 'queued'
const isFailed = (status: SubagentStatus) => status === 'failed' || status === 'interrupted'

/** One delegation batch (or a lone agent) — the overlay's grouping. */
export interface AgentDelegationGroup {
  delegationIndex: number
  id: string
  nodes: SubagentNode[]
  taskCount: number
}

export interface PanelSubagents {
  /** Sub-agent id → the session that spawned it (its steer/stop/transcript route). */
  owners: ReadonlyMap<string, string>
  tree: SubagentNode[]
}

/** The panel's sub-agents (subagentsForPanel's scope) and who spawned each. */
export function usePanelSubagents(): PanelSubagents {
  const bySession = useStore($subagentsBySession)
  const activeSessionId = useStore($activeSessionId)

  return useMemo(() => {
    const owners = new Map<string, string>()
    const items: SubagentProgress[] = []

    for (const [sessionId, rows] of Object.entries(bySession)) {
      for (const row of rows) {
        if (sessionId === activeSessionId || isLive(row.status)) {
          items.push(row)
          owners.set(row.id, sessionId)
        }
      }
    }

    return { owners, tree: buildSubagentTree(items) }
  }, [activeSessionId, bySession])
}

const flattenNodes = (nodes: readonly SubagentNode[]): SubagentNode[] =>
  nodes.flatMap(node => [node, ...flattenNodes(node.children)])

function fmtDuration(seconds: number | undefined, a: Translations['agents']): string {
  if (!seconds || seconds <= 0) {
    return ''
  }

  if (seconds < 60) {
    return a.durationSeconds(String(Math.round(seconds)))
  }

  return a.durationMinutes(Math.floor(seconds / 60), Math.round(seconds % 60))
}

interface AgentsPaneBodyProps extends PanelSubagents {
  groups: readonly AgentDelegationGroup[]
}

export function AgentsPaneBody({ groups, owners, tree }: AgentsPaneBodyProps) {
  const { t } = useI18n()
  const flat = useMemo(() => flattenNodes(tree), [tree])
  const live = flat.filter(node => isLive(node.status)).length
  // undefined = follow the default (the first running agent, else the first).
  const [openId, setOpenId] = useState<null | string | undefined>(undefined)

  if (tree.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-(--ui-bg-inspector)" data-slot="agents-pane">
        <PanelEmpty description={t.agents.emptyDesc} icon="hubot" title={t.agents.emptyTitle} />
      </div>
    )
  }

  const fallbackOpen = (flat.find(node => isLive(node.status)) ?? flat[0])?.id ?? null
  const expandedId = openId === undefined ? fallbackOpen : openId

  return (
    <div
      className="@container flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain bg-(--ui-bg-inspector) pt-2 pb-2.5"
      data-slot="agents-pane"
    >
      <AgentsSummary flat={flat} live={live} />
      {groups.map(group => (
        <DelegationSection group={group} key={group.id}>
          {group.nodes.map(node => (
            <AgentNodeTree
              depth={0}
              expandedId={expandedId}
              key={node.id}
              node={node}
              onToggle={id => setOpenId(expandedId === id ? null : id)}
              owners={owners}
            />
          ))}
        </DelegationSection>
      ))}
    </div>
  )
}

function AgentsSummary({ flat, live }: { flat: SubagentNode[]; live: number }) {
  const { t } = useI18n()
  const a = t.studio.pages.inspector.agents
  const tools = flat.reduce((sum, node) => sum + (node.toolCount ?? 0), 0)
  const priced = flat.some(node => typeof node.costUsd === 'number')
  const cost = flat.reduce((sum, node) => sum + (node.costUsd ?? 0), 0)
  const failed = flat.filter(node => isFailed(node.status)).length

  return (
    <div className="mx-2.5 mb-2">
      <div
        className="grid grid-cols-4 gap-1.5 rounded-xl bg-(--pg-card) px-3 py-2.5 shadow-(--pg-card-ring) @max-[17.5rem]:grid-cols-2"
        data-slot="agents-summary"
      >
        <SummaryStat label={a.statAgents} value={flat.length.toLocaleString()} />
        <SummaryStat accent label={a.statRunning} value={live.toLocaleString()} />
        <SummaryStat label={a.statToolCalls} value={tools.toLocaleString()} />
        <SummaryStat label={a.statCost} value={priced ? `$${cost.toFixed(2)}` : '—'} />
      </div>
      {failed > 0 ? <p className="m-0 mt-1.5 px-1 text-xs text-(--ui-red)">{t.agents.failedCount(failed)}</p> : null}
    </div>
  )
}

function SummaryStat({ accent = false, label, value }: { accent?: boolean; label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-px">
      <b
        className={cn(
          'text-base leading-tight font-[650] tabular-nums',
          accent ? 'text-primary' : 'text-(--ui-text-primary)'
        )}
      >
        {value}
      </b>
      <span className="truncate text-[0.6875rem] text-(--ui-text-tertiary)">{label}</span>
    </div>
  )
}

function DelegationSection({ children, group }: { children: ReactNode; group: AgentDelegationGroup }) {
  const { t } = useI18n()

  if (group.nodes.length === 1 && group.taskCount <= 1) {
    return <>{children}</>
  }

  const active = group.nodes.filter(node => isLive(node.status)).length

  const label = [
    group.delegationIndex > 0 ? t.agents.delegation(group.delegationIndex) : '',
    t.agents.workers(group.nodes.length),
    active > 0 ? t.agents.workersActive(active) : ''
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section className="flex flex-col" data-slot="agents-delegation">
      <p className="m-0 mx-3.5 mt-1 mb-1.5 text-[0.6875rem] font-semibold text-(--ui-text-tertiary)">{label}</p>
      {children}
    </section>
  )
}

interface AgentNodeTreeProps {
  depth: number
  expandedId: null | string
  node: SubagentNode
  onToggle: (id: string) => void
  owners: ReadonlyMap<string, string>
}

function AgentNodeTree({ depth, node, ...rest }: AgentNodeTreeProps) {
  return (
    <>
      <AgentNodeCard depth={depth} node={node} {...rest} />
      {node.children.map(child => (
        <AgentNodeTree depth={depth + 1} key={child.id} node={child} {...rest} />
      ))}
    </>
  )
}

function StatusMark({ status }: { status: SubagentStatus }) {
  const { t } = useI18n()

  if (isLive(status)) {
    return (
      <span
        aria-label={status === 'queued' ? t.agents.queued : t.agents.running}
        className="flex size-4 shrink-0 items-center justify-center"
        role="img"
      >
        <RunRing />
      </span>
    )
  }

  const failed = isFailed(status)

  return (
    <span aria-label={failed ? t.agents.failed : t.agents.done} className="flex size-4 shrink-0" role="img">
      <StudioIcon
        className={failed ? 'text-(--pg-dot-red)' : 'text-(--pg-dot-green)'}
        name={failed ? 'x-circle' : 'check-circle'}
        size={16}
      />
    </span>
  )
}

function AgentNodeCard({ depth, expandedId, node, onToggle, owners }: AgentNodeTreeProps) {
  const { t } = useI18n()
  const a = t.studio.pages.inspector.agents
  const running = isLive(node.status)
  const elapsed = useElapsedSeconds(running, `subagent:${node.id}`, node.startedAt)
  const expanded = expandedId === node.id
  const tokens = (node.inputTokens ?? 0) + (node.outputTokens ?? 0)

  const seconds = typeof node.durationSeconds === 'number' ? Math.max(0, Math.round(node.durationSeconds)) : elapsed

  const meta = [
    node.model,
    fmtDuration(seconds, t.agents),
    node.toolCount ? a.toolCalls(node.toolCount) : '',
    tokens > 0 ? t.agents.tokens(compactNumber(tokens)) : ''
  ].filter(Boolean)

  return (
    <div
      className="mb-2 overflow-hidden rounded-xl bg-(--pg-card) shadow-(--pg-card-ring)"
      data-slot="agent-node"
      data-status={node.status}
      style={{ marginInlineEnd: 10, marginInlineStart: 10 + Math.min(depth, 3) * 14 }}
    >
      <button
        aria-expanded={expanded}
        className="flex w-full min-w-0 items-center gap-2.5 px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"
        onClick={() => onToggle(node.id)}
        type="button"
      >
        <StatusMark status={node.status} />
        <span className="flex min-w-0 flex-1 flex-col">
          <b className="truncate text-[0.8125rem] font-semibold text-(--ui-text-primary)">{node.goal}</b>
          {meta.length > 0 ? (
            <span className="truncate text-[0.71875rem] text-(--ui-text-tertiary) tabular-nums">
              {meta.join(' · ')}
            </span>
          ) : null}
        </span>
        <StudioIcon className="shrink-0 text-(--ui-text-tertiary)" name={expanded ? 'chev-d' : 'chev-r'} size={12} />
      </button>
      {expanded ? <AgentNodeBody node={node} ownerSessionId={owners.get(node.id) ?? null} running={running} /> : null}
    </div>
  )
}

const STREAM_MARK: Record<SubagentStreamEntry['kind'], string> = {
  progress: '·',
  summary: '✓',
  thinking: '…',
  tool: '›'
}

/** The spawning session's title, when the sidebar list knows it. */
function useSessionTitle(sessionId: null | string): string {
  const sessions = useStore($sessions)

  return useMemo(() => {
    if (!sessionId) {
      return ''
    }

    const stored = storedSessionIdForRuntimeId(sessionId) ?? sessionId
    const row = sessions.find(session => sessionMatchesStoredId(session, stored))

    return row?.title?.trim() || row?.preview?.trim() || ''
  }, [sessionId, sessions])
}

function AgentNodeBody({
  node,
  ownerSessionId,
  running
}: {
  node: SubagentNode
  ownerSessionId: null | string
  running: boolean
}) {
  const { t } = useI18n()
  const a = t.studio.pages.inspector.agents
  const title = useSessionTitle(ownerSessionId)
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const stream = node.stream.slice(-10)
  const files = [...node.filesWritten.map(path => `+ ${path}`), ...node.filesRead.map(path => `· ${path}`)]
  const childSessionId = node.sessionId

  const openWindow =
    childSessionId && canOpenSessionWindow()
      ? () =>
          void openSessionInNewWindow(childSessionId, {
            parentSessionId: ownerSessionId ? (storedSessionIdForRuntimeId(ownerSessionId) ?? ownerSessionId) : null,
            watch: true
          })
      : null

  return (
    <div className="flex min-w-0 flex-col gap-2 px-3 pb-3" data-slot="agent-node-body">
      {title ? (
        <div className="truncate text-[0.71875rem] text-(--ui-text-tertiary)">{a.fromSession(title)}</div>
      ) : null}
      {stream.length > 0 || running ? (
        <div
          className="rounded-lg bg-(--pg-recessed) px-2.5 py-2 font-mono text-[0.71875rem] leading-[1.6] text-(--ui-text-secondary)"
          data-selectable-text="true"
        >
          {stream.map((entry, index) => (
            <div
              className={cn('flex min-w-0 gap-1.5', entry.isError && 'text-(--ui-red)')}
              key={`${entry.kind}:${entry.at}:${index}`}
            >
              <span aria-hidden className="w-2.5 shrink-0 text-(--ui-text-quaternary)">
                {STREAM_MARK[entry.kind]}
              </span>
              <span className="min-w-0 flex-1 wrap-anywhere">{entry.text}</span>
            </div>
          ))}
          {running ? (
            <span
              aria-label={t.agents.streaming}
              className="inline-block size-[7px] rounded-full bg-(--ui-text-primary) align-middle motion-safe:animate-pulse"
              role="img"
            />
          ) : null}
        </div>
      ) : null}
      {files.length > 0 ? (
        <div
          className="font-mono text-[0.71875rem] leading-normal text-(--ui-text-secondary)"
          data-selectable-text="true"
        >
          {files.slice(0, 8).map(line => (
            <div className="wrap-anywhere" key={line}>
              {line}
            </div>
          ))}
          {files.length > 8 ? (
            <div className="text-(--ui-text-tertiary)">{t.agents.moreFiles(files.length - 8)}</div>
          ) : null}
        </div>
      ) : null}
      {running && ownerSessionId ? <AgentSteerControls sessionId={ownerSessionId} subagentId={node.id} /> : null}
      {openWindow ? (
        <Button className="self-start" onClick={openWindow} size="sm" variant="ghost">
          <StudioIcon name="window" size={13} />
          {a.viewTranscript}
        </Button>
      ) : ownerSessionId ? (
        <>
          <Button
            aria-expanded={transcriptOpen}
            className="self-start"
            onClick={() => setTranscriptOpen(open => !open)}
            size="sm"
            variant="ghost"
          >
            {transcriptOpen ? a.hideTranscript : a.viewTranscript}
          </Button>
          {transcriptOpen ? <SubagentTranscript sessionId={ownerSessionId} subagentId={node.id} /> : null}
        </>
      ) : null}
    </div>
  )
}

/** Steer / Stop a running sub-agent — the same `subagent.*` calls as the composer's controls. */
function AgentSteerControls({ sessionId, subagentId }: { sessionId: string; subagentId: string }) {
  const { t } = useI18n()
  const a = t.studio.pages.inspector.agents
  const [text, setText] = useState('')
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<null | { failed: boolean; text: string }>(null)

  const send = async (action: 'interrupt' | 'steer') => {
    setPending(true)
    setFeedback(null)

    try {
      // A child control never falls back to whichever gateway happens to be active.
      const result = await requestForOwnedSession<{ found?: boolean; status?: string }>(
        sessionId,
        async () => {
          throw new Error(t.agents.requestRejected)
        },
        `subagent.${action}`,
        { session_id: sessionId, subagent_id: subagentId, ...(action === 'steer' ? { text: text.trim() } : {}) }
      )

      if (action === 'steer' ? result.status !== 'queued' : !result.found) {
        throw new Error(t.agents.requestRejected)
      }

      setFeedback({ failed: false, text: action === 'steer' ? t.agents.steerQueued : t.agents.stopRequested })

      if (action === 'steer') {
        setText('')
      }
    } catch {
      setFeedback({ failed: true, text: t.agents.requestRejected })
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      className="flex flex-col gap-1"
      onKeyDown={event => event.stopPropagation()}
      onSubmit={event => {
        event.preventDefault()
        event.stopPropagation()

        if (text.trim() && !pending) {
          void send('steer')
        }
      }}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <Input
          aria-label={a.steerLabel}
          className="h-7 min-w-0 flex-1"
          disabled={pending}
          onChange={event => setText(event.target.value)}
          placeholder={t.agents.steerPlaceholder}
          value={text}
        />
        <Button disabled={pending || !text.trim()} size="sm" type="submit" variant="outline">
          {t.agents.steer}
        </Button>
        <Button disabled={pending} onClick={() => void send('interrupt')} size="sm" type="button" variant="destructive">
          {t.statusStack.stop}
        </Button>
      </div>
      {feedback ? (
        <p className="m-0 text-xs text-(--ui-text-secondary)" role={feedback.failed ? 'alert' : 'status'}>
          {feedback.text}
        </p>
      ) : null}
    </form>
  )
}
