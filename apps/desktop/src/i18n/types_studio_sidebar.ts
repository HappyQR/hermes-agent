/** Hermes Studio — The left sidebar: nav, projects, sessions, view options, footer. */
export interface StudioSidebarTranslations {
  /** The search button's visible label. */
  search: string
  /** The search button's accessible name (it opens ⌘K on the sessions scope). */
  searchAria: string
  nav: {
    /** Landmark name for the page rows. */
    label: string
    automations: string
    memory: string
    open: string
    pendingPairing: (count: number) => string
    cronJobs: (count: number) => string
    cronFailing: (count: number) => string
  }
  section: {
    expand: string
    collapse: string
    collapsedCount: (count: number) => string
    expandGroups: string
    collapseGroups: string
  }
  projects: {
    newProject: string
    openFolder: string
    newWorktree: string
    auto: string
    actions: string
    newSessionHere: string
    newSessionInLane: string
    empty: string
  }
  scope: {
    tip: string
    clear: string
  }
  sessions: {
    viewOptions: string
    viewOptionsTip: string
    noMatches: string
    clearFilters: string
  }
  grouping: {
    label: string
    time: string
    project: string
    status: string
    source: string
    profile: string
    none: string
    noProject: string
  }
  statusGroup: {
    needsInput: string
    working: string
    unread: string
    draft: string
    done: string
  }
  view: {
    reset: string
    sort: string
    show: string
    time: string
    density: string
    compact: string
    comfortable: string
    detailed: string
    filters: string
    sources: string
    prStatus: string
    prAny: string
    showArchived: string
    moreFilters: string
  }
  source: {
    desktop: string
    cron: string
    from: (label: string) => string
  }
  row: {
    yesterday: string
  }
  menu: {
    /** A modifier-click gesture hint, e.g. `⌘-click`. */
    clickHint: (keys: string) => string
    openInNewWindow: string
    splitRight: string
    splitDown: string
    splitLeft: string
    splitUp: string
    color: string
    copySessionId: string
    branchFromHere: string
    export: string
    exportJson: string
    exportMarkdown: string
    /** The Markdown export's speaker headings. */
    exportUser: string
    exportAssistant: string
    exportFailed: string
    newProject: string
    /** The rename sheet's confirm button. */
    renameConfirm: string
    delete: string
  }
  /** The new-chat screen's project and profile chips (under the starters). */
  draft: {
    /** The project chip's label (and menu row) when the draft has no project. */
    noProject: string
    /** The project chip's accessible name. */
    projectAria: (name: string) => string
    /** The profile chip's accessible name. */
    profileAria: (name: string) => string
  }
  footer: {
    /** `name` is the bold product + version, e.g. "Hermes v0.22.2". */
    updateAvailable: (name: string) => string
    /** The pill's headline when the update has no release tag to name (main channel). */
    updateGeneric: string
    /** The headline when the update is the connected backend's (remote mode). */
    updateBackend: string
    updateView: string
    updateBehind: (count: number) => string
    updateApplying: string
    updateRestart: string
    account: string
    ready: string
    connecting: string
    disconnected: string
    unreachable: string
    remote: string
    thisDevice: string
    thisMac: string
    defaultSuffix: string
    needsInputBadge: (count: number) => string
    unreadBadge: (count: number) => string
    switchHere: string
    newProfile: string
    gateway: string
    reconnect: string
    recentActivity: string
    connectGateway: string
    systemStatus: string
    settings: string
    shortcuts: string
    checkUpdates: string
    showRail: string
  }
}
