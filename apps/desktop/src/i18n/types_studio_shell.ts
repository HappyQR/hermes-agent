/** Hermes Studio — Window chrome: toolbar, inspector, status bar, native menu. */
export interface StudioShellTranslations {
  layout: string
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
