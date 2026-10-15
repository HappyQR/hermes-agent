// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

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
  transcript: {
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
