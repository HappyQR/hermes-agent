// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
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
    scopeMenuTitle: 'Diese Einstellungen gelten für'
  }
}
