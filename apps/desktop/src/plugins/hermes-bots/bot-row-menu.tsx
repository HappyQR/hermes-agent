/**
 * A bot row's right-click menu — shared by the Bots pane's full row and the
 * sidebar's compact row, so both offer the same verbs. "Open Bot Chat" goes
 * through `openRosterBot`, the one canonical-chat door (src/AGENTS.md).
 */

import {
  Codicon,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  host,
  queryClient,
  useI18n,
  useValue
} from '@hermes/plugin-sdk'

import { saveSelectedRosterBot } from './bot-state'
import { ensureBotMetadata } from './canonical-chat'
import {
  $botMeta,
  $lastRoster,
  botSelectionKey,
  isDefaultBot,
  newBotChat,
  ROSTER_KEY,
  saveBotMeta
} from './data'
import { botGroups } from './group-membership'
import { fallbackSelectionAfterHide, isBotHidden, isBotPinned } from './hidden-bots'
import { useBots } from './i18n'
import { displayName } from './labels'
import { duplicateBot } from './profile-ops'
import { botRecentSession, openBotRecentSession } from './recent-session'
import { openRosterBot } from './roster-actions'
import { botRosterMeta, botWorkspaceOwnerKey, setBotsWorkspaceOwner } from './routing'
import { openBotScreen } from './screen-open'
import type { RosterRow } from './types'
import { $botSections, botSectionId, moveBotsToSection } from './user-sections'

export interface BotRowMenuProps {
  bot: RosterRow
  onDelete: (bot: RosterRow) => void
  onEdit: (bot: RosterRow) => void
  onGroup: (bot: RosterRow) => void
  /** Opens the New section dialog; the bot is filed into it on create. */
  onNewSection: (bot: RosterRow) => void
}

export function BotRowMenu({ bot, onDelete, onEdit, onGroup, onNewSection }: BotRowMenuProps) {
  const { t } = useI18n()
  const b = useBots()
  const allMeta = useValue($botMeta)
  const meta = botRosterMeta(bot, allMeta)
  const hidden = isBotHidden(bot, allMeta)
  const pinned = isBotPinned(bot, allMeta)
  const groups = botGroups(meta)
  const sections = useValue($botSections)
  const currentSectionId = botSectionId(bot, allMeta)

  return (
    <ContextMenuContent>
      <ContextMenuItem onSelect={() => void openRosterBot(bot)}>{b.bot.openBotChat}</ContextMenuItem>
      <ContextMenuItem onSelect={() => openBotScreen(bot, meta)}>{b.screen.menu}</ContextMenuItem>
      <ContextMenuCheckboxItem
        checked={Boolean(meta?.screenAutoOpen)}
        onSelect={() => {
          void ensureBotMetadata(bot)
            .then(current => {
              const next = !current.screenAutoOpen
              void saveBotMeta(bot, { screenAutoOpen: next })
              host.notify({
                kind: 'info',
                message: next
                  ? b.screen.autoOpenOnToast(displayName(bot, current))
                  : b.screen.autoOpenOffToast(displayName(bot, current))
              })
            })
            .catch(error => host.notifyError?.(error, b.bot.metadataLoadFailed))
        }}
      >
        {b.screen.autoOpenMenu}
      </ContextMenuCheckboxItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        onSelect={() => {
          void ensureBotMetadata(bot)
            .then(current => {
              const pinned = Boolean(current.pinned)
              void saveBotMeta(bot, {
                pinned: !pinned
              })
              host.notify({
                kind: 'info',
                message: pinned
                  ? b.bot.unpinnedToast(displayName(bot, current))
                  : b.bot.pinnedToast(displayName(bot, current))
              })
            })
            .catch(error => host.notifyError?.(error, b.bot.metadataLoadFailed))
        }}
      >
        {pinned ? b.bot.unpin : b.bot.pinToTop}
      </ContextMenuItem>
      <ContextMenuItem
        onSelect={() => {
          void ensureBotMetadata(bot)
            .then(current => {
              const hidden = Boolean(current.hidden)
              void saveBotMeta(bot, {
                hidden: !hidden
              })

              if (!hidden) {
                fallbackSelectionAfterHide(botSelectionKey(bot))
              }

              host.notify({
                kind: 'info',
                message: hidden
                  ? b.bot.unhiddenToast(displayName(bot, current))
                  : b.bot.hiddenToast(displayName(bot, current))
              })
            })
            .catch(error => host.notifyError?.(error, b.bot.metadataLoadFailed))
        }}
      >
        {hidden ? b.bot.unhide : b.bot.hide}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        onSelect={() =>
          void ensureBotMetadata(bot)
            .then(() => onEdit(bot))
            .catch(error => host.notifyError?.(error, b.bot.loadFailed))
        }
      >
        {b.bot.editMenu}
      </ContextMenuItem>
      <ContextMenuItem
        onSelect={() =>
          void ensureBotMetadata(bot)
            .then(() => onGroup(bot))
            .catch(error => host.notifyError?.(error, b.bot.groupsLoadFailed))
        }
      >
        {groups.length ? b.bot.groupsMenu(groups.join(', ')) : b.bot.manageGroups}
      </ContextMenuItem>
      <ContextMenuItem
        onSelect={() => {
          host.notify({
            kind: 'info',
            message: `Duplicating ${displayName(bot, meta)}…`
          })
          duplicateBot(bot, $lastRoster.get())
            .then(name => {
              queryClient.invalidateQueries({
                queryKey: ROSTER_KEY
              })
              host.notify({
                kind: 'success',
                message: `Created ${name} — full copy of ${bot.name}`
              })
            })
            .catch(err => host.notifyError(err, b.bot.duplicateFailed))
        }}
      >
        {b.bot.duplicate}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        onSelect={() => {
          saveSelectedRosterBot(bot)
          setBotsWorkspaceOwner(botWorkspaceOwnerKey(bot), bot)
          newBotChat(bot)
        }}
      >
        {b.bot.newChatWith}
      </ContextMenuItem>
      {/* Click-to-latest (#93054): the freshest listed session — a cron run,
          a delegated job, a side thread — without moving the row click off
          the canonical Bot Chat. */}
      <ContextMenuItem disabled={!botRecentSession(bot)} onSelect={() => void openBotRecentSession(bot)}>
        Open recent session
      </ContextMenuItem>
      <ContextMenuSeparator />
      {/* Filing. Membership is one field on the bot's meta (`sectionId`), so
          this is a one-field write and no list anywhere has to be kept in
          sync with it. */}
      <ContextMenuSub>
        <ContextMenuSubTrigger>{b.sections.moveTo}</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          {sections.map(section => (
            <ContextMenuItem
              disabled={section.id === currentSectionId}
              key={section.id}
              onSelect={() => void moveBotsToSection([bot], section.id)}
            >
              <Codicon className="mr-1.5" name="folder" />
              {section.name}
            </ContextMenuItem>
          ))}
          {sections.length ? <ContextMenuSeparator /> : null}
          <ContextMenuItem onSelect={() => onNewSection(bot)}>
            <Codicon className="mr-1.5" name="new-folder" />
            {b.sections.newSectionEllipsis}
          </ContextMenuItem>
          {currentSectionId ? (
            <ContextMenuItem onSelect={() => void moveBotsToSection([bot], null)}>
              <Codicon className="mr-1.5" name="inbox" />
              {b.sections.removeFromSection}
            </ContextMenuItem>
          ) : null}
        </ContextMenuSubContent>
      </ContextMenuSub>
      {isDefaultBot(bot) ? null : <ContextMenuSeparator />}
      {isDefaultBot(bot) ? null : (
        <ContextMenuItem onSelect={() => onDelete(bot)} variant="destructive">
          {t.common.delete}
        </ContextMenuItem>
      )}
    </ContextMenuContent>
  )
}
