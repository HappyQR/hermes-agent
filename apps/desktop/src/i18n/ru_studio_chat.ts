// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const ruStudioChat: StudioChatTranslations = {
  contextUsage: 'Использование контекста',
  tray: {
    label: 'Активность',
    hide: 'Скрыть активность',
    show: count => `Показать активность (${count})`,
    approval: count => (count > 1 ? `Нужно одобрение · ${count}` : 'Нужно одобрение'),
    approvalHint: 'Перейти к команде, ожидающей одобрения',
    needsInput: 'Ждёт вашего выбора',
    needsInputHint: 'Перейти к вопросу',
    previews: count => `Превью: ${count}`,
    more: 'Ещё',
    close: 'Закрыть',
    titles: {
      background: 'Фоновые процессы',
      preview: 'Ссылки для просмотра',
      previousTodo: 'Прошлые задачи',
      queue: 'Очередь',
      subagent: 'Субагенты',
      todo: 'Задачи'
    },
    todoCaption: 'Hermes обновляет их в этом ходе',
    queueCaption: 'Отправятся по порядку после этого хода',
    git: {
      hint: 'Ветка, изменения и рабочие деревья',
      reviewChanges: 'Просмотреть изменения',
      openPullRequest: number => `Открыть пул-реквест #${number}`,
      copyWorktreePath: 'Скопировать путь рабочего дерева'
    }
  }
}
