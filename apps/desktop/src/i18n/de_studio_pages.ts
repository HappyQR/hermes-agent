// Hermes Studio copy (pages) — fork-owned so upstream locale merges stay clean.
import type { StudioPagesTranslations } from './types_studio_pages'

export const deStudioPages: StudioPagesTranslations = {
  common: {
    moreActions: 'Weitere Aktionen',
    deleteEllipsis: 'Löschen…',
    edit: 'Bearbeiten',
    appliesTo: 'Gilt für',
    thisMac: 'Dieser Mac',
    thisDevice: 'Dieses Gerät'
  },
  automations: {
    title: 'Automationen',
    subtitle:
      'Hermes nach Zeitplan oder bei eingehenden Ereignissen ausführen und die Ergebnisse dorthin senden, wo du sie brauchst.',
    tabsLabel: 'Automationstyp',
    tabs: { cron: 'Geplant', webhook: 'Webhook', blueprints: 'Vorlagen' },
    newMenu: 'Neu',
    newJob: 'Neuer geplanter Auftrag…',
    newHook: 'Neuer Webhook…',
    blueprintsIntro:
      'Fertige Automationen: ein paar Optionen ausfüllen, schon laufen sie. Sie stammen aus deinen installierten Plugins und Skills.',
    blueprintKind: 'Vorlage',
    useBlueprint: 'Verwenden',
    useBlueprintAria: name => `${name} verwenden`
  },
  cron: {
    listLabel: 'Geplante Aufträge',
    nextAt: when => `nächster Lauf ${when}`,
    overdueAt: when => `überfällig seit ${when}`,
    tagHealthy: 'In Ordnung',
    tagFailed: 'Letzter Lauf fehlgeschlagen',
    triggerNow: 'Jetzt ausführen',
    duplicate: 'Auftrag duplizieren',
    copyName: name => `${name} (Kopie)`,
    openLatestRun: 'Letzten Lauf in einer Sitzung öffnen',
    noRunsToOpen: 'Dieser Auftrag hat noch keinen Lauf mit Sitzung.',
    deleteNamed: name => `„${name}“ löschen?`,
    deleteBody:
      'Der Auftrag stoppt sofort und seine gespeicherten Laufausgaben werden gelöscht. Sitzungen früherer Läufe bleiben im Verlauf.',
    lastRunFailed: 'Letzter Lauf fehlgeschlagen',
    failureSeparator: ': ',
    kvNext: 'Nächster Lauf',
    kvOverdue: 'Überfällig seit',
    kvLast: 'Letzter Lauf',
    kvDeliver: 'Sendet an',
    kvModel: 'Modell',
    modelDefault: 'Standard (globales Modell)',
    prompt: 'Prompt',
    script: 'Skript',
    runs: 'Läufe',
    runRunning: 'Läuft',
    runViewOnly: 'Nur ansehen',
    runOutputOnly: 'Nur Ausgabe',
    durationSeconds: seconds => `${seconds} s`,
    durationMinutes: (minutes, seconds) => (seconds ? `${minutes} min ${seconds} s` : `${minutes} min`),
    durationHours: (hours, minutes) => (minutes ? `${hours} h ${minutes} min` : `${hours} h`),
    weeklyOnDaysAt: (days, time) => `Jeden ${days} um ${time}`,
    weekdaysShort: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    daySeparator: ', ',
    sheet: {
      newTitle: 'Neuer geplanter Auftrag',
      editTitle: 'Geplanten Auftrag bearbeiten',
      blueprintTitle: name => `Vorlage verwenden: ${name}`,
      name: 'Name',
      promptQuestion: 'Was soll Hermes tun?',
      promptPlaceholder:
        'Zum Beispiel: die wichtigsten KI-Nachrichten der letzten 24 Stunden zusammenfassen, je ein Satz, mit Quellenlinks.',
      when: 'Wann',
      frequency: 'Häufigkeit',
      time: 'Uhrzeit',
      weekdays: 'Tage',
      dayOfMonth: 'Tag des Monats',
      customLabel: 'Eigener Zeitplan',
      customPlaceholder: 'Oder einen Cron-Ausdruck oder eine Phrase wie „every 30m“ eingeben',
      checkedOnSave: 'Wird beim Speichern geprüft',
      deliverTo: 'Ergebnisse senden an',
      model: 'Modell',
      create: 'Erstellen',
      save: 'Speichern'
    }
  },
  webhooks: {
    listLabel: 'Webhooks',
    runsOnEvent: 'Führt Hermes aus, wenn ein Ereignis eingeht',
    enableAria: name => `${name} aktivieren`,
    receiveUrl: 'Empfangs-URL',
    receiveUrlHint: 'In die Webhook-Einstellungen des Absenders einfügen',
    signingSecret: 'Signatur-Secret',
    signingSecretHint: 'Wird nur einmal beim Erstellen angezeigt',
    secretSet: 'Festgelegt',
    secretNotSet: 'Nicht festgelegt',
    events: 'Ereignisse',
    skills: 'Skills',
    deliverTo: 'Ergebnisse senden an',
    none: '—',
    newTitle: 'Neuer Webhook',
    promptQuestion: 'Was soll Hermes tun, wenn ein Ereignis eingeht?',
    moreOptions: 'Weitere Optionen',
    receiverSettings: 'Empfänger-Einstellungen'
  }
}
