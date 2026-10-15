// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

// 工具執行摘要：動詞 + 數量 + 量詞（「探索了 3 個檔案」、「正在執行 npm test」）。
const zhHantRun = (verb: string, measure: string) => ({
  present: `正在${verb}`,
  named: (target: string, live: boolean) => (live ? `正在${verb} ${target}` : `${verb}了 ${target}`),
  counted: (count: number, live: boolean) =>
    live ? `正在${verb} ${count} ${measure}` : `${verb}了 ${count} ${measure}`
})

export const zhHantStudioChat: StudioChatTranslations = {
  contextUsage: '上下文用量',
  composer: {
    addContext: '加入上下文',
    addContextHint: '加入檔案、圖片、網址或片段',
    popOut: '浮動輸入框',
    dock: '停靠輸入框',
    skills: '技能…',
    autoApprove: '自動核准',
    autoApproveHint: '核准已關閉：指令會直接執行',
    yoloHint: '此對話已開啟 YOLO：指令會直接執行',
    turnOffYolo: '關閉此對話的 YOLO',
    contextUsagePercent: percent => `上下文用量 ${percent}%`,
    cacheHit: value => `快取命中 ${value}`,
    stats: {
      cacheHit: '快取命中',
      throughput: '生成速率',
      throughputValue: value => `${value} 詞元/秒`,
      turnTime: '本輪用時',
      sessionCost: '本對話費用'
    },
    compress: '壓縮上下文',
    compressIdleOnly: 'Hermes 閒置時可用',
    usageDetails: '用量詳情',
    effortOff: '關閉',
    moreSendOptions: '更多傳送方式',
    steerHint: '下一次工具呼叫後',
    redirectHint: '停止並傳送',
    voiceOptionsHint: '按右鍵查看語音選項',
    voiceEngineHint: '按右鍵選擇引擎',
    placeholderBusy: combo => `補充上下文，或按 ${combo} 排入下一回合`,
    placeholderHero: '交給 Hermes 一個任務，/ 使用指令，@ 引用檔案'
  },
  empty: {
    greeting: {
      lateNight: '夜深了',
      morning: '早安',
      noon: '午安',
      afternoon: '午安',
      evening: '晚上好'
    },
    startersLabel: '快速開始',
    starters: {
      fixError: {
        title: '修正一個錯誤',
        description: '貼上錯誤訊息，我來找出原因並修正',
        prompt: '幫我看看這個錯誤：'
      },
      organizeFolder: {
        title: '整理一個資料夾',
        description: '依類型和日期歸檔，產生清單',
        prompt: '幫我整理 ~/Downloads，把發票另外歸檔。'
      },
      schedule: {
        title: '每天定時做件事',
        description: '例如早上 9 點彙整新聞發到 Telegram',
        prompt: '每天早上 9 點彙整 AI 新聞發到 Telegram。'
      },
      prototype: {
        title: '做一個網頁原型',
        description: '描述想法，直接得到可點擊的頁面',
        prompt: '幫我做一個可點擊的網頁原型：'
      }
    },
    continueFrom: '從 Claude Code 或 Codex 繼續'
  },
  toolRun: {
    categories: {
      analyze: zhHantRun('分析', '張圖片'),
      browse: zhHantRun('開啟', '個頁面'),
      delegate: zhHantRun('委派', '個任務'),
      edit: zhHantRun('編輯', '個檔案'),
      explore: zhHantRun('探索', '個檔案'),
      interact: zhHantRun('進行', '個瀏覽器操作'),
      other: zhHantRun('使用', '個工具'),
      read: zhHantRun('讀取', '個頁面'),
      run: zhHantRun('執行', '條指令'),
      search: zhHantRun('搜尋', '個關鍵字')
    },
    join: clauses => clauses.join('，'),
    moreCommands: (first, more) => `${first} 及另外 ${more} 條指令`
  },
  transcript: {
    delegateSpawned: count => `衍生了 ${count} 個子代理`,
    delegateRunning: count => `${count} 個執行中`,
    delegateAllDone: '全部完成',
    openAgents: '在檢閱器中檢視',
    approvalTitle: '允許 Hermes 執行這條指令？',
    approvalTitleAction: '允許 Hermes 執行這項操作？',
    approvalMode: '核准模式…',
    needsChoice: '需要你的選擇',
    answered: '已回答',
    questions: count => `${count} 個問題`,
    clarifyHint: '選擇一項，或直接輸入你的答案',
    clarifyHintMulti: '可多選，或直接輸入你的答案',
    recommended: '推薦',
    moreRecovery: '更多復原方式',
    preparingReply: 'Hermes 正在準備回覆',
    timelineLabel: '對話時間軸',
    editAndRerun: '編輯並重新執行',
    editRerunNote: '傳送後從這裡重新執行，之後的訊息會被移除',
    previousVersion: '上一個版本',
    nextVersion: '下一個版本',
    exportMarkdown: '匯出為 Markdown…',
    exportFileName: 'Hermes 回覆.md',
    exported: name => `已儲存 ${name}`,
    exportFailed: '無法匯出回覆'
  },
  tray: {
    label: '活動',
    hide: '收起活動匣',
    show: count => `顯示活動（${count}）`,
    approval: count => (count > 1 ? `需要核准 · ${count}` : '需要核准'),
    approvalHint: '跳到等待核准的指令',
    needsInput: '等待你的選擇',
    needsInputHint: '跳到問題',
    previews: count => `預覽 ${count}`,
    more: '更多',
    close: '收起',
    titles: {
      background: '背景程序',
      preview: '預覽連結',
      previousTodo: '先前的任務',
      queue: '佇列',
      subagent: '子代理',
      todo: '待辦'
    },
    todoCaption: '本回合由 Hermes 維護',
    queueCaption: '目前回合結束後依序傳送',
    git: {
      hint: '分支、變更與工作樹',
      reviewChanges: '審查變更',
      openPullRequest: number => `開啟拉取要求 #${number}`,
      copyWorktreePath: '複製工作樹路徑'
    }
  }
}
