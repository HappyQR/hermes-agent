// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

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
  transcript: {
    delegateSpawned: count => `${count} Subagent${count === 1 ? '' : 'en'} gestartet`,
    delegateRunning: count => `${count} laufen`,
    delegateAllDone: 'Alle fertig',
    openAgents: 'In Agenten ansehen',
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
