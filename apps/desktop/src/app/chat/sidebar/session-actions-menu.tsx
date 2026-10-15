import { useStore } from '@nanostores/react'
import type * as React from 'react'
import { useEffect, useRef, useState } from 'react'

import {
  type ActionItemSpec,
  ActionsContextMenu,
  ActionsMenu,
  type MenuKit,
  renderActionItem
} from '@/components/ui/actions-menu'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CopyButton } from '@/components/ui/copy-button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { renameSession } from '@/hermes'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { isSubmitEnter } from '@/lib/ime'
import { activeGateway } from '@/store/gateway'
import { notify, notifyError } from '@/store/notifications'
import { applyRenamedSessionTitle } from '@/store/projects'
import {
  $activeSessionId,
  $connection,
  $selectedStoredSessionId,
  $sessions,
  $unreadFinishedSessionIds,
  applySessionTitle,
  markSessionRead,
  sessionMatchesStoredId
} from '@/store/session'
import { $sessionStates, $sessionTiles, openSessionTile } from '@/store/session-states'
import { ackStoredSessionId } from '@/store/session-unread'

import type { SessionTitleResponse } from '../../types'

import {
  buildDangerItems,
  buildOpenItems,
  buildTabItems,
  clickHint,
  menuIcon,
  MoveToProjectSubmenu,
  SessionColorSubmenu,
  SessionExportSubmenu
} from './session-actions-menu-items'
import { SplitSubmenu } from './split-submenu'

// Rename a session, preferring the gateway's session.title RPC over REST.
//
// A freshly *branched* session (and any brand-new chat) lives only in the
// gateway's in-memory _sessions map keyed by its RUNTIME id — no row is
// persisted to state.db until the first turn. REST PATCH /api/sessions/{id}
// resolves against the stored sessions table, so it 404s ("Session not found")
// on these runtime-only sessions. The session.title RPC resolves the live
// runtime session AND persists the row on demand, so it succeeds where REST
// cannot. This mirrors the /title slash command's fix (use-prompt-actions.ts).
//
// We only take the RPC path for the ACTIVE/selected session: its runtime id is
// known ($activeSessionId) and it lives on the active gateway, so there is no
// profile-routing ambiguity. Every other row (already persisted, possibly on a
// background profile) keeps the REST path, which handles profile scoping and a
// non-empty title is required by the RPC (it rejects clears), so clears stay on
// REST too.
/** Resolve a live runtime id for a stored session id, from any surface that
 *  currently holds one — not just the selected-primary row.
 *
 *  A branched session opens as its own TAB and deliberately does NOT become the
 *  selected primary row, so `$selectedStoredSessionId`/`$activeSessionId` do not
 *  see it. Until its first turn it also has no persisted DB row, so a REST
 *  rename 404s "session not found". But the branch flow binds a runtime and
 *  stores it on the tile (`patchSessionTile(..., { runtimeId })`), and
 *  `$sessionStates` is keyed by runtime id with `storedSessionId` on each state.
 *  Consulting those lets the working `session.title` RPC path fire for a
 *  just-branched draft instead of falling through to a 404. (#70317) */
function resolveRuntimeIdForStored(storedSessionId: string): null | string {
  if (storedSessionId === $selectedStoredSessionId.get()) {
    const active = $activeSessionId.get()

    if (active) {
      return active
    }
  }

  const tileRuntimeId = $sessionTiles.get().find(tile => tile.storedSessionId === storedSessionId)?.runtimeId

  if (tileRuntimeId) {
    return tileRuntimeId
  }

  for (const [runtimeId, state] of Object.entries($sessionStates.get())) {
    if (state.storedSessionId === storedSessionId) {
      return runtimeId
    }
  }

  return null
}

export async function renameSessionPreferringRpc(
  storedSessionId: string,
  title: string,
  profile?: string
): Promise<{ title?: string }> {
  const resolvedProfile =
    (profile ?? '').trim() ||
    $sessions.get().find(s => sessionMatchesStoredId(s, storedSessionId))?.profile ||
    undefined

  const runtimeId = resolveRuntimeIdForStored(storedSessionId)
  const gateway = activeGateway()

  if (title && runtimeId && gateway) {
    try {
      const result = await gateway.request<SessionTitleResponse>('session.title', {
        session_id: runtimeId,
        title
      })

      return { title: result?.title ?? title }
    } catch (err) {
      // Fall through to REST — e.g. the socket is mid-reconnect. REST still
      // works for any session that already has a persisted row. Log so a
      // genuine RPC-side failure (which then surfaces a REST 404 for the
      // runtime id) is at least diagnosable instead of silently swallowed.
      console.warn('session.title RPC rename failed; falling back to REST', err)
    }
  }

  return renameSession(storedSessionId, title, resolvedProfile)
}

interface SessionActions {
  sessionId: string
  title: string
  pinned?: boolean
  /** Backend-derived read state — drives the Mark as unread/read label. */
  unread?: boolean
  /** The row is already archived (the sidebar's Archived view): the shared
   *  archive verb becomes Unarchive and restores the session (#98813). */
  archived?: boolean
  profile?: string
  onPin?: () => void
  /** Toggle the persisted read-state watermark for this row. */
  onToggleUnread?: () => void
  onBranch?: () => void
  onArchive?: () => void
  onDelete?: () => void
  /** Close this surface (a tile tab) — omitted where nothing closes (sidebar
   *  rows, the main tab). */
  onClose?: () => void
  /** TAB surfaces: the session is already a tab, so "Open in new tab" is
   *  nonsense there — sidebar rows/dropdowns keep it. */
  surface?: 'row' | 'tab'
  /** May this session be renamed? False for a canonical Bot Chat tab: its
   *  exact title is the bot's identity (the backend guard refuses a user
   *  rename and the caption never reads the stored title anyway — #124857),
   *  so the Rename item and dialog are omitted instead of toasting success
   *  over a no-op. Mirrors how onPin/onBranch are gated. */
  renameable?: boolean
  /** The tab's layout-tree pane id (`session-tile:<id>` or `workspace`) — enables
   *  the Close-others / to-the-right / all tab verbs. Tab surfaces only. */
  tabPaneId?: string
  /** The MAIN tab's escape hatch: hide the zone's tab bar (it sticky-shows
   *  once a tab is ever gained; this is the explicit off switch). */
  onHideTabBar?: () => void
}

function useSessionActions({
  sessionId,
  title,
  pinned = false,
  unread = false,
  archived = false,
  profile,
  onPin,
  onToggleUnread,
  onBranch,
  onArchive,
  onDelete,
  onClose,
  onHideTabBar,
  renameable = true,
  surface = 'row',
  tabPaneId
}: SessionActions) {
  const { t } = useI18n()
  const r = t.sidebar.row
  const menu = t.studio.sidebar.menu
  const [renameOpen, setRenameOpen] = useState(false)
  // The rename item opens a Dialog. When a menu closes, Radix restores focus to
  // its trigger — for a sidebar row that trigger is the row's own <button>, so
  // focus lands there instead of the dialog's input: Space then activates the
  // row (selecting the session) and the arrow keys move the list rather than
  // the caret. Suppress that one restore so the dialog keeps focus; every other
  // action leaves the restore alone (it's the correct behavior for them). Mirrors
  // the project menu's appearance-popover guard.
  const suppressCloseFocusRef = useRef(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const tiles = useStore($sessionTiles)
  const selectedStoredSessionId = useStore($selectedStoredSessionId)
  const isRemote = useStore($connection)?.mode === 'remote'
  // The row's finished-unread dot is cleared by opening the session (main or
  // tile) — this menu item is the explicit escape hatch for the rest.
  const isUnread = useStore($unreadFinishedSessionIds).includes(sessionId)
  const row = surface === 'row'

  // Already showing as a tab somewhere (a tile, or loaded in main — main IS
  // a tab): offering "Open in new tab" again is noise.
  const alreadyTabbed = sessionId === selectedStoredSessionId || tiles.some(tile => tile.storedSessionId === sessionId)

  const openItems = buildOpenItems({ alreadyTabbed, isRemote, menu, profile, r, row, sessionId })

  // IDENTITY — name/mark/reference the session. Rename is omitted (not
  // disabled) for a session whose title is not its name — a canonical Bot
  // Chat — so the menu never offers a verb whose result the user cannot see.
  const identityItems: ActionItemSpec[] = [
    ...(renameable
      ? [
          {
            disabled: !sessionId,
            iconNode: menuIcon('pencil'),
            label: r.rename,
            onSelect: () => {
              triggerHaptic('selection')
              // Keep focus off the row trigger so it lands in the dialog input.
              suppressCloseFocusRef.current = true
              setRenameOpen(true)
            }
          }
        ]
      : []),
    {
      disabled: !onPin,
      hint: row ? clickHint(['shift'], menu) : undefined,
      iconNode: menuIcon('pin'),
      label: pinned ? r.unpin : r.pin,
      onSelect: () => {
        triggerHaptic('selection')
        onPin?.()
      }
    },
    // One read-state item, driven by BOTH unread sources: the transient
    // finished-unread dot (isUnread) and the backend watermark (unread).
    // "Mark as read" clears whichever is lit; "Mark as unread" arms the
    // persisted watermark so the dot survives restarts.
    {
      disabled: !sessionId || (!onToggleUnread && !isUnread),
      iconNode: menuIcon('dot'),
      label: unread || isUnread ? r.markRead : r.markUnread,
      onSelect: () => {
        triggerHaptic('selection')

        if (unread || isUnread) {
          // Clear the transient family dot immediately (and ack the persisted
          // watermark/marker so a list refresh doesn't repaint it)…
          markSessionRead(sessionId)
          ackStoredSessionId(sessionId)

          // …and retire the persisted watermark when the row carries one.
          if (unread) {
            onToggleUnread?.()
          }
        } else {
          onToggleUnread?.()
        }
      }
    }
  ]

  const tabItems = surface === 'tab' ? buildTabItems({ onClose, tabPaneId, t }) : []

  const dangerItems = buildDangerItems({
    archived,
    onArchive,
    onDelete,
    requestDelete: () => setDeleteOpen(true),
    row,
    t
  })

  // `close` dismisses a controlled dropdown after the split row's default
  // (right) split; a context menu passes none and picks from the submenu.
  const renderItems = (kit: MenuKit, close?: () => void) => (
    <>
      {openItems.map(item => renderActionItem(kit, item))}
      {row && (
        <SplitSubmenu
          close={close}
          disabled={!sessionId}
          kit={kit}
          label={r.openInSplit}
          onSplit={dir => openSessionTile(sessionId, dir)}
        />
      )}
      {(openItems.length > 0 || row) && <kit.Separator />}
      {identityItems.map(item => renderActionItem(kit, item))}
      <SessionColorSubmenu kit={kit} sessionId={sessionId} />
      <CopyButton
        appearance={kit.copyAppearance}
        disabled={!sessionId}
        errorMessage={r.copyIdFailed}
        iconClassName="size-3.5 text-current"
        key={menu.copySessionId}
        label={menu.copySessionId}
        onCopyError={err => notifyError(err, r.copyIdFailed)}
        text={sessionId}
      />
      <kit.Separator />
      {renderActionItem(kit, {
        disabled: !onBranch,
        iconNode: menuIcon('branch'),
        label: menu.branchFromHere,
        onSelect: () => {
          triggerHaptic('selection')
          onBranch?.()
        }
      })}
      <SessionExportSubmenu kit={kit} profile={profile} sessionId={sessionId} title={title} />
      <MoveToProjectSubmenu kit={kit} profile={profile} sessionId={sessionId} />
      {tabItems.length > 0 && (
        <>
          <kit.Separator />
          {tabItems.map(item => renderActionItem(kit, item))}
        </>
      )}
      <kit.Separator />
      {dangerItems.map(item => renderActionItem(kit, item))}
      {onHideTabBar && (
        <>
          <kit.Separator />
          {renderActionItem(kit, {
            disabled: false,
            icon: 'eye-closed',
            label: r.hideTabBar,
            onSelect: () => {
              triggerHaptic('selection')
              onHideTabBar()
            }
          })}
        </>
      )}
    </>
  )

  const renameDialog = renameable ? (
    <RenameSessionDialog
      currentTitle={title}
      onOpenChange={setRenameOpen}
      open={renameOpen}
      profile={profile}
      sessionId={sessionId}
    />
  ) : null

  // Consumed once per close: when rename was the action that closed the menu,
  // block Radix's focus-restore to the trigger so the dialog input keeps focus.
  const onCloseAutoFocus = (event: Event) => {
    if (suppressCloseFocusRef.current) {
      suppressCloseFocusRef.current = false
      event.preventDefault()
    }
  }

  const deleteDialog = (
    <DeleteSessionDialog
      onConfirm={() => {
        onDelete?.()
      }}
      onOpenChange={setDeleteOpen}
      open={deleteOpen}
      sessionTitle={title}
    />
  )

  return { deleteDialog, onCloseAutoFocus, renameDialog, renderItems }
}

interface DeleteSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  sessionTitle: string
}

// Thin wrapper over ConfirmDialog — the single choke point for every session
// delete entry point (sidebar rows, tab menus, the chat header). Deleting a
// session is irreversible and the desktop used to fire it instantly on click
// (#61470); this mirrors the CLI's y/N guard. onConfirm is the fire-and-forget
// delete call; ConfirmDialog owns the busy/done beat and Enter-to-confirm.
function DeleteSessionDialog({ open, onOpenChange, onConfirm, sessionTitle }: DeleteSessionDialogProps) {
  const { t } = useI18n()
  const r = t.sidebar.row

  return (
    <ConfirmDialog
      busyLabel={r.deleting}
      confirmLabel={t.common.delete}
      description={r.deleteDesc(sessionTitle)}
      destructive
      doneLabel={r.deleted}
      onClose={() => onOpenChange(false)}
      onConfirm={onConfirm}
      open={open}
      title={r.deleteTitle}
    />
  )
}

interface SessionActionsMenuProps
  extends SessionActions, Pick<React.ComponentProps<typeof ActionsMenu>, 'align' | 'sideOffset'> {
  children: React.ReactNode
}

export function SessionActionsMenu({ children, align = 'end', sideOffset = 6, ...actions }: SessionActionsMenuProps) {
  const { t } = useI18n()
  const { deleteDialog, onCloseAutoFocus, renameDialog, renderItems } = useSessionActions(actions)
  // Controlled, so the split row's default action can dismiss the menu.
  const [open, setOpen] = useState(false)

  return (
    <>
      <ActionsMenu
        align={align}
        ariaLabel={t.sidebar.row.sessionActions}
        contentClassName="min-w-56"
        items={kit => renderItems(kit, () => setOpen(false))}
        onCloseAutoFocus={onCloseAutoFocus}
        onOpenChange={setOpen}
        open={open}
        sideOffset={sideOffset}
      >
        {children}
      </ActionsMenu>
      {renameDialog}
      {deleteDialog}
    </>
  )
}

interface SessionContextMenuProps extends SessionActions {
  children: React.ReactNode
}

export function SessionContextMenu({ children, ...actions }: SessionContextMenuProps) {
  const { t } = useI18n()
  const { deleteDialog, onCloseAutoFocus, renameDialog, renderItems } = useSessionActions(actions)

  return (
    <>
      <ActionsContextMenu
        ariaLabel={t.sidebar.row.sessionActions}
        contentClassName="min-w-56"
        items={kit => renderItems(kit)}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        {children}
      </ActionsContextMenu>
      {renameDialog}
      {deleteDialog}
    </>
  )
}

interface RenameSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  currentTitle: string
  profile?: string
}

function RenameSessionDialog({ open, onOpenChange, sessionId, currentTitle, profile }: RenameSessionDialogProps) {
  const { t } = useI18n()
  const r = t.sidebar.row
  const [value, setValue] = useState(currentTitle)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setValue(currentTitle)
      window.setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [currentTitle, open])

  const submit = async () => {
    const next = value.trim()

    if (!sessionId || submitting) {
      return
    }

    if (next === currentTitle.trim()) {
      onOpenChange(false)

      return
    }

    setSubmitting(true)

    try {
      const targetProfile =
        (profile ?? '').trim() || $sessions.get().find(s => sessionMatchesStoredId(s, sessionId))?.profile || undefined

      const result = await renameSessionPreferringRpc(sessionId, next, targetProfile)
      const finalTitle = result.title || next || ''
      // One write, every list: patch the main store AND the project surfaces.
      // Bare-id patching only the recents slice left project-scoped rows
      // (overview previews, entered-project lanes) on the stale title until a
      // profile switch forced a refetch (#123337).
      applySessionTitle(sessionId, finalTitle || null)
      applyRenamedSessionTitle(sessionId, finalTitle || null)
      notify({ durationMs: 2_000, kind: 'success', message: r.renamed })
      onOpenChange(false)
    } catch (err) {
      notifyError(err, r.renameFailed)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{r.renameTitle}</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          disabled={submitting}
          onChange={event => setValue(event.target.value)}
          onKeyDown={event => {
            if (isSubmitEnter(event)) {
              event.preventDefault()
              void submit()
            } else if (event.key === 'Escape') {
              onOpenChange(false)
            }
          }}
          placeholder={r.untitledPlaceholder}
          ref={inputRef}
          value={value}
        />
        <DialogFooter>
          <Button disabled={submitting} onClick={() => onOpenChange(false)} type="button" variant="ghost">
            {t.common.cancel}
          </Button>
          <Button disabled={submitting} onClick={() => void submit()} type="button">
            {t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
