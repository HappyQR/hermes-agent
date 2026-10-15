import { useStore } from '@nanostores/react'
import { type ReactNode, useMemo } from 'react'
import { useLocation } from 'react-router'

import { jobState } from '@/app/cron/job-state'
import { Codicon } from '@/components/ui/codicon'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
import { STUDIO_ICON_SHAPES } from '@/components/ui/studio-icon-shapes'
import { Tip, TipKeybindLabel } from '@/components/ui/tooltip'
import { ContribBoundary, ContribRender } from '@/contrib/react/boundary'
import { useContributions } from '@/contrib/react/use-contributions'
import { type Translations, useI18n } from '@/i18n'
import { useKeybindHint } from '@/lib/keybinds/use-keybind-hint'
import { cn } from '@/lib/utils'
import { $cronJobs } from '@/store/cron'
import { recordAction } from '@/store/desktop-metrics'
import { $interfaceMode, shownInMode } from '@/store/interface-mode'
import { openRouteTile } from '@/store/route-tiles'
import { applySidebarNavPrefs, SIDEBAR_NAV_PREFS_AREA } from '@/store/sidebar-nav'

import {
  type AppView,
  ARTIFACTS_ROUTE,
  CAPABILITIES_ROUTE,
  CRON_ROUTE,
  MESSAGING_ROUTE,
  SIDEBAR_NAV_AREA,
  type SidebarNavContribution,
  STARMAP_ROUTE
} from '../../../routes'
import type { SidebarNavItem } from '../../../types'
import { CONTEXT_SPLIT_KIT, SplitSubmenu } from '../split-submenu'

import { usePendingPairingCount } from './use-pending-pairing-count'

interface NavRowItem extends SidebarNavItem {
  /** Views (beyond `id`) that light this row up — Automations covers the cron
   *  and webhook views, Memory the star map, until those pages move. */
  views?: readonly string[]
  /** A contributed row's trailing count, mounted in its own error boundary. */
  contributedMeta?: SidebarNavContribution['meta']
}

// A row's `tier` is the one mode it belongs to; the list filters once.
// Prototype order: Capabilities · Messaging · Automations · Artifacts · Memory.
const SIDEBAR_NAV: NavRowItem[] = [
  {
    id: 'capabilities',
    label: '',
    icon: props => <StudioIcon name="cube" {...props} />,
    route: CAPABILITIES_ROUTE,
    keybindActionId: 'nav.capabilities'
  },
  {
    id: 'messaging',
    label: '',
    icon: props => <StudioIcon name="bubbles" {...props} />,
    route: MESSAGING_ROUTE,
    keybindActionId: 'nav.messaging'
  },
  // The id stays `cron` (tips, `sidebarNav.prefs`, the `nav.cron` keybind).
  {
    id: 'cron',
    label: '',
    icon: props => <StudioIcon name="clock" {...props} />,
    route: CRON_ROUTE,
    keybindActionId: 'nav.cron',
    views: ['cron', 'webhooks', 'automations']
  },
  // Artifacts are output of running Hermes the developer way.
  {
    id: 'artifacts',
    label: '',
    icon: props => <StudioIcon name="shapes" {...props} />,
    route: ARTIFACTS_ROUTE,
    keybindActionId: 'nav.artifacts',
    tier: 'advanced'
  },
  {
    id: 'memory',
    label: '',
    icon: props => <StudioIcon name="graph" {...props} />,
    route: STARMAP_ROUTE,
    views: ['starmap', 'memory']
  }
]

type SidebarCopy = Translations['sidebar']
type StudioCopy = Translations['studio']['sidebar']

function navLabel(item: SidebarNavItem, s: SidebarCopy, studio: StudioCopy): string {
  if (item.id === 'cron') {
    return studio.nav.automations
  }

  if (item.id === 'memory') {
    return studio.nav.memory
  }

  return (s.nav as Record<string, string | undefined>)[item.id] ?? item.label
}

/** Built-in rows + `sidebar.nav` contributions, through the mode filter and
 *  the `sidebarNav.prefs` arbitration (hide/order). */
function useNavItems(): NavRowItem[] {
  const contributions = useContributions(SIDEBAR_NAV_AREA)
  const navPrefs = useContributions(SIDEBAR_NAV_PREFS_AREA)
  const interfaceMode = useStore($interfaceMode)

  const contributed = useMemo<NavRowItem[]>(
    () =>
      contributions.flatMap(c => {
        const data = c.data as Partial<SidebarNavContribution> | undefined

        if (!data?.path?.startsWith('/') || !data.label) {
          return []
        }

        const codicon = data.codicon || 'plug'
        const studioIcon = data.studioIcon && data.studioIcon in STUDIO_ICON_SHAPES ? data.studioIcon : null

        return [
          {
            contributedMeta: data.meta,
            icon: (props: { className?: string }) =>
              studioIcon ? (
                <StudioIcon name={studioIcon as StudioIconName} {...props} />
              ) : (
                <Codicon name={codicon} {...props} />
              ),
            id: c.id,
            label: data.label,
            route: data.path,
            tier: data.tier
          }
        ]
      }),
    [contributions]
  )

  return useMemo(
    () => applySidebarNavPrefs([...SIDEBAR_NAV, ...contributed].filter(shownInMode(interfaceMode)), navPrefs),
    [contributed, interfaceMode, navPrefs]
  )
}

/** Automations' count: how many jobs, warn-toned when any is failing. */
function useCronMeta(studio: StudioCopy): { node: ReactNode; tip: string } | null {
  const jobs = useStore($cronJobs)

  if (!jobs.length) {
    return null
  }

  const failing = jobs.filter(job => jobState(job) === 'error').length

  return {
    node: failing ? <span className="text-(--ui-orange)">{jobs.length}</span> : jobs.length,
    tip: failing ? `${studio.nav.cronJobs(jobs.length)} · ${studio.nav.cronFailing(failing)}` : studio.nav.cronJobs(jobs.length)
  }
}

interface NavRowProps {
  active: boolean
  item: NavRowItem
  label: string
  meta?: { node: ReactNode; tip?: string } | null
  onNavigate: (item: SidebarNavItem) => void
  openLabel: string
  splitLabel: string
}

function NavRow({ active, item, label, meta, onNavigate, openLabel, splitLabel }: NavRowProps) {
  const ItemIcon = item.icon
  // Hover only teaches something when there is a shortcut to learn.
  const hint = useKeybindHint(item.keybindActionId ?? '')
  const showTip = Boolean(item.keybindActionId && hint)

  const button = (
    <button
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-7.5 w-full min-w-0 items-center gap-2 rounded-[7px] px-2 text-left text-[0.8125rem] text-(--ui-text-primary) transition-colors duration-[120ms] [-webkit-app-region:no-drag]',
        'hover:bg-(--ui-hover) aria-[current=page]:bg-(--ui-selected)'
      )}
      data-tip-region=""
      onClick={() => {
        if (item.keybindActionId) {
          recordAction(item.keybindActionId, 'click')
        }

        onNavigate(item)
      }}
      type="button"
    >
      <ItemIcon className="size-4 shrink-0 text-(--ui-accent) [&.codicon]:text-[1rem]" />
      {/* Shrink-to-fit: the label carries the row's `data-tour` handle, so a
          tip anchored to it lands at the end of the word. Its own
          `sidebar-nav-` namespace (the overlay nav owns `nav-<id>`). */}
      <span className="min-w-0 truncate" data-tip-arrow-only="" data-tour={`sidebar-nav-${item.id}`}>
        {label}
      </span>
      {meta?.node || item.contributedMeta ? (
        <span
          aria-hidden="true"
          className="ml-auto shrink-0 pl-1 text-[0.71875rem] tabular-nums text-(--ui-text-tertiary)"
          data-slot="sidebar-nav-meta"
        >
          {item.contributedMeta ? (
            <ContribBoundary id={item.id} variant="chip">
              <ContribRender render={item.contributedMeta} />
            </ContribBoundary>
          ) : meta?.tip ? (
            <Tip label={meta.tip} placement="row">
              <span>{meta.node}</span>
            </Tip>
          ) : (
            meta?.node
          )}
        </span>
      ) : null}
    </button>
  )

  // Radix triggers compose through asChild: Tip → ContextMenuTrigger → button.
  const trigger = <ContextMenuTrigger asChild>{button}</ContextMenuTrigger>

  return (
    <ContextMenu>
      {showTip ? (
        <Tip label={<TipKeybindLabel actionId={item.keybindActionId!} text={label} />} placement="row">
          {trigger}
        </Tip>
      ) : (
        trigger
      )}
      <ContextMenuContent aria-label={label}>
        <ContextMenuItem onSelect={() => onNavigate(item)}>
          <span>{openLabel}</span>
        </ContextMenuItem>
        {item.route ? (
          <>
            <ContextMenuSeparator />
            <SplitSubmenu
              kit={CONTEXT_SPLIT_KIT}
              label={splitLabel}
              onSplit={dir => item.route && openRouteTile(item.route, dir)}
            />
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  )
}

interface SidebarNavProps {
  currentView: AppView
  onNavigate: (item: SidebarNavItem) => void
}

/** The page rows at the top of the sidebar (prototype `.sb-nav`). */
export function SidebarNav({ currentView, onNavigate }: SidebarNavProps) {
  const { t } = useI18n()
  const s = t.sidebar
  const studio = t.studio.sidebar
  const { pathname } = useLocation()
  const items = useNavItems()
  const pendingPairing = usePendingPairingCount()
  const cronMeta = useCronMeta(studio)

  const metaFor = (item: NavRowItem) => {
    if (item.id === 'messaging' && pendingPairing > 0) {
      return { node: pendingPairing, tip: studio.nav.pendingPairing(pendingPairing) }
    }

    return item.id === 'cron' ? cronMeta : null
  }

  // Built-in rows light up for their views; contributed rows at their route.
  const isActive = (item: NavRowItem) =>
    SIDEBAR_NAV.includes(item)
      ? [item.id, ...(item.views ?? [])].includes(currentView)
      : currentView === 'extension' && Boolean(item.route) && pathname === item.route

  return (
    <nav aria-label={studio.nav.label} className="flex flex-col gap-px pb-2.5" data-slot="sidebar-nav">
      {items.map(item => (
        <NavRow
          active={isActive(item)}
          item={item}
          key={item.id}
          label={navLabel(item, s, studio)}
          meta={metaFor(item)}
          onNavigate={onNavigate}
          openLabel={studio.nav.open}
          splitLabel={s.row.openInSplit}
        />
      ))}
    </nav>
  )
}
