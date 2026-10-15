// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const enStudioChat: StudioChatTranslations = {
  contextUsage: 'Context usage',
  tray: {
    label: 'Activity',
    hide: 'Hide activity',
    show: count => `Show activity (${count})`,
    approval: count => (count > 1 ? `Approval needed · ${count}` : 'Approval needed'),
    approvalHint: 'Jump to the command waiting for approval',
    needsInput: 'Waiting for your choice',
    needsInputHint: 'Jump to the question',
    previews: count => `${count} Preview${count === 1 ? '' : 's'}`,
    more: 'More',
    close: 'Close',
    titles: {
      background: 'Background processes',
      preview: 'Preview links',
      previousTodo: 'Previous tasks',
      queue: 'Queue',
      subagent: 'Subagents',
      todo: 'Tasks'
    },
    todoCaption: 'Kept up to date by Hermes this turn',
    queueCaption: 'Sends in order after this turn',
    git: {
      hint: 'Branch, changes and worktrees',
      reviewChanges: 'Review changes',
      openPullRequest: number => `Open pull request #${number}`,
      copyWorktreePath: 'Copy worktree path'
    }
  }
}
