// Hermes Studio copy (sidebar) — fork-owned so upstream locale merges stay clean.
import type { StudioSidebarTranslations } from './types_studio_sidebar'

export const jaStudioSidebar: StudioSidebarTranslations = {
  search: '検索',
  searchAria: 'セッション、ページ、コマンドを検索',
  nav: {
    label: 'ページ',
    automations: 'オートメーション',
    memory: 'メモリ',
    open: '開く',
    pendingPairing: count => `保留中のペアリング要求が ${count} 件`,
    cronJobs: count => `スケジュール済みジョブ ${count} 件`,
    cronFailing: count => `${count} 件のジョブが失敗しています`
  },
  section: {
    expand: '展開',
    collapse: '折りたたむ',
    collapsedCount: count => `${count} 件を折りたたみ中`,
    expandGroups: 'すべてのグループを展開',
    collapseGroups: 'すべてのグループを折りたたむ'
  },
  projects: {
    newProject: '新規プロジェクト…',
    openFolder: 'フォルダをプロジェクトとして開く…',
    newWorktree: '新規ワークツリー…',
    auto: '自動',
    actions: 'プロジェクトの操作',
    newSessionHere: 'このプロジェクトで新規セッション',
    newSessionInLane: 'このレーンで新規セッション'
  },
  dateGroupToday: '今日',
  projectGroupNone: 'プロジェクト外',
  scope: {
    tip: 'このプロジェクトのセッションのみ表示',
    clear: 'すべてのセッションを表示',
    allProfilesTip: 'すべてのプロファイルのセッションを表示中',
    allProfilesClear: 'このプロファイルのセッションのみ表示'
  },
  sessions: {
    viewOptions: '表示オプション',
    viewOptionsTip: 'グループ化、並べ替え、フィルタ',
    noMatches: 'フィルタに一致するセッションはありません。',
    clearFilters: 'フィルタをクリア'
  },
  grouping: {
    label: 'グループ化',
    time: '時間順',
    project: 'プロジェクト別',
    status: 'ステータス別',
    source: 'ソース別',
    profile: 'ゲートウェイとプロファイル別',
    none: 'グループ化しない',
    noProject: 'プロジェクトなし'
  },
  statusGroup: {
    needsInput: '入力が必要',
    working: '実行中',
    unread: '未読',
    draft: '下書き',
    done: '完了'
  },
  view: {
    reset: 'デフォルトに戻す',
    sort: '並べ替え',
    show: '表示',
    time: '時刻',
    density: 'リストの密度',
    compact: 'コンパクト',
    comfortable: '標準',
    detailed: '詳細',
    filters: 'フィルタ',
    sources: 'ソース',
    prStatus: 'PR の状態',
    prAny: 'すべて',
    showArchived: 'アーカイブ済みのセッションを表示',
    moreFilters: 'その他のフィルタ'
  },
  source: {
    desktop: 'デスクトップ',
    cron: 'スケジュール済みジョブ',
    from: label => `${label} から`
  },
  row: {
    yesterday: '昨日'
  },
  menu: {
    clickHint: keys => `${keys}+クリック`,
    openInNewWindow: '新しいウインドウで開く',
    splitRight: '右',
    splitDown: '下',
    splitLeft: '左',
    splitUp: '上',
    color: 'カラー',
    copySessionId: 'セッション ID をコピー',
    branchFromHere: 'ここから分岐',
    export: '書き出す',
    exportJson: 'JSON…',
    exportMarkdown: 'Markdown…',
    exportUser: 'あなた',
    exportAssistant: 'Hermes',
    exportFailed: 'セッションを書き出せませんでした',
    newProject: '新規プロジェクト…',
    renameConfirm: '名前を変更',
    delete: '削除…'
  },
  draft: {
    noProject: 'プロジェクトなし',
    projectAria: name => `プロジェクト：${name}`,
    profileAria: name => `プロファイル：${name}`
  },
  footer: {
    updateAvailable: name => `${name} が利用可能`,
    updateGeneric: 'アップデートがあります',
    updateBackend: 'バックエンドのアップデートがあります',
    updateView: 'クリックして表示',
    updateBehind: count => `${count} コミット遅れ · クリックして表示`,
    updateApplying: 'アップデート中…',
    updateRestart: '再起動してアップデートを完了',
    account: 'プロファイルとゲートウェイ',
    ready: '準備完了',
    connecting: '接続中…',
    disconnected: '接続が切れました',
    unreachable: '到達できません',
    remote: 'リモート',
    thisDevice: 'このデバイス',
    thisMac: 'この Mac',
    defaultSuffix: '（デフォルト）',
    needsInputBadge: count => `${count} 件 入力待ち`,
    unreadBadge: count => `${count} 件 未読`,
    switchHere: 'このプロファイルに切り替える',
    newProfile: '新規プロファイル…',
    gateway: 'ゲートウェイ',
    reconnect: '再接続',
    recentActivity: '最近のアクティビティ…',
    connectGateway: '別のゲートウェイに接続…',
    systemStatus: 'システムの状態…',
    settings: '設定…',
    shortcuts: 'キーボードショートカット',
    checkUpdates: 'アップデートを確認…',
    showRail: 'プロファイルバーを表示'
  }
}
