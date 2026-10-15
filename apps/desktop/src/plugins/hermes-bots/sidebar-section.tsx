/**
 * The sidebar's compact Bots section (Hermes Studio; core area
 * `sidebar.sections`): one quiet row per bot — face, name, a running ring —
 * after the Sessions list. A click goes through `openRosterBot`, the same
 * canonical-chat door as the Bots pane's rows (src/AGENTS.md: one bot = ONE
 * canonical forever-chat, identified by name; never a stored pointer). The
 * full roster — sections, group chats, search, filters — stays in the Bots
 * workspace, one click away in the header's ⋯ menu.
 */

import {
  atom,
  Button,
  cn,
  computed,
  ContextMenu,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  GlyphSpinner,
  host,
  queryClient,
  RowButton,
  SIDEBAR_SECTIONS_AREA,
  type SidebarSectionContribution,
  StudioIcon,
  Tip,
  translateNow,
  useI18n,
  useValue
} from '@hermes/plugin-sdk'

import { avatarColor, botAppearance, BotFace } from './avatar'
import { isBackfilledFacePng } from './avatar-image'
import { BotRowMenu } from './bot-row-menu'
import { $botChatFocused, $focusedBotOwner, $pendingBotOpen, $selectedRosterKey, focusedRosterOwner } from './bot-state'
import { $botAttention, $botMeta, $lastRoster, botRosterKey, botSelectionKey, botSourceStatus, ROSTER_KEY, useRoster } from './data'
import { $groupChatWorkspace } from './group-chat'
import { $activeGroupMemberKeys } from './group-presence'
import { $showHiddenBots, isBotHidden } from './hidden-bots'
import { useBots } from './i18n'
import { displayName } from './labels'
import { $activityToasts, openRosterBot, setActivityToasts } from './roster-actions'
import { sortRosterBots } from './roster-pane-derivation'
import { renderRosterDialogs } from './roster-pane-dialogs'
import { botRosterMeta } from './routing'
import { botRowOwnsWorkspace, botWorkingMood, useTurnBusy, warmRosterBot } from './row-helpers'
import { ID } from './shared'
import type { BotMeta, GroupMember, RosterRow } from './types'
import type { SectionDialogState } from './user-sections'

/** The bots the section lists: the roster in the pane's order (pinned, then
 *  most recent activity), minus offline ghosts and — unless the user asked to
 *  see them — hidden bots. */
export function sidebarBots(roster: readonly RosterRow[], meta: Record<string, BotMeta>, showHidden: boolean) {
  const live = (Array.isArray(roster) ? roster : []).filter(bot => bot && !bot.ghost)

  return sortRosterBots(live, meta).roster.filter(bot => showHidden || !isBotHidden(bot, meta))
}

/** The header's folded count. */
export const $botsSidebarCount = computed(
  [$lastRoster, $botMeta, $showHiddenBots],
  (roster, meta, showHidden) => sidebarBots(roster, meta, showHidden).length
)

// ── Dialogs ──────────────────────────────────────────────────────────────────
// One owner for the section's dialogs: the header tools, which are mounted
// whether or not the section is open (its "+" must work while folded). Rows
// and the "+" menu open them through this atom.

interface DialogState {
  createOpen: boolean
  groupCreateOpen: boolean
  editing: null | RosterRow
  deleting: null | (RosterRow & { path?: string })
  deletingGroup: null | { members: GroupMember[]; name: string }
  grouping: null | RosterRow
  sectionDialog: SectionDialogState
}

const CLOSED: DialogState = {
  createOpen: false,
  deleting: null,
  deletingGroup: null,
  editing: null,
  groupCreateOpen: false,
  grouping: null,
  sectionDialog: null
}

const $dialogs = atom<DialogState>(CLOSED)

const openDialog = (patch: Partial<DialogState>) => $dialogs.set({ ...$dialogs.get(), ...patch })

function SectionDialogs({ roster }: { roster: RosterRow[] }) {
  const { t } = useI18n()
  const b = useBots()
  const state = useValue($dialogs)

  return renderRosterDialogs({
    b,
    t,
    ...state,
    activeSourceRoster: roster.filter(bot => !bot.remoteSource),
    refetch: () => queryClient.invalidateQueries({ queryKey: ROSTER_KEY }),
    roster,
    setCreateOpen: createOpen => openDialog({ createOpen }),
    setDeleting: deleting => openDialog({ deleting }),
    setDeletingGroup: deletingGroup => openDialog({ deletingGroup }),
    setEditing: editing => openDialog({ editing }),
    setGroupCreateOpen: groupCreateOpen => openDialog({ groupCreateOpen }),
    setGrouping: grouping => openDialog({ grouping }),
    setSectionDialog: sectionDialog => openDialog({ sectionDialog })
  })
}

// ── Header tools ─────────────────────────────────────────────────────────────

const TOOL = 'size-5.5 rounded-[6px] text-(--ui-text-tertiary) hover:text-foreground data-[state=open]:bg-(--ui-press)'

/** "+" (new bot, new group chat, new section) and "⋯" (the Bots workspace,
 *  hidden bots, activity toasts) — the Bots pane toolbar's verbs. */
export function BotsSidebarTools() {
  const b = useBots()
  const roster = useValue($lastRoster)
  const showHidden = useValue($showHiddenBots)
  const activityToasts = useValue($activityToasts)
  const live = roster.filter(bot => !bot?.ghost)

  return (
    <span className="flex items-center">
      <DropdownMenu>
        <Tip label={b.roster.newBotOrGroup}>
          <DropdownMenuTrigger asChild>
            <Button aria-label={b.roster.newBotOrGroup} className={TOOL} size="icon-xs" variant="ghost">
              <StudioIcon name="plus" size={13} />
            </Button>
          </DropdownMenuTrigger>
        </Tip>
        <DropdownMenuContent align="start" className="min-w-48">
          <DropdownMenuItem onSelect={() => openDialog({ createOpen: true })}>
            <StudioIcon name="bot" size={15} />
            <span>{b.bot.newTitle}</span>
          </DropdownMenuItem>
          {/* A room needs two bots (any registered connection, as the dialog seats). */}
          <DropdownMenuItem disabled={live.length < 2} onSelect={() => openDialog({ groupCreateOpen: true })}>
            <StudioIcon name="people" size={15} />
            <span>{b.group.newTitle}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openDialog({ sectionDialog: { mode: 'create' } })}>
            <StudioIcon name="folder-plus" size={15} />
            <span>{b.sections.newSection}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label={b.sidebar.more} className={TOOL} size="icon-xs" variant="ghost">
            <StudioIcon name="more" size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-52">
          <DropdownMenuItem onSelect={() => host.revealPane?.(`${ID}:pane`)}>
            <StudioIcon name="bot" size={15} />
            <span>{b.sidebar.openWorkspace}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={showHidden} onCheckedChange={next => $showHiddenBots.set(Boolean(next))}>
            {b.roster.showHidden}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={activityToasts} onCheckedChange={next => setActivityToasts(Boolean(next))}>
            {b.sidebar.activityToasts}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SectionDialogs roster={roster} />
    </span>
  )
}

// ── Rows ─────────────────────────────────────────────────────────────────────

const rowCallbacks = {
  onDelete: (deleting: RosterRow) => openDialog({ deleting }),
  onEdit: (editing: RosterRow) => openDialog({ editing }),
  onGroup: (grouping: RosterRow) => openDialog({ grouping }),
  onNewSection: (bot: RosterRow) => openDialog({ sectionDialog: { bot, mode: 'create' } })
}

/** One bot as a 30px sidebar row. Same open path, highlight rule, working
 *  mood and right-click menu as the pane's row; no preview line. */
function CompactBotRow({ bot }: { bot: RosterRow }) {
  const b = useBots()
  const allMeta = useValue($botMeta)
  const meta = botRosterMeta(bot, allMeta)
  const focusedOwner = focusedRosterOwner(useValue($focusedBotOwner))
  const selectedRosterKey = useValue($selectedRosterKey)
  const botChatFocused = useValue($botChatFocused)
  const activeGroup = useValue($groupChatWorkspace)
  const opening = useValue($pendingBotOpen)?.key === botRosterKey(bot)
  const turnBusy = useTurnBusy()
  const groupKeys = useValue($activeGroupMemberKeys)
  const attentionByKey = useValue($botAttention)
  const activeConnectionId = String(host.state.connectionId?.get?.() || 'local').trim()

  // The pane row's lookup: group turns record under the selection key, relay
  // deliveries under the route key (or `<active connection>::<name>`).
  const attention =
    attentionByKey[botSelectionKey(bot)] ||
    attentionByKey[botRosterKey(bot)] ||
    attentionByKey[`${bot?.connectionId || activeConnectionId}::${bot?.name || 'default'}`] ||
    null

  const mood = botWorkingMood(bot, focusedOwner, turnBusy, activeConnectionId, Date.now(), groupKeys)
  const active = botRowOwnsWorkspace(bot, activeGroup, botChatFocused, focusedOwner, selectedRosterKey)
  const status = botSourceStatus(bot)
  const { shape, color, image } = botAppearance(bot.name, meta)
  const name = displayName(bot, meta)

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <RowButton
          aria-busy={opening || undefined}
          aria-label={[name, status.label].filter(Boolean).join(' · ')}
          className={cn(
            'flex h-7.5 w-full min-w-0 items-center gap-2 rounded-[7px] px-2 text-left text-[0.8125rem] transition-colors duration-[120ms]',
            'hover:bg-(--ui-row-hover-background)',
            active && 'bg-(--ui-row-active-background) hover:bg-(--ui-row-active-background)'
          )}
          data-roster-key={botRosterKey(bot)}
          onClick={() => void openRosterBot(bot)}
          onPointerEnter={() => warmRosterBot(bot)}
        >
          <span className={cn('grid size-4.5 shrink-0 place-items-center', !status.available && 'opacity-60 grayscale')}>
            <BotFace
              color={avatarColor(color, bot.name)}
              image={image && !isBackfilledFacePng(image) ? image : null}
              mood={mood}
              name={bot.name}
              shape={shape}
              size={18}
            />
          </span>
          <span className="min-w-0 flex-1 truncate">{name}</span>
          {attention ? (
            <span aria-label={b.roster.needsAttention} className="grid shrink-0 place-items-center text-(--ui-orange)" role="img">
              <StudioIcon name="warn" size={13} />
            </span>
          ) : null}
          {opening ? (
            <GlyphSpinner ariaLabel={b.bot.openingChat} className="shrink-0 text-xs text-(--ui-text-secondary)" />
          ) : mood === 'idle' ? null : (
            <span aria-hidden="true" className="studio-ring-run size-2.75 shrink-0" />
          )}
        </RowButton>
      </ContextMenuTrigger>
      <BotRowMenu bot={bot} {...rowCallbacks} />
    </ContextMenu>
  )
}

// ── Body ─────────────────────────────────────────────────────────────────────

/** The section body: polls the roster while open (the pane's own query) and
 *  lists the bots; empty, it offers the first bot. */
export function BotsSidebarSection() {
  const b = useBots()
  const { data, error } = useRoster()
  const allMeta = useValue($botMeta)
  const lastRoster = useValue($lastRoster)
  const showHidden = useValue($showHiddenBots)
  const live = Array.isArray(data?.profiles) ? data.profiles : null
  const bots = sidebarBots(live ?? lastRoster, allMeta, showHidden)

  if (!bots.length) {
    return !data && !error ? (
      <div className="flex h-7.5 items-center px-2">
        <GlyphSpinner ariaLabel={b.roster.waitingForGateway} className="text-xs text-(--ui-text-quaternary)" />
      </div>
    ) : (
      <div className="mx-2 mt-0.5 mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg px-2.5 py-2 text-xs text-(--ui-text-tertiary) shadow-[inset_0_0_0_1px_var(--ui-line)]">
        <span>{b.roster.emptyTitle}</span>
        <Button onClick={() => openDialog({ createOpen: true })} size="xs" variant="text">
          {b.bot.newTitle}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-px" data-slot="sidebar-bots">
      {bots.map(bot => (
        <CompactBotRow bot={bot} key={botRosterKey(bot)} />
      ))}
    </div>
  )
}

/** The `sidebar.sections` registration (plugin.tsx registers it). */
export function botsSidebarSectionContribution() {
  const data: SidebarSectionContribution = {
    count: $botsSidebarCount,
    defaultCollapsed: true,
    title: () => translateNow('common.bots'),
    tools: BotsSidebarTools
  }

  return { area: SIDEBAR_SECTIONS_AREA, data, id: 'sidebar-section', render: () => <BotsSidebarSection /> }
}
