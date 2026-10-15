// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
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
    scopeMenuTitle: '這些設定套用於'
  }
}
