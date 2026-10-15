// Hermes Studio copy (overlays) — fork-owned so upstream locale merges stay clean.
import { esStudioOverlaysAux } from './es_studio_overlays_aux'
import type { StudioOverlaysTranslations } from './types_studio_overlays'

export const esStudioOverlays: StudioOverlaysTranslations = {
  quickAsk: 'Pregunta rápida',
  aux: esStudioOverlaysAux,
  shortcuts: {
    title: 'Atajos de teclado',
    subtitle: place => `Puedes cambiarlos en ${place}`,
    close: 'Cerrar atajos de teclado',
    search: 'Buscar atajos',
    searchPlaceholder: 'Buscar',
    editInSettings: 'Editar en Ajustes',
    noResults: query => `Ningún atajo coincide con «${query}»`,
    slotProfiles: (first, last) => `Cambiar al perfil ${first}–${last}`,
    slotTabs: (first, last) => `Cambiar a la pestaña ${first}–${last}`,
    slotSessions: (first, last) => `Cambiar a la sesión reciente ${first}–${last}`
  },
  system: {
    title: 'Estado del sistema',
    subtitle: 'Sesiones, estado del sistema, uso y mantenimiento',
    close: 'Cerrar estado del sistema',
    sectionsLabel: 'Sección',
    statGateway: 'Gateway',
    running: 'En ejecución',
    stopped: 'Detenido',
    statVersion: 'Versión',
    statActiveSessions: 'Sesiones activas',
    statPlatforms: 'Plataformas de mensajería',
    platformsConnected: count => `${count} conectadas`,
    platformsNone: 'Ninguna conectada',
    restartDesc: 'Las plataformas de mensajería conectadas se reconectan',
    restart: 'Reiniciar…',
    checkForUpdates: 'Buscar actualizaciones',
    periodLabel: 'Periodo',
    cacheHit: percent => `Aciertos de caché ${percent} %`,
    dayDetail: (day, input, output) => `${day} · entrada ${input} · salida ${output}`,
    searchSessions: 'Buscar todas las sesiones por título o ID',
    tokens: count => `${count} tokens`,
    archiveSession: 'Archivar sesión',
    run: 'Ejecutar',
    manageMemory: 'Gestionar…'
  },
  palette: {
    placeholder: 'Buscar sesiones, páginas, comandos y ajustes',
    scopesLabel: 'Ámbito',
    scopes: {
      all: 'Todo',
      sessions: 'Sesiones y proyectos',
      pages: 'Páginas',
      actions: 'Comandos',
      settings: 'Ajustes'
    },
    recent: 'Recientes',
    searchContent: query => `Buscar en el contenido de todas las sesiones: «${query}»`,
    searchContentDetail: 'Búsqueda de texto completo',
    contentGroup: 'En el contenido de las sesiones',
    footerSelect: 'Seleccionar',
    footerOpen: 'Abrir',
    footerScope: 'Cambiar de ámbito',
    footerPaste: 'Pega un ID de sesión para ir directamente',
    on: 'Activado',
    off: 'Desactivado',
    layoutEditMode: 'Alternar modo de edición del diseño',
    reloadPlugins: 'Recargar plugins de escritorio',
    resetLayout: 'Restablecer el diseño',
    toggleLogs: 'Mostrar u ocultar registros',
    toggleYolo: 'Alternar modo YOLO (sin aprobaciones)'
  },
  profiles: {
    subtitle: 'Cada perfil tiene su propio modelo, habilidades, memoria y personalidad (SOUL.md).',
    remote: 'Remoto',
    changeModel: 'Cambiar…',
    skillsEnabled: count => `${count} activadas`,
    manage: 'Gestionar',
    soulHint: 'Personalidad e instrucciones permanentes',
    soulUnsaved: combo => `Sin guardar · ${combo} para guardar`,
    exportNote: 'Los perfiles exportados nunca incluyen claves',
    importShort: 'Importar…'
  },
  import: {
    subtitle: host =>
      `Trae una conversación de Claude Code o Codex a Hermes y continúa donde la dejaste. Leyendo desde ${host}`,
    importInto: profile => `Importar en: ${profile}`,
    sourceLabel: 'Origen'
  },
  updates: {
    currentVersion: (version, channel) => `Actual ${version} · ${channel}`,
    managedByPackageOwner: 'Las actualizaciones las gestiona el responsable del paquete fuera de esta app.',
    commitBuildNoUpdates: 'Esta compilación no recibe actualizaciones. Pide una nueva al desarrollador que te la dio.'
  }
}
