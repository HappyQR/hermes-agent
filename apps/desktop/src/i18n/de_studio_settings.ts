// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
// Generated from one table (all 9 locales together); edit the table, not one file.
import type { StudioSettingsTranslations } from './types_studio_settings'

export const deStudioSettings: StudioSettingsTranslations = {
  searchPlaceholder: 'Einstellungen durchsuchen',
  pages: {
    general: {
      title: 'Allgemein',
      hero: 'Sprache, Start, Tipps und Fensterverhalten.'
    },
    appearance: {
      title: 'Erscheinungsbild',
      hero: 'Farben, Themes, Fensterglas, Schriften und Haustiere.'
    },
    chat: {
      title: 'Chat',
      hero: 'Antwortstil und wie Denken, Tool-Aufrufe und Nachrichten angezeigt werden.'
    },
    notifications: {
      title: 'Benachrichtigungen',
      hero: 'Was dich unterbrechen darf, und der Ton, wenn Arbeit fertig ist.'
    },
    keyboard: {
      title: 'Tastatur & Kurzbefehle',
      hero: 'Kurzbefehle, Schnellfrage, die HUD-Geste und Fensteraufnahme.'
    },
    models: {
      title: 'Modelle',
      hero: 'Das Standardmodell, Ersatzmodelle und die Hilfsmodelle für Hintergrundaufgaben.'
    },
    providers: {
      title: 'Konten & Anbieter',
      hero: 'Angemeldete Konten, API-Schlüssel, eigene Endpunkte und lokale Modelle.'
    },
    memory: {
      title: 'Gedächtnis & Kontext',
      hero: 'Was sich Hermes merkt, wie viel, und wie lange Gespräche komprimiert werden.'
    },
    voice: {
      title: 'Sprache',
      hero: 'Sprachgespräch, Spracherkennung, Vorlesen und das Aktivierungswort.'
    },
    workspace: {
      title: 'Arbeitsbereich',
      hero: 'Projektordner, wo Befehle laufen, und Datei-Checkpoints.'
    },
    safety: {
      title: 'Sicherheit & Datenschutz',
      hero: 'Befehlsfreigaben, Datenschutz, der Browser und Zugriff auf private Netzwerke.'
    },
    passwords: {
      title: 'Passwörter & Logins',
      hero: 'Die Zugangsdaten, mit denen sich Hermes für dich bei Websites anmeldet.'
    },
    tools: {
      title: 'Tools & Schlüssel',
      hero: 'API-Schlüssel für Tool-Dienste und Server-Umgebungsvariablen.'
    },
    gateways: {
      title: 'Gateways & Verbindungen',
      hero: 'Mit welchem Hermes dieses Fenster verbunden ist, und deine gespeicherten Verbindungen.'
    },
    sessions: {
      title: 'Sessions & Archiv',
      hero: 'Automatisches Archivieren und archivierte Sessions.'
    },
    plugins: {
      title: 'Plugins',
      hero: page => `Einstellungen installierter Plugins. Installieren und aktivieren unter „${page} › Plugins“.`
    },
    billing: {
      title: 'Abrechnung',
      hero: 'Guthaben, Tarif, automatisches Aufladen und Ausgabenlimits.'
    },
    advanced: {
      title: 'Erweitert',
      hero: 'Agentenschritte, Terminal-Backend, Subagenten und Ausgabelimits. Für alle, die Hermes gut kennen.'
    },
    about: {
      title: 'Über Hermes',
      hero: 'Version, Updates, Konfigurationssicherung und Deinstallation.'
    }
  },
  window: {
    navLabel: 'Einstellungskategorien',
    noResults: query => `Keine Ergebnisse für „${query}“`,
    categoryResult: 'Kategorie',
    onlyThisMac: 'Nur dieser Mac',
    onlyThisDevice: 'Nur dieses Gerät',
    appliesToProfile: profile => `Gilt für „${profile}“`,
    appliesTo: 'Gilt für',
    scopeMenuTitle: 'Diese Einstellungen gelten für',
    searchResults: 'Suchergebnisse',
    pageMenu: 'Einstellungsseite'
  },
  sections: {
    general: {
      language: 'Sprache & Start',
      tips: 'Tipps & Anleitungen',
      system: 'Fenster & System'
    },
    appearance: {
      look: 'Erscheinungsbild',
      theme: 'Themes',
      themeNote:
        'Themes werden pro Profil gespeichert. Du kannst auch direkt aus dem VS Code Marketplace installieren.',
      window: 'Fenster',
      typography: 'Schriften & Skalierung',
      pet: 'Haustier'
    },
    chat: {
      replies: 'Antworten',
      messages: 'Nachrichten',
      media: 'Einbettungen & Anhänge'
    },
    notifications: {
      alerts: 'Desktop-Hinweise',
      sounds: 'Ton & Haptik'
    },
    keyboard: {
      shortcuts: 'Kurzbefehle',
      shortcutsNote: 'Klicke auf eine Tastenkombination, um sie zu ändern. Konflikte werden in der Zeile markiert.',
      quickAsk: 'Schnellfrage',
      hud: 'HUD & Fensteraufnahme'
    },
    models: {
      main: 'Hauptmodell',
      fallbacks: 'Ersatzmodelle',
      fallbacksNote:
        'Werden der Reihe nach versucht, wenn das Hauptmodell nicht verfügbar ist oder kein Guthaben mehr hat.',
      auxiliary: 'Hilfsmodelle',
      auxiliaryDisclosure: 'Hintergrundaufgaben (Bilderkennung, Komprimierung, Titel…)',
      moa: 'Agentenmix',
      moaDisclosure: 'Mehrere Modelle antworten gemeinsam, ein Aggregator fasst zusammen (/moa)'
    },
    providers: {
      accounts: 'Konten',
      apiKeys: 'API-Schlüssel',
      endpoints: 'Eigene Endpunkte',
      local: 'Lokale Modelle'
    },
    memory: {
      memory: 'Langzeitgedächtnis',
      context: 'Kontext & Komprimierung',
      contextDisclosure: 'Komprimierungsdetails',
      maintenance: 'Wartung'
    },
    voice: {
      conversation: 'Sprachgespräch',
      stt: 'Spracherkennung',
      tts: 'Vorlesen',
      wake: 'Aktivierungswort'
    },
    workspace: {
      projects: 'Projekte',
      execution: 'Ausführung',
      checkpoints: 'Checkpoints',
      checkpointsNote:
        'Wird vor jeder Dateiänderung automatisch gespeichert, damit du an einer Nachricht den Checkpoint wiederherstellen kannst.'
    },
    safety: {
      approvals: 'Befehlsfreigabe',
      privacy: 'Datenschutz',
      browser: 'Browser & Netzwerk'
    },
    passwords: {
      credentials: 'Gespeicherte Zugangsdaten',
      credentialsNote: 'Werden verwendet, wenn Hermes sich für dich anmeldet oder Formulare ausfüllt.',
      managers: 'Passwortmanager'
    },
    tools: {
      toolKeys: 'Schlüssel für Tool-Dienste',
      serverEnv: 'Server-Umgebungsvariablen',
      toolsets: 'Toolsets'
    },
    gateways: {
      connection: 'Dieses Fenster verbindet sich mit',
      saved: 'Gespeicherte Verbindungen',
      remoteUpdates: 'Remote-Updates'
    },
    sessions: {
      retention: 'Archivierung & Aufbewahrung',
      archived: 'Archivierte Sessions'
    },
    plugins: {
      pages: 'Plugin-Einstellungen',
      manage: 'Installieren & Aktivieren'
    },
    advanced: {
      agent: 'Agent',
      terminal: 'Terminal-Backend',
      subagents: 'Subagenten',
      output: 'Ausgabelimits',
      updates: 'In-App-Updates'
    },
    about: {
      updates: 'Updates',
      config: 'Konfiguration',
      diagnostics: 'Diagnose',
      uninstall: 'Deinstallieren'
    }
  },
  rows: {
    modeLight: 'Hell',
    modeDark: 'Dunkel',
    modeAuto: 'Automatisch',
    modeGroup: 'Farbmodus',
    accentTitle: 'Akzentfarbe',
    accentDesc: 'Die Farbe von Tasten, Auswahlen und Links',
    accentNous: 'Blau',
    accentHermes: 'Hermes-Blau',
    accentViolet: 'Lila',
    accentPink: 'Pink',
    accentRed: 'Rot',
    accentOrange: 'Orange',
    accentGreen: 'Grün',
    accentMono: 'Graphit',
    thinkingTitle: 'Denkprozess',
    thinkingDesc: 'Wie das Denken des Modells in Antworten erscheint',
    thinkingShow: 'Anzeigen',
    thinkingCollapse: 'Eingeklappt',
    thinkingHide: 'Ausgeblendet',
    timestampsTitle: 'Zeitstempel anzeigen',
    hapticsTitle: 'Haptisches Feedback',
    hapticsDesc: 'Haptische Hinweise beim Ziehen und wenn Arbeit fertig ist. Ausschalten stummt auch den Fertig-Ton.',
    wakeTitle: 'Auf das Aktivierungswort hören',
    wakeDesc: 'Hört im Hintergrund zu und startet ein Sprachgespräch, sobald es die Phrase hört',
    wakePhrase: 'Aktivierungsphrase',
    memoryOpenTitle: 'Ansehen & bearbeiten',
    memoryOpenDesc: 'Graph und Liste auf der Seite „Gedächtnis“ durchsehen.',
    memoryOpenAction: 'Gedächtnis öffnen',
    resetMemoryTitle: 'Gedächtnis zurücksetzen',
    resetMemoryDesc: 'Leert MEMORY.md. Kann nicht rückgängig gemacht werden.',
    resetProfileTitle: 'Nutzerprofil zurücksetzen',
    resetProfileDesc: 'Leert USER.md.',
    resetAction: 'Zurücksetzen…',
    toolsetsTitle: 'Toolsets ein- oder ausschalten',
    toolsetsDesc: page => `Verwaltet unter „${page} › Tools“.`,
    openAction: 'Öffnen',
    pluginsManageDesc: 'Installieren, aktualisieren, aktivieren und deinstallieren',
    pluginsManageAction: 'Plugins öffnen',
    exportDesc: 'Speichert hermes-config.json. Schlüssel sind nicht enthalten.',
    exportAction: 'Exportieren…',
    importAction: 'Importieren…',
    resetConfigDesc: 'Betrifft nur das aktuelle Profil. Die Darstellung dieses Geräts bleibt unverändert.',
    resetConfigAction: 'Zurücksetzen…',
    diagnosticsTitle: 'Diagnosedaten senden',
    diagnosticsDesc: 'Lädt geschwärzte Logs für den Support hoch. Du bestätigst vor dem Senden, der Link läuft ab.',
    diagnosticsAction: 'Senden…',
    logsTitle: 'Log-Ordner',
    logsActionMac: 'Im Finder zeigen',
    logsActionOther: 'Ordner öffnen',
    localModelsDesc: 'Offene Modelle herunterladen und auf diesem Computer ausführen.',
    localModelsAction: 'Lokale Modelle verwalten…',
    sendTestAction: 'Senden',
    themeMarketplaceTitle: 'Aus dem VS Code Marketplace installieren',
    noThemesMatch: query => `Keine installierten Themes passen zu „${query}“.`,
    activateKey: 'Aktivieren',
    activatingKey: 'Wird aktiviert…',
    apiKeyFallback: 'API-Schlüssel',
    pasteKeyPlaceholder: name => `${name} einfügen`,
    providerNeedsKey: provider => `${provider} benötigt einen API-Schlüssel – richte ihn ein, um ein Modell zu wählen.`,
    providerBrowserSignIn: provider => `${provider} meldet sich über deinen Browser an – Hermes übernimmt den Ablauf.`,
    addCredentialTitle: 'Zugangsdaten hinzufügen',
    addCredentialDesc: 'Login, Zahlungskarte oder Adresse',
    addCredentialAction: 'Hinzufügen…',
    resetShortcutsAction: 'Alles zurücksetzen'
  }
}
