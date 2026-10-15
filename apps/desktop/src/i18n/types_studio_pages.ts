/** Hermes Studio — Pages: capabilities, messaging, automations, artifacts, memory, kanban. */
export interface StudioPagesTranslations {
  common: StudioPagesCommonTranslations
  automations: StudioAutomationsTranslations
  cron: StudioCronTranslations
  webhooks: StudioWebhooksTranslations
}

export interface StudioPagesCommonTranslations {
  /** Accessible name of a row/card "⋯" menu trigger. */
  moreActions: string
  /** Menu verb with an ellipsis: the action asks before it runs. */
  deleteEllipsis: string
  edit: string
  /** Lead-in of the profile scope pop-up ("Applies to"). */
  appliesTo: string
  /** The local machine, macOS wording. */
  thisMac: string
  /** The local machine on Windows and Linux. */
  thisDevice: string
}

export interface StudioAutomationsTranslations {
  title: string
  subtitle: string
  tabsLabel: string
  tabs: { blueprints: string; cron: string; webhook: string }
  newMenu: string
  newJob: string
  newHook: string
  blueprintsIntro: string
  /** Card subtitle: what a blueprint is. */
  blueprintKind: string
  useBlueprint: string
  useBlueprintAria: (name: string) => string
}

export interface StudioCronTranslations {
  listLabel: string
  /** Second line of a list row: when the job runs next. */
  nextAt: (when: string) => string
  overdueAt: (when: string) => string
  tagHealthy: string
  tagFailed: string
  triggerNow: string
  duplicate: string
  copyName: (name: string) => string
  openLatestRun: string
  noRunsToOpen: string
  deleteNamed: (name: string) => string
  deleteBody: string
  lastRunFailed: string
  /** Between "Last run failed" and the error summary. */
  failureSeparator: string
  kvNext: string
  kvOverdue: string
  kvLast: string
  kvDeliver: string
  kvModel: string
  modelDefault: string
  prompt: string
  script: string
  runs: string
  runRunning: string
  runViewOnly: string
  runOutputOnly: string
  durationSeconds: (seconds: number) => string
  durationMinutes: (minutes: number, seconds: number) => string
  durationHours: (hours: number, minutes: number) => string
  /** Weekly on several days: "Every Mon, Wed at 9:00". */
  weeklyOnDaysAt: (days: string, time: string) => string
  /** Short weekday names, Monday first. */
  weekdaysShort: [string, string, string, string, string, string, string]
  daySeparator: string
  sheet: {
    newTitle: string
    editTitle: string
    blueprintTitle: (name: string) => string
    name: string
    promptQuestion: string
    promptPlaceholder: string
    when: string
    frequency: string
    time: string
    weekdays: string
    dayOfMonth: string
    customLabel: string
    customPlaceholder: string
    checkedOnSave: string
    deliverTo: string
    model: string
    create: string
    save: string
  }
}

export interface StudioWebhooksTranslations {
  listLabel: string
  runsOnEvent: string
  enableAria: (name: string) => string
  receiveUrl: string
  receiveUrlHint: string
  signingSecret: string
  signingSecretHint: string
  secretSet: string
  secretNotSet: string
  events: string
  skills: string
  deliverTo: string
  none: string
  newTitle: string
  promptQuestion: string
  moreOptions: string
  receiverSettings: string
}
