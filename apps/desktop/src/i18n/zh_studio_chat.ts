// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const zhStudioChat: StudioChatTranslations = {
  contextUsage: '上下文用量',
  composer: {
    addContext: '添加上下文',
    addContextHint: '添加文件、图片、网址或片段',
    popOut: '悬浮输入框',
    dock: '停靠输入框',
    skills: '技能…',
    autoApprove: '自动批准',
    autoApproveHint: '审批已关闭：命令会直接运行',
    yoloHint: '此会话已开启 YOLO：命令会直接运行',
    turnOffYolo: '关闭此会话的 YOLO',
    contextUsagePercent: percent => `上下文用量 ${percent}%`,
    cacheHit: value => `缓存命中 ${value}`,
    stats: {
      cacheHit: '缓存命中',
      throughput: '生成速率',
      throughputValue: value => `${value} 词元/秒`,
      turnTime: '本轮用时',
      sessionCost: '本会话费用'
    },
    compress: '压缩上下文',
    compressIdleOnly: 'Hermes 空闲时可用',
    usageDetails: '用量详情',
    effortOff: '关闭',
    moreSendOptions: '更多发送方式',
    steerHint: '下一次工具调用后',
    redirectHint: '停止并发送',
    voiceOptionsHint: '右键查看语音选项',
    voiceEngineHint: '右键选择引擎',
    placeholderBusy: combo => `补充上下文，或按 ${combo} 排队到下一回合`,
    placeholderHero: '给 Hermes 一个任务，/ 使用命令，@ 引用文件'
  },
  transcript: {
    delegateSpawned: count => `派生了 ${count} 个子代理`,
    delegateRunning: count => `${count} 个运行中`,
    delegateAllDone: '全部完成',
    openAgents: '在代理中查看',
    editAndRerun: '编辑并重新运行',
    editRerunNote: '发送后从这里重新运行，之后的消息会被移除',
    previousVersion: '上一个版本',
    nextVersion: '下一个版本',
    exportMarkdown: '导出为 Markdown…',
    exportFileName: 'Hermes 回复.md',
    exported: name => `已保存 ${name}`,
    exportFailed: '无法导出回复'
  },
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
