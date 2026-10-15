// Hermes Studio copy (overlays: aux windows, boot surfaces, toasts) — fork-owned.
import type { StudioOverlaysAuxTranslations } from './types_studio_overlays_aux'

export const deStudioOverlaysAux: StudioOverlaysAuxTranslations = {
  quickEntry: {
    placeholder: 'Hermes fragen…',
    disconnected: 'Nicht verbunden — öffne Hermes, um dich neu zu verbinden',
    sendTo: 'Senden an',
    targetLabel: 'Ziel-Session',
    targetCurrent: 'Aktueller Chat',
    targetNew: 'Neue Session',
    send: 'senden',
    dismiss: 'schließen',
    summon: combo => `${combo} in jeder App`,
    deliveryFailed: 'Hermes konnte die Nachricht nicht zustellen.'
  },
  wake: {
    listening: 'Hört zu'
  },
  pet: {
    label: name => `Haustier: ${name}`,
    messagePlaceholder: 'Nachricht…',
    openInHermes: 'In Hermes öffnen',
    lines: {
      run: [
        'bin dran…',
        'mach ich…',
        'rechne…',
        'tüftle…',
        'köchle…',
        'tief drin…',
        'verdrahte…',
        'komme voran…',
        'Kopf runter…',
        'hämmere…'
      ],
      review: [
        'denke nach…',
        'lese…',
        'prüfe…',
        'grüble…',
        'verbinde Punkte…',
        'schätze ab…',
        'verfolge es…',
        'überlege…',
        'hecke was aus…',
        'hmm…'
      ],
      failed: [
        'hakt',
        'tja',
        'kaputt',
        'autsch',
        'hängt fest'
      ],
      waiting: [
        'du bist dran',
        'gehört dir',
        'an dich',
        'dein Zug',
        'warte auf Anweisungen'
      ],
      idle: [
        'hallo',
        'brauchst du was?',
        'alles ruhig',
        'bereit',
        'Zeit für eine Pause?'
      ]
    }
  },
  boot: {
    connecting: 'Verbinde mit Hermes…',
    step: (current, total) => `Schritt ${current} von ${total}`
  }
}
