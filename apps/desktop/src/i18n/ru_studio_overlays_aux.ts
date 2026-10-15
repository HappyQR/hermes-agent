// Hermes Studio copy (overlays: aux windows, boot surfaces, toasts) — fork-owned.
import type { StudioOverlaysAuxTranslations } from './types_studio_overlays_aux'

export const ruStudioOverlaysAux: StudioOverlaysAuxTranslations = {
  quickEntry: {
    placeholder: 'Спросите Hermes…',
    disconnected: 'Нет подключения — откройте Hermes, чтобы переподключиться',
    sendTo: 'Отправить в',
    targetLabel: 'Целевой сеанс',
    targetCurrent: 'Текущий чат',
    targetNew: 'Новый сеанс',
    send: 'отправить',
    dismiss: 'закрыть',
    summon: combo => `${combo} — вызов из любого приложения`,
    deliveryFailed: 'Hermes не удалось доставить сообщение.'
  },
  wake: {
    listening: 'Слушаю'
  },
  pet: {
    label: name => `Питомец: ${name}`,
    messagePlaceholder: 'Сообщение…',
    openInHermes: 'Открыть в Hermes',
    lines: {
      run: [
        'работаю…',
        'уже делаю…',
        'считаю…',
        'колдую…',
        'готовлю…',
        'в деталях…',
        'подключаю…',
        'продвигаюсь…',
        'с головой в работе…',
        'стучу молотком…'
      ],
      review: [
        'думаю…',
        'читаю…',
        'проверяю…',
        'размышляю…',
        'связываю факты…',
        'оцениваю…',
        'отслеживаю…',
        'обдумываю…',
        'замышляю…',
        'хм…'
      ],
      failed: [
        'загвоздка',
        'упс',
        'сломалось',
        'ой',
        'застрял'
      ],
      waiting: [
        'ваш ход',
        'всё ваше',
        'теперь вы',
        'мяч на вашей стороне',
        'жду указаний'
      ],
      idle: [
        'привет',
        'что-нибудь нужно?',
        'всё спокойно',
        'на связи',
        'может, перерыв?'
      ]
    }
  },
  boot: {
    connecting: 'Подключение к Hermes…',
    step: (current, total) => `Шаг ${current} из ${total}`
  }
}
