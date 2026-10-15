// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
// Generated from one table (all 9 locales together); edit the table, not one file.
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
    scopeMenuTitle: 'Ces réglages s’appliquent à',
    searchResults: 'Résultats de recherche',
    pageMenu: 'Page de réglages'
  },
  sections: {
    general: {
      language: 'Langue et démarrage',
      tips: 'Astuces et tutoriels',
      system: 'Fenêtre et système'
    },
    appearance: {
      look: 'Apparence',
      theme: 'Thèmes',
      themeNote:
        'Les thèmes sont enregistrés par profil. Vous pouvez aussi en installer un depuis le VS Code Marketplace.',
      window: 'Fenêtre',
      typography: 'Polices et échelle',
      pet: 'Animal'
    },
    chat: {
      replies: 'Réponses',
      messages: 'Messages',
      media: 'Intégrations et pièces jointes'
    },
    notifications: {
      alerts: 'Alertes du bureau',
      sounds: 'Son et retour haptique'
    },
    keyboard: {
      shortcuts: 'Raccourcis',
      shortcutsNote: 'Cliquez sur une combinaison pour la modifier. Les conflits sont signalés dans la ligne.',
      quickAsk: 'Question rapide',
      hud: 'HUD et capture de fenêtre'
    },
    models: {
      main: 'Modèle principal',
      fallbacks: 'Modèles de secours',
      fallbacksNote: 'Essayés dans l’ordre si le modèle principal est indisponible ou sans crédit.',
      auxiliary: 'Modèles auxiliaires',
      auxiliaryDisclosure: 'Tâches de fond (vision, compression, titres…)',
      moa: 'Mélange d’agents',
      moaDisclosure: 'Plusieurs modèles répondent ensemble, puis un agrégateur combine leurs réponses (/moa)'
    },
    providers: {
      accounts: 'Comptes',
      apiKeys: 'Clés API',
      endpoints: 'Points de terminaison personnalisés',
      local: 'Modèles locaux'
    },
    memory: {
      memory: 'Mémoire à long terme',
      context: 'Contexte et compression',
      contextDisclosure: 'Détails de la compression',
      maintenance: 'Maintenance'
    },
    voice: {
      conversation: 'Conversation vocale',
      stt: 'Dictée',
      tts: 'Lecture à voix haute',
      wake: 'Mot d’activation'
    },
    workspace: {
      projects: 'Projets',
      execution: 'Exécution',
      checkpoints: 'Points de contrôle',
      checkpointsNote:
        'Enregistrés automatiquement avant chaque modification de fichier ; restaurez-les depuis un message.'
    },
    safety: {
      approvals: 'Approbation des commandes',
      privacy: 'Confidentialité',
      browser: 'Navigateur et réseau'
    },
    passwords: {
      credentials: 'Identifiants enregistrés',
      credentialsNote: 'Utilisés quand Hermes se connecte ou remplit des formulaires pour vous.',
      managers: 'Gestionnaires de mots de passe'
    },
    tools: {
      toolKeys: 'Clés des services d’outils',
      serverEnv: 'Variables d’environnement du serveur',
      toolsets: 'Ensembles d’outils'
    },
    gateways: {
      connection: 'Cette fenêtre se connecte à',
      saved: 'Connexions enregistrées',
      remoteUpdates: 'Mises à jour à distance'
    },
    sessions: {
      retention: 'Archivage et conservation',
      archived: 'Sessions archivées'
    },
    plugins: {
      pages: 'Réglages des plugins',
      manage: 'Installation et activation'
    },
    advanced: {
      agent: 'Agent',
      terminal: 'Backend du terminal',
      subagents: 'Sous-agents',
      output: 'Limites de sortie',
      updates: 'Mises à jour intégrées'
    },
    about: {
      updates: 'Mises à jour',
      config: 'Configuration',
      diagnostics: 'Diagnostics',
      uninstall: 'Désinstallation'
    }
  },
  rows: {
    modeLight: 'Clair',
    modeDark: 'Sombre',
    modeAuto: 'Auto',
    modeGroup: 'Mode de couleur',
    accentTitle: 'Couleur d’accentuation',
    accentDesc: 'La couleur des boutons, des sélections et des liens',
    accentNous: 'Bleu',
    accentHermes: 'Bleu Hermes',
    accentViolet: 'Violet',
    accentPink: 'Rose',
    accentRed: 'Rouge',
    accentOrange: 'Orange',
    accentGreen: 'Vert',
    accentMono: 'Graphite',
    thinkingTitle: 'Réflexion',
    thinkingDesc: 'Comment le raisonnement du modèle apparaît dans les réponses',
    thinkingShow: 'Afficher',
    thinkingCollapse: 'Replié',
    thinkingHide: 'Masqué',
    timestampsTitle: 'Afficher l’heure',
    hapticsTitle: 'Retour haptique',
    hapticsDesc:
      'Retours haptiques lors des glisser-déposer et à la fin d’un travail. Les désactiver coupe aussi le son de fin.',
    wakeTitle: 'Écouter le mot d’activation',
    wakeDesc: 'Écoute en arrière-plan et lance une conversation vocale quand il entend la phrase',
    wakePhrase: 'Phrase d’activation',
    memoryOpenTitle: 'Afficher et modifier',
    memoryOpenDesc: 'Parcourez le graphe et la liste sur la page Mémoire.',
    memoryOpenAction: 'Ouvrir la mémoire',
    resetMemoryTitle: 'Réinitialiser la mémoire',
    resetMemoryDesc: 'Vide MEMORY.md. Action irréversible.',
    resetProfileTitle: 'Réinitialiser le profil utilisateur',
    resetProfileDesc: 'Vide USER.md.',
    resetAction: 'Réinitialiser…',
    toolsetsTitle: 'Activer ou désactiver des ensembles d’outils',
    toolsetsDesc: page => `Gérés dans « ${page} › Outils ».`,
    openAction: 'Ouvrir',
    pluginsManageDesc: 'Installer, mettre à jour, activer et désinstaller',
    pluginsManageAction: 'Ouvrir les plugins',
    exportDesc: 'Enregistre hermes-config.json. Les clés ne sont pas incluses.',
    exportAction: 'Exporter…',
    importAction: 'Importer…',
    resetConfigDesc: 'N’affecte que le profil actuel. Les réglages d’apparence de cet appareil ne changent pas.',
    resetConfigAction: 'Réinitialiser…',
    diagnosticsTitle: 'Envoyer les diagnostics',
    diagnosticsDesc: 'Envoie des journaux anonymisés au support. Vous confirmez avant l’envoi et le lien expire.',
    diagnosticsAction: 'Envoyer…',
    logsTitle: 'Dossier des journaux',
    logsActionMac: 'Afficher dans le Finder',
    logsActionOther: 'Ouvrir le dossier',
    localModelsDesc: 'Téléchargez des modèles ouverts et exécutez-les sur cet ordinateur.',
    localModelsAction: 'Gérer les modèles locaux…',
    sendTestAction: 'Envoyer',
    themeMarketplaceTitle: 'Installer depuis le VS Code Marketplace',
    noThemesMatch: query => `Aucun thème installé ne correspond à « ${query} ».`,
    activateKey: 'Activer',
    activatingKey: 'Activation…',
    apiKeyFallback: 'clé API',
    pasteKeyPlaceholder: name => `Collez ${name}`,
    providerNeedsKey: provider => `${provider} nécessite une clé API — configurez-la pour choisir un modèle.`,
    providerBrowserSignIn: provider => `${provider} se connecte via votre navigateur — Hermes s’occupe de tout.`,
    addCredentialTitle: 'Ajouter un identifiant',
    addCredentialDesc: 'Identifiant, carte de paiement ou adresse',
    addCredentialAction: 'Ajouter…',
    resetShortcutsAction: 'Tout rétablir par défaut'
  }
}
