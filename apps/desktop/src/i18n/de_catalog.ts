import type { CatalogTranslations } from './types_catalog'

export const deCatalog: CatalogTranslations = {
  add: 'Hinzufügen',
  added: 'Hinzugefügt',
  discover: 'Entdecken',
  featured: 'Empfohlen',
  explorePlugins: 'Plugins entdecken',
  exploreSkills: 'Skills entdecken',
  mostStarred: 'Meiste Sterne',
  newest: 'Neueste',
  recentlyUpdated: 'Kürzlich aktualisiert',
  alphabetical: 'Name',
  sortBy: 'Sortieren nach',
  seeAll: 'Alle anzeigen',
  related: 'Ähnliches',
  tags: 'Tags',
  screenshots: 'Screenshots',
  listView: 'Listenansicht',
  cardView: 'Kartenansicht',
  installTitle: (name: string) => `„${name}“ installieren?`,
  installDescription:
    'Dieser Skill steht in neuen Sessions zur Verfügung. Installieren Sie nur aus Quellen, denen Sie vertrauen.',
  installTo: 'Installieren in',
  thisComputer: 'Diesem Computer',
  installing: 'Wird installiert…',
  installComplete: (name: string) => `„${name}“ installiert`,
  destinationChanged:
    'Das Ziel hat sich geändert. Schließen Sie diesen Dialog und öffnen Sie den Installationslink erneut.',
  install: 'Installieren',
  installed: 'Installiert',
  searchSkills: 'Skills durchsuchen',
  searchPlugins: 'Plugins durchsuchen',
  allSources: 'Alle Quellen',
  allCategories: 'Alle Kategorien',
  about: 'Info',
  author: 'Autor',
  source: 'Quelle',
  category: 'Kategorie',
  version: 'Version',
  platforms: 'Plattformen',
  requires: 'Voraussetzungen',
  tools: 'Werkzeuge',
  hooks: 'Hooks',
  middleware: 'Middleware',
  commands: 'Befehle',
  license: 'Lizenz',
  addedDate: 'Hinzugefügt',
  updatedDate: 'Aktualisiert',
  repository: 'Repository',
  documentation: 'Dokumentation',
  noResults: 'Keine Treffer',
  tryAnother: 'Versuchen Sie eine andere Suche oder setzen Sie die Filter zurück.',
  clearFilters: 'Filter zurücksetzen',
  filters: 'Filter',
  loadFailed: 'Der Katalog konnte nicht geladen werden',
  retry: 'Erneut versuchen',
  more: 'Mehr anzeigen',
  pinned: 'Geprüfter Commit',
  snapshotHint: 'Aus dem Hermes-Katalog. Beim Stöbern werden nie die Quell-Repositorys kontaktiert.',
  installHint: 'Prüfen Sie die Quelle vor der Installation. Änderungen gelten für neue Sessions.',
  results: (count: number) => `${count.toLocaleString('de')} Treffer`,
  back: 'Zurück zu den Ergebnissen',
  tier: 'Stufe',
  previousSlide: 'Vorheriger Eintrag',
  nextSlide: 'Nächster Eintrag',
  slideOf: (index: number, count: number) => `${index} von ${count}`,
  tierLabels: { official: 'Offiziell', verified: 'Verifiziert', community: 'Community' },
  tiers: {
    official: { title: 'Offizielle Plugins', blurb: 'Von Nous Research entwickelt und gepflegt.' },
    verified: { title: 'Verifizierte Plugins', blurb: 'Vom Anbieter der Integration, von Nous verifiziert.' }
  },
  moreToExplore: 'Mehr zu entdecken',
  moreToExploreBlurb: 'Die kleineren Ecken des Katalogs, an einem Ort.',
  skillsFor: (category: string) => `Skills für ${category}.`,
  discoverKind: (kind: string) => `${kind} entdecken`,
  developer: {
    heading: 'Entwicklermodus',
    title: 'Für Hermes entwickeln',
    pitch: 'Ein Werkzeug, einen Connector, ein Plugin oder einen Mod gebaut?',
    pitchFollowUp: 'Sie möchten, wissen aber nicht wie?',
    submit: 'Mod einreichen',
    docs: 'Entwicklerdokumentation'
  },
  toolsets: {
    mostUsed: 'Am häufigsten genutzt',
    mostUsedBlurb: 'Die Werkzeuge, die Hermes in diesem Profil am häufigsten nutzt.',
    essentials: 'Grundausstattung',
    essentialsBlurb: 'Worauf die meiste Arbeit von Hermes aufbaut.',
    toolCount: (count: number) => `${count} ${count === 1 ? 'Werkzeug' : 'Werkzeuge'}`,
    callCount: (count: string, calls: number) => `${count} ${calls === 1 ? 'Aufruf' : 'Aufrufe'}`,
    themes: {
      work: {
        label: 'Browsen, arbeiten und automatisieren',
        blurb: 'Browser und Desktop steuern, Dateien bearbeiten, Code ausführen und Aufgaben planen.'
      },
      create: {
        label: 'Sehen, hören und erschaffen',
        blurb: 'Bilder und Videos ansehen, Sprache transkribieren und Medien erzeugen.'
      },
      recall: {
        label: 'Gedächtnis und Wissen',
        blurb: 'Woran sich Hermes erinnert, und die Skills und der Verlauf, die es durchsuchen kann.'
      },
      connect: {
        label: 'Verbinden und kommunizieren',
        blurb: 'Konten, andere Agenten, das Smart Home und Suche über das Web hinaus.'
      },
      more: { label: 'Weitere Werkzeuge', blurb: 'Alles andere, was dieses Profil einschalten kann.' }
    }
  }
}
