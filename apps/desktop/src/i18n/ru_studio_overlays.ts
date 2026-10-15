// Hermes Studio copy (overlays) — fork-owned so upstream locale merges stay clean.
import { ruStudioOverlaysAux } from './ru_studio_overlays_aux'
import type { StudioOverlaysTranslations } from './types_studio_overlays'

export const ruStudioOverlays: StudioOverlaysTranslations = {
  quickAsk: 'Быстрый вопрос',
  aux: ruStudioOverlaysAux,
  shortcuts: {
    title: 'Сочетания клавиш',
    subtitle: place => `Изменить можно в разделе «${place}»`,
    close: 'Закрыть сочетания клавиш',
    search: 'Поиск сочетаний',
    searchPlaceholder: 'Поиск',
    editInSettings: 'Изменить в настройках',
    noResults: query => `Нет сочетаний по запросу «${query}»`,
    slotProfiles: (first, last) => `Переключиться на профиль ${first}–${last}`,
    slotTabs: (first, last) => `Переключиться на вкладку ${first}–${last}`,
    slotSessions: (first, last) => `Переключиться на недавний сеанс ${first}–${last}`
  },
  system: {
    title: 'Состояние системы',
    subtitle: 'Сеансы, состояние системы, использование и обслуживание',
    close: 'Закрыть состояние системы',
    sectionsLabel: 'Раздел',
    statGateway: 'Шлюз',
    running: 'Работает',
    stopped: 'Остановлен',
    statVersion: 'Версия',
    statActiveSessions: 'Активные сеансы',
    statPlatforms: 'Платформы сообщений',
    platformsConnected: count => `Подключено: ${count}`,
    platformsNone: 'Нет подключений',
    restartDesc: 'Подключённые платформы сообщений переподключатся',
    restart: 'Перезапустить…',
    checkForUpdates: 'Проверить обновления',
    periodLabel: 'Период',
    cacheHit: percent => `Попадания в кэш ${percent}%`,
    dayDetail: (day, input, output) => `${day} · ввод ${input} · вывод ${output}`,
    searchSessions: 'Поиск по всем сеансам по названию или ID',
    tokens: count => `${count} токенов`,
    run: 'Запустить',
    manageMemory: 'Управлять…'
  },
  palette: {
    placeholder: 'Поиск сеансов, страниц, команд и настроек',
    scopesLabel: 'Область',
    scopes: {
      all: 'Все',
      sessions: 'Сеансы и проекты',
      pages: 'Страницы',
      actions: 'Команды',
      settings: 'Настройки'
    },
    recent: 'Недавние',
    searchContent: query => `Искать в содержимом всех сеансов: «${query}»`,
    searchContentDetail: 'Полнотекстовый поиск',
    contentGroup: 'В содержимом сеансов',
    footerSelect: 'Выбрать',
    footerOpen: 'Открыть',
    footerScope: 'Сменить область',
    footerPaste: 'Вставьте ID сеанса, чтобы сразу перейти к нему',
    on: 'Вкл.',
    off: 'Выкл.',
    layoutEditMode: 'Переключить режим правки раскладки',
    reloadPlugins: 'Перезагрузить плагины рабочего стола',
    resetLayout: 'Сбросить раскладку'
  },
  profiles: {
    subtitle: 'У каждого профиля своя модель, навыки, память и личность (SOUL.md).',
    remote: 'Удалённый',
    changeModel: 'Изменить…',
    skillsEnabled: count => `Включено: ${count}`,
    manage: 'Управлять',
    soulHint: 'Личность и постоянные инструкции',
    soulUnsaved: combo => `Не сохранено · ${combo} — сохранить`,
    exportNote: 'Экспортированный профиль не содержит ключей',
    importShort: 'Импорт…'
  },
  updates: {
    currentVersion: (version, channel) => `Текущая ${version} · ${channel}`
  }
}
