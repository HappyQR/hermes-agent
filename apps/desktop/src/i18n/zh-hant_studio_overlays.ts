import type { StudioOverlaysTranslations } from './types_studio_overlays'
// Hermes Studio copy (overlays) — fork-owned so upstream locale merges stay clean.
import { zhHantStudioOverlaysAux } from './zh-hant_studio_overlays_aux'

export const zhHantStudioOverlays: StudioOverlaysTranslations = {
  quickAsk: '快速提問',
  aux: zhHantStudioOverlaysAux,
  shortcuts: {
    title: '鍵盤快捷鍵',
    subtitle: place => `在 ${place} 中修改`,
    close: '關閉鍵盤快捷鍵',
    search: '搜尋快捷鍵',
    searchPlaceholder: '搜尋',
    editInSettings: '在設定中修改',
    noResults: query => `沒有符合「${query}」的快捷鍵`,
    slotProfiles: (first, last) => `切換到設定檔 ${first}–${last}`,
    slotTabs: (first, last) => `切換到分頁 ${first}–${last}`,
    slotSessions: (first, last) => `切換到最近的工作階段 ${first}–${last}`
  },
  system: {
    title: '系統狀態',
    subtitle: '工作階段、系統、用量與維護',
    close: '關閉系統狀態',
    sectionsLabel: '分區',
    statGateway: '閘道',
    running: '執行中',
    stopped: '已停止',
    statVersion: '版本',
    statActiveSessions: '使用中的工作階段',
    statPlatforms: '訊息平台',
    platformsConnected: count => `${count} 個已連線`,
    platformsNone: '未連線',
    restartDesc: '已連線的訊息平台會重新連線',
    restart: '重新啟動…',
    checkForUpdates: '檢查更新',
    periodLabel: '時間範圍',
    cacheHit: percent => `快取命中 ${percent}%`,
    dayDetail: (day, input, output) => `${day} · 輸入 ${input} · 輸出 ${output}`,
    searchSessions: '依標題或 ID 搜尋所有工作階段',
    tokens: count => `${count} 詞元`,
    run: '執行',
    manageMemory: '管理…'
  },
  palette: {
    placeholder: '搜尋工作階段、頁面、指令與設定',
    scopesLabel: '範圍',
    scopes: {
      all: '全部',
      sessions: '工作階段與專案',
      pages: '頁面',
      actions: '指令',
      settings: '設定'
    },
    recent: '最近',
    searchContent: query => `搜尋所有工作階段內容：${query}`,
    searchContentDetail: '伺服器全文搜尋',
    contentGroup: '在工作階段內容中搜尋',
    footerSelect: '選擇',
    footerOpen: '開啟',
    footerScope: '切換範圍',
    footerPaste: '貼上工作階段 ID 即可直接前往',
    on: '開',
    off: '關',
    layoutEditMode: '切換版面編輯模式',
    reloadPlugins: '重新載入桌面外掛程式',
    resetLayout: '重設版面'
  },
  profiles: {
    subtitle: '每個設定檔都有獨立的模型、技能、記憶與人格（SOUL.md）。',
    remote: '遠端',
    changeModel: '更改…',
    skillsEnabled: count => `${count} 個已啟用`,
    manage: '管理',
    soulHint: '人格與長期指令',
    soulUnsaved: combo => `未儲存 · ${combo} 儲存`,
    exportNote: '匯出的設定檔不包含金鑰',
    importShort: '匯入…'
  },
  updates: {
    currentVersion: (version, channel) => `目前 ${version} · ${channel}`
  }
}
