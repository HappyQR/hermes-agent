// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
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
    scopeMenuTitle: 'These settings apply to'
  }
}
