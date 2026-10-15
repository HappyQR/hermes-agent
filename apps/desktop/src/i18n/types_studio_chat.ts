/** Hermes Studio — The chat surface: composer, activity tray, transcript, empty state. */
export interface StudioChatTranslations {
  contextUsage: string
  composer: StudioChatComposerTranslations
  tray: StudioChatTrayTranslations
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
