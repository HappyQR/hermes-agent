// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

// Resumen de una serie de herramientas: «Exploré 3 archivos», «Ejecutando npm test».
const esRun = (past: string, present: string, one: string, many: string) => ({
  present,
  named: (target: string, live: boolean) => `${live ? present : past} ${target}`,
  counted: (count: number, live: boolean) => `${live ? present : past} ${count} ${count === 1 ? one : many}`
})

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)

export const esStudioChat: StudioChatTranslations = {
  contextUsage: 'Uso del contexto',
  composer: {
    addContext: 'Añadir contexto',
    addContextHint: 'Añadir archivos, imágenes, enlaces o fragmentos',
    popOut: 'Desacoplar el editor',
    dock: 'Acoplar el editor',
    skills: 'Habilidades…',
    autoApprove: 'Aprobación automática',
    autoApproveHint: 'Aprobaciones desactivadas: los comandos se ejecutan sin preguntar',
    yoloHint: 'YOLO está activado en este chat: los comandos se ejecutan sin preguntar',
    turnOffYolo: 'Desactivar YOLO en este chat',
    contextUsagePercent: percent => `Uso del contexto ${percent} %`,
    cacheHit: value => `aciertos de caché ${value}`,
    stats: {
      cacheHit: 'Aciertos de caché',
      throughput: 'Velocidad',
      throughputValue: value => `${value} tok/s`,
      turnTime: 'Este turno',
      sessionCost: 'Coste de la sesión'
    },
    compress: 'Comprimir contexto',
    compressIdleOnly: 'Disponible cuando Hermes está inactivo',
    usageDetails: 'Detalles de uso',
    effortOff: 'Desactivado',
    moreSendOptions: 'Más opciones de envío',
    steerHint: 'tras la próxima llamada a herramienta',
    redirectHint: 'detiene y envía',
    voiceOptionsHint: 'Clic derecho para opciones de voz',
    voiceEngineHint: 'Clic derecho para elegir el motor',
    placeholderBusy: combo => `Añade contexto o pulsa ${combo} para enviarlo en el próximo turno`,
    placeholderHero: 'Dale una tarea a Hermes: / para comandos, @ para citar archivos'
  },
  empty: {
    greeting: {
      lateNight: 'Es tarde',
      morning: 'Buenos días',
      noon: 'Buenas tardes',
      afternoon: 'Buenas tardes',
      evening: 'Buenas noches'
    },
    startersLabel: 'Para empezar',
    starters: {
      fixError: {
        title: 'Corregir un error',
        description: 'Pega el mensaje de error y encontraré la causa para corregirlo',
        prompt: 'Ayúdame con este error:'
      },
      organizeFolder: {
        title: 'Ordenar una carpeta',
        description: 'Archivar por tipo y fecha, con un listado',
        prompt: 'Ordena ~/Downloads y archiva las facturas aparte.'
      },
      schedule: {
        title: 'Hacer algo cada día',
        description: 'Por ejemplo, un resumen de noticias de IA a las 9 en Telegram',
        prompt: 'Cada mañana a las 9, resume las noticias de IA y envíalas a Telegram.'
      },
      prototype: {
        title: 'Prototipar una página web',
        description: 'Describe la idea y obtén una página navegable',
        prompt: 'Crea un prototipo de página web navegable para:'
      }
    },
    continueFrom: 'Continuar desde Claude Code o Codex'
  },
  toolRun: {
    categories: {
      analyze: esRun('Analicé', 'Analizando', 'imagen', 'imágenes'),
      browse: esRun('Abrí', 'Abriendo', 'página', 'páginas'),
      delegate: esRun('Delegué', 'Delegando', 'tarea', 'tareas'),
      edit: esRun('Edité', 'Editando', 'archivo', 'archivos'),
      explore: esRun('Exploré', 'Explorando', 'archivo', 'archivos'),
      interact: esRun('Realicé', 'Realizando', 'acción del navegador', 'acciones del navegador'),
      other: esRun('Usé', 'Usando', 'herramienta', 'herramientas'),
      read: esRun('Leí', 'Leyendo', 'página', 'páginas'),
      run: esRun('Ejecuté', 'Ejecutando', 'comando', 'comandos'),
      search: {
        present: 'Buscando',
        named: (target, live) => `${live ? 'Buscando' : 'Busqué'} ${target}`,
        counted: (count, live) => `${live ? 'Haciendo' : 'Hice'} ${count} ${count === 1 ? 'búsqueda' : 'búsquedas'}`
      }
    },
    join: clauses => clauses.map((clause, index) => (index === 0 ? clause : lowerFirst(clause))).join(', '),
    moreCommands: (first, more) => `${first} + ${more} ${more === 1 ? 'comando' : 'comandos'}`
  },
  voice: {
    label: 'Conversación por voz',
    doneSpeaking: 'Ya terminé'
  },
  transcript: {
    replyDuration: seconds => {
      const m = Math.floor(seconds / 60)
      const s = seconds % 60

      return m === 0 ? `${s} s` : s === 0 ? `${m} min` : `${m} min ${s} s`
    },
    searchResults: 'Resultados de búsqueda',
    delegatedTask: 'Tarea delegada',
    delegateSpawned: count => `${count} subagente${count === 1 ? '' : 's'} lanzado${count === 1 ? '' : 's'}`,
    delegateRunning: count => `${count} en curso`,
    delegateAllDone: 'Todo listo',
    openAgents: 'Ver en el inspector',
    approvalTitle: '¿Permitir que Hermes ejecute este comando?',
    approvalTitleAction: '¿Permitir que Hermes realice esta acción?',
    approvalMode: 'Modo de aprobación…',
    needsChoice: 'Necesita tu elección',
    answered: 'Respondida',
    questions: count => `${count} pregunta${count === 1 ? '' : 's'}`,
    clarifyHint: 'Elige una opción o escribe tu respuesta',
    clarifyHintMulti: 'Selecciona todo lo que corresponda o escribe tu respuesta',
    recommended: 'Recomendado',
    moreRecovery: 'Más opciones de recuperación',
    preparingReply: 'Hermes está preparando una respuesta',
    timelineLabel: 'Cronología de la conversación',
    editAndRerun: 'Editar y volver a ejecutar',
    editRerunNote: 'Se envía desde aquí: los mensajes posteriores de este chat se eliminan',
    previousVersion: 'Versión anterior',
    nextVersion: 'Versión siguiente',
    exportMarkdown: 'Exportar como Markdown…',
    exportFileName: 'Respuesta de Hermes.md',
    exported: name => `${name} guardado`,
    exportFailed: 'No se pudo exportar la respuesta'
  },
  tray: {
    label: 'Actividad',
    hide: 'Ocultar actividad',
    show: count => `Mostrar actividad (${count})`,
    approval: count => (count > 1 ? `Se necesita aprobación · ${count}` : 'Se necesita aprobación'),
    approvalHint: 'Ir al comando que espera aprobación',
    needsInput: 'Esperando tu elección',
    needsInputHint: 'Ir a la pregunta',
    previews: count => `${count} vista${count === 1 ? '' : 's'} previa${count === 1 ? '' : 's'}`,
    more: 'Más',
    close: 'Cerrar',
    titles: {
      background: 'Procesos en segundo plano',
      preview: 'Enlaces de vista previa',
      previousTodo: 'Tareas anteriores',
      queue: 'Cola',
      subagent: 'Subagentes',
      todo: 'Tareas'
    },
    todoCaption: 'Hermes las mantiene al día en este turno',
    queueCaption: 'Se envían en orden después de este turno',
    git: {
      hint: 'Rama, cambios y árboles de trabajo',
      reviewChanges: 'Revisar cambios',
      openPullRequest: number => `Abrir pull request #${number}`,
      copyWorktreePath: 'Copiar la ruta del árbol de trabajo'
    }
  }
}
