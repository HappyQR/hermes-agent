// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
// Generated from one table (all 9 locales together); edit the table, not one file.
import type { StudioSettingsTranslations } from './types_studio_settings'

export const ruStudioSettings: StudioSettingsTranslations = {
  searchPlaceholder: 'Поиск в настройках',
  pages: {
    general: {
      title: 'Основные',
      hero: 'Язык, запуск, подсказки и поведение окна.'
    },
    appearance: {
      title: 'Оформление',
      hero: 'Цвета, темы, стекло окна, шрифты и питомцы.'
    },
    chat: {
      title: 'Чат',
      hero: 'Стиль ответов и то, как показываются рассуждения, вызовы инструментов и сообщения.'
    },
    notifications: {
      title: 'Уведомления',
      hero: 'Что может вас отвлекать и звук по завершении работы.'
    },
    keyboard: {
      title: 'Клавиатура и горячие клавиши',
      hero: 'Сочетания клавиш, быстрый вопрос, жест HUD и захват окна.'
    },
    models: {
      title: 'Модели',
      hero: 'Модель по умолчанию, резервные модели и вспомогательные модели для фоновых задач.'
    },
    providers: {
      title: 'Аккаунты и провайдеры',
      hero: 'Аккаунты, ключи API, собственные эндпоинты и локальные модели.'
    },
    memory: {
      title: 'Память и контекст',
      hero: 'Что Hermes запоминает, сколько и как сжимаются длинные разговоры.'
    },
    voice: {
      title: 'Голос',
      hero: 'Голосовой разговор, распознавание речи, чтение вслух и слово активации.'
    },
    workspace: {
      title: 'Рабочая среда',
      hero: 'Папки проектов, среда выполнения команд и контрольные точки файлов.'
    },
    safety: {
      title: 'Безопасность и конфиденциальность',
      hero: 'Подтверждение команд, конфиденциальность, браузер и доступ к частным сетям.'
    },
    passwords: {
      title: 'Пароли и входы',
      hero: 'Учётные данные, которыми Hermes входит на сайты за вас.'
    },
    tools: {
      title: 'Инструменты и ключи',
      hero: 'Ключи API для сервисов инструментов и переменные окружения сервера.'
    },
    gateways: {
      title: 'Шлюзы и подключения',
      hero: 'К какому Hermes подключено это окно и сохранённые подключения.'
    },
    sessions: {
      title: 'Сеансы и архив',
      hero: 'Автоархивирование и архивные сеансы.'
    },
    plugins: {
      title: 'Плагины',
      hero: page => `Настройки установленных плагинов. Установка и включение — в разделе «${page} › Плагины».`
    },
    billing: {
      title: 'Оплата',
      hero: 'Баланс, тариф, автопополнение и лимиты расходов.'
    },
    advanced: {
      title: 'Дополнительно',
      hero: 'Шаги агента, бэкенд терминала, субагенты и лимиты вывода. Для тех, кто хорошо знает Hermes.'
    },
    about: {
      title: 'О Hermes',
      hero: 'Версия, обновления, резервная копия настроек и удаление.'
    }
  },
  window: {
    navLabel: 'Разделы настроек',
    noResults: query => `Ничего не найдено по запросу «${query}»`,
    categoryResult: 'Раздел',
    onlyThisMac: 'Только этот Mac',
    onlyThisDevice: 'Только это устройство',
    appliesToProfile: profile => `Применяется к «${profile}»`,
    appliesTo: 'Применяется к',
    scopeMenuTitle: 'Эти настройки применяются к',
    searchResults: 'Результаты поиска',
    pageMenu: 'Раздел настроек'
  },
  sections: {
    general: {
      language: 'Язык и запуск',
      tips: 'Подсказки и обучение',
      system: 'Окно и система'
    },
    appearance: {
      look: 'Оформление',
      theme: 'Темы',
      themeNote: 'Темы сохраняются для каждого профиля. Можно установить тему прямо из VS Code Marketplace.',
      window: 'Окно',
      typography: 'Шрифты и масштаб',
      pet: 'Питомец'
    },
    chat: {
      replies: 'Ответы',
      messages: 'Сообщения',
      media: 'Встраивания и вложения'
    },
    notifications: {
      alerts: 'Уведомления на рабочем столе',
      sounds: 'Звук и тактильный отклик'
    },
    keyboard: {
      shortcuts: 'Сочетания клавиш',
      shortcutsNote: 'Нажмите на сочетание, чтобы изменить его. Конфликты отмечаются в строке.',
      quickAsk: 'Быстрый вопрос',
      hud: 'HUD и захват окна'
    },
    models: {
      main: 'Основная модель',
      fallbacks: 'Резервные модели',
      fallbacksNote: 'Используются по порядку, если основная модель недоступна или закончился лимит.',
      auxiliary: 'Вспомогательные модели',
      auxiliaryDisclosure: 'Фоновые задачи (зрение, сжатие, заголовки…)',
      moa: 'Смесь агентов',
      moaDisclosure: 'Несколько моделей отвечают вместе, затем агрегатор объединяет ответы (/moa)'
    },
    providers: {
      accounts: 'Аккаунты',
      apiKeys: 'Ключи API',
      endpoints: 'Собственные эндпоинты',
      local: 'Локальные модели'
    },
    memory: {
      memory: 'Долговременная память',
      context: 'Контекст и сжатие',
      contextDisclosure: 'Параметры сжатия',
      maintenance: 'Обслуживание'
    },
    voice: {
      conversation: 'Голосовой разговор',
      stt: 'Распознавание речи',
      tts: 'Чтение вслух',
      wake: 'Слово активации'
    },
    workspace: {
      projects: 'Проекты',
      execution: 'Выполнение',
      checkpoints: 'Контрольные точки',
      checkpointsNote: 'Сохраняются автоматически перед каждым изменением файлов — их можно восстановить из сообщения.'
    },
    safety: {
      approvals: 'Подтверждение команд',
      privacy: 'Конфиденциальность',
      browser: 'Браузер и сеть'
    },
    passwords: {
      credentials: 'Сохранённые данные для входа',
      credentialsNote: 'Используются, когда Hermes входит на сайты или заполняет формы за вас.',
      managers: 'Менеджеры паролей'
    },
    tools: {
      toolKeys: 'Ключи сервисов инструментов',
      serverEnv: 'Переменные окружения сервера',
      toolsets: 'Наборы инструментов'
    },
    gateways: {
      connection: 'Это окно подключается к',
      saved: 'Сохранённые подключения',
      remoteUpdates: 'Удалённые обновления'
    },
    sessions: {
      retention: 'Архивирование и хранение',
      archived: 'Архивные сеансы'
    },
    plugins: {
      pages: 'Настройки плагинов',
      manage: 'Установка и включение'
    },
    advanced: {
      agent: 'Агент',
      terminal: 'Бэкенд терминала',
      subagents: 'Субагенты',
      output: 'Лимиты вывода',
      updates: 'Обновления в приложении'
    },
    about: {
      updates: 'Обновления',
      config: 'Конфигурация',
      diagnostics: 'Диагностика',
      uninstall: 'Удаление'
    }
  },
  rows: {
    modeLight: 'Светлое',
    modeDark: 'Тёмное',
    modeAuto: 'Авто',
    modeGroup: 'Цветовой режим',
    accentTitle: 'Акцентный цвет',
    accentDesc: 'Цвет кнопок, выделения и ссылок',
    accentNous: 'Синий',
    accentHermes: 'Синий Hermes',
    accentViolet: 'Фиолетовый',
    accentPink: 'Розовый',
    accentRed: 'Красный',
    accentOrange: 'Оранжевый',
    accentGreen: 'Зелёный',
    accentMono: 'Графит',
    thinkingTitle: 'Рассуждения',
    thinkingDesc: 'Как рассуждения модели показываются в ответах',
    thinkingShow: 'Показывать',
    thinkingCollapse: 'Свёрнуто',
    thinkingHide: 'Скрыто',
    timestampsTitle: 'Показывать время',
    hapticsTitle: 'Тактильный отклик',
    hapticsDesc:
      'Тактильные сигналы при перетаскивании и по завершении работы. Если выключить, звук завершения тоже отключится.',
    wakeTitle: 'Слушать слово активации',
    wakeDesc: 'Слушает в фоне и начинает голосовой разговор, услышав фразу',
    wakePhrase: 'Фраза активации',
    memoryOpenTitle: 'Просмотр и правка',
    memoryOpenDesc: 'Граф и список — на странице «Память»',
    memoryOpenAction: 'Открыть память',
    resetMemoryTitle: 'Сбросить память',
    resetMemoryDesc: 'Очищает MEMORY.md. Отменить нельзя.',
    resetProfileTitle: 'Сбросить профиль пользователя',
    resetProfileDesc: 'Очищает USER.md.',
    resetAction: 'Сбросить…',
    toolsetsTitle: 'Включение и выключение наборов',
    toolsetsDesc: page => `Управление — в разделе «${page} › Инструменты».`,
    openAction: 'Открыть',
    pluginsManageDesc: 'Установка, обновление, включение и удаление',
    pluginsManageAction: 'Открыть плагины',
    exportDesc: 'Сохраняет hermes-config.json. Ключи не включаются.',
    exportAction: 'Экспорт…',
    importAction: 'Импорт…',
    resetConfigDesc: 'Затрагивает только текущий профиль. Настройки оформления этого устройства не меняются.',
    resetConfigAction: 'Сбросить…',
    diagnosticsTitle: 'Отправить диагностику',
    diagnosticsDesc:
      'Загружает обезличенные журналы для поддержки. Перед отправкой нужно подтверждение, ссылка истекает.',
    diagnosticsAction: 'Отправить…',
    logsTitle: 'Папка журналов',
    logsActionMac: 'Показать в Finder',
    logsActionOther: 'Открыть папку',
    localModelsDesc: 'Скачивайте открытые модели и запускайте их на этом компьютере.',
    localModelsAction: 'Управлять локальными моделями…',
    sendTestAction: 'Отправить',
    themeMarketplaceTitle: 'Установить из VS Code Marketplace',
    noThemesMatch: query => `Нет установленных тем по запросу «${query}».`,
    activateKey: 'Активировать',
    activatingKey: 'Активация…',
    apiKeyFallback: 'API-ключ',
    pasteKeyPlaceholder: name => `Вставьте ${name}`,
    providerNeedsKey: provider => `Для ${provider} нужен API-ключ — настройте его, чтобы выбрать модель.`,
    providerBrowserSignIn: provider => `${provider} входит через браузер — Hermes проведёт вас по всем шагам.`,
    addCredentialTitle: 'Добавить учётные данные',
    addCredentialDesc: 'Логин, платёжная карта или адрес',
    addCredentialAction: 'Добавить…',
    resetShortcutsAction: 'Сбросить всё по умолчанию'
  }
}
