// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const frStudioChat: StudioChatTranslations = {
  contextUsage: 'Utilisation du contexte',
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
