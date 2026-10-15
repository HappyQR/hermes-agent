import type * as React from 'react'
import { useNavigate } from 'react-router'

import { StudioPage } from '@/components/studio/pages/page'
import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SegmentedControl } from '@/components/ui/segmented-control'
import type { SessionInfo } from '@/hermes'
import { useI18n } from '@/i18n'
import { Plus } from '@/lib/icons'

import { CronView } from '../cron'
import { useRouteEnumParam } from '../hooks/use-route-enum-param'
import { MESSAGING_ROUTE, navigateToWorkspacePage } from '../routes'
import type { SetStatusbarItemGroup } from '../shell/statusbar-controls'
import { WebhooksView } from '../webhooks'

import { type AutomationCreateKind, requestAutomationCreate } from './requests'

// 自动化 — scheduled jobs, webhooks and blueprints on one page (prototype
// pages.js:195-272). The tabs are the existing views re-hosted: one CronView
// instance serves both Scheduled and Blueprints (so the editor sheet and the
// blueprint catalog survive the switch), WebhooksView keeps its profile-owned
// draft. `/cron` and `/webhooks` render this page on their tab.

export const AUTOMATION_TABS = ['cron', 'webhook', 'blueprints'] as const

export type AutomationTab = (typeof AUTOMATION_TABS)[number]

interface AutomationsViewProps extends React.ComponentProps<'section'> {
  /** The tab a bare route shows (`/webhooks` opens on Webhook). */
  defaultTab?: AutomationTab
  onOpenSession?: (sessionId: string, session?: SessionInfo) => void
  setStatusbarItemGroup?: SetStatusbarItemGroup
}

export function AutomationsView({
  defaultTab = 'cron',
  onOpenSession,
  setStatusbarItemGroup: _setStatusbarItemGroup,
  ...props
}: AutomationsViewProps) {
  const { t } = useI18n()
  const a = t.studio.pages.automations
  const navigate = useNavigate()
  const [tab, setTab] = useRouteEnumParam('tab', AUTOMATION_TABS, defaultTab)

  const startNew = (kind: AutomationCreateKind) => {
    requestAutomationCreate(kind)
    setTab(kind)
  }

  return (
    <StudioPage
      {...props}
      layout={tab === 'blueprints' ? 'scroll' : 'split'}
      subtitle={a.subtitle}
      title={a.title}
      tools={
        <>
          <SegmentedControl
            aria-label={a.tabsLabel}
            onChange={setTab}
            options={AUTOMATION_TABS.map(id => ({ id, label: a.tabs[id] }))}
            value={tab}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus />
                {a.newMenu}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem onSelect={() => startNew('cron')}>
                <Codicon name="watch" size="0.875rem" />
                {a.newJob}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => startNew('webhook')}>
                <Codicon name="globe" size="0.875rem" />
                {a.newHook}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    >
      {tab === 'webhook' ? (
        <WebhooksView
          onOpenReceiverSettings={() => navigateToWorkspacePage(navigate, `${MESSAGING_ROUTE}?platform=webhook`)}
        />
      ) : (
        <CronView onOpenSession={onOpenSession} section={tab === 'blueprints' ? 'blueprints' : 'jobs'} />
      )}
    </StudioPage>
  )
}
