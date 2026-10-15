// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
// Generated from one table (all 9 locales together); edit the table, not one file.
import type { StudioSettingsTranslations } from './types_studio_settings'

export const zhHantStudioSettings: StudioSettingsTranslations = {
  searchPlaceholder: '搜尋設定',
  pages: {
    general: {
      title: '一般',
      hero: '語言、啟動方式、提示與視窗行為。'
    },
    appearance: {
      title: '外觀',
      hero: '顏色、主題、視窗玻璃、字體與寵物。'
    },
    chat: {
      title: '對話',
      hero: '回覆風格，以及思考過程、工具呼叫和訊息如何顯示。'
    },
    notifications: {
      title: '通知',
      hero: '哪些事情需要打擾你，以及完成時的提示音。'
    },
    keyboard: {
      title: '鍵盤與快捷操作',
      hero: '快捷鍵、快速提問、HUD 手勢與擷取視窗。'
    },
    models: {
      title: '模型',
      hero: '預設模型、備用模型，以及背景任務使用的輔助模型。'
    },
    providers: {
      title: '帳號與提供方',
      hero: '登入的帳號、API 金鑰、自訂端點與本地模型。'
    },
    memory: {
      title: '記憶與上下文',
      hero: 'Hermes 記住什麼、記多少，以及長對話如何壓縮。'
    },
    voice: {
      title: '語音',
      hero: '語音對話、語音轉文字、朗讀與喚醒詞。'
    },
    workspace: {
      title: '工作區',
      hero: '專案資料夾、指令執行環境與檔案檢查點。'
    },
    safety: {
      title: '安全與隱私',
      hero: '指令審核、隱私、瀏覽器與私有網路存取。'
    },
    passwords: {
      title: '密碼與登入',
      hero: 'Hermes 代你登入網站時使用的憑證。'
    },
    tools: {
      title: '工具與金鑰',
      hero: '工具服務的 API 金鑰與伺服器環境變數。'
    },
    gateways: {
      title: '閘道與連線',
      hero: '這個視窗連線到哪個 Hermes，以及已儲存的連線。'
    },
    sessions: {
      title: '工作階段與封存',
      hero: '自動封存與已封存的工作階段。'
    },
    plugins: {
      title: '外掛程式',
      hero: page => `已安裝外掛程式的設定。安裝與啟用請到「${page} › 外掛程式」。`
    },
    billing: {
      title: '帳單',
      hero: '餘額、方案、自動儲值與用量上限。'
    },
    advanced: {
      title: '進階',
      hero: '代理步數、終端機後端、子代理與輸出上限。適合熟悉 Hermes 的使用者。'
    },
    about: {
      title: '關於 Hermes',
      hero: '版本、更新、設定備份與解除安裝。'
    }
  },
  window: {
    navLabel: '設定分類',
    noResults: query => `找不到「${query}」`,
    categoryResult: '分類',
    onlyThisMac: '僅限這台 Mac',
    onlyThisDevice: '僅限這部裝置',
    appliesToProfile: profile => `套用於「${profile}」`,
    appliesTo: '套用於',
    scopeMenuTitle: '這些設定套用於',
    searchResults: '搜尋結果',
    pageMenu: '設定頁面'
  },
  sections: {
    general: {
      language: '語言與啟動',
      tips: '提示與教學',
      system: '視窗與系統'
    },
    appearance: {
      look: '外觀',
      theme: '主題',
      themeNote: '主題依設定檔儲存。也可以直接從 VS Code 主題市集安裝。',
      window: '視窗',
      typography: '字體與縮放',
      pet: '寵物'
    },
    chat: {
      replies: '回覆',
      messages: '訊息',
      media: '內嵌媒體與附件'
    },
    notifications: {
      alerts: '桌面提醒',
      sounds: '聲音與觸感'
    },
    keyboard: {
      shortcuts: '快捷鍵',
      shortcutsNote: '點按按鍵組合即可重新設定。衝突會在該列中提示。',
      quickAsk: '快速提問',
      hud: 'HUD 與擷取視窗'
    },
    models: {
      main: '主要模型',
      fallbacks: '備用模型',
      fallbacksNote: '主要模型無法使用或超出額度時，依序嘗試。',
      auxiliary: '輔助模型',
      auxiliaryDisclosure: '背景任務（視覺、壓縮、標題產生…）',
      moa: '混合代理',
      moaDisclosure: '多個模型一起回答，再由彙整模型總結（/moa）'
    },
    providers: {
      accounts: '帳號',
      apiKeys: 'API 金鑰',
      endpoints: '自訂端點',
      local: '本地模型'
    },
    memory: {
      memory: '長期記憶',
      context: '上下文與壓縮',
      contextDisclosure: '壓縮細節',
      maintenance: '維護'
    },
    voice: {
      conversation: '語音對話',
      stt: '語音轉文字',
      tts: '朗讀',
      wake: '喚醒詞'
    },
    workspace: {
      projects: '專案',
      execution: '執行',
      checkpoints: '檢查點',
      checkpointsNote: '每次修改檔案前自動保存，可以在訊息上「還原檢查點」。'
    },
    safety: {
      approvals: '指令審核',
      privacy: '隱私',
      browser: '瀏覽器與網路'
    },
    passwords: {
      credentials: '已儲存的憑證',
      credentialsNote: 'Hermes 代你登入或填寫表單時使用。',
      managers: '密碼管理工具'
    },
    tools: {
      toolKeys: '工具服務金鑰',
      serverEnv: '伺服器環境變數',
      toolsets: '工具集'
    },
    gateways: {
      connection: '這個視窗連線到',
      saved: '已儲存的連線',
      remoteUpdates: '遠端更新'
    },
    sessions: {
      retention: '封存與保留',
      archived: '已封存的工作階段'
    },
    plugins: {
      pages: '外掛程式設定',
      manage: '安裝與啟用'
    },
    advanced: {
      agent: '代理',
      terminal: '終端機後端',
      subagents: '子代理',
      output: '輸出上限',
      updates: '應用程式內更新'
    },
    about: {
      updates: '更新',
      config: '設定檔',
      diagnostics: '診斷',
      uninstall: '解除安裝'
    }
  },
  rows: {
    modeLight: '淺色',
    modeDark: '深色',
    modeAuto: '自動',
    modeGroup: '顏色模式',
    accentTitle: '強調色',
    accentDesc: '按鈕、選取項目和連結的顏色',
    accentNous: '藍色',
    accentHermes: 'Hermes 藍',
    accentViolet: '紫色',
    accentPink: '粉紅色',
    accentRed: '紅色',
    accentOrange: '橙色',
    accentGreen: '綠色',
    accentMono: '石墨色',
    thinkingTitle: '思考過程',
    thinkingDesc: '模型的推理在回覆中如何顯示',
    thinkingShow: '顯示',
    thinkingCollapse: '摺疊',
    thinkingHide: '隱藏',
    timestampsTitle: '顯示時間戳記',
    hapticsTitle: '觸覺回饋',
    hapticsDesc: '拖放與完成時的觸覺回饋。關閉後完成提示音也會靜音。',
    wakeTitle: '啟用喚醒詞',
    wakeDesc: '在背景持續聆聽，聽到喚醒詞後開始語音對話',
    wakePhrase: '喚醒詞',
    memoryOpenTitle: '檢視與編輯',
    memoryOpenDesc: '在「記憶」頁面瀏覽圖譜和列表',
    memoryOpenAction: '開啟記憶',
    resetMemoryTitle: '重設記憶',
    resetMemoryDesc: '清空 MEMORY.md，無法復原',
    resetProfileTitle: '重設使用者畫像',
    resetProfileDesc: '清空 USER.md',
    resetAction: '重設…',
    toolsetsTitle: '啟用或關閉工具集',
    toolsetsDesc: page => `在「${page} › 工具」中管理`,
    openAction: '開啟',
    pluginsManageDesc: '安裝、更新、啟用與解除安裝',
    pluginsManageAction: '開啟外掛程式',
    exportDesc: '儲存為 hermes-config.json，不含金鑰',
    exportAction: '匯出…',
    importAction: '匯入…',
    resetConfigDesc: '只影響目前的設定檔，本機外觀設定不變',
    resetConfigAction: '恢復…',
    diagnosticsTitle: '傳送診斷資訊',
    diagnosticsDesc: '上傳去識別化的記錄檔以協助排查問題。傳送前會先確認，連結會自動過期',
    diagnosticsAction: '傳送…',
    logsTitle: '記錄檔資料夾',
    logsActionMac: '在 Finder 中顯示',
    logsActionOther: '開啟資料夾',
    localModelsDesc: '下載開源模型並在本機執行',
    localModelsAction: '管理本地模型…',
    sendTestAction: '傳送',
    themeMarketplaceTitle: '從 VS Code 主題市集安裝',
    noThemesMatch: query => `沒有符合「${query}」的已安裝主題。`,
    activateKey: '啟用',
    activatingKey: '正在啟用…',
    apiKeyFallback: 'API 金鑰',
    pasteKeyPlaceholder: name => `貼上 ${name}`,
    providerNeedsKey: provider => `${provider} 需要 API 金鑰——設定好後即可選擇模型。`,
    providerBrowserSignIn: provider => `${provider} 透過瀏覽器登入——Hermes 會帶你完成整個流程。`,
    addCredentialTitle: '新增憑證',
    addCredentialDesc: '登入、付款卡或地址',
    addCredentialAction: '新增…',
    resetShortcutsAction: '全部恢復預設'
  }
}
