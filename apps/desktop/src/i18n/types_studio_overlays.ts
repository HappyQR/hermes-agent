import type { StudioOverlaysAuxTranslations } from './types_studio_overlays_aux'

/** Hermes Studio — Overlays: command palette, system status, sheets, quick ask, HUD, onboarding. */
export interface StudioOverlaysTranslations {
  quickAsk: string
  /** Aux windows, boot/onboarding surfaces and toasts (one file per locale: *_studio_overlays_aux.ts). */
  aux: StudioOverlaysAuxTranslations
  shortcuts: {
    title: string
    subtitle: (place: string) => string
    close: string
    search: string
    searchPlaceholder: string
    editInSettings: string
    noResults: (query: string) => string
    slotProfiles: (first: number, last: number) => string
    slotTabs: (first: number, last: number) => string
    slotSessions: (first: number, last: number) => string
  }
  system: {
    title: string
    subtitle: string
    close: string
    sectionsLabel: string
    statGateway: string
    running: string
    stopped: string
    statVersion: string
    statActiveSessions: string
    statPlatforms: string
    platformsConnected: (count: number) => string
    platformsNone: string
    restartDesc: string
    restart: string
    checkForUpdates: string
    periodLabel: string
    cacheHit: (percent: number) => string
    dayDetail: (day: string, input: string, output: string) => string
    searchSessions: string
    tokens: (count: string) => string
    run: string
    manageMemory: string
  }
  palette: {
    placeholder: string
    scopesLabel: string
    scopes: {
      all: string
      sessions: string
      pages: string
      actions: string
      settings: string
    }
    recent: string
    searchContent: (query: string) => string
    searchContentDetail: string
    contentGroup: string
    footerSelect: string
    footerOpen: string
    footerScope: string
    footerPaste: string
    on: string
    off: string
    layoutEditMode: string
    reloadPlugins: string
    resetLayout: string
  }
  profiles: {
    subtitle: string
    remote: string
    changeModel: string
    skillsEnabled: (count: number) => string
    manage: string
    soulHint: string
    soulUnsaved: (combo: string) => string
    exportNote: string
    importShort: string
  }
  updates: {
    currentVersion: (version: string, channel: string) => string
  }
}
