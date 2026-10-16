// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

type RuForms = readonly [one: string, few: string, many: string]

// Русские формы числа: 1 файл, 2 файла, 5 файлов, 11 файлов, 21 файл.
const ruCount = (count: number, [one, few, many]: RuForms) => {
  const tens = count % 100
  const units = count % 10
  const form = tens >= 11 && tens <= 14 ? many : units === 1 ? one : units >= 2 && units <= 4 ? few : many

  return `${count} ${form}`
}

// Сводка вызовов инструментов: «Изучил 3 файла», «Выполняет npm test».
const ruRun = (past: string, present: string, forms: RuForms) => ({
  present,
  named: (target: string, live: boolean) => `${live ? present : past} ${target}`,
  counted: (count: number, live: boolean) => `${live ? present : past} ${ruCount(count, forms)}`
})

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)

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
  empty: {
    greeting: {
      lateNight: 'Уже поздно',
      morning: 'Доброе утро',
      noon: 'Добрый день',
      afternoon: 'Добрый день',
      evening: 'Добрый вечер'
    },
    startersLabel: 'Быстрый старт',
    starters: {
      fixError: {
        title: 'Исправить ошибку',
        description: 'Вставьте текст ошибки — я найду причину и исправлю',
        prompt: 'Помоги разобраться с этой ошибкой:'
      },
      organizeFolder: {
        title: 'Навести порядок в папке',
        description: 'Разложу по типу и дате и составлю список',
        prompt: 'Наведи порядок в ~/Downloads и сложи счета отдельно.'
      },
      schedule: {
        title: 'Делать что-то каждый день',
        description: 'Например, дайджест новостей ИИ в Telegram в 9 утра',
        prompt: 'Каждое утро в 9 собирай новости ИИ и отправляй их в Telegram.'
      },
      prototype: {
        title: 'Прототип веб-страницы',
        description: 'Опишите идею — получите кликабельную страницу',
        prompt: 'Сделай кликабельный прототип веб-страницы для:'
      }
    },
    continueFrom: 'Продолжить из Claude Code или Codex'
  },
  toolRun: {
    categories: {
      analyze: ruRun('Проанализировал', 'Анализирует', ['изображение', 'изображения', 'изображений']),
      browse: ruRun('Открыл', 'Открывает', ['страницу', 'страницы', 'страниц']),
      delegate: ruRun('Поручил', 'Поручает', ['задачу', 'задачи', 'задач']),
      edit: ruRun('Изменил', 'Изменяет', ['файл', 'файла', 'файлов']),
      explore: ruRun('Изучил', 'Изучает', ['файл', 'файла', 'файлов']),
      interact: ruRun('Выполнил', 'Выполняет', ['действие в браузере', 'действия в браузере', 'действий в браузере']),
      other: ruRun('Использовал', 'Использует', ['инструмент', 'инструмента', 'инструментов']),
      read: ruRun('Прочитал', 'Читает', ['страницу', 'страницы', 'страниц']),
      run: ruRun('Выполнил', 'Выполняет', ['команду', 'команды', 'команд']),
      search: {
        present: 'Ищет',
        named: (target, live) => `${live ? 'Ищет' : 'Искал'} ${target}`,
        counted: (count, live) =>
          `${live ? 'Выполняет' : 'Выполнил'} ${ruCount(count, ['поисковый запрос', 'поисковых запроса', 'поисковых запросов'])}`
      }
    },
    join: clauses => clauses.map((clause, index) => (index === 0 ? clause : lowerFirst(clause))).join(', '),
    moreCommands: (first, more) => `${first} и ещё ${ruCount(more, ['команда', 'команды', 'команд'])}`
  },
  voice: {
    label: 'Голосовой разговор',
    doneSpeaking: 'Я закончил'
  },
  transcript: {
    replyDuration: seconds => {
      const m = Math.floor(seconds / 60)
      const s = seconds % 60

      return m === 0 ? `${s} с` : s === 0 ? `${m} мин` : `${m} мин ${s} с`
    },
    searchResults: 'Результаты поиска',
    delegatedTask: 'Поручённая задача',
    delegateSpawned: count => `Запущено субагентов: ${count}`,
    delegateRunning: count => `выполняется: ${count}`,
    delegateAllDone: 'Все готово',
    openAgents: 'Открыть в инспекторе',
    approvalTitle: 'Разрешить Hermes выполнить эту команду?',
    approvalTitleAction: 'Разрешить Hermes выполнить это действие?',
    approvalMode: 'Режим одобрения…',
    needsChoice: 'Нужен ваш выбор',
    answered: 'Отвечено',
    questions: count => `Вопросов: ${count}`,
    clarifyHint: 'Выберите вариант или введите свой ответ',
    clarifyHintMulti: 'Выберите все подходящие варианты или введите свой ответ',
    recommended: 'Рекомендуется',
    moreRecovery: 'Другие способы восстановления',
    preparingReply: 'Hermes готовит ответ',
    timelineLabel: 'Хронология разговора',
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
