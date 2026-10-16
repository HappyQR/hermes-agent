// Hermes Studio copy (sidebar) — fork-owned so upstream locale merges stay clean.
import type { StudioSidebarTranslations } from './types_studio_sidebar'

export const esStudioSidebar: StudioSidebarTranslations = {
  search: 'Buscar',
  searchAria: 'Buscar sesiones, páginas y comandos',
  nav: {
    label: 'Páginas',
    automations: 'Automatizaciones',
    memory: 'Memoria',
    open: 'Abrir',
    pendingPairing: count =>
      count === 1 ? '1 solicitud de vinculación pendiente' : `${count} solicitudes de vinculación pendientes`,
    cronJobs: count => (count === 1 ? '1 tarea programada' : `${count} tareas programadas`),
    cronFailing: count => (count === 1 ? '1 tarea está fallando' : `${count} tareas están fallando`)
  },
  section: {
    expand: 'Expandir',
    collapse: 'Contraer',
    collapsedCount: count => (count === 1 ? '1 oculta' : `${count} ocultas`),
    expandGroups: 'Expandir todos los grupos',
    collapseGroups: 'Contraer todos los grupos'
  },
  projects: {
    newProject: 'Nuevo proyecto…',
    openFolder: 'Abrir carpeta como proyecto…',
    newWorktree: 'Nuevo árbol de trabajo…',
    auto: 'Auto',
    actions: 'Acciones del proyecto',
    newSessionHere: 'Nueva sesión en este proyecto',
    newSessionInLane: 'Nueva sesión en este carril',
    empty: 'Aún no hay proyectos'
  },
  scope: {
    tip: 'Solo se muestran las sesiones de este proyecto',
    clear: 'Mostrar todas las sesiones'
  },
  sessions: {
    viewOptions: 'Opciones de vista',
    viewOptionsTip: 'Agrupar, ordenar y filtrar',
    noMatches: 'Ninguna sesión coincide con estos filtros.',
    clearFilters: 'Borrar filtros'
  },
  grouping: {
    label: 'Agrupar',
    time: 'Por fecha',
    project: 'Por proyecto',
    status: 'Por estado',
    source: 'Por origen',
    profile: 'Por puerta de enlace y perfil',
    none: 'Sin agrupar',
    noProject: 'Sin proyecto'
  },
  statusGroup: {
    needsInput: 'Requiere respuesta',
    working: 'En curso',
    unread: 'No leídas',
    draft: 'Borradores',
    done: 'Terminadas'
  },
  view: {
    reset: 'Restaurar valores predeterminados',
    sort: 'Ordenar',
    show: 'Mostrar',
    time: 'Hora',
    density: 'Densidad de la lista',
    compact: 'Compacta',
    comfortable: 'Cómoda',
    detailed: 'Detallada',
    filters: 'Filtros',
    sources: 'Orígenes',
    prStatus: 'Estado de la PR',
    prAny: 'Todas',
    showArchived: 'Mostrar sesiones archivadas',
    moreFilters: 'Más filtros'
  },
  source: {
    desktop: 'Escritorio',
    cron: 'Tarea programada',
    from: label => `Desde ${label}`
  },
  row: {
    yesterday: 'Ayer'
  },
  menu: {
    clickHint: keys => `${keys} + clic`,
    openInNewWindow: 'Abrir en una ventana nueva',
    splitRight: 'A la derecha',
    splitDown: 'Abajo',
    splitLeft: 'A la izquierda',
    splitUp: 'Arriba',
    color: 'Color',
    copySessionId: 'Copiar ID de la sesión',
    branchFromHere: 'Crear rama desde aquí',
    export: 'Exportar',
    exportJson: 'JSON…',
    exportMarkdown: 'Markdown…',
    exportUser: 'Tú',
    exportAssistant: 'Hermes',
    exportFailed: 'No se pudo exportar la sesión',
    newProject: 'Nuevo proyecto…',
    renameConfirm: 'Cambiar nombre',
    delete: 'Eliminar…'
  },
  draft: {
    noProject: 'Sin proyecto',
    projectAria: name => `Proyecto: ${name}`,
    profileAria: name => `Perfil: ${name}`
  },
  footer: {
    updateAvailable: name => `${name} disponible`,
    updateGeneric: 'Actualización disponible',
    updateBackend: 'Actualización del backend disponible',
    updateView: 'Haz clic para verla',
    updateBehind: count =>
      count === 1 ? '1 commit por detrás · Haz clic para verla' : `${count} commits por detrás · Haz clic para verla`,
    updateApplying: 'Actualizando…',
    updateRestart: 'Reinicia para terminar la actualización',
    account: 'Perfiles y puertas de enlace',
    ready: 'Lista',
    connecting: 'Conectando…',
    disconnected: 'Desconectada',
    unreachable: 'Inaccesible',
    remote: 'Remoto',
    thisDevice: 'Este dispositivo',
    thisMac: 'Este Mac',
    defaultSuffix: ' (predeterminado)',
    needsInputBadge: count => `${count} esperan respuesta`,
    unreadBadge: count => (count === 1 ? '1 sin leer' : `${count} sin leer`),
    switchHere: 'Cambiar a este perfil',
    newProfile: 'Nuevo perfil…',
    gateway: 'Puerta de enlace',
    reconnect: 'Reconectar',
    recentActivity: 'Actividad reciente…',
    connectGateway: 'Conectar otra puerta de enlace…',
    systemStatus: 'Estado del sistema…',
    settings: 'Ajustes…',
    shortcuts: 'Atajos de teclado',
    checkUpdates: 'Buscar actualizaciones…',
    showRail: 'Mostrar barra de perfiles'
  }
}
