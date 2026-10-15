// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

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
