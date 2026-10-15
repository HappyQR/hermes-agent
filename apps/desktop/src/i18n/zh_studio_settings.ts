// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
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
    scopeMenuTitle: '这些设置应用于'
  }
}
