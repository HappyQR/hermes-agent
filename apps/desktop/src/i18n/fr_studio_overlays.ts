// Hermes Studio copy (overlays) — fork-owned so upstream locale merges stay clean.
import { frStudioOverlaysAux } from './fr_studio_overlays_aux'
import type { StudioOverlaysTranslations } from './types_studio_overlays'

export const frStudioOverlays: StudioOverlaysTranslations = {
  quickAsk: 'Question rapide',
  aux: frStudioOverlaysAux,
  shortcuts: {
    title: 'Raccourcis clavier',
    subtitle: place => `Modifiables dans ${place}`,
    close: 'Fermer les raccourcis clavier',
    search: 'Rechercher un raccourci',
    searchPlaceholder: 'Rechercher',
    editInSettings: 'Modifier dans les réglages',
    noResults: query => `Aucun raccourci ne correspond à « ${query} »`,
    slotProfiles: (first, last) => `Passer au profil ${first}–${last}`,
    slotTabs: (first, last) => `Passer à l’onglet ${first}–${last}`,
    slotSessions: (first, last) => `Passer à la session récente ${first}–${last}`
  },
  system: {
    title: 'État du système',
    subtitle: 'Sessions, santé du système, utilisation et maintenance',
    close: 'Fermer l’état du système',
    sectionsLabel: 'Section',
    statGateway: 'Gateway',
    running: 'En marche',
    stopped: 'Arrêté',
    statVersion: 'Version',
    statActiveSessions: 'Sessions actives',
    statPlatforms: 'Plateformes de messagerie',
    platformsConnected: count => `${count} connectée(s)`,
    platformsNone: 'Aucune connectée',
    restartDesc: 'Les plateformes de messagerie connectées se reconnectent',
    restart: 'Redémarrer…',
    checkForUpdates: 'Rechercher des mises à jour',
    periodLabel: 'Période',
    cacheHit: percent => `Taux de cache ${percent} %`,
    dayDetail: (day, input, output) => `${day} · entrée ${input} · sortie ${output}`,
    searchSessions: 'Rechercher toutes les sessions par titre ou ID',
    tokens: count => `${count} jetons`,
    run: 'Lancer',
    manageMemory: 'Gérer…'
  },
  palette: {
    placeholder: 'Rechercher des sessions, pages, commandes et réglages',
    scopesLabel: 'Portée',
    scopes: {
      all: 'Tout',
      sessions: 'Sessions et projets',
      pages: 'Pages',
      actions: 'Commandes',
      settings: 'Réglages'
    },
    recent: 'Récents',
    searchContent: query => `Rechercher dans le contenu des sessions : « ${query} »`,
    searchContentDetail: 'Recherche en texte intégral',
    contentGroup: 'Dans le contenu des sessions',
    footerSelect: 'Sélectionner',
    footerOpen: 'Ouvrir',
    footerScope: 'Changer de portée',
    footerPaste: 'Collez l’ID d’une session pour y accéder',
    on: 'Activé',
    off: 'Désactivé',
    layoutEditMode: 'Basculer le mode d’édition de la disposition',
    reloadPlugins: 'Recharger les plugins de bureau',
    resetLayout: 'Réinitialiser la disposition'
  },
  profiles: {
    subtitle: 'Chaque profil a son propre modèle, ses compétences, sa mémoire et son persona (SOUL.md).',
    remote: 'Distant',
    changeModel: 'Modifier…',
    skillsEnabled: count => `${count} activée(s)`,
    manage: 'Gérer',
    soulHint: 'Persona et consignes permanentes',
    soulUnsaved: combo => `Non enregistré · ${combo} pour enregistrer`,
    exportNote: 'Les profils exportés n’incluent jamais les clés',
    importShort: 'Importer…'
  },
  updates: {
    currentVersion: (version, channel) => `Actuelle ${version} · ${channel}`
  }
}
