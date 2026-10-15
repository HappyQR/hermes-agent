// Hermes Studio copy (sidebar) — fork-owned so upstream locale merges stay clean.
import type { StudioSidebarTranslations } from './types_studio_sidebar'

export const zhStudioSidebar: StudioSidebarTranslations = {
  search: '搜索',
  searchAria: '搜索会话、页面与命令',
  nav: {
    label: '页面',
    automations: '自动化',
    memory: '记忆',
    open: '打开',
    pendingPairing: count => `${count} 个待处理的配对请求`,
    cronJobs: count => `${count} 个定时任务`,
    cronFailing: count => `${count} 个任务运行失败`
  },
  section: {
    expand: '展开',
    collapse: '折叠',
    collapsedCount: count => `已折叠 ${count} 项`,
    expandGroups: '展开所有分组',
    collapseGroups: '折叠所有分组'
  },
  projects: {
    newProject: '新建项目…',
    openFolder: '打开文件夹为项目…',
    newWorktree: '新建工作树…',
    auto: '自动',
    actions: '项目操作',
    newSessionHere: '在此项目中新建会话',
    newSessionInLane: '在此通道新建会话',
    empty: '还没有项目'
  },
  scope: {
    tip: '只显示这个项目的会话',
    clear: '显示所有会话'
  },
  sessions: {
    viewOptions: '显示选项',
    viewOptionsTip: '分组、排序与筛选',
    noMatches: '没有符合筛选条件的会话。',
    clearFilters: '清除筛选'
  },
  grouping: {
    label: '分组',
    time: '按时间',
    project: '按项目',
    status: '按状态',
    source: '按来源',
    profile: '按网关与档案',
    none: '不分组',
    noProject: '未归入项目'
  },
  statusGroup: {
    needsInput: '需要输入',
    working: '运行中',
    unread: '未读',
    draft: '草稿',
    done: '已完成'
  },
  view: {
    reset: '恢复默认',
    sort: '排序',
    show: '显示',
    time: '时间',
    density: '列表密度',
    compact: '紧凑',
    comfortable: '舒适',
    detailed: '详细',
    filters: '筛选',
    sources: '来源',
    prStatus: 'PR 状态',
    prAny: '全部',
    showArchived: '显示已归档的会话',
    moreFilters: '更多筛选'
  },
  source: {
    desktop: '桌面',
    cron: '定时任务',
    from: label => `来自 ${label}`
  },
  row: {
    yesterday: '昨天'
  },
  menu: {
    clickHint: keys => `${keys} 点按`,
    openInNewWindow: '在新窗口中打开',
    splitRight: '右侧',
    splitDown: '下方',
    splitLeft: '左侧',
    splitUp: '上方',
    color: '颜色',
    copySessionId: '拷贝会话 ID',
    branchFromHere: '从这里分支',
    export: '导出',
    exportJson: 'JSON…',
    exportMarkdown: 'Markdown…',
    exportFailed: '无法导出会话',
    newProject: '新建项目…',
    delete: '删除…'
  },
  footer: {
    updateAvailable: name => `${name} 可用`,
    updateGeneric: '有可用更新',
    updateBackend: '后端有可用更新',
    updateView: '点按查看',
    updateBehind: count => `落后 ${count} 个提交 · 点按查看`,
    updateApplying: '正在更新…',
    updateRestart: '重启以完成更新',
    account: '配置档案与网关',
    ready: '已就绪',
    connecting: '正在连接…',
    disconnected: '连接中断',
    unreachable: '不可达',
    remote: '远程',
    thisDevice: '本机',
    thisMac: '本机',
    defaultSuffix: '（默认）',
    needsInputBadge: count => `${count} 需要输入`,
    unreadBadge: count => `${count} 未读`,
    switchHere: '切换到此档案',
    newProfile: '新建配置档案…',
    gateway: '网关',
    reconnect: '重新连接',
    recentActivity: '最近活动…',
    connectGateway: '连接其他网关…',
    systemStatus: '系统状态…',
    settings: '设置…',
    shortcuts: '键盘快捷键',
    checkUpdates: '检查更新…',
    showRail: '显示配置档案栏'
  }
}
