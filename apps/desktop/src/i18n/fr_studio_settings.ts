// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
import type { StudioSettingsTranslations } from './types_studio_settings'

export const frStudioSettings: StudioSettingsTranslations = {
  searchPlaceholder: 'Rechercher dans les réglages',
  pages: {
    general: {
      title: 'Général',
      hero: 'Langue, démarrage, astuces et comportement de la fenêtre.'
    },
    appearance: {
      title: 'Apparence',
      hero: 'Couleurs, thèmes, verre de la fenêtre, polices et animaux.'
    },
    chat: {
      title: 'Conversation',
      hero: 'Style des réponses et affichage de la réflexion, des appels d’outils et des messages.'
    },
    notifications: {
      title: 'Notifications',
      hero: 'Ce qui peut vous déranger, et le son lorsqu’un travail se termine.'
    },
    keyboard: {
      title: 'Clavier et raccourcis',
      hero: 'Raccourcis, question rapide, geste HUD et capture de fenêtre.'
    },
    models: {
      title: 'Modèles',
      hero: 'Le modèle par défaut, les modèles de secours et les modèles auxiliaires des tâches de fond.'
    },
    providers: {
      title: 'Comptes et fournisseurs',
      hero: 'Comptes connectés, clés API, points de terminaison personnalisés et modèles locaux.'
    },
    memory: {
      title: 'Mémoire et contexte',
      hero: 'Ce dont Hermes se souvient, en quelle quantité, et la compression des longues conversations.'
    },
    voice: {
      title: 'Voix',
      hero: 'Conversation vocale, dictée, lecture à voix haute et mot d’activation.'
    },
    workspace: {
      title: 'Espace de travail',
      hero: 'Dossiers de projet, environnement d’exécution des commandes et points de contrôle des fichiers.'
    },
    safety: {
      title: 'Sécurité et confidentialité',
      hero: 'Approbation des commandes, confidentialité, navigateur et accès aux réseaux privés.'
    },
    passwords: {
      title: 'Mots de passe et identifiants',
      hero: 'Les identifiants que Hermes utilise pour se connecter à des sites à votre place.'
    },
    tools: {
      title: 'Outils et clés',
      hero: 'Clés API des services d’outils et variables d’environnement du serveur.'
    },
    gateways: {
      title: 'Gateways et connexions',
      hero: 'Le Hermes auquel cette fenêtre est connectée, et vos connexions enregistrées.'
    },
    sessions: {
      title: 'Sessions et archives',
      hero: 'Archivage automatique et sessions archivées.'
    },
    plugins: {
      title: 'Plugins',
      hero: page => `Réglages des plugins installés. L’installation et l’activation se font dans « ${page} › Plugins ».`
    },
    billing: {
      title: 'Facturation',
      hero: 'Solde, forfait, recharge automatique et limites de dépenses.'
    },
    advanced: {
      title: 'Avancé',
      hero: 'Étapes de l’agent, backend du terminal, sous-agents et limites de sortie. Pour qui connaît bien Hermes.'
    },
    about: {
      title: 'À propos de Hermes',
      hero: 'Version, mises à jour, sauvegarde de la configuration et désinstallation.'
    }
  },
  window: {
    navLabel: 'Catégories de réglages',
    noResults: query => `Aucun résultat pour « ${query} »`,
    categoryResult: 'Catégorie',
    onlyThisMac: 'Ce Mac uniquement',
    onlyThisDevice: 'Cet appareil uniquement',
    appliesToProfile: profile => `S’applique à « ${profile} »`,
    appliesTo: 'S’applique à',
    scopeMenuTitle: 'Ces réglages s’appliquent à'
  }
}
