// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const ruStudioChat: StudioChatTranslations = {
  contextUsage: 'Использование контекста',
  composer: {
    addContext: 'Добавить контекст',
    addContextHint: 'Добавить файлы, изображения, ссылки или фрагменты',
    popOut: 'Открепить поле ввода',
    dock: 'Закрепить поле ввода',
    skills: 'Навыки…',
    autoApprove: 'Автоодобрение',
    autoApproveHint: 'Одобрение выключено — команды выполняются без запроса',
    yoloHint: 'YOLO включён для этого чата — команды выполняются без запроса',
    turnOffYolo: 'Выключить YOLO для этого чата',
    contextUsagePercent: percent => `Использование контекста ${percent}%`,
    cacheHit: value => `попадания в кэш ${value}`,
    stats: {
      cacheHit: 'Попадания в кэш',
      throughput: 'Скорость',
      throughputValue: value => `${value} ток/с`,
      turnTime: 'Этот ход',
      sessionCost: 'Стоимость сессии'
    },
    compress: 'Сжать контекст',
    compressIdleOnly: 'Доступно, когда Hermes свободен',
    usageDetails: 'Подробности использования',
    effortOff: 'Выкл.',
    moreSendOptions: 'Другие способы отправки',
    steerHint: 'после следующего вызова инструмента',
    redirectHint: 'останавливает и отправляет',
    voiceOptionsHint: 'Правый щелчок — параметры голоса',
    voiceEngineHint: 'Правый щелчок — выбор движка',
    placeholderBusy: combo => `Добавьте контекст или нажмите ${combo}, чтобы отправить в следующем ходе`,
    placeholderHero: 'Дайте Hermes задачу — / для команд, @ для ссылок на файлы'
  },
  transcript: {
    editAndRerun: 'Изменить и перезапустить',
    editRerunNote: 'Отправка отсюда — последующие сообщения в этом чате будут удалены',
    previousVersion: 'Предыдущая версия',
    nextVersion: 'Следующая версия',
    exportMarkdown: 'Экспорт в Markdown…',
    exportFileName: 'Ответ Hermes.md',
    exported: name => `Сохранено: ${name}`,
    exportFailed: 'Не удалось экспортировать ответ'
  },
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
