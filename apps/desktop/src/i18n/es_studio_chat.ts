// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const esStudioChat: StudioChatTranslations = {
  contextUsage: 'Uso del contexto',
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
