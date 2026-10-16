/** Hermes Studio — Pages: capabilities, messaging, automations, artifacts, memory, kanban. */
export interface StudioPagesTranslations {
  common: StudioPagesCommonTranslations
  automations: StudioAutomationsTranslations
  cron: StudioCronTranslations
  webhooks: StudioWebhooksTranslations
  inspector: StudioInspectorTranslations
  memory: StudioMemoryTranslations
  capabilities: StudioCapabilitiesTranslations
  messaging: StudioMessagingTranslations
  artifacts: StudioArtifactsTranslations
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

export interface StudioInspectorTranslations {
  agents: {
    statAgents: string
    statRunning: string
    statToolCalls: string
    statCost: string
    /** Tool calls on one agent's meta line. */
    toolCalls: (count: number) => string
    fromSession: (title: string) => string
    viewTranscript: string
    hideTranscript: string
    /** Accessible name of the steer field. */
    steerLabel: string
  }
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

export type StudioConnectorStateWord =
  | 'accessExpired'
  | 'available'
  | 'connected'
  | 'connecting'
  | 'connectionUnknown'
  | 'couldNotConnect'
  | 'offByYourOrganisation'
  | 'offForYou'
  | 'serverConnecting'
  | 'serverError'
  | 'serverNeedsAuth'
  | 'serverOff'
  | 'serverOn'
  | 'serverOnUnused'

export type StudioConnectorVerb =
  'authenticate' | 'connect' | 'install' | 'openLogs' | 'reconnect' | 'stopWaiting' | 'tryAgain' | 'turnBackOn'

/** Skill categories the bundled and official catalogs use. */
export type StudioSkillCategory =
  | 'apple'
  | 'autonomous-ai-agents'
  | 'blockchain'
  | 'communication'
  | 'creative'
  | 'data-science'
  | 'devops'
  | 'dogfood'
  | 'email'
  | 'finance'
  | 'gaming'
  | 'general'
  | 'github'
  | 'health'
  | 'mcp'
  | 'media'
  | 'migration'
  | 'mlops'
  | 'note-taking'
  | 'payments'
  | 'productivity'
  | 'research'
  | 'security'
  | 'smart-home'
  | 'social-media'
  | 'software-development'
  | 'web'
  | 'web-development'

export interface StudioCapabilitiesTranslations {
  title: string
  subtitle: string
  tabsLabel: string
  tabs: { connectors: string; plugins: string; skills: string; toolsets: string }
  searchLabel: string
  searchSkills: (count: number) => string
  searchTools: string
  searchPlugins: string
  sortLabel: string
  sort: { least: string; most: string; name: string }
  viewInMemory: string
  /** The ⋯ menu with tab-wide switches. */
  bulkMenu: string
  bulkAllSkills: string
  bulkAllTools: string
  disableUnused: string
  /** Aria name of the profile scope pop-up. */
  scopeAria: string
  scopeDefault: string
  scopeCurrent: (label: string) => string
  usedTimes: (count: number) => string
  emptyTitle: string
  emptyNoMatch: (query: string) => string
  /** Display names of known skill categories (others are humanized). */
  categories: Record<StudioSkillCategory, string>
  skills: {
    source: { agent: string; bundled: string; external: string; hub: string; local: string }
    /** After "Learned" on a card: Hermes wrote the skill itself. */
    learnedNote: string
    details: string
    detailsAria: (name: string) => string
    officialTitle: string
    officialSource: (category: string) => string
    browseHub: string
    hubTitle: string
    hubHint: string
    archiveEllipsis: string
    editSkillMd: string
    done: string
    useInChat: string
    editing: (name: string) => string
    emptyNone: string
  }
  tools: {
    toolCount: (count: number) => string
    footnote: string
    includedTools: string
    includedToolsNote: (count: number) => string
    callCount: (count: number) => string
    providers: string
    setup: string
    emptyNone: string
  }
  connectors: {
    addCustom: string
    searchApps: (count: number) => string
    filtersLabel: string
    filters: { all: string; available: string; connected: string; local: string; off: string }
    groups: { available: string; connected: string; local: string; off: string }
    connectedNote: string
    offNote: string
    kindManaged: string
    kindCatalog: string
    kindCustom: string
    kindPlugin: (plugin: string) => string
    inCatalog: string
    hostedTwin: string
    alsoLocal: string
    open: (name: string) => string
    turnServerOn: (name: string) => string
    turnServerOff: (name: string) => string
    tools: (count: number) => string
    toolsOff: (count: number) => string
    toolsOn: (count: number) => string
    toolsSomeOn: (total: number, on: number) => string
    accounts: (count: number) => string
    state: Record<StudioConnectorStateWord, string>
    verb: Record<StudioConnectorVerb, string>
    manage: string
    reason: { finishSignIn: string; reconnect: string; serverError: string; serverNeedsAuth: string }
    segmentNoMatch: (segment: string) => string
    matchesElsewhere: (count: number) => string
    showAllMatches: string
    loading: string
    emptyTitle: string
    noMatchTitle: string
    noMatchBody: string
    clearSearch: string
    hostedFailedTitle: string
    hostedFailedBody: string
    retry: string
  }
  plugins: {
    columnPlugin: string
    columnDesktop: string
    columnAgent: string
    /** Kind tag of a package with both halves. */
    kindBoth: string
    checkUpdates: string
    uninstallEllipsis: string
    browseCatalog: string
    catalogTitle: string
    catalogHint: string
    settingsTip: string
    noMatch: (query: string) => string
  }
}

export interface StudioMessagingTranslations {
  title: string
  subtitle: string
  searchPlatforms: string
  listLabel: string
  filterLabel: string
  /** Follows the requester's name on a pending pairing card (leading space where the language wants one). */
  pairingRequest: string
  quickSetupTitle: string
  quickSetupBody: string
  /** The quick-setup card's button; opens the QR sheet. */
  showQr: string
  qrSheetTitle: string
  homeChannel: string
  homeChannelHint: string
  homeChannelNone: string
  pairedUsersHint: string
  updateCredentials: string
  /** Under the save button when the change will apply without a restart. */
  saveHint: string
  /** Platform names that translate (邮件, 钉钉, 企业微信…), keyed by platform id.
   *  Brand names (Telegram, Slack…) keep the backend's label, so it is partial. */
  platformNames: Partial<Record<string, string>>
}

export interface StudioArtifactsTranslations {
  title: string
  subtitle: string
  search: string
  typeLabel: string
  tabs: { all: string; file: string; image: string; link: string; web: string }
  kind: { file: string; image: string; link: string; web: string }
  /** Quick Look subtitle: kind · from «session» · time. */
  sourceLine: (kind: string, session: string, when: string) => string
  noMatchDesc: string
  showMore: (shown: number, total: number) => string
  quickLook: string
  openInInspector: string
  openSession: string
  openWithDefault: string
  previous: string
  next: string
  previewUnavailable: string
  partialSkipped: (skipped: number, total: number) => string
  partialSafeLimit: (count: number) => string
  partialUnreadable: (count: number) => string
}
