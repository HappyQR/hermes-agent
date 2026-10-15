// Hermes Studio copy (overlays: aux windows, boot surfaces, toasts) — fork-owned.
import type { StudioOverlaysAuxTranslations } from './types_studio_overlays_aux'

export const frStudioOverlaysAux: StudioOverlaysAuxTranslations = {
  quickEntry: {
    placeholder: 'Demander à Hermes…',
    disconnected: 'Non connecté — ouvrez Hermes pour vous reconnecter',
    sendTo: 'Envoyer à',
    targetLabel: 'Session cible',
    targetCurrent: 'Conversation actuelle',
    targetNew: 'Nouvelle session',
    send: 'envoyer',
    dismiss: 'fermer',
    summon: combo => `${combo} depuis n’importe quelle app`,
    deliveryFailed: 'Hermes n’a pas pu transmettre le message.'
  },
  wake: {
    listening: 'À l’écoute'
  },
  pet: {
    label: name => `Animal : ${name}`,
    messagePlaceholder: 'Message…',
    openInHermes: 'Ouvrir dans Hermes',
    lines: {
      run: [
        'au travail…',
        'je m’en occupe…',
        'ça calcule…',
        'je bricole…',
        'ça mijote…',
        'dans les détails…',
        'je branche tout…',
        'ça avance…',
        'tête baissée…',
        'je martèle…'
      ],
      review: [
        'je réfléchis…',
        'je lis…',
        'je relis…',
        'je médite…',
        'je relie les points…',
        'je jauge…',
        'je remonte le fil…',
        'je rumine…',
        'je manigance…',
        'hmm…'
      ],
      failed: [
        'un accroc',
        'zut',
        'ça a cassé',
        'aïe',
        'bloqué'
      ],
      waiting: [
        'à toi',
        'tout à toi',
        'à toi de jouer',
        'la balle est dans ton camp',
        'j’attends tes ordres'
      ],
      idle: [
        'coucou',
        'besoin de quelque chose ?',
        'tout est calme',
        'en attente',
        'une petite pause ?'
      ]
    }
  },
  boot: {
    connecting: 'Connexion à Hermes…',
    step: (current, total) => `Étape ${current} sur ${total}`
  }
}
