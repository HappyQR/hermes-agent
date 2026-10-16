/** Hermes Studio — The chat surface: composer, activity tray, transcript, empty state. */
export interface StudioChatTranslations {
  contextUsage: string
  composer: StudioChatComposerTranslations
  empty: StudioChatEmptyTranslations
  toolRun: StudioChatToolRunTranslations
  transcript: StudioChatTranscriptTranslations
  tray: StudioChatTrayTranslations
  voice: StudioChatVoiceTranslations
}

/** Messages, their actions, cards and decisions in the transcript. */
export interface StudioChatTranscriptTranslations {
  /** The web search row's detail label. */
  searchResults: string
  /** A delegated child's title when its call carried no goal. */
  delegatedTask: string
  delegateSpawned: (count: number) => string
  delegateRunning: (count: number) => string
  delegateAllDone: string
  openAgents: string
  approvalTitle: string
  /** The approval title when what waits is not a plain command (plugin rule, config change). */
  approvalTitleAction: string
  /** The approval card's menu row opening the approval mode choice. */
  approvalMode: string
  needsChoice: string
  answered: string
  questions: (count: number) => string
  /** Under a single-choice question. */
  clarifyHint: string
  /** Under a multi-choice question. */
  clarifyHintMulti: string
  recommended: string
  moreRecovery: string
  /** The visible waiting line before the first token. */
  preparingReply: string
  timelineLabel: string
  /** The user bubble's edit action (the bubble itself is "Edit message"). */
  editAndRerun: string
  /** Under the inline edit: what sending an edit does (later messages go). */
  editRerunNote: string
  previousVersion: string
  nextVersion: string
  exportMarkdown: string
  /** Suggested file name for "Export as Markdown…". */
  exportFileName: string
  exported: (name: string) => string
  exportFailed: string
}

/** The composer card: "+" menu additions, pills, context gauge, send options, voice hints. */
export interface StudioChatComposerTranslations {
  addContext: string
  addContextHint: string
  popOut: string
  dock: string
  skills: string
  autoApprove: string
  autoApproveHint: string
  yoloHint: string
  turnOffYolo: string
  contextUsagePercent: (percent: number) => string
  /** Tooltip suffix on the context gauge, e.g. "cache hit 86%". */
  cacheHit: (value: string) => string
  stats: {
    cacheHit: string
    throughput: string
    throughputValue: (value: number) => string
    turnTime: string
    sessionCost: string
  }
  compress: string
  compressIdleOnly: string
  usageDetails: string
  /** The pill's effort when thinking is off. */
  effortOff: string
  moreSendOptions: string
  steerHint: string
  redirectHint: string
  voiceOptionsHint: string
  voiceEngineHint: string
  /** Placeholder while a turn runs; `combo` is the live queue shortcut. */
  placeholderBusy: (combo: string) => string
  /** Placeholder of the centred composer on the empty state. */
  placeholderHero: string
}

/** The activity tray: one row of chips above the composer, each opening a panel. */
export interface StudioChatTrayTranslations {
  /** The chip row's toolbar label. */
  label: string
  hide: string
  /** The one chip left while the tray is hidden; `count` = chips it holds. */
  show: (count: number) => string
  approval: (count: number) => string
  approvalHint: string
  needsInput: string
  needsInputHint: string
  previews: (count: number) => string
  more: string
  close: string
  titles: {
    background: string
    preview: string
    previousTodo: string
    queue: string
    subagent: string
    todo: string
  }
  todoCaption: string
  queueCaption: string
  git: {
    hint: string
    reviewChanges: string
    openPullRequest: (number: number) => string
    copyWorktreePath: string
  }
}

/** The empty chat: greeting, starters, import link. */
export interface StudioChatEmptyTranslations {
  greeting: Record<'afternoon' | 'evening' | 'lateNight' | 'morning' | 'noon', string>
  /** aria-label of the starter cards' group. */
  startersLabel: string
  starters: Record<
    'fixError' | 'organizeFolder' | 'prototype' | 'schedule',
    {
      description: string
      /** Drafted into the composer when the card is picked (not sent). */
      prompt: string
      title: string
    }
  >
  continueFrom: string
}

/** What a tool-run summary groups calls by (run-summary.ts routes tools here). */
export type ToolRunCategory =
  'analyze' | 'browse' | 'delegate' | 'edit' | 'explore' | 'interact' | 'other' | 'read' | 'run' | 'search'

/** One category's words. The locale owns word order, tense and plurals. */
export interface StudioChatToolRunCategory {
  /** The verb alone while it happens ("Editing") — also the status line
   *  before a tool starts. */
  present: string
  /** A clause naming the one thing acted on: "Edited wiring.tsx" /
   *  "Editing wiring.tsx". */
  named: (target: string, live: boolean) => string
  /** A clause counting what was acted on: "Explored 3 files" /
   *  "Exploring 3 files". */
  counted: (count: number, live: boolean) => string
}

/** The grey line standing in for a run of tool calls. */
export interface StudioChatToolRunTranslations {
  categories: Record<ToolRunCategory, StudioChatToolRunCategory>
  /** One run's clauses as one line — English: "Explored 3 files, ran 5 commands". */
  join: (clauses: readonly string[]) => string
  /** A compound shell command: its first real segment and how many follow
   *  ("npm test + 2 commands"). */
  moreCommands: (first: string, more: number) => string
}

/** The live voice conversation capsule (statuses reuse t.composer). */
export interface StudioChatVoiceTranslations {
  /** The capsule's group label. */
  label: string
  /** Ends the current take and sends it (the classic pill's "Stop"). */
  doneSpeaking: string
}
