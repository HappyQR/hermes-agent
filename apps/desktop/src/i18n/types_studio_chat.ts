/** Hermes Studio — The chat surface: composer, activity tray, transcript, empty state. */
export interface StudioChatTranslations {
  contextUsage: string
  tray: StudioChatTrayTranslations
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
