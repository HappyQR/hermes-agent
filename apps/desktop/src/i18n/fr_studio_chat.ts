// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

// Résumé d’une série d’outils : « J’ai exploré 3 fichiers », « Exécution de npm test ».
const frRun = (past: string, present: string, one: string, many: string) => ({
  present,
  named: (target: string, live: boolean) => (live ? `${present} de ${target}` : `J’ai ${past} ${target}`),
  counted: (count: number, live: boolean) => {
    const things = `${count} ${count <= 1 ? one : many}`

    return live ? `${present} de ${things}` : `J’ai ${past} ${things}`
  }
})

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)

export const frStudioChat: StudioChatTranslations = {
  contextUsage: 'Utilisation du contexte',
  composer: {
    addContext: 'Ajouter du contexte',
    addContextHint: 'Ajouter des fichiers, images, liens ou extraits',
    popOut: 'Détacher le compositeur',
    dock: 'Ancrer le compositeur',
    skills: 'Compétences…',
    autoApprove: 'Approbation auto',
    autoApproveHint: 'Approbations désactivées — les commandes s’exécutent sans demander',
    yoloHint: 'YOLO est activé pour ce chat — les commandes s’exécutent sans demander',
    turnOffYolo: 'Désactiver YOLO pour ce chat',
    contextUsagePercent: percent => `Utilisation du contexte ${percent} %`,
    cacheHit: value => `cache ${value}`,
    stats: {
      cacheHit: 'Succès du cache',
      throughput: 'Débit',
      throughputValue: value => `${value} jetons/s`,
      turnTime: 'Ce tour',
      sessionCost: 'Coût de la session'
    },
    compress: 'Compresser le contexte',
    compressIdleOnly: 'Disponible quand Hermes est inactif',
    usageDetails: 'Détails d’utilisation',
    effortOff: 'Désactivé',
    moreSendOptions: 'Autres options d’envoi',
    steerHint: 'après le prochain appel d’outil',
    redirectHint: 'arrête, puis envoie',
    voiceOptionsHint: 'Clic droit pour les options vocales',
    voiceEngineHint: 'Clic droit pour choisir le moteur',
    placeholderBusy: combo => `Ajoutez du contexte, ou ${combo} pour l’envoyer au prochain tour`,
    placeholderHero: 'Confiez une tâche à Hermes — / pour les commandes, @ pour citer des fichiers'
  },
  empty: {
    greeting: {
      lateNight: 'Il est tard',
      morning: 'Bonjour',
      noon: 'Bon après-midi',
      afternoon: 'Bon après-midi',
      evening: 'Bonsoir'
    },
    startersLabel: 'Pour commencer',
    starters: {
      fixError: {
        title: 'Corriger une erreur',
        description: 'Collez le message d’erreur, je trouve la cause et la corrige',
        prompt: 'Aide-moi à comprendre cette erreur :'
      },
      organizeFolder: {
        title: 'Ranger un dossier',
        description: 'Classement par type et par date, avec un inventaire',
        prompt: 'Range ~/Downloads et classe les factures à part.'
      },
      schedule: {
        title: 'Une tâche chaque jour',
        description: 'Par exemple, l’actu de l’IA résumée sur Telegram à 9 h',
        prompt: 'Chaque matin à 9 h, résume l’actualité de l’IA et envoie-la sur Telegram.'
      },
      prototype: {
        title: 'Maquetter une page web',
        description: 'Décrivez l’idée, obtenez une page cliquable',
        prompt: 'Crée une maquette de page web cliquable pour :'
      }
    },
    continueFrom: 'Reprendre depuis Claude Code ou Codex'
  },
  toolRun: {
    categories: {
      analyze: frRun('analysé', 'Analyse', 'image', 'images'),
      browse: frRun('ouvert', 'Ouverture', 'page', 'pages'),
      delegate: frRun('délégué', 'Délégation', 'tâche', 'tâches'),
      edit: frRun('modifié', 'Modification', 'fichier', 'fichiers'),
      explore: frRun('exploré', 'Exploration', 'fichier', 'fichiers'),
      interact: frRun('effectué', 'Exécution', 'action de navigateur', 'actions de navigateur'),
      other: frRun('utilisé', 'Utilisation', 'outil', 'outils'),
      read: frRun('lu', 'Lecture', 'page', 'pages'),
      run: frRun('exécuté', 'Exécution', 'commande', 'commandes'),
      search: {
        present: 'Recherche',
        named: (target, live) => (live ? `Recherche de ${target}` : `J’ai recherché ${target}`),
        counted: (count, live) => {
          const things = `${count} ${count <= 1 ? 'recherche' : 'recherches'}`

          return live ? `${things} en cours` : `J’ai lancé ${things}`
        }
      }
    },
    join: clauses => clauses.map((clause, index) => (index === 0 ? clause : lowerFirst(clause))).join(', '),
    moreCommands: (first, more) => `${first} + ${more} ${more <= 1 ? 'commande' : 'commandes'}`
  },
  voice: {
    label: 'Conversation vocale',
    doneSpeaking: 'J’ai fini'
  },
  transcript: {
    searchResults: 'Résultats de recherche',
    delegatedTask: 'Tâche déléguée',
    delegateSpawned: count => `${count} sous-agent${count > 1 ? 's' : ''} lancé${count > 1 ? 's' : ''}`,
    delegateRunning: count => `${count} en cours`,
    delegateAllDone: 'Tout est terminé',
    openAgents: 'Voir dans l’inspecteur',
    approvalTitle: 'Autoriser Hermes à exécuter cette commande ?',
    approvalTitleAction: 'Autoriser Hermes à effectuer cette action ?',
    approvalMode: 'Mode d’approbation…',
    needsChoice: 'Votre choix est requis',
    answered: 'Répondu',
    questions: count => `${count} question${count > 1 ? 's' : ''}`,
    clarifyHint: 'Choisissez une option ou saisissez votre réponse',
    clarifyHintMulti: 'Sélectionnez tout ce qui s’applique ou saisissez votre réponse',
    recommended: 'Recommandé',
    moreRecovery: 'Autres options de récupération',
    preparingReply: 'Hermes prépare une réponse',
    timelineLabel: 'Chronologie de la conversation',
    editAndRerun: 'Modifier et relancer',
    editRerunNote: 'Envoi à partir d’ici — les messages suivants de ce chat sont supprimés',
    previousVersion: 'Version précédente',
    nextVersion: 'Version suivante',
    exportMarkdown: 'Exporter en Markdown…',
    exportFileName: 'Réponse Hermes.md',
    exported: name => `${name} enregistré`,
    exportFailed: 'Impossible d’exporter la réponse'
  },
  tray: {
    label: 'Activité',
    hide: 'Masquer l’activité',
    show: count => `Afficher l’activité (${count})`,
    approval: count => (count > 1 ? `Approbation requise · ${count}` : 'Approbation requise'),
    approvalHint: 'Aller à la commande en attente d’approbation',
    needsInput: 'En attente de votre choix',
    needsInputHint: 'Aller à la question',
    previews: count => `${count} aperçu${count > 1 ? 's' : ''}`,
    more: 'Plus',
    close: 'Fermer',
    titles: {
      background: 'Processus en arrière-plan',
      preview: 'Liens d’aperçu',
      previousTodo: 'Tâches précédentes',
      queue: 'File d’attente',
      subagent: 'Sous-agents',
      todo: 'Tâches'
    },
    todoCaption: 'Tenues à jour par Hermes pendant ce tour',
    queueCaption: 'Envoyés dans l’ordre après ce tour',
    git: {
      hint: 'Branche, modifications et arbres de travail',
      reviewChanges: 'Examiner les modifications',
      openPullRequest: number => `Ouvrir la pull request #${number}`,
      copyWorktreePath: 'Copier le chemin de l’arbre de travail'
    }
  }
}
