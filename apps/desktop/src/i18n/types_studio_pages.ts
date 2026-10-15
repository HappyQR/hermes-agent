/** Hermes Studio — Pages: capabilities, messaging, automations, artifacts, memory, kanban. */
export interface StudioPagesTranslations {
  common: StudioPagesCommonTranslations
  automations: StudioAutomationsTranslations
  cron: StudioCronTranslations
  webhooks: StudioWebhooksTranslations
  memory: StudioMemoryTranslations
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

export interface StudioMemoryTranslations {
  title: string
  subtitle: string
  viewLabel: string
  viewList: string
  share: string
  copyCode: string
  codeCopied: string
  codeCopiedBody: string
  loadCode: string
  loadCodeTitle: string
  importInvalid: string
  settings: string
  filterLabel: string
  counts: (skills: number, memories: number, categories: number) => string
  graphHint: string
  canvasLabel: string
  play: string
  pause: string
  timeline: string
  /** The timeline's label once the whole map is revealed. */
  now: string
  legendSkill: string
  legendMemory: string
  legendRadial: string
  listMemory: string
  listUser: string
  listSkills: string
  listSkillsScope: string
  usage: (file: string, used: number, limit: number) => string
  entries: (file: string, count: number) => string
  emptyMemory: string
  emptyUser: string
  emptySkills: string
  learnedBadge: string
  usedTimes: (count: number) => string
  lastActive: (date: string) => string
  editRow: string
  rowActionAria: (action: string, label: string) => string
  editSkill: string
  editMemory: string
  archiveSkill: string
  deleteMemory: string
  editTitle: (label: string) => string
  deleteMemoryTitle: (label: string) => string
  deleteMemoryBody: string
  archiveConfirm: string
  archiveTitle: (name: string) => string
  archiveBody: string
  /** Hover-card badges drawn on the map. */
  badges: { learned: string; memory: string; pinned: string; profileMemory: string; unknown: string }
}
