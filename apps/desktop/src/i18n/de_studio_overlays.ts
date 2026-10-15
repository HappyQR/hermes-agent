// Hermes Studio copy (overlays) — fork-owned so upstream locale merges stay clean.
import { deStudioOverlaysAux } from './de_studio_overlays_aux'
import type { StudioOverlaysTranslations } from './types_studio_overlays'

export const deStudioOverlays: StudioOverlaysTranslations = {
  quickAsk: 'Schnellfrage',
  aux: deStudioOverlaysAux,
  shortcuts: {
    title: 'Tastaturkurzbefehle',
    subtitle: place => `Ändern unter ${place}`,
    close: 'Tastaturkurzbefehle schließen',
    search: 'Kurzbefehle durchsuchen',
    searchPlaceholder: 'Suchen',
    editInSettings: 'In den Einstellungen bearbeiten',
    noResults: query => `Keine Kurzbefehle für „${query}“`,
    slotProfiles: (first, last) => `Zu Profil ${first}–${last} wechseln`,
    slotTabs: (first, last) => `Zu Tab ${first}–${last} wechseln`,
    slotSessions: (first, last) => `Zur letzten Session ${first}–${last} wechseln`
  },
  system: {
    title: 'Systemstatus',
    subtitle: 'Sessions, Systemzustand, Nutzung und Wartung',
    close: 'Systemstatus schließen',
    sectionsLabel: 'Bereich',
    statGateway: 'Gateway',
    running: 'Läuft',
    stopped: 'Gestoppt',
    statVersion: 'Version',
    statActiveSessions: 'Aktive Sessions',
    statPlatforms: 'Messaging-Plattformen',
    platformsConnected: count => `${count} verbunden`,
    platformsNone: 'Keine verbunden',
    restartDesc: 'Verbundene Messaging-Plattformen verbinden sich neu',
    restart: 'Neu starten…',
    checkForUpdates: 'Nach Updates suchen',
    periodLabel: 'Zeitraum',
    cacheHit: percent => `Cache-Treffer ${percent} %`,
    dayDetail: (day, input, output) => `${day} · Eingabe ${input} · Ausgabe ${output}`,
    searchSessions: 'Alle Sessions nach Titel oder ID durchsuchen',
    tokens: count => `${count} Token`,
    archiveSession: 'Session archivieren',
    run: 'Ausführen',
    manageMemory: 'Verwalten…'
  },
  palette: {
    placeholder: 'Sessions, Seiten, Befehle und Einstellungen durchsuchen',
    scopesLabel: 'Bereich',
    scopes: {
      all: 'Alle',
      sessions: 'Sessions & Projekte',
      pages: 'Seiten',
      actions: 'Befehle',
      settings: 'Einstellungen'
    },
    recent: 'Zuletzt',
    searchContent: query => `Alle Session-Inhalte durchsuchen: „${query}“`,
    searchContentDetail: 'Volltextsuche',
    contentGroup: 'In Session-Inhalten',
    footerSelect: 'Auswählen',
    footerOpen: 'Öffnen',
    footerScope: 'Bereich wechseln',
    footerPaste: 'Session-ID einfügen, um direkt hinzuspringen',
    on: 'Ein',
    off: 'Aus',
    layoutEditMode: 'Layout-Bearbeitungsmodus umschalten',
    reloadPlugins: 'Desktop-Plugins neu laden',
    resetLayout: 'Layout zurücksetzen'
  },
  profiles: {
    subtitle: 'Jedes Profil hat eigenes Modell, eigene Skills, eigenes Gedächtnis und eine eigene Persona (SOUL.md).',
    remote: 'Remote',
    changeModel: 'Ändern…',
    skillsEnabled: count => `${count} aktiviert`,
    manage: 'Verwalten',
    soulHint: 'Persona und dauerhafte Anweisungen',
    soulUnsaved: combo => `Nicht gesichert · ${combo} zum Sichern`,
    exportNote: 'Exportierte Profile enthalten nie Schlüssel',
    importShort: 'Importieren…'
  },
  import: {
    subtitle: host => `Hol ein Gespräch aus Claude Code oder Codex in Hermes und mach dort weiter, wo du aufgehört hast. Gelesen von ${host}`,
    importInto: profile => `Importieren in: ${profile}`,
    sourceLabel: 'Quelle'
  },
  updates: {
    currentVersion: (version, channel) => `Aktuell ${version} · ${channel}`
  }
}
