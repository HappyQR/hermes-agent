/**
 * Hermes Studio — the macOS application menu (src/app/shell/native-menu*.ts).
 * Labels follow the platform's menu conventions per language (title case in
 * English, "…" on items that ask for more input). `app` is the product name.
 */
export interface StudioMenuTranslations {
  /** Menu bar titles (the app menu is always titled with the app name). */
  titles: {
    file: string
    edit: string
    view: string
    session: string
    window: string
    help: string
  }
  app: {
    about: (app: string) => string
    checkForUpdates: string
    settings: string
    services: string
    hide: (app: string) => string
    hideOthers: string
    showAll: string
    quit: (app: string) => string
  }
  file: {
    newSession: string
    newTab: string
    newWindow: string
    openFolder: string
    newProject: string
    newWorktree: string
    importSession: string
    exportSession: string
    exportProfile: string
    importProfile: string
    closeTab: string
    reopenTab: string
  }
  edit: {
    undo: string
    redo: string
    cut: string
    copy: string
    paste: string
    pasteAndMatchStyle: string
    delete: string
    selectAll: string
    find: string
    sendSelection: string
    spelling: string
    checkSpellingWhileTyping: string
    substitutions: string
    showSubstitutions: string
    textReplacement: string
  }
  view: {
    showSidebar: string
    hideSidebar: string
    showInspector: string
    hideInspector: string
    preview: string
    changes: string
    terminal: string
    agents: string
    layout: string
    singlePane: string
    splitSideBySide: string
    swapSidebar: string
    editLayout: string
    resetLayout: string
    hud: string
    tabBar: string
    tabBarAuto: string
    tabBarAlways: string
    tabBarNever: string
    showStatusBar: string
    hideStatusBar: string
    interfaceMode: string
    simple: string
    advanced: string
    appearance: string
    light: string
    dark: string
    system: string
    zoomIn: string
    zoomOut: string
    actualSize: string
    fullScreen: string
    reload: string
    forceReload: string
    developerTools: string
  }
  session: {
    rename: string
    pin: string
    unpin: string
    branch: string
    stop: string
    compress: string
    switchModel: string
    voice: string
    next: string
    previous: string
    archive: string
    unarchive: string
    delete: string
  }
  window: {
    minimize: string
    zoom: string
    profiles: string
    allProfiles: string
    manageProfiles: string
    systemStatus: string
    quickAsk: string
    bringAllToFront: string
  }
  help: {
    shortcuts: string
    tutorial: string
    composerTips: string
    docs: string
    discord: string
    sendDiagnostics: string
  }
}
