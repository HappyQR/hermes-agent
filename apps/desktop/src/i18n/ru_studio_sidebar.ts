// Hermes Studio copy (sidebar) — fork-owned so upstream locale merges stay clean.
import type { StudioSidebarTranslations } from './types_studio_sidebar'

const plural = (count: number, one: string, few: string, many: string) => {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return one
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few
  }

  return many
}

export const ruStudioSidebar: StudioSidebarTranslations = {
  search: 'Поиск',
  searchAria: 'Поиск сеансов, страниц и команд',
  nav: {
    label: 'Страницы',
    automations: 'Автоматизация',
    memory: 'Память',
    open: 'Открыть',
    pendingPairing: count =>
      `${count} ${plural(count, 'запрос на сопряжение ожидает', 'запроса на сопряжение ожидают', 'запросов на сопряжение ожидают')}`,
    cronJobs: count => `${count} ${plural(count, 'запланированная задача', 'запланированные задачи', 'запланированных задач')}`,
    cronFailing: count => `${count} ${plural(count, 'задача завершается', 'задачи завершаются', 'задач завершаются')} с ошибкой`
  },
  section: {
    expand: 'Развернуть',
    collapse: 'Свернуть',
    collapsedCount: count => `Скрыто: ${count}`,
    expandGroups: 'Развернуть все группы',
    collapseGroups: 'Свернуть все группы'
  },
  projects: {
    newProject: 'Новый проект…',
    openFolder: 'Открыть папку как проект…',
    newWorktree: 'Новое рабочее дерево…',
    auto: 'Авто',
    actions: 'Действия с проектом',
    newSessionHere: 'Новый сеанс в этом проекте',
    newSessionInLane: 'Новый сеанс в этой ветке',
    empty: 'Проектов пока нет'
  },
  scope: {
    tip: 'Показаны только сеансы этого проекта',
    clear: 'Показать все сеансы'
  },
  sessions: {
    viewOptions: 'Параметры вида',
    viewOptionsTip: 'Группировка, сортировка и фильтры',
    noMatches: 'Нет сеансов, подходящих под фильтры.',
    clearFilters: 'Сбросить фильтры'
  },
  grouping: {
    label: 'Группировка',
    time: 'По времени',
    project: 'По проекту',
    status: 'По статусу',
    source: 'По источнику',
    profile: 'По шлюзу и профилю',
    none: 'Без группировки',
    noProject: 'Без проекта'
  },
  statusGroup: {
    needsInput: 'Нужен ответ',
    working: 'Выполняется',
    unread: 'Непрочитанные',
    draft: 'Черновики',
    done: 'Завершённые'
  },
  view: {
    reset: 'Восстановить по умолчанию',
    sort: 'Сортировка',
    show: 'Показывать',
    time: 'Время',
    density: 'Плотность списка',
    compact: 'Компактно',
    comfortable: 'Обычно',
    detailed: 'Подробно',
    filters: 'Фильтры',
    sources: 'Источники',
    prStatus: 'Статус PR',
    prAny: 'Все',
    showArchived: 'Показывать архивные сеансы',
    moreFilters: 'Другие фильтры'
  },
  source: {
    desktop: 'Компьютер',
    cron: 'Запланированная задача',
    from: label => `Из ${label}`
  },
  row: {
    yesterday: 'Вчера'
  },
  menu: {
    clickHint: keys => `${keys}+щелчок`,
    openInNewWindow: 'Открыть в новом окне',
    splitRight: 'Справа',
    splitDown: 'Снизу',
    splitLeft: 'Слева',
    splitUp: 'Сверху',
    color: 'Цвет',
    copySessionId: 'Скопировать ID сеанса',
    branchFromHere: 'Ответвить отсюда',
    export: 'Экспорт',
    exportJson: 'JSON…',
    exportMarkdown: 'Markdown…',
    exportUser: 'Вы',
    exportAssistant: 'Hermes',
    exportFailed: 'Не удалось экспортировать сеанс',
    newProject: 'Новый проект…',
    delete: 'Удалить…'
  },
  footer: {
    updateAvailable: name => `Доступна версия ${name}`,
    updateGeneric: 'Доступно обновление',
    updateBackend: 'Доступно обновление бэкенда',
    updateView: 'Нажмите, чтобы посмотреть',
    updateBehind: count =>
      `Отстаёт на ${count} ${plural(count, 'коммит', 'коммита', 'коммитов')} · Нажмите, чтобы посмотреть`,
    updateApplying: 'Обновление…',
    updateRestart: 'Перезапустите, чтобы завершить обновление',
    account: 'Профили и шлюзы',
    ready: 'Готов',
    connecting: 'Подключение…',
    disconnected: 'Нет соединения',
    unreachable: 'Недоступен',
    remote: 'Удалённый',
    thisDevice: 'Это устройство',
    thisMac: 'Этот Mac',
    defaultSuffix: ' (по умолчанию)',
    needsInputBadge: count => `Ждут ответа: ${count}`,
    unreadBadge: count => `Непрочитанных: ${count}`,
    switchHere: 'Переключиться на этот профиль',
    newProfile: 'Новый профиль…',
    gateway: 'Шлюз',
    reconnect: 'Переподключиться',
    recentActivity: 'Недавняя активность…',
    connectGateway: 'Подключить другой шлюз…',
    systemStatus: 'Состояние системы…',
    settings: 'Настройки…',
    shortcuts: 'Сочетания клавиш',
    checkUpdates: 'Проверить обновления…',
    showRail: 'Показывать панель профилей'
  }
}
