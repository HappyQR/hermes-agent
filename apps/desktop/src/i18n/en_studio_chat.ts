// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const enStudioChat: StudioChatTranslations = {
  contextUsage: 'Context usage',
  composer: {
    addContext: 'Add context',
    addContextHint: 'Add files, images, links or snippets',
    popOut: 'Pop out composer',
    dock: 'Dock composer',
    skills: 'Skills…',
    autoApprove: 'Auto-approve',
    autoApproveHint: 'Approvals are off — commands run without asking',
    yoloHint: 'YOLO is on for this chat — commands run without asking',
    turnOffYolo: 'Turn off YOLO for this chat',
    contextUsagePercent: percent => `Context usage ${percent}%`,
    cacheHit: value => `cache hit ${value}`,
    stats: {
      cacheHit: 'Cache hit',
      throughput: 'Throughput',
      throughputValue: value => `${value} tok/s`,
      turnTime: 'This turn',
      sessionCost: 'Session cost'
    },
    compress: 'Compress context',
    compressIdleOnly: 'Available while Hermes is idle',
    usageDetails: 'Usage details',
    effortOff: 'Off',
    moreSendOptions: 'More send options',
    steerHint: 'after the next tool call',
    redirectHint: 'stops, then sends',
    voiceOptionsHint: 'Right-click for voice options',
    voiceEngineHint: 'Right-click to choose the engine',
    placeholderBusy: combo => `Add context, or ${combo} to queue for the next turn`,
    placeholderHero: 'Give Hermes a task — / for commands, @ to reference files'
  },
  transcript: {
    delegateSpawned: count => `Spawned ${count} subagent${count === 1 ? '' : 's'}`,
    delegateRunning: count => `${count} running`,
    delegateAllDone: 'All done',
    openAgents: 'View in Agents',
    editAndRerun: 'Edit and rerun',
    editRerunNote: 'Sends from here — later messages in this chat are removed',
    previousVersion: 'Previous version',
    nextVersion: 'Next version',
    exportMarkdown: 'Export as Markdown…',
    exportFileName: 'Hermes reply.md',
    exported: name => `Saved ${name}`,
    exportFailed: "Couldn't export the reply"
  },
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
