// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

// Zusammenfassung eines Tool-Laufs: „3 Dateien untersucht“, „Führe npm test aus“.
const deRun = (participle: string, doing: (object: string) => string, present: string, one: string, many: string) => ({
  present,
  named: (target: string, live: boolean) => (live ? doing(target) : `${target} ${participle}`),
  counted: (count: number, live: boolean) => {
    const things = `${count} ${count === 1 ? one : many}`

    return live ? doing(things) : `${things} ${participle}`
  }
})

export const deStudioChat: StudioChatTranslations = {
  contextUsage: 'Kontextnutzung',
  composer: {
    addContext: 'Kontext hinzufügen',
    addContextHint: 'Dateien, Bilder, Links oder Snippets hinzufügen',
    popOut: 'Eingabefeld lösen',
    dock: 'Eingabefeld andocken',
    skills: 'Skills…',
    autoApprove: 'Auto-Freigabe',
    autoApproveHint: 'Freigaben sind aus — Befehle laufen ohne Nachfrage',
    yoloHint: 'YOLO ist für diesen Chat an — Befehle laufen ohne Nachfrage',
    turnOffYolo: 'YOLO für diesen Chat ausschalten',
    contextUsagePercent: percent => `Kontextnutzung ${percent} %`,
    cacheHit: value => `Cache-Treffer ${value}`,
    stats: {
      cacheHit: 'Cache-Treffer',
      throughput: 'Durchsatz',
      throughputValue: value => `${value} Tok./s`,
      turnTime: 'Dieser Zug',
      sessionCost: 'Sitzungskosten'
    },
    compress: 'Kontext komprimieren',
    compressIdleOnly: 'Verfügbar, wenn Hermes nicht arbeitet',
    usageDetails: 'Nutzungsdetails',
    effortOff: 'Aus',
    moreSendOptions: 'Weitere Sendeoptionen',
    steerHint: 'nach dem nächsten Tool-Aufruf',
    redirectHint: 'stoppt, dann senden',
    voiceOptionsHint: 'Rechtsklick für Sprachoptionen',
    voiceEngineHint: 'Rechtsklick, um die Engine zu wählen',
    placeholderBusy: combo => `Kontext ergänzen oder ${combo}, um es für den nächsten Zug einzureihen`,
    placeholderHero: 'Gib Hermes eine Aufgabe — / für Befehle, @ für Dateien'
  },
  empty: {
    greeting: {
      lateNight: 'Noch wach?',
      morning: 'Guten Morgen',
      noon: 'Guten Tag',
      afternoon: 'Guten Tag',
      evening: 'Guten Abend'
    },
    startersLabel: 'Schnellstart',
    starters: {
      fixError: {
        title: 'Einen Fehler beheben',
        description: 'Füge die Fehlermeldung ein – ich finde die Ursache und behebe sie',
        prompt: 'Hilf mir mit diesem Fehler:'
      },
      organizeFolder: {
        title: 'Einen Ordner aufräumen',
        description: 'Nach Typ und Datum ablegen, mit einer Übersicht',
        prompt: 'Räume ~/Downloads auf und lege Rechnungen separat ab.'
      },
      schedule: {
        title: 'Täglich etwas erledigen',
        description: 'Zum Beispiel um 9 Uhr KI-News für Telegram zusammenfassen',
        prompt: 'Fasse jeden Morgen um 9 Uhr KI-News zusammen und schicke sie an Telegram.'
      },
      prototype: {
        title: 'Webseiten-Prototyp bauen',
        description: 'Beschreibe die Idee und erhalte eine klickbare Seite',
        prompt: 'Baue einen klickbaren Webseiten-Prototyp für:'
      }
    },
    continueFrom: 'Aus Claude Code oder Codex fortsetzen'
  },
  toolRun: {
    categories: {
      analyze: deRun('analysiert', object => `Analysiere ${object}`, 'Analysiere', 'Bild', 'Bilder'),
      browse: deRun('geöffnet', object => `Öffne ${object}`, 'Öffne', 'Seite', 'Seiten'),
      delegate: deRun('delegiert', object => `Delegiere ${object}`, 'Delegiere', 'Aufgabe', 'Aufgaben'),
      edit: deRun('bearbeitet', object => `Bearbeite ${object}`, 'Bearbeite', 'Datei', 'Dateien'),
      explore: deRun('untersucht', object => `Untersuche ${object}`, 'Untersuche', 'Datei', 'Dateien'),
      interact: deRun('ausgeführt', object => `Führe ${object} aus`, 'Führe aus', 'Browseraktion', 'Browseraktionen'),
      other: deRun('verwendet', object => `Verwende ${object}`, 'Verwende', 'Tool', 'Tools'),
      read: deRun('gelesen', object => `Lese ${object}`, 'Lese', 'Seite', 'Seiten'),
      run: deRun('ausgeführt', object => `Führe ${object} aus`, 'Führe aus', 'Befehl', 'Befehle'),
      search: {
        present: 'Suche',
        named: (target, live) => (live ? `Suche ${target}` : `${target} gesucht`),
        counted: (count, live) => {
          const things = `${count} ${count === 1 ? 'Suchanfrage' : 'Suchanfragen'}`

          return live ? `Führe ${things} aus` : `${things} ausgeführt`
        }
      }
    },
    // German nouns keep their capital mid-line, so clauses stand apart rather
    // than being lower-cased into one sentence.
    join: clauses => clauses.join(' · '),
    moreCommands: (first, more) => `${first} + ${more} ${more === 1 ? 'Befehl' : 'Befehle'}`
  },
  voice: {
    label: 'Sprachunterhaltung',
    doneSpeaking: 'Fertig gesprochen'
  },
  transcript: {
    searchResults: 'Suchergebnisse',
    delegatedTask: 'Delegierte Aufgabe',
    delegateSpawned: count => `${count} Subagent${count === 1 ? '' : 'en'} gestartet`,
    delegateRunning: count => `${count} laufen`,
    delegateAllDone: 'Alle fertig',
    openAgents: 'Im Inspektor ansehen',
    approvalTitle: 'Darf Hermes diesen Befehl ausführen?',
    approvalTitleAction: 'Darf Hermes diese Aktion ausführen?',
    approvalMode: 'Freigabemodus…',
    needsChoice: 'Deine Auswahl ist gefragt',
    answered: 'Beantwortet',
    questions: count => `${count} Frage${count === 1 ? '' : 'n'}`,
    clarifyHint: 'Wähle eine Option oder gib deine Antwort ein',
    clarifyHintMulti: 'Wähle alles Zutreffende aus oder gib deine Antwort ein',
    recommended: 'Empfohlen',
    moreRecovery: 'Weitere Wiederherstellungsoptionen',
    preparingReply: 'Hermes bereitet eine Antwort vor',
    timelineLabel: 'Gesprächsverlauf',
    editAndRerun: 'Bearbeiten und neu ausführen',
    editRerunNote: 'Sendet ab hier — spätere Nachrichten in diesem Chat werden entfernt',
    previousVersion: 'Vorherige Version',
    nextVersion: 'Nächste Version',
    exportMarkdown: 'Als Markdown exportieren…',
    exportFileName: 'Hermes-Antwort.md',
    exported: name => `${name} gespeichert`,
    exportFailed: 'Antwort konnte nicht exportiert werden'
  },
  tray: {
    label: 'Aktivität',
    hide: 'Aktivität ausblenden',
    show: count => `Aktivität anzeigen (${count})`,
    approval: count => (count > 1 ? `Freigabe nötig · ${count}` : 'Freigabe nötig'),
    approvalHint: 'Zum Befehl springen, der auf Freigabe wartet',
    needsInput: 'Wartet auf deine Auswahl',
    needsInputHint: 'Zur Frage springen',
    previews: count => `${count} Vorschau${count === 1 ? '' : 'en'}`,
    more: 'Mehr',
    close: 'Schließen',
    titles: {
      background: 'Hintergrundprozesse',
      preview: 'Vorschau-Links',
      previousTodo: 'Frühere Aufgaben',
      queue: 'Warteschlange',
      subagent: 'Subagenten',
      todo: 'Aufgaben'
    },
    todoCaption: 'Hermes hält sie in diesem Zug aktuell',
    queueCaption: 'Werden nach diesem Zug der Reihe nach gesendet',
    git: {
      hint: 'Branch, Änderungen und Worktrees',
      reviewChanges: 'Änderungen prüfen',
      openPullRequest: number => `Pull-Request #${number} öffnen`,
      copyWorktreePath: 'Worktree-Pfad kopieren'
    }
  }
}
