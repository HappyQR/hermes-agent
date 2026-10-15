// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

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
  transcript: {
    delegateSpawned: count => `${count} subagente${count === 1 ? '' : 's'} lanzado${count === 1 ? '' : 's'}`,
    delegateRunning: count => `${count} en curso`,
    delegateAllDone: 'Todo listo',
    openAgents: 'Ver en Agentes',
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
    copyDetails: 'Copiar detalles',
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
