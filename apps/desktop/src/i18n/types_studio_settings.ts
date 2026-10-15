/** Hermes Studio — The settings window. */
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
  }
}
