/** Hermes Studio — Window chrome: toolbar, inspector, status bar, native menu. */
export interface StudioShellTranslations {
  /** A stored chat with neither a title nor a preview yet. */
  untitledSession: string
  layout: string
  /** The inspector zone's segmented header (prototype .insp-head). */
  inspector: {
    label: string
    close: string
    preview: string
    files: string
    review: string
    terminal: string
    agents: string
  }
  /** Bundled layout template names, by preset id. */
  presets: Record<'sidebar-left' | 'sidebar-right' | 'default' | 'basic' | 'focus' | 'terminal-deck' | 'quad', string>
  /** The 52px workspace toolbar (title, chips, live pill, Layout ▾ + inspector capsule). */
  toolbar: {
    /** A chat with no title yet (the tab / toolbar caption). */
    newSessionTitle: string
    layoutMenu: string
    showInspector: string
    hideInspector: string
    singlePane: string
    splitWith: string
    noOtherSessions: string
    layoutTemplates: string
    saveLayoutAs: string
    editLayout: string
    resetLayout: string
    tabBar: string
    tabBarAuto: string
    tabBarAlways: string
    tabBarNever: string
    showStatusBar: string
    hideStatusBar: string
    projectChip: string
    branchChip: string
    pullRequest: string
    reviewChanges: string
    newWorktree: string
    copyWorktreePath: string
    viewRunningAgents: string
  }
}
