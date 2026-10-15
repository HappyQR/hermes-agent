// Hermes Studio copy (overlays: aux windows, boot surfaces, toasts) — fork-owned.
import type { StudioOverlaysAuxTranslations } from './types_studio_overlays_aux'

export const jaStudioOverlaysAux: StudioOverlaysAuxTranslations = {
  quickEntry: {
    placeholder: 'Hermes に質問…',
    disconnected: '未接続です — Hermes を開いて再接続してください',
    sendTo: '送信先',
    targetLabel: '送信先のセッション',
    targetCurrent: '現在のチャット',
    targetNew: '新しいセッション',
    send: '送信',
    dismiss: '閉じる',
    summon: combo => `どのアプリからでも ${combo} で呼び出せます`,
    deliveryFailed: 'Hermes はメッセージを届けられませんでした。'
  },
  wake: {
    listening: '聞き取り中'
  },
  pet: {
    label: name => `ペット：${name}`,
    messagePlaceholder: 'メッセージ…',
    openInHermes: 'Hermes で開く',
    lines: {
      run: [
        '作業中…',
        'やってます…',
        '計算中…',
        'いじってます…',
        '仕込み中…',
        '細部を詰め中…',
        'つないでます…',
        '進めてます…',
        '集中してます…',
        'トンテンカン…'
      ],
      review: [
        '考え中…',
        '読んでます…',
        '見直し中…',
        '思案中…',
        '点をつなぎ中…',
        '見極め中…',
        'たどってます…',
        '熟考中…',
        '策を練り中…',
        'うーん…'
      ],
      failed: [
        'つまずいた',
        'あらら',
        '壊れちゃった',
        'うっ',
        '引っかかった'
      ],
      waiting: [
        'あなたの番',
        'どうぞ',
        'お任せします',
        'ボールはそちら',
        '指示待ちです'
      ],
      idle: [
        'やあ',
        '何かある？',
        '静かだね',
        '待機中',
        'ひと休みする？'
      ]
    }
  },
  boot: {
    connecting: 'Hermes に接続しています…',
    step: (current, total) => `ステップ ${current}/${total}`
  }
}
