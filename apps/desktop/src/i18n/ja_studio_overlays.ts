// Hermes Studio copy (overlays) — fork-owned so upstream locale merges stay clean.
import { jaStudioOverlaysAux } from './ja_studio_overlays_aux'
import type { StudioOverlaysTranslations } from './types_studio_overlays'

export const jaStudioOverlays: StudioOverlaysTranslations = {
  quickAsk: 'クイック質問',
  aux: jaStudioOverlaysAux,
  shortcuts: {
    title: 'キーボードショートカット',
    subtitle: place => `${place} で変更できます`,
    close: 'キーボードショートカットを閉じる',
    search: 'ショートカットを検索',
    searchPlaceholder: '検索',
    editInSettings: '設定で編集',
    noResults: query => `「${query}」に一致するショートカットはありません`,
    slotProfiles: (first, last) => `プロファイル ${first}–${last} に切り替え`,
    slotTabs: (first, last) => `タブ ${first}–${last} に切り替え`,
    slotSessions: (first, last) => `最近のセッション ${first}–${last} に切り替え`
  },
  system: {
    title: 'システム状況',
    subtitle: 'セッション、システム、使用量、メンテナンス',
    close: 'システム状況を閉じる',
    sectionsLabel: 'セクション',
    statGateway: 'ゲートウェイ',
    running: '実行中',
    stopped: '停止中',
    statVersion: 'バージョン',
    statActiveSessions: 'アクティブなセッション',
    statPlatforms: 'メッセージングプラットフォーム',
    platformsConnected: count => `${count} 件接続済み`,
    platformsNone: '未接続',
    restartDesc: '接続中のメッセージングプラットフォームが再接続されます',
    restart: '再起動…',
    checkForUpdates: 'アップデートを確認',
    periodLabel: '期間',
    cacheHit: percent => `キャッシュヒット ${percent}%`,
    dayDetail: (day, input, output) => `${day} · 入力 ${input} · 出力 ${output}`,
    searchSessions: 'タイトルまたは ID ですべてのセッションを検索',
    tokens: count => `${count} トークン`,
    archiveSession: 'セッションをアーカイブ',
    run: '実行',
    manageMemory: '管理…'
  },
  palette: {
    placeholder: 'セッション、ページ、コマンド、設定を検索',
    scopesLabel: '範囲',
    scopes: {
      all: 'すべて',
      sessions: 'セッションとプロジェクト',
      pages: 'ページ',
      actions: 'コマンド',
      settings: '設定'
    },
    recent: '最近',
    searchContent: query => `すべてのセッション内容を検索：${query}`,
    searchContentDetail: 'サーバーの全文検索',
    contentGroup: 'セッションの内容',
    footerSelect: '選択',
    footerOpen: '開く',
    footerScope: '範囲を切り替え',
    footerPaste: 'セッション ID を貼り付けると直接移動できます',
    on: 'オン',
    off: 'オフ',
    layoutEditMode: 'レイアウト編集モードを切り替え',
    reloadPlugins: 'デスクトッププラグインを再読み込み',
    resetLayout: 'レイアウトをリセット',
    toggleLogs: 'ログの表示を切り替え',
    toggleYolo: 'YOLO モードを切り替え（承認をスキップ）'
  },
  profiles: {
    subtitle: 'プロファイルごとにモデル、スキル、メモリ、ペルソナ（SOUL.md）が独立しています。',
    remote: 'リモート',
    changeModel: '変更…',
    skillsEnabled: count => `${count} 件有効`,
    manage: '管理',
    soulHint: 'ペルソナと常設の指示',
    soulUnsaved: combo => `未保存 · ${combo} で保存`,
    exportNote: '書き出したプロファイルにキーは含まれません',
    importShort: '読み込む…'
  },
  import: {
    subtitle: host => `Claude Code や Codex の会話を Hermes に取り込み、続きから再開できます。読み込み元：${host}`,
    importInto: profile => `取り込み先：${profile}`,
    sourceLabel: 'ソース'
  },
  updates: {
    currentVersion: (version, channel) => `現在 ${version} · ${channel}`
  }
}
