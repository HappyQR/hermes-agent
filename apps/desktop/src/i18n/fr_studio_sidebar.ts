// Hermes Studio copy (sidebar) — fork-owned so upstream locale merges stay clean.
import type { StudioSidebarTranslations } from './types_studio_sidebar'

export const frStudioSidebar: StudioSidebarTranslations = {
  search: 'Rechercher',
  searchAria: 'Rechercher des sessions, des pages et des commandes',
  nav: {
    label: 'Pages',
    automations: 'Automatisations',
    memory: 'Mémoire',
    open: 'Ouvrir',
    pendingPairing: count =>
      count === 1 ? '1 demande de jumelage en attente' : `${count} demandes de jumelage en attente`,
    cronJobs: count => (count === 1 ? '1 tâche planifiée' : `${count} tâches planifiées`),
    cronFailing: count => (count === 1 ? '1 tâche en échec' : `${count} tâches en échec`)
  },
  section: {
    expand: 'Développer',
    collapse: 'Réduire',
    collapsedCount: count => (count === 1 ? '1 masquée' : `${count} masquées`),
    expandGroups: 'Développer tous les groupes',
    collapseGroups: 'Réduire tous les groupes'
  },
  projects: {
    newProject: 'Nouveau projet…',
    openFolder: 'Ouvrir un dossier comme projet…',
    newWorktree: 'Nouvel arbre de travail…',
    auto: 'Auto',
    actions: 'Actions du projet',
    newSessionHere: 'Nouvelle session dans ce projet',
    newSessionInLane: 'Nouvelle session dans ce couloir'
  },
  scope: {
    tip: 'Seules les sessions de ce projet sont affichées',
    clear: 'Afficher toutes les sessions'
  },
  sessions: {
    viewOptions: 'Options d’affichage',
    viewOptionsTip: 'Grouper, trier et filtrer',
    noMatches: 'Aucune session ne correspond à ces filtres.',
    clearFilters: 'Effacer les filtres'
  },
  grouping: {
    label: 'Grouper',
    time: 'Par date',
    project: 'Par projet',
    status: 'Par état',
    source: 'Par source',
    profile: 'Par passerelle et profil',
    none: 'Aucun groupe',
    noProject: 'Sans projet'
  },
  statusGroup: {
    needsInput: 'Réponse requise',
    working: 'En cours',
    unread: 'Non lues',
    draft: 'Brouillons',
    done: 'Terminées'
  },
  view: {
    reset: 'Rétablir les réglages par défaut',
    sort: 'Trier',
    show: 'Afficher',
    time: 'Heure',
    density: 'Densité de la liste',
    compact: 'Compacte',
    comfortable: 'Confortable',
    detailed: 'Détaillée',
    filters: 'Filtres',
    sources: 'Sources',
    prStatus: 'État de la PR',
    prAny: 'Toutes',
    showArchived: 'Afficher les sessions archivées',
    moreFilters: 'Plus de filtres'
  },
  source: {
    desktop: 'Bureau',
    cron: 'Tâche planifiée',
    from: label => `Depuis ${label}`
  },
  row: {
    yesterday: 'Hier'
  },
  menu: {
    clickHint: keys => `${keys} + clic`,
    openInNewWindow: 'Ouvrir dans une nouvelle fenêtre',
    splitRight: 'À droite',
    splitDown: 'En bas',
    splitLeft: 'À gauche',
    splitUp: 'En haut',
    color: 'Couleur',
    copySessionId: 'Copier l’ID de la session',
    branchFromHere: 'Créer une branche ici',
    export: 'Exporter',
    exportJson: 'JSON…',
    exportMarkdown: 'Markdown…',
    exportUser: 'Vous',
    exportAssistant: 'Hermes',
    exportFailed: 'Impossible d’exporter la session',
    newProject: 'Nouveau projet…',
    renameConfirm: 'Renommer',
    delete: 'Supprimer…'
  },
  draft: {
    noProject: 'Aucun projet',
    projectAria: name => `Projet : ${name}`,
    profileAria: name => `Profil : ${name}`
  },
  footer: {
    updateAvailable: name => `${name} disponible`,
    updateGeneric: 'Mise à jour disponible',
    updateBackend: 'Mise à jour du backend disponible',
    updateView: 'Cliquez pour voir',
    updateBehind: count =>
      count === 1 ? '1 commit de retard · Cliquez pour voir' : `${count} commits de retard · Cliquez pour voir`,
    updateApplying: 'Mise à jour…',
    updateRestart: 'Redémarrez pour terminer la mise à jour',
    account: 'Profils et passerelles',
    ready: 'Prête',
    connecting: 'Connexion…',
    disconnected: 'Déconnectée',
    unreachable: 'Injoignable',
    remote: 'Distant',
    thisDevice: 'Cet appareil',
    thisMac: 'Ce Mac',
    defaultSuffix: ' (par défaut)',
    needsInputBadge: count => `${count} en attente`,
    unreadBadge: count => (count === 1 ? '1 non lue' : `${count} non lues`),
    switchHere: 'Passer à ce profil',
    newProfile: 'Nouveau profil…',
    gateway: 'Passerelle',
    reconnect: 'Se reconnecter',
    recentActivity: 'Activité récente…',
    connectGateway: 'Connecter une autre passerelle…',
    systemStatus: 'État du système…',
    settings: 'Réglages…',
    shortcuts: 'Raccourcis clavier',
    checkUpdates: 'Rechercher des mises à jour…',
    showRail: 'Afficher la barre des profils'
  }
}
