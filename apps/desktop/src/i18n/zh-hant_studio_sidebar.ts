// Hermes Studio copy (sidebar) — fork-owned so upstream locale merges stay clean.
import type { StudioSidebarTranslations } from './types_studio_sidebar'

export const zhHantStudioSidebar: StudioSidebarTranslations = {
  search: '搜尋',
  searchAria: '搜尋工作階段、頁面與指令',
  nav: {
    label: '頁面',
    automations: '自動化',
    memory: '記憶',
    open: '開啟',
    pendingPairing: count => `${count} 個待處理的配對請求`,
    cronJobs: count => `${count} 個排程工作`,
    cronFailing: count => `${count} 個工作執行失敗`
  },
  section: {
    expand: '展開',
    collapse: '收合',
    collapsedCount: count => `已收合 ${count} 項`,
    expandGroups: '展開所有群組',
    collapseGroups: '收合所有群組'
  },
  projects: {
    newProject: '新增專案…',
    openFolder: '將資料夾開啟為專案…',
    newWorktree: '新增工作樹…',
    auto: '自動',
    actions: '專案動作',
    newSessionHere: '在此專案中新增工作階段',
    newSessionInLane: '在此通道新增工作階段',
    empty: '還沒有專案'
  },
  scope: {
    tip: '只顯示這個專案的工作階段',
    clear: '顯示所有工作階段'
  },
  sessions: {
    viewOptions: '顯示選項',
    viewOptionsTip: '分組、排序與篩選',
    noMatches: '沒有符合篩選條件的工作階段。',
    clearFilters: '清除篩選'
  },
  grouping: {
    label: '分組',
    time: '依時間',
    project: '依專案',
    status: '依狀態',
    source: '依來源',
    profile: '依閘道與設定檔',
    none: '不分組',
    noProject: '未歸入專案'
  },
  statusGroup: {
    needsInput: '需要輸入',
    working: '運作中',
    unread: '未讀',
    draft: '草稿',
    done: '已完成'
  },
  view: {
    reset: '恢復預設值',
    sort: '排序',
    show: '顯示',
    time: '時間',
    density: '清單密度',
    compact: '緊湊',
    comfortable: '舒適',
    detailed: '詳細',
    filters: '篩選',
    sources: '來源',
    prStatus: 'PR 狀態',
    prAny: '全部',
    showArchived: '顯示已封存的工作階段',
    moreFilters: '更多篩選'
  },
  source: {
    desktop: '桌面',
    cron: '排程工作',
    from: label => `來自 ${label}`
  },
  row: {
    yesterday: '昨天'
  },
  menu: {
    clickHint: keys => `${keys} 點按`,
    openInNewWindow: '在新視窗中開啟',
    splitRight: '右側',
    splitDown: '下方',
    splitLeft: '左側',
    splitUp: '上方',
    color: '顏色',
    copySessionId: '拷貝工作階段 ID',
    branchFromHere: '從這裡分支',
    export: '匯出',
    exportJson: 'JSON…',
    exportMarkdown: 'Markdown…',
    exportUser: '你',
    exportAssistant: 'Hermes',
    exportFailed: '無法匯出工作階段',
    newProject: '新增專案…',
    delete: '刪除…'
  },
  footer: {
    updateAvailable: name => `${name} 可用`,
    updateGeneric: '有可用的更新',
    updateBackend: '後端有可用的更新',
    updateView: '點按查看',
    updateBehind: count => `落後 ${count} 個提交 · 點按查看`,
    updateApplying: '正在更新…',
    updateRestart: '重新啟動以完成更新',
    account: '設定檔與閘道',
    ready: '已就緒',
    connecting: '正在連線…',
    disconnected: '連線中斷',
    unreachable: '無法連線',
    remote: '遠端',
    thisDevice: '本機',
    thisMac: '本機',
    defaultSuffix: '（預設）',
    needsInputBadge: count => `${count} 需要輸入`,
    unreadBadge: count => `${count} 未讀`,
    switchHere: '切換到此設定檔',
    newProfile: '新增設定檔…',
    gateway: '閘道',
    reconnect: '重新連線',
    recentActivity: '最近活動…',
    connectGateway: '連線其他閘道…',
    systemStatus: '系統狀態…',
    settings: '設定…',
    shortcuts: '鍵盤快速鍵',
    checkUpdates: '檢查更新…',
    showRail: '顯示設定檔列'
  }
}
