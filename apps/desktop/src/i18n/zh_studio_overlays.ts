import type { StudioOverlaysTranslations } from './types_studio_overlays'
// Hermes Studio copy (overlays) — fork-owned so upstream locale merges stay clean.
import { zhStudioOverlaysAux } from './zh_studio_overlays_aux'

export const zhStudioOverlays: StudioOverlaysTranslations = {
  quickAsk: '快速提问',
  aux: zhStudioOverlaysAux,
  shortcuts: {
    title: '键盘快捷键',
    subtitle: place => `在 ${place} 中修改`,
    close: '关闭键盘快捷键',
    search: '搜索快捷键',
    searchPlaceholder: '搜索',
    editInSettings: '在设置中修改',
    noResults: query => `没有匹配「${query}」的快捷键`,
    slotProfiles: (first, last) => `切换到配置档案 ${first}–${last}`,
    slotTabs: (first, last) => `切换到标签页 ${first}–${last}`,
    slotSessions: (first, last) => `切换到最近的会话 ${first}–${last}`
  },
  system: {
    title: '系统状态',
    subtitle: '会话、系统、用量与维护',
    close: '关闭系统状态',
    sectionsLabel: '分区',
    statGateway: '网关',
    running: '运行中',
    stopped: '已停止',
    statVersion: '版本',
    statActiveSessions: '活跃会话',
    statPlatforms: '消息平台',
    platformsConnected: count => `${count} 个已连接`,
    platformsNone: '未连接',
    restartDesc: '已连接的消息平台会重新连接',
    restart: '重启…',
    checkForUpdates: '检查更新',
    periodLabel: '时间范围',
    cacheHit: percent => `缓存命中 ${percent}%`,
    dayDetail: (day, input, output) => `${day} · 输入 ${input} · 输出 ${output}`,
    searchSessions: '按标题或 ID 搜索全部会话',
    tokens: count => `${count} 词元`,
    archiveSession: '归档会话',
    run: '运行',
    manageMemory: '管理…'
  },
  palette: {
    placeholder: '搜索会话、页面、命令与设置',
    scopesLabel: '范围',
    scopes: {
      all: '全部',
      sessions: '会话与项目',
      pages: '页面',
      actions: '命令',
      settings: '设置'
    },
    recent: '最近',
    searchContent: query => `搜索全部会话内容：${query}`,
    searchContentDetail: '服务端全文搜索',
    contentGroup: '在会话内容中搜索',
    footerSelect: '选择',
    footerOpen: '打开',
    footerScope: '切换范围',
    footerPaste: '粘贴会话 ID 可直接跳转',
    on: '开',
    off: '关',
    layoutEditMode: '切换布局编辑模式',
    reloadPlugins: '重新加载桌面插件',
    resetLayout: '重置布局',
    toggleLogs: '切换日志',
    toggleYolo: '切换 YOLO 模式（跳过审批）'
  },
  profiles: {
    subtitle: '每个配置档案有独立的模型、技能、记忆与人格（SOUL.md）。',
    remote: '远程',
    changeModel: '更改…',
    skillsEnabled: count => `${count} 个已启用`,
    manage: '管理',
    soulHint: '人格与长期指令',
    soulUnsaved: combo => `未保存 · ${combo} 保存`,
    exportNote: '导出的档案不包含密钥',
    importShort: '导入…'
  },
  import: {
    subtitle: host => `把 Claude Code 或 Codex 的对话导入 Hermes，接着上次的进度。读取自：${host}`,
    importInto: profile => `导入到：${profile}`,
    sourceLabel: '来源'
  },
  updates: {
    currentVersion: (version, channel) => `当前 ${version} · ${channel}`
  }
}
