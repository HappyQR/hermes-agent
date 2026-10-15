/** Hermes Studio — The settings window. Generated with the locale files (one table, 9 locales). */
export interface StudioSettingsPageCopy {
  title: string
  /** One line under the hero tile. */
  hero: string
}

export interface StudioSettingsTranslations {
  searchPlaceholder: string
  /** The 19 categories, in sidebar order. */
  pages: {
    general: StudioSettingsPageCopy
    appearance: StudioSettingsPageCopy
    chat: StudioSettingsPageCopy
    notifications: StudioSettingsPageCopy
    keyboard: StudioSettingsPageCopy
    models: StudioSettingsPageCopy
    providers: StudioSettingsPageCopy
    memory: StudioSettingsPageCopy
    voice: StudioSettingsPageCopy
    workspace: StudioSettingsPageCopy
    safety: StudioSettingsPageCopy
    passwords: StudioSettingsPageCopy
    tools: StudioSettingsPageCopy
    gateways: StudioSettingsPageCopy
    sessions: StudioSettingsPageCopy
    plugins: { title: string; hero: (capabilitiesPage: string) => string }
    billing: StudioSettingsPageCopy
    advanced: StudioSettingsPageCopy
    about: StudioSettingsPageCopy
  }
  window: {
    /** Accessible name of the category list. */
    navLabel: string
    noResults: (query: string) => string
    /** Subtitle of a search hit that is a whole category. */
    categoryResult: string
    onlyThisMac: string
    onlyThisDevice: string
    appliesToProfile: (profile: string) => string
    /** Label in front of the profile popup in the window header. */
    appliesTo: string
    /** Heading of the profile popup menu. */
    scopeMenuTitle: string
    searchResults: string
    pageMenu: string
  }
  /** Section titles and notes, per page. */
  sections: {
    general: {
      language: string
      tips: string
      system: string
    }
    appearance: {
      look: string
      theme: string
      themeNote: string
      window: string
      typography: string
      pet: string
    }
    chat: {
      replies: string
      messages: string
      media: string
    }
    notifications: {
      alerts: string
      sounds: string
    }
    keyboard: {
      shortcuts: string
      shortcutsNote: string
      quickAsk: string
      hud: string
    }
    models: {
      main: string
      fallbacks: string
      fallbacksNote: string
      auxiliary: string
      auxiliaryDisclosure: string
      moa: string
      moaDisclosure: string
    }
    providers: {
      accounts: string
      apiKeys: string
      endpoints: string
      local: string
    }
    memory: {
      memory: string
      context: string
      contextDisclosure: string
      maintenance: string
    }
    voice: {
      conversation: string
      stt: string
      tts: string
      wake: string
    }
    workspace: {
      projects: string
      execution: string
      checkpoints: string
      checkpointsNote: string
    }
    safety: {
      approvals: string
      privacy: string
      browser: string
    }
    passwords: {
      credentials: string
      credentialsNote: string
      managers: string
    }
    tools: {
      toolKeys: string
      serverEnv: string
      toolsets: string
    }
    gateways: {
      connection: string
      saved: string
      remoteUpdates: string
    }
    sessions: {
      retention: string
      archived: string
    }
    plugins: {
      pages: string
      manage: string
    }
    advanced: {
      agent: string
      terminal: string
      subagents: string
      output: string
      updates: string
    }
    about: {
      updates: string
      config: string
      diagnostics: string
      uninstall: string
    }
  }
  /** Rows the window adds over existing settings (mode cards, accent, thinking, maintenance…). */
  rows: {
    modeLight: string
    modeDark: string
    modeAuto: string
    modeGroup: string
    accentTitle: string
    accentDesc: string
    accentNous: string
    accentHermes: string
    accentViolet: string
    accentPink: string
    accentRed: string
    accentOrange: string
    accentGreen: string
    accentMono: string
    thinkingTitle: string
    thinkingDesc: string
    thinkingShow: string
    thinkingCollapse: string
    thinkingHide: string
    timestampsTitle: string
    hapticsTitle: string
    hapticsDesc: string
    wakeTitle: string
    wakeDesc: string
    wakePhrase: string
    memoryOpenTitle: string
    memoryOpenDesc: string
    memoryOpenAction: string
    resetMemoryTitle: string
    resetMemoryDesc: string
    resetProfileTitle: string
    resetProfileDesc: string
    resetAction: string
    maintenanceActiveOnly: (profile: string) => string
    toolsetsTitle: string
    toolsetsDesc: (page: string) => string
    openAction: string
    pluginsManageDesc: string
    pluginsManageAction: string
    exportDesc: string
    exportAction: string
    importAction: string
    resetConfigDesc: string
    resetConfigAction: string
    diagnosticsTitle: string
    diagnosticsDesc: string
    diagnosticsAction: string
    logsTitle: string
    logsActionMac: string
    logsActionOther: string
    localModelsDesc: string
    localModelsAction: string
    sendTestAction: string
    resetShortcutsAction: string
  }
}
