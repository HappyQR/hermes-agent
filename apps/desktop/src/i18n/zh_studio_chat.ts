// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const zhStudioChat: StudioChatTranslations = {
  contextUsage: '上下文用量',
  tray: {
    label: '活动',
    hide: '收起活动托盘',
    show: count => `显示活动（${count}）`,
    approval: count => (count > 1 ? `需要批准 · ${count}` : '需要批准'),
    approvalHint: '跳到等待批准的命令',
    needsInput: '等待你的选择',
    needsInputHint: '跳到问题',
    previews: count => `预览 ${count}`,
    more: '更多',
    close: '收起',
    titles: {
      background: '后台进程',
      preview: '预览链接',
      previousTodo: '以往任务',
      queue: '队列',
      subagent: '子代理',
      todo: '待办'
    },
    todoCaption: '本回合由 Hermes 维护',
    queueCaption: '当前回合结束后依次发送',
    git: {
      hint: '分支、改动与工作树',
      reviewChanges: '审查变更',
      openPullRequest: number => `打开拉取请求 #${number}`,
      copyWorktreePath: '复制工作树路径'
    }
  }
}
