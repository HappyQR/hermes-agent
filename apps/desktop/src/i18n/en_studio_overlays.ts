// Hermes Studio copy (overlays) — fork-owned so upstream locale merges stay clean.
import { enStudioOverlaysAux } from './en_studio_overlays_aux'
import type { StudioOverlaysTranslations } from './types_studio_overlays'

export const enStudioOverlays: StudioOverlaysTranslations = {
  quickAsk: 'Quick Ask',
  aux: enStudioOverlaysAux,
  shortcuts: {
    title: 'Keyboard Shortcuts',
    subtitle: place => `Change them in ${place}`,
    close: 'Close keyboard shortcuts',
    search: 'Search shortcuts',
    searchPlaceholder: 'Search',
    editInSettings: 'Edit in Settings',
    noResults: query => `No shortcuts match “${query}”`,
    slotProfiles: (first, last) => `Switch to profile ${first}–${last}`,
    slotTabs: (first, last) => `Switch to tab ${first}–${last}`,
    slotSessions: (first, last) => `Switch to recent session ${first}–${last}`
  },
  system: {
    title: 'System Status',
    subtitle: 'Sessions, system health, usage and maintenance',
    close: 'Close system status',
    sectionsLabel: 'Section',
    statGateway: 'Gateway',
    running: 'Running',
    stopped: 'Stopped',
    statVersion: 'Version',
    statActiveSessions: 'Active sessions',
    statPlatforms: 'Messaging platforms',
    platformsConnected: count => `${count} connected`,
    platformsNone: 'None connected',
    restartDesc: 'Connected messaging platforms reconnect',
    restart: 'Restart…',
    checkForUpdates: 'Check for updates',
    periodLabel: 'Time range',
    cacheHit: percent => `Cache hit ${percent}%`,
    dayDetail: (day, input, output) => `${day} · input ${input} · output ${output}`,
    searchSessions: 'Search all sessions by title or ID',
    tokens: count => `${count} tokens`,
    archiveSession: 'Archive session',
    run: 'Run',
    manageMemory: 'Manage…'
  },
  palette: {
    placeholder: 'Search sessions, pages, commands and settings',
    scopesLabel: 'Scope',
    scopes: {
      all: 'All',
      sessions: 'Sessions & Projects',
      pages: 'Pages',
      actions: 'Commands',
      settings: 'Settings'
    },
    recent: 'Recent',
    searchContent: query => `Search all session content: “${query}”`,
    searchContentDetail: 'Full-text search',
    contentGroup: 'In session content',
    footerSelect: 'Select',
    footerOpen: 'Open',
    footerScope: 'Switch scope',
    footerPaste: 'Paste a session ID to jump to it',
    on: 'On',
    off: 'Off',
    layoutEditMode: 'Toggle layout edit mode',
    reloadPlugins: 'Reload desktop plugins',
    resetLayout: 'Reset layout',
    toggleLogs: 'Toggle logs',
    toggleYolo: 'Toggle YOLO mode (skip approvals)'
  },
  profiles: {
    subtitle: 'Each profile has its own model, skills, memory and persona (SOUL.md).',
    remote: 'Remote',
    changeModel: 'Change…',
    skillsEnabled: count => `${count} enabled`,
    manage: 'Manage',
    soulHint: 'Persona and standing instructions',
    soulUnsaved: combo => `Unsaved · ${combo} to save`,
    exportNote: 'Exported profiles never include keys',
    importShort: 'Import…'
  },
  import: {
    subtitle: host => `Bring a Claude Code or Codex conversation into Hermes and pick up where you left off. Reading from ${host}`,
    importInto: profile => `Import into: ${profile}`,
    sourceLabel: 'Source'
  },
  updates: {
    currentVersion: (version, channel) => `Current ${version} · ${channel}`
  }
}
