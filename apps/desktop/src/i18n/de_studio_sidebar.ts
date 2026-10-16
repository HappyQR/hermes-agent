// Hermes Studio copy (sidebar) — fork-owned so upstream locale merges stay clean.
import type { StudioSidebarTranslations } from './types_studio_sidebar'

export const deStudioSidebar: StudioSidebarTranslations = {
  search: 'Suchen',
  searchAria: 'Sessions, Seiten und Befehle durchsuchen',
  nav: {
    label: 'Seiten',
    automations: 'Automationen',
    memory: 'Gedächtnis',
    open: 'Öffnen',
    pendingPairing: count =>
      count === 1 ? '1 ausstehende Kopplungsanfrage' : `${count} ausstehende Kopplungsanfragen`,
    cronJobs: count => (count === 1 ? '1 geplanter Job' : `${count} geplante Jobs`),
    cronFailing: count => (count === 1 ? '1 Job schlägt fehl' : `${count} Jobs schlagen fehl`)
  },
  section: {
    expand: 'Aufklappen',
    collapse: 'Zuklappen',
    collapsedCount: count => `${count} ausgeblendet`,
    expandGroups: 'Alle Gruppen aufklappen',
    collapseGroups: 'Alle Gruppen zuklappen'
  },
  projects: {
    newProject: 'Neues Projekt…',
    openFolder: 'Ordner als Projekt öffnen…',
    newWorktree: 'Neuer Worktree…',
    auto: 'Auto',
    actions: 'Projektaktionen',
    newSessionHere: 'Neue Session in diesem Projekt',
    newSessionInLane: 'Neue Session in dieser Spur'
  },
  dateGroupToday: 'Heute',
  projectGroupNone: 'Ohne Projekt',
  scope: {
    tip: 'Nur Sessions dieses Projekts werden angezeigt',
    clear: 'Alle Sessions anzeigen',
    allProfilesTip: 'Sessions aller Profile werden angezeigt',
    allProfilesClear: 'Nur Sessions dieses Profils anzeigen'
  },
  sessions: {
    viewOptions: 'Darstellungsoptionen',
    viewOptionsTip: 'Gruppieren, sortieren und filtern',
    noMatches: 'Keine Sessions entsprechen diesen Filtern.',
    clearFilters: 'Filter löschen'
  },
  grouping: {
    label: 'Gruppieren',
    time: 'Nach Zeit',
    project: 'Nach Projekt',
    status: 'Nach Status',
    source: 'Nach Quelle',
    profile: 'Nach Gateway und Profil',
    none: 'Nicht gruppieren',
    noProject: 'Ohne Projekt'
  },
  statusGroup: {
    needsInput: 'Eingabe nötig',
    working: 'Läuft',
    unread: 'Ungelesen',
    draft: 'Entwürfe',
    done: 'Erledigt'
  },
  view: {
    reset: 'Standard wiederherstellen',
    sort: 'Sortieren',
    show: 'Anzeigen',
    time: 'Zeit',
    density: 'Listendichte',
    compact: 'Kompakt',
    comfortable: 'Bequem',
    detailed: 'Detailliert',
    filters: 'Filter',
    sources: 'Quellen',
    prStatus: 'PR-Status',
    prAny: 'Alle',
    showArchived: 'Archivierte Sessions anzeigen',
    moreFilters: 'Weitere Filter'
  },
  source: {
    desktop: 'Desktop',
    cron: 'Geplanter Job',
    from: label => `Von ${label}`
  },
  row: {
    yesterday: 'Gestern'
  },
  menu: {
    clickHint: keys => `${keys}-Klick`,
    openInNewWindow: 'In neuem Fenster öffnen',
    splitRight: 'Rechts',
    splitDown: 'Unten',
    splitLeft: 'Links',
    splitUp: 'Oben',
    color: 'Farbe',
    copySessionId: 'Session-ID kopieren',
    branchFromHere: 'Ab hier verzweigen',
    export: 'Exportieren',
    exportJson: 'JSON…',
    exportMarkdown: 'Markdown…',
    exportUser: 'Du',
    exportAssistant: 'Hermes',
    exportFailed: 'Session konnte nicht exportiert werden',
    newProject: 'Neues Projekt…',
    renameConfirm: 'Umbenennen',
    delete: 'Löschen…'
  },
  draft: {
    noProject: 'Kein Projekt',
    projectAria: name => `Projekt: ${name}`,
    profileAria: name => `Profil: ${name}`
  },
  footer: {
    updateAvailable: name => `${name} verfügbar`,
    updateGeneric: 'Update verfügbar',
    updateBackend: 'Backend-Update verfügbar',
    updateView: 'Zum Anzeigen klicken',
    updateBehind: count =>
      count === 1 ? '1 Commit zurück · Zum Anzeigen klicken' : `${count} Commits zurück · Zum Anzeigen klicken`,
    updateApplying: 'Wird aktualisiert…',
    updateRestart: 'Neu starten, um das Update abzuschließen',
    account: 'Profile und Gateways',
    ready: 'Bereit',
    connecting: 'Verbinde…',
    disconnected: 'Getrennt',
    unreachable: 'Nicht erreichbar',
    remote: 'Remote',
    thisDevice: 'Dieses Gerät',
    thisMac: 'Dieser Mac',
    defaultSuffix: ' (Standard)',
    needsInputBadge: count => `${count} warten`,
    unreadBadge: count => `${count} ungelesen`,
    switchHere: 'Zu diesem Profil wechseln',
    newProfile: 'Neues Profil…',
    gateway: 'Gateway',
    reconnect: 'Neu verbinden',
    recentActivity: 'Letzte Aktivität…',
    connectGateway: 'Weiteres Gateway verbinden…',
    systemStatus: 'Systemstatus…',
    settings: 'Einstellungen…',
    shortcuts: 'Tastaturkurzbefehle',
    checkUpdates: 'Nach Updates suchen…',
    showRail: 'Profilleiste anzeigen'
  }
}
