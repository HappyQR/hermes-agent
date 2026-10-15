import type { SettingsPageProps } from '../types'

import type { SettingsPageId } from './categories'
import { AboutPage } from './pages/about'
import { AdvancedPage } from './pages/advanced'
import { AppearancePage } from './pages/appearance'
import { BillingPage } from './pages/billing'
import { ChatPage } from './pages/chat'
import { GatewaysPage } from './pages/gateways'
import { GeneralPage } from './pages/general'
import { KeyboardPage } from './pages/keyboard'
import { MemoryPage } from './pages/memory'
import { ModelsPage } from './pages/models'
import { NotificationsPage } from './pages/notifications'
import { PasswordsPage } from './pages/passwords'
import { PluginsPage } from './pages/plugins'
import { ProvidersPage } from './pages/providers'
import { SafetyPage } from './pages/safety'
import { SessionsPage } from './pages/sessions'
import { ToolsPage } from './pages/tools'
import { VoicePage } from './pages/voice'
import { WorkspacePage } from './pages/workspace'
import type { SettingsWindowLocation } from './use-settings-location'

interface PageViewProps extends SettingsPageProps {
  location: SettingsWindowLocation
  page: SettingsPageId
}

/** One Settings window page: the composed sections for `page`. */
export function SettingsPageView({ location, onClose, onConfigSaved, onMainModelChanged, page }: PageViewProps) {
  const config = { onConfigSaved, onMainModelChanged }

  const pages: Record<SettingsPageId, () => React.ReactNode> = {
    about: () => <AboutPage {...config} />,
    advanced: () => <AdvancedPage {...config} />,
    appearance: () => <AppearancePage />,
    billing: () => <BillingPage location={location} />,
    chat: () => <ChatPage {...config} />,
    gateways: () => <GatewaysPage />,
    general: () => <GeneralPage />,
    keyboard: () => <KeyboardPage />,
    memory: () => <MemoryPage {...config} />,
    models: () => <ModelsPage location={location} {...config} />,
    notifications: () => <NotificationsPage />,
    passwords: () => <PasswordsPage />,
    plugins: () => <PluginsPage />,
    providers: () => <ProvidersPage location={location} onClose={onClose} {...config} />,
    safety: () => <SafetyPage {...config} />,
    sessions: () => <SessionsPage />,
    tools: () => <ToolsPage {...config} />,
    voice: () => <VoicePage {...config} />,
    workspace: () => <WorkspacePage {...config} />
  }

  return pages[page]()
}
