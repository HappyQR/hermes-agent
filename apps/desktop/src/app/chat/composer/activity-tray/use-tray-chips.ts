import { useStore } from '@nanostores/react'
import { useMemo } from 'react'

import type { Translations } from '@/i18n'
import type { TodoItem } from '@/lib/todos'
import { useSessionSlice, useStoreSelector } from '@/lib/use-session-slice'
import { sessionClarifyRequest } from '@/store/clarify'
import { $parkedQueueSessions, $queuedPromptsBySession } from '@/store/composer-queue'
import { $statusItemsBySession, type ComposerStatusItem } from '@/store/composer-status'
import { $previewStatusBySession } from '@/store/preview-status'
import { sessionApprovalStackSize } from '@/store/prompts'
import { $sessionControlBySession, type SessionControlEntry } from '@/store/session-control'
import { $subagentsBySession } from '@/store/subagents'
import { $retainedTodosBySession } from '@/store/todos'

import { isLocalhostPreview } from '../status-stack'
import { useSessionValue } from '../status-stack/session-control-utils'

import { CHIP_ORDER, chipForSection, type TrayChipId } from './chips'

export interface TrayChip {
  /** Glyph: a codicon name, or 'hand' for the approval glyph (Tabler). */
  icon: string
  id: TrayChipId
  label: string
  /** A live chip trades its glyph for the running spinner. */
  live?: boolean
  /** 0..1 — the todo progress bar. */
  progress?: number
  /** The stack sections this chip's panel shows. Empty for jump chips. */
  sectionKeys: string[]
  tone?: 'error' | 'muted' | 'warn'
}

interface TrayChipInputs {
  /** Non-notice section keys the status stack emitted, in stack order. */
  sectionKeys: readonly string[]
  /** Runtime session id (status items, prompts). */
  sessionId: null | string
  /** The composer's queue key (stored id or draft key). */
  sessionKey: null | string
  t: Translations
}

const isTodo = (item: ComposerStatusItem) => item.type === 'todo'
const isBackground = (item: ComposerStatusItem) => item.type === 'background'

function sectionsByChip(sectionKeys: readonly string[]): Map<TrayChipId, string[]> {
  const byChip = new Map<TrayChipId, string[]>()

  for (const key of sectionKeys) {
    const chip = chipForSection(key)
    byChip.set(chip, [...(byChip.get(chip) ?? []), key])
  }

  return byChip
}

type ChipBody = Omit<TrayChip, 'id' | 'sectionKeys'>

/** Live todos while a plan runs; the retained snapshot (muted) once the turn has settled. */
function todoChip(
  keys: readonly string[],
  items: readonly ComposerStatusItem[],
  retained: readonly TodoItem[],
  t: Translations
): ChipBody | null {
  if (keys.includes('todo')) {
    const todos = items.filter(isTodo)
    const done = todos.filter(item => item.todoStatus === 'completed').length

    return {
      icon: 'checklist',
      label: t.statusStack.todos(done, todos.length),
      live: todos.some(item => item.todoStatus === 'in_progress' && item.state === 'running'),
      progress: todos.length ? done / todos.length : 0
    }
  }

  if (!keys.length) {
    return null
  }

  const done = retained.filter(todo => todo.status === 'completed').length

  return { icon: 'checklist', label: t.statusStack.previousTodos(done, retained.length), tone: 'muted' }
}

/** Keeps the composer's own wording ("1 Queued", "1 Queued — paused"). */
function queueChip(count: number, parked: boolean, t: Translations): ChipBody {
  return parked
    ? { icon: 'debug-pause', label: t.composer.queuedPaused(count), tone: 'muted' }
    : { icon: 'layers', label: t.composer.queued(count) }
}

/** The control chip mirrors the goal / loop / heartbeat headers, one line. */
function controlChip(entry: SessionControlEntry | undefined, items: readonly ComposerStatusItem[], t: Translations) {
  const s = t.statusStack
  const ctrl = s.control
  const goal = entry?.snapshot?.goal
  const loop = entry?.snapshot?.loop
  const heartbeat = entry?.snapshot?.heartbeat
  const tone = entry?.error || goal?.last_verdict === 'blocked' ? ('error' as const) : undefined

  if (goal) {
    const state =
      goal.last_verdict === 'blocked'
        ? s.goalBlocked
        : goal.wait_barrier
          ? s.goalWaiting
          : { active: s.goalActive, done: s.goalDone, paused: s.goalPaused }[goal.status]

    const turns = goal.max_turns > 0 ? ctrl.goalActiveTurns(goal.turns_used, goal.max_turns) : null

    return { icon: 'target', label: turns ? `${state} · ${turns}` : state, tone }
  }

  if (loop) {
    const label = loop.status === 'paused' ? ctrl.loopPaused : loop.deferred_by_goal ? ctrl.loopDeferred : ctrl.loopActive

    return { icon: 'sync', label, tone }
  }

  if (heartbeat) {
    return {
      icon: 'pulse',
      label: heartbeat.status === 'paused' ? ctrl.heartbeatPaused : ctrl.heartbeatActive,
      tone
    }
  }

  // Legacy goal (structured control unsupported by this backend) or an error row.
  const legacy = items.find(item => item.type === 'goal')
  const status = legacy?.goalStatus

  const label =
    status === 'paused'
      ? s.goalPaused
      : status === 'waiting'
        ? s.goalWaiting
        : status === 'done'
          ? s.goalDone
          : s.goalActive

  return { icon: 'target', label, tone }
}

/**
 * One chip per kind of activity the session has, in CHIP_ORDER. Presence comes
 * from the sections the stack emitted (it already applied tiering and its own
 * gates) or, for decisions, from the prompt stores. Every read is a per-session
 * slice, so other sessions' churn never re-renders the tray.
 */
export function useTrayChips({ sectionKeys, sessionId, sessionKey, t }: TrayChipInputs): TrayChip[] {
  const copy = t.studio.chat.tray
  const approvals = useStore(useMemo(() => sessionApprovalStackSize(sessionId), [sessionId]))
  const clarify = useStore(useMemo(() => sessionClarifyRequest(sessionId), [sessionId]))
  const items = useSessionSlice($statusItemsBySession, sessionId)
  const retained = useSessionSlice($retainedTodosBySession, sessionId)
  const subagents = useSessionSlice($subagentsBySession, sessionId)
  const control = useSessionValue($sessionControlBySession, sessionId)
  const previews = useSessionSlice($previewStatusBySession, sessionId)
  const queueLength = useSessionSlice($queuedPromptsBySession, sessionKey).length
  const parked = useStoreSelector($parkedQueueSessions, map => Boolean(sessionKey && map[sessionKey]))

  const byChip = sectionsByChip(sectionKeys)
  const chips: TrayChip[] = []

  const add = (id: TrayChipId, chip: ChipBody) =>
    chips.push({ ...chip, id, sectionKeys: byChip.get(id) ?? [] })

  if (approvals > 0) {
    add('approval', { icon: 'hand', label: copy.approval(approvals), tone: 'warn' })
  }

  if (clarify) {
    add('needs', { icon: 'question', label: copy.needsInput, tone: 'warn' })
  }

  const todo = todoChip(byChip.get('todo') ?? [], items, retained, t)

  if (todo) {
    add('todo', todo)
  }

  if (byChip.has('control')) {
    add('control', controlChip(control, items, t))
  }

  const liveSubagents = subagents.filter(item => item.status === 'running' || item.status === 'queued').length

  // The section stays mounted between runs; the chip only shows live agents.
  if (byChip.has('subagent') && liveSubagents > 0) {
    add('subagent', { icon: 'agent', label: t.statusStack.subagents(liveSubagents), live: true })
  }

  if (byChip.has('queue') && queueLength > 0) {
    add('queue', queueChip(queueLength, parked, t))
  }

  const background = items.filter(isBackground)
  const backgroundRunning = background.some(item => item.state === 'running')

  if (byChip.has('background')) {
    add('background', {
      icon: 'server-process',
      label: t.statusStack.background(background.length),
      live: backgroundRunning,
      tone: background.some(item => item.state === 'failed') ? 'error' : undefined
    })
  }

  if (byChip.has('preview')) {
    const count = previews.filter(item => backgroundRunning || !isLocalhostPreview(item.target)).length
    add('preview', { icon: 'globe', label: copy.previews(count) })
  }

  if (byChip.has('other')) {
    add('other', { icon: 'ellipsis', label: copy.more })
  }

  return chips.sort((a, b) => CHIP_ORDER.indexOf(a.id) - CHIP_ORDER.indexOf(b.id))
}
