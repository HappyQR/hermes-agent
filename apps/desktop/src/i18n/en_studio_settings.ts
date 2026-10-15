// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
// Generated from one table (all 9 locales together); edit the table, not one file.
import type { StudioSettingsTranslations } from './types_studio_settings'

export const enStudioSettings: StudioSettingsTranslations = {
  searchPlaceholder: 'Search settings',
  pages: {
    general: {
      title: 'General',
      hero: 'Language, startup, tips and window behavior.'
    },
    appearance: {
      title: 'Appearance',
      hero: 'Color, themes, window glass, fonts and pets.'
    },
    chat: {
      title: 'Chat',
      hero: 'Reply style, and how thinking, tool calls and messages are shown.'
    },
    notifications: {
      title: 'Notifications',
      hero: 'What may interrupt you, and the sound when work finishes.'
    },
    keyboard: {
      title: 'Keyboard & Shortcuts',
      hero: 'Shortcuts, Quick Ask, the HUD gesture and window capture.'
    },
    models: {
      title: 'Models',
      hero: 'The default model, fallbacks, and the auxiliary models background tasks use.'
    },
    providers: {
      title: 'Accounts & Providers',
      hero: 'Signed-in accounts, API keys, custom endpoints and local models.'
    },
    memory: {
      title: 'Memory & Context',
      hero: 'What Hermes remembers, how much, and how long conversations are compressed.'
    },
    voice: {
      title: 'Voice',
      hero: 'Voice conversation, speech to text, reading aloud and the wake word.'
    },
    workspace: {
      title: 'Workspace',
      hero: 'Project folders, where commands run, and file checkpoints.'
    },
    safety: {
      title: 'Safety & Privacy',
      hero: 'Command approvals, privacy, the browser and private network access.'
    },
    passwords: {
      title: 'Passwords & Logins',
      hero: 'The credentials Hermes uses when it signs in to sites for you.'
    },
    tools: {
      title: 'Tools & Keys',
      hero: 'API keys for tool services and server environment variables.'
    },
    gateways: {
      title: 'Gateways & Connections',
      hero: 'Which Hermes this window connects to, and your saved connections.'
    },
    sessions: {
      title: 'Sessions & Archive',
      hero: 'Auto-archiving and archived sessions.'
    },
    plugins: {
      title: 'Plugins',
      hero: page => `Settings for installed plugins. Install and enable them in ${page} › Plugins.`
    },
    billing: {
      title: 'Billing',
      hero: 'Balance, plan, auto-refill and spending limits.'
    },
    advanced: {
      title: 'Advanced',
      hero: 'Agent steps, terminal backend, subagents and output limits. For people who know Hermes well.'
    },
    about: {
      title: 'About Hermes',
      hero: 'Version, updates, configuration backup and uninstall.'
    }
  },
  window: {
    navLabel: 'Settings categories',
    noResults: query => `No results for “${query}”`,
    categoryResult: 'Category',
    onlyThisMac: 'This Mac only',
    onlyThisDevice: 'This device only',
    appliesToProfile: profile => `Applies to “${profile}”`,
    appliesTo: 'Applies to',
    scopeMenuTitle: 'These settings apply to',
    searchResults: 'Search results',
    pageMenu: 'Settings page'
  },
  sections: {
    general: {
      language: 'Language & Startup',
      tips: 'Tips & Tutorials',
      system: 'Window & System'
    },
    appearance: {
      look: 'Appearance',
      theme: 'Themes',
      themeNote: 'Themes are saved per profile. You can also install one straight from the VS Code Marketplace.',
      window: 'Window',
      typography: 'Fonts & Scaling',
      pet: 'Pet'
    },
    chat: {
      replies: 'Replies',
      messages: 'Messages',
      media: 'Embeds & Attachments'
    },
    notifications: {
      alerts: 'Desktop Alerts',
      sounds: 'Sound & Haptics'
    },
    keyboard: {
      shortcuts: 'Shortcuts',
      shortcutsNote: 'Click a key combination to change it. Conflicts are flagged in the row.',
      quickAsk: 'Quick Ask',
      hud: 'HUD & Window Capture'
    },
    models: {
      main: 'Main Model',
      fallbacks: 'Fallback Models',
      fallbacksNote: 'Tried in order when the main model is unavailable or out of credits.',
      auxiliary: 'Auxiliary Models',
      auxiliaryDisclosure: 'Background tasks (vision, compression, title generation…)',
      moa: 'Mixture of Agents',
      moaDisclosure: 'Several models answer together, then an aggregator combines them (/moa)'
    },
    providers: {
      accounts: 'Accounts',
      apiKeys: 'API Keys',
      endpoints: 'Custom Endpoints',
      local: 'Local Models'
    },
    memory: {
      memory: 'Long-term Memory',
      context: 'Context & Compression',
      contextDisclosure: 'Compression details',
      maintenance: 'Maintenance'
    },
    voice: {
      conversation: 'Voice Conversation',
      stt: 'Speech to Text',
      tts: 'Read Aloud',
      wake: 'Wake Word'
    },
    workspace: {
      projects: 'Projects',
      execution: 'Execution',
      checkpoints: 'Checkpoints',
      checkpointsNote: 'Saved automatically before each file change, so you can use Restore checkpoint on a message.'
    },
    safety: {
      approvals: 'Command Approval',
      privacy: 'Privacy',
      browser: 'Browser & Network'
    },
    passwords: {
      credentials: 'Saved Credentials',
      credentialsNote: 'Used when Hermes signs in or fills in forms for you.',
      managers: 'Password Managers'
    },
    tools: {
      toolKeys: 'Tool Service Keys',
      serverEnv: 'Server Environment Variables',
      toolsets: 'Toolsets'
    },
    gateways: {
      connection: 'This Window Connects To',
      saved: 'Saved Connections',
      remoteUpdates: 'Remote Updates'
    },
    sessions: {
      retention: 'Archive & Retention',
      archived: 'Archived Sessions'
    },
    plugins: {
      pages: 'Plugin Settings',
      manage: 'Install & Enable'
    },
    advanced: {
      agent: 'Agent',
      terminal: 'Terminal Backend',
      subagents: 'Subagents',
      output: 'Output Limits',
      updates: 'In-App Updates'
    },
    about: {
      updates: 'Updates',
      config: 'Configuration',
      diagnostics: 'Diagnostics',
      uninstall: 'Uninstall'
    }
  },
  rows: {
    modeLight: 'Light',
    modeDark: 'Dark',
    modeAuto: 'Auto',
    modeGroup: 'Color mode',
    accentTitle: 'Accent color',
    accentDesc: 'The color of buttons, selections and links.',
    accentNous: 'Blue',
    accentHermes: 'Hermes Blue',
    accentViolet: 'Purple',
    accentPink: 'Pink',
    accentRed: 'Red',
    accentOrange: 'Orange',
    accentGreen: 'Green',
    accentMono: 'Graphite',
    thinkingTitle: 'Thinking',
    thinkingDesc: 'How the model’s reasoning appears in replies.',
    thinkingShow: 'Show',
    thinkingCollapse: 'Collapsed',
    thinkingHide: 'Hidden',
    timestampsTitle: 'Show timestamps',
    hapticsTitle: 'Haptic feedback',
    hapticsDesc: 'Haptic cues for drags and finished work. Turning it off also mutes the completion sound.',
    wakeTitle: 'Listen for the wake word',
    wakeDesc: 'Keeps listening in the background and starts a voice conversation when it hears the phrase.',
    wakePhrase: 'Wake phrase',
    memoryOpenTitle: 'View & edit',
    memoryOpenDesc: 'Browse the graph and the list on the Memory page.',
    memoryOpenAction: 'Open Memory',
    resetMemoryTitle: 'Reset memory',
    resetMemoryDesc: 'Clears MEMORY.md. This can’t be undone.',
    resetProfileTitle: 'Reset user profile',
    resetProfileDesc: 'Clears USER.md.',
    resetAction: 'Reset…',
    toolsetsTitle: 'Turn toolsets on or off',
    toolsetsDesc: page => `Managed in ${page} › Tools.`,
    openAction: 'Open',
    pluginsManageDesc: 'Install, update, enable and uninstall.',
    pluginsManageAction: 'Open Plugins',
    exportDesc: 'Saves hermes-config.json. Keys are not included.',
    exportAction: 'Export…',
    importAction: 'Import…',
    resetConfigDesc: 'Only affects the current profile. This device’s appearance settings stay as they are.',
    resetConfigAction: 'Reset…',
    diagnosticsTitle: 'Send diagnostics',
    diagnosticsDesc: 'Uploads redacted logs for support. You confirm before anything is sent, and the link expires.',
    diagnosticsAction: 'Send…',
    logsTitle: 'Logs folder',
    logsActionMac: 'Show in Finder',
    logsActionOther: 'Open folder',
    localModelsDesc: 'Download open models and run them on this computer.',
    localModelsAction: 'Manage local models…',
    sendTestAction: 'Send',
    themeMarketplaceTitle: 'Install from the VS Code Marketplace',
    noThemesMatch: query => `No installed themes match "${query}".`,
    activateKey: 'Activate',
    activatingKey: 'Activating…',
    apiKeyFallback: 'API key',
    pasteKeyPlaceholder: name => `Paste ${name}`,
    providerNeedsKey: provider => `${provider} needs an API key — set it up to choose a model.`,
    providerBrowserSignIn: provider => `${provider} signs in through your browser — Hermes runs the flow for you.`,
    addCredentialTitle: 'Add credential',
    addCredentialDesc: 'A login, payment card or address',
    addCredentialAction: 'Add…',
    resetShortcutsAction: 'Restore all defaults'
  }
}
