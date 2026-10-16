// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

// 工具运行摘要：动词 + 数量 + 量词（"探索了 3 个文件"、"正在运行 npm test"）。
const zhRun = (verb: string, measure: string) => ({
  present: `正在${verb}`,
  named: (target: string, live: boolean) => (live ? `正在${verb} ${target}` : `${verb}了 ${target}`),
  counted: (count: number, live: boolean) =>
    live ? `正在${verb} ${count} ${measure}` : `${verb}了 ${count} ${measure}`
})

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
    voiceOptionsHint: '右键查看语音选项',
    voiceEngineHint: '右键选择引擎',
    placeholderBusy: combo => `补充上下文，或按 ${combo} 排队到下一回合`,
    placeholderHero: '给 Hermes 一个任务，/ 使用命令，@ 引用文件'
  },
  empty: {
    greeting: {
      lateNight: '夜深了',
      morning: '上午好',
      noon: '中午好',
      afternoon: '下午好',
      evening: '晚上好'
    },
    startersLabel: '快速开始',
    starters: {
      fixError: { title: '修一个报错', description: '贴上错误信息，我来定位原因并修复', prompt: '帮我看看这个报错：' },
      organizeFolder: {
        title: '整理一个文件夹',
        description: '按类型和日期归档，生成清单',
        prompt: '帮我整理 ~/Downloads，把发票单独归档。'
      },
      schedule: {
        title: '每天定时做件事',
        description: '比如早上 9 点汇总新闻发到 Telegram',
        prompt: '每天早上 9 点汇总 AI 新闻发到 Telegram。'
      },
      prototype: {
        title: '做一个网页原型',
        description: '描述想法，直接得到可点的页面',
        prompt: '帮我做一个可点击的网页原型：'
      }
    },
    continueFrom: '从 Claude Code 或 Codex 继续'
  },
  toolRun: {
    categories: {
      analyze: zhRun('分析', '张图片'),
      browse: zhRun('打开', '个页面'),
      delegate: zhRun('委派', '个任务'),
      edit: zhRun('编辑', '个文件'),
      explore: zhRun('探索', '个文件'),
      interact: zhRun('执行', '个浏览器操作'),
      other: zhRun('使用', '个工具'),
      read: zhRun('读取', '个页面'),
      run: zhRun('运行', '条命令'),
      search: zhRun('搜索', '个关键词')
    },
    join: clauses => clauses.join('，'),
    moreCommands: (first, more) => `${first} 及另外 ${more} 条命令`
  },
  voice: {
    label: '语音对话',
    doneSpeaking: '说完了'
  },
  transcript: {
    replyDuration: seconds => {
      const m = Math.floor(seconds / 60)
      const s = seconds % 60

      return m === 0 ? `${s} 秒` : s === 0 ? `${m} 分钟` : `${m} 分 ${s} 秒`
    },
    searchResults: '搜索结果',
    delegatedTask: '委派的任务',
    delegateSpawned: count => `派生了 ${count} 个子代理`,
    delegateRunning: count => `${count} 个运行中`,
    delegateAllDone: '全部完成',
    openAgents: '在检查器中查看',
    approvalTitle: '允许 Hermes 运行这条命令？',
    approvalTitleAction: '允许 Hermes 执行这项操作？',
    approvalMode: '审批模式…',
    needsChoice: '需要你的选择',
    answered: '已回答',
    questions: count => `${count} 个问题`,
    clarifyHint: '选择一项，或直接输入你的答案',
    clarifyHintMulti: '可多选，或直接输入你的答案',
    recommended: '推荐',
    moreRecovery: '更多恢复方式',
    preparingReply: 'Hermes 正在准备回复',
    timelineLabel: '对话时间线',
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
      previousTodo: '以往待办',
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
