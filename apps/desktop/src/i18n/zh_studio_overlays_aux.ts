// Hermes Studio copy (overlays: aux windows, boot surfaces, toasts) — fork-owned.
import type { StudioOverlaysAuxTranslations } from './types_studio_overlays_aux'

export const zhStudioOverlaysAux: StudioOverlaysAuxTranslations = {
  quickEntry: {
    placeholder: '问 Hermes…',
    disconnected: '未连接 — 打开 Hermes 以重新连接',
    sendTo: '发送到',
    targetLabel: '目标会话',
    targetCurrent: '当前会话',
    targetNew: '新会话',
    send: '发送',
    dismiss: '关闭',
    summon: combo => `在任何应用里按 ${combo} 唤出`,
    deliveryFailed: 'Hermes 未能送达这条消息。'
  },
  wake: {
    listening: '正在聆听'
  },
  pet: {
    label: name => `宠物：${name}`,
    messagePlaceholder: '发消息…',
    openInHermes: '在 Hermes 中打开',
    lines: {
      run: [
        '干活中…',
        '这就办…',
        '运算中…',
        '鼓捣中…',
        '忙活中…',
        '深入细节…',
        '接线中…',
        '推进中…',
        '埋头苦干…',
        '敲敲打打…'
      ],
      review: [
        '思考中…',
        '阅读中…',
        '审阅中…',
        '琢磨中…',
        '串联线索…',
        '掂量一下…',
        '顺藤摸瓜…',
        '斟酌中…',
        '盘算中…',
        '嗯…'
      ],
      failed: [
        '卡住了',
        '哎呀',
        '出岔子了',
        '呃',
        '碰壁了'
      ],
      waiting: [
        '轮到你了',
        '交给你了',
        '该你啦',
        '球在你手里',
        '等你吩咐'
      ],
      idle: [
        '你好呀',
        '需要帮忙吗？',
        '一切安静',
        '随时待命',
        '要不要休息一下？'
      ]
    }
  },
  boot: {
    connecting: '正在连接 Hermes…',
    step: (current, total) => `第 ${current} 步，共 ${total} 步`
  }
}
