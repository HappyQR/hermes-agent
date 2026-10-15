// Hermes Studio copy (overlays: aux windows, boot surfaces, toasts) — fork-owned.
import type { StudioOverlaysAuxTranslations } from './types_studio_overlays_aux'

export const zhHantStudioOverlaysAux: StudioOverlaysAuxTranslations = {
  quickEntry: {
    placeholder: '問 Hermes…',
    disconnected: '未連線 — 開啟 Hermes 以重新連線',
    sendTo: '傳送到',
    targetLabel: '目標工作階段',
    targetCurrent: '目前的對話',
    targetNew: '新工作階段',
    send: '傳送',
    dismiss: '關閉',
    summon: combo => `在任何 App 中按 ${combo} 叫出`,
    deliveryFailed: 'Hermes 未能送達這則訊息。'
  },
  wake: {
    listening: '正在聆聽'
  },
  pet: {
    label: name => `寵物：${name}`,
    messagePlaceholder: '傳訊息…',
    openInHermes: '在 Hermes 中開啟',
    lines: {
      run: [
        '工作中…',
        '馬上處理…',
        '運算中…',
        '動手調整…',
        '忙著呢…',
        '深入細節…',
        '接線中…',
        '推進中…',
        '埋頭苦幹…',
        '敲敲打打…'
      ],
      review: [
        '思考中…',
        '閱讀中…',
        '審閱中…',
        '琢磨中…',
        '串連線索…',
        '掂量一下…',
        '順藤摸瓜…',
        '斟酌中…',
        '盤算中…',
        '嗯…'
      ],
      failed: [
        '卡住了',
        '哎呀',
        '出狀況了',
        '呃',
        '碰壁了'
      ],
      waiting: [
        '輪到你了',
        '交給你了',
        '該你囉',
        '球在你手上',
        '等你吩咐'
      ],
      idle: [
        '你好呀',
        '需要幫忙嗎？',
        '一切安靜',
        '隨時待命',
        '要不要休息一下？'
      ]
    }
  },
  boot: {
    connecting: '正在連線到 Hermes…',
    step: (current, total) => `第 ${current} 步，共 ${total} 步`
  }
}
