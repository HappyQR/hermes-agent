// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const zhHantStudioChat: StudioChatTranslations = {
  contextUsage: '上下文用量',
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
