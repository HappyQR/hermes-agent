// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
// Generated from one table (all 9 locales together); edit the table, not one file.
import type { StudioSettingsTranslations } from './types_studio_settings'

export const zhStudioSettings: StudioSettingsTranslations = {
  searchPlaceholder: '搜索设置',
  pages: {
    general: {
      title: '通用',
      hero: '语言、启动方式、提示与窗口行为。'
    },
    appearance: {
      title: '外观',
      hero: '颜色、主题、窗口玻璃、字体与宠物。'
    },
    chat: {
      title: '对话',
      hero: '回复风格，以及思考过程、工具调用和消息如何显示。'
    },
    notifications: {
      title: '通知',
      hero: '哪些事情需要打扰你，以及完成时的提示音。'
    },
    keyboard: {
      title: '键盘与快捷操作',
      hero: '快捷键、快速提问、HUD 手势与截取窗口。'
    },
    models: {
      title: '模型',
      hero: '默认模型、备用模型，以及后台任务用的辅助模型。'
    },
    providers: {
      title: '账户与提供商',
      hero: '登录账户、API 密钥、自定义端点与本地模型。'
    },
    memory: {
      title: '记忆与上下文',
      hero: 'Hermes 记住什么、记多少，以及长对话如何压缩。'
    },
    voice: {
      title: '语音',
      hero: '语音对话、语音转文字、朗读与唤醒词。'
    },
    workspace: {
      title: '工作区',
      hero: '项目文件夹、命令执行环境与文件检查点。'
    },
    safety: {
      title: '安全与隐私',
      hero: '命令审批、隐私、浏览器与私有网络访问。'
    },
    passwords: {
      title: '密码与登录',
      hero: 'Hermes 代你登录网站时使用的凭据。'
    },
    tools: {
      title: '工具与密钥',
      hero: '工具服务的 API 密钥与服务器环境变量。'
    },
    gateways: {
      title: '网关与连接',
      hero: '这个窗口连接到哪个 Hermes，以及保存的连接。'
    },
    sessions: {
      title: '会话与归档',
      hero: '自动归档与已归档的会话。'
    },
    plugins: {
      title: '插件',
      hero: page => `已安装插件的设置。安装与启用在「${page} › 插件」。`
    },
    billing: {
      title: '账单',
      hero: '余额、方案、自动充值与用量上限。'
    },
    advanced: {
      title: '高级',
      hero: '代理步数、终端后端、子代理与输出上限。适合熟悉 Hermes 的用户。'
    },
    about: {
      title: '关于 Hermes',
      hero: '版本、更新、配置备份与卸载。'
    }
  },
  window: {
    navLabel: '设置分类',
    noResults: query => `没有找到「${query}」`,
    categoryResult: '分类',
    onlyThisMac: '仅此 Mac',
    onlyThisDevice: '仅此设备',
    appliesToProfile: profile => `应用于「${profile}」`,
    appliesTo: '应用于',
    scopeMenuTitle: '这些设置应用于',
    searchResults: '搜索结果',
    pageMenu: '设置页面'
  },
  sections: {
    general: {
      language: '语言与启动',
      tips: '提示与教程',
      system: '窗口与系统'
    },
    appearance: {
      look: '外观',
      theme: '主题',
      themeNote: '主题按配置档案保存。也可以直接从 VS Code 主题市场安装。',
      window: '窗口',
      typography: '字体与缩放',
      pet: '宠物'
    },
    chat: {
      replies: '回复',
      messages: '消息',
      media: '内嵌媒体与附件'
    },
    notifications: {
      alerts: '桌面提醒',
      sounds: '声音与触感'
    },
    keyboard: {
      shortcuts: '快捷键',
      shortcutsNote: '点按按键组合即可重新设置。冲突会在行内提示。',
      quickAsk: '快速提问',
      hud: 'HUD 与截取窗口'
    },
    models: {
      main: '主模型',
      fallbacks: '备用模型',
      fallbacksNote: '主模型不可用或超出额度时，按顺序尝试。',
      auxiliary: '辅助模型',
      auxiliaryDisclosure: '后台任务（视觉、压缩、标题生成…）',
      moa: '混合代理',
      moaDisclosure: '多个模型一起回答，再由聚合模型汇总（/moa）'
    },
    providers: {
      accounts: '账户',
      apiKeys: 'API 密钥',
      endpoints: '自定义端点',
      local: '本地模型'
    },
    memory: {
      memory: '长期记忆',
      context: '上下文与压缩',
      contextDisclosure: '压缩细节',
      maintenance: '维护'
    },
    voice: {
      conversation: '语音对话',
      stt: '语音转文字',
      tts: '朗读',
      wake: '唤醒词'
    },
    workspace: {
      projects: '项目',
      execution: '执行',
      checkpoints: '检查点',
      checkpointsNote: '每次改文件前自动留存，可以在消息上「恢复检查点」。'
    },
    safety: {
      approvals: '命令审批',
      privacy: '隐私',
      browser: '浏览器与网络'
    },
    passwords: {
      credentials: '已保存的凭据',
      credentialsNote: 'Hermes 代你登录或填写表单时使用。',
      managers: '密码管理器'
    },
    tools: {
      toolKeys: '工具服务密钥',
      serverEnv: '服务器环境变量',
      toolsets: '工具集'
    },
    gateways: {
      connection: '这个窗口连接到',
      saved: '已保存的连接',
      remoteUpdates: '远程更新'
    },
    sessions: {
      retention: '归档与保留',
      archived: '已归档的会话'
    },
    plugins: {
      pages: '插件设置',
      manage: '安装与启用'
    },
    advanced: {
      agent: '代理',
      terminal: '终端后端',
      subagents: '子代理',
      output: '输出上限',
      updates: '应用内更新'
    },
    about: {
      updates: '更新',
      config: '配置',
      diagnostics: '诊断',
      uninstall: '卸载'
    }
  },
  rows: {
    modeLight: '浅色',
    modeDark: '深色',
    modeAuto: '自动',
    modeGroup: '颜色模式',
    accentTitle: '强调色',
    accentDesc: '按钮、选中项和链接的颜色',
    accentNous: '蓝色',
    accentHermes: 'Hermes 蓝',
    accentViolet: '紫色',
    accentPink: '粉色',
    accentRed: '红色',
    accentOrange: '橙色',
    accentGreen: '绿色',
    accentMono: '石墨色',
    thinkingTitle: '思考过程',
    thinkingDesc: '模型的推理在回复中如何显示',
    thinkingShow: '显示',
    thinkingCollapse: '折叠',
    thinkingHide: '隐藏',
    timestampsTitle: '显示时间戳',
    hapticsTitle: '触感反馈',
    hapticsDesc: '拖放与完成时的触感反馈。关闭后完成提示音也会静音。',
    wakeTitle: '启用唤醒词',
    wakeDesc: '在后台持续聆听，听到唤醒词后开始语音对话',
    wakePhrase: '唤醒词',
    memoryOpenTitle: '查看与编辑',
    memoryOpenDesc: '在「记忆」页面浏览图谱和列表',
    memoryOpenAction: '打开记忆',
    resetMemoryTitle: '重置记忆',
    resetMemoryDesc: '清空 MEMORY.md，无法撤销',
    resetProfileTitle: '重置用户画像',
    resetProfileDesc: '清空 USER.md',
    resetAction: '重置…',
    maintenanceActiveOnly: profile => `重置只作用于这个窗口正在使用的配置档案（「${profile}」）。`,
    toolsetsTitle: '启用或关闭工具集',
    toolsetsDesc: page => `在「${page} › 工具」中管理`,
    openAction: '打开',
    pluginsManageDesc: '安装、更新、启用与卸载',
    pluginsManageAction: '打开插件',
    exportDesc: '保存为 hermes-config.json，不含密钥',
    exportAction: '导出…',
    importAction: '导入…',
    resetConfigDesc: '只影响当前配置档案，本机外观设置不变',
    resetConfigAction: '恢复…',
    diagnosticsTitle: '发送诊断信息',
    diagnosticsDesc: '上传脱敏后的日志用于排查问题。发送前会先确认，链接会自动过期',
    diagnosticsAction: '发送…',
    logsTitle: '日志文件夹',
    logsActionMac: '在访达中显示',
    logsActionOther: '打开文件夹',
    localModelsDesc: '下载开源模型并在本机运行',
    localModelsAction: '管理本地模型…',
    sendTestAction: '发送',
    resetShortcutsAction: '全部恢复默认'
  }
}
