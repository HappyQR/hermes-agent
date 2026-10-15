// Hermes Studio copy (shell) — fork-owned so upstream locale merges stay clean.
import type { StudioShellTranslations } from './types_studio_shell'

export const zhStudioShell: StudioShellTranslations = {
  untitledSession: '未命名会话',
  layout: '布局',
  inspector: {
    label: '检查器',
    close: '关闭检查器',
    preview: '预览',
    files: '文件',
    review: '变更',
    terminal: '终端',
    agents: '代理'
  },
  presets: {
    'sidebar-left': '侧边栏在左',
    'sidebar-right': '侧边栏在右',
    default: '默认',
    basic: '基础',
    focus: '专注',
    'terminal-deck': '终端台',
    quad: '四宫格'
  },
  toolbar: {
    newSessionTitle: '新会话',
    layoutMenu: '布局与分屏',
    showInspector: '显示检查器',
    hideInspector: '隐藏检查器',
    singlePane: '单栏',
    splitWith: '左右分屏',
    noOtherSessions: '没有其他会话',
    layoutTemplates: '布局模板',
    saveLayoutAs: '存储当前布局为模板…',
    editLayout: '编辑布局…',
    resetLayout: '重置布局',
    tabBar: '标签栏',
    tabBarAuto: '自动',
    tabBarAlways: '始终显示',
    tabBarNever: '从不显示',
    showStatusBar: '显示状态栏',
    hideStatusBar: '隐藏状态栏',
    projectChip: '项目与工作目录',
    branchChip: '分支与工作树',
    pullRequest: '拉取请求',
    reviewChanges: '审查变更',
    newWorktree: '新建工作树…',
    copyWorktreePath: '拷贝工作树路径',
    viewRunningAgents: '查看运行中的代理'
  }
}
