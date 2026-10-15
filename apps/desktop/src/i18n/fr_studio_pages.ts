// Hermes Studio copy (pages) — fork-owned so upstream locale merges stay clean.
import type { StudioPagesTranslations } from './types_studio_pages'

export const frStudioPages: StudioPagesTranslations = {
  common: {
    moreActions: 'Autres actions',
    deleteEllipsis: 'Supprimer…',
    edit: 'Modifier',
    appliesTo: 'S’applique à',
    thisMac: 'Ce Mac',
    thisDevice: 'Cet appareil'
  },
  automations: {
    title: 'Automatisations',
    subtitle:
      'Lancez Hermes selon un horaire ou à la réception d’un événement, et envoyez les résultats où vous voulez.',
    tabsLabel: 'Type d’automatisation',
    tabs: { cron: 'Planifiées', webhook: 'Webhook', blueprints: 'Modèles' },
    newMenu: 'Nouveau',
    newJob: 'Nouvelle tâche planifiée…',
    newHook: 'Nouveau webhook…',
    blueprintsIntro:
      'Des automatisations prêtes à l’emploi : remplissez quelques options et c’est parti. Elles viennent de vos plugins et compétences installés.',
    blueprintKind: 'Modèle',
    useBlueprint: 'Utiliser',
    useBlueprintAria: name => `Utiliser ${name}`
  },
  cron: {
    listLabel: 'Tâches planifiées',
    nextAt: when => `prochaine ${when}`,
    overdueAt: when => `en retard depuis ${when}`,
    tagHealthy: 'OK',
    tagFailed: 'Dernière exécution échouée',
    triggerNow: 'Lancer maintenant',
    duplicate: 'Dupliquer la tâche',
    copyName: name => `${name} (copie)`,
    openLatestRun: 'Ouvrir la dernière exécution dans une session',
    noRunsToOpen: 'Cette tâche n’a pas encore d’exécution liée à une session.',
    deleteNamed: name => `Supprimer « ${name} » ?`,
    deleteBody:
      'La tâche s’arrête immédiatement et ses sorties enregistrées sont supprimées. Les sessions des exécutions précédentes restent dans l’historique.',
    lastRunFailed: 'La dernière exécution a échoué',
    failureSeparator: ' : ',
    kvNext: 'Prochaine exécution',
    kvOverdue: 'En retard depuis',
    kvLast: 'Dernière exécution',
    kvDeliver: 'Envoie à',
    kvModel: 'Modèle',
    modelDefault: 'Par défaut (modèle global)',
    prompt: 'Prompt',
    script: 'Script',
    runs: 'Exécutions',
    runRunning: 'En cours',
    runViewOnly: 'Lecture seule',
    runOutputOnly: 'Sortie uniquement',
    durationSeconds: seconds => `${seconds} s`,
    durationMinutes: (minutes, seconds) => (seconds ? `${minutes} min ${seconds} s` : `${minutes} min`),
    durationHours: (hours, minutes) => (minutes ? `${hours} h ${minutes} min` : `${hours} h`),
    weeklyOnDaysAt: (days, time) => `Chaque ${days} à ${time}`,
    weekdaysShort: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'],
    daySeparator: ', ',
    sheet: {
      newTitle: 'Nouvelle tâche planifiée',
      editTitle: 'Modifier la tâche planifiée',
      blueprintTitle: name => `Utiliser le modèle : ${name}`,
      name: 'Nom',
      promptQuestion: 'Que doit faire Hermes ?',
      promptPlaceholder:
        'Par exemple : résumez les actualités IA importantes des dernières 24 heures, une phrase chacune, avec les liens des sources.',
      when: 'Quand',
      frequency: 'Fréquence',
      time: 'Heure',
      weekdays: 'Jours',
      dayOfMonth: 'Jour du mois',
      customLabel: 'Planification personnalisée',
      customPlaceholder: 'Ou saisissez une expression cron ou une phrase comme « every 30m »',
      checkedOnSave: 'Vérifiée à l’enregistrement',
      deliverTo: 'Envoyer les résultats à',
      model: 'Modèle',
      create: 'Créer',
      save: 'Enregistrer'
    }
  },
  webhooks: {
    listLabel: 'Webhooks',
    runsOnEvent: 'Lance Hermes à la réception d’un événement',
    enableAria: name => `Activer ${name}`,
    receiveUrl: 'URL de réception',
    receiveUrlHint: 'Collez-la dans les réglages webhook de l’expéditeur',
    signingSecret: 'Secret de signature',
    signingSecretHint: 'Affiché une seule fois, à la création',
    secretSet: 'Défini',
    secretNotSet: 'Non défini',
    events: 'Événements',
    skills: 'Compétences',
    deliverTo: 'Envoyer les résultats à',
    none: '—',
    newTitle: 'Nouveau webhook',
    promptQuestion: 'Que doit faire Hermes à la réception d’un événement ?',
    moreOptions: 'Plus d’options',
    receiverSettings: 'Réglages du récepteur'
  }
}
