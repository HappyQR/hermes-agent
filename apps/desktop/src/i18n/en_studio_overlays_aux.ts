// Hermes Studio copy (overlays: aux windows, boot surfaces, toasts) — fork-owned.
import type { StudioOverlaysAuxTranslations } from './types_studio_overlays_aux'

export const enStudioOverlaysAux: StudioOverlaysAuxTranslations = {
  quickEntry: {
    placeholder: 'Ask Hermes…',
    disconnected: 'Not connected — open Hermes to reconnect',
    sendTo: 'Send to',
    targetLabel: 'Target session',
    targetCurrent: 'Current chat',
    targetNew: 'New session',
    send: 'send',
    dismiss: 'close',
    summon: combo => `Press ${combo} in any app`,
    deliveryFailed: 'Hermes could not deliver the prompt.'
  },
  wake: {
    listening: 'Listening'
  },
  pet: {
    label: name => `Pet: ${name}`,
    messagePlaceholder: 'Message…',
    openInHermes: 'Open in Hermes',
    lines: {
      run: [
        'working…',
        'on it…',
        'crunching…',
        'tinkering…',
        'cooking…',
        'in the weeds…',
        'wiring it up…',
        'making moves…',
        'heads down…',
        'hammering away…'
      ],
      review: [
        'thinking…',
        'reading…',
        'reviewing…',
        'pondering…',
        'connecting dots…',
        'sizing it up…',
        'tracing it…',
        'mulling…',
        'scheming…',
        'hmm…'
      ],
      failed: [
        'hit a snag',
        'welp',
        'that broke',
        'oof',
        'snagged'
      ],
      waiting: [
        'your turn',
        'all yours',
        'over to you',
        'ball’s in your court',
        'awaiting orders'
      ],
      idle: [
        'hi there',
        'need anything?',
        'all quiet',
        'standing by',
        'time for a break?'
      ]
    }
  },
  boot: {
    connecting: 'Connecting to Hermes…',
    step: (current, total) => `Step ${current} of ${total}`
  }
}
