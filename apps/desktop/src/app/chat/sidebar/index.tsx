import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useStore } from '@nanostores/react'
import type * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import { type SessionInfo } from '@/hermes'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { $activeConnectionId } from '@/store/connections'
import {
  $dismissedAutoProjectIds,
  $panesFlipped,
  $pinnedSessionIds,
  $sidebarCardRows,
  $sidebarFiltersActive,
  $sidebarGrouping,
  $sidebarOrdering,
  $sidebarPrDataWanted,
  $sidebarPrFilter,
  $sidebarProfileFilter,
  $sidebarProjectFilter,
  $sidebarProjectOrderIds,
  $sidebarSessionOrderIds,
  $sidebarSessionOrderManual,
  $sidebarShowAllSessions,
  $sidebarShowArchived,
  $sidebarStatusFilter,
  $sidebarWorkspaceOrderIds,
  $sidebarWorkspaceParentOrderIds,
  filterVisibleProjects,
  pinSession,
  setPinnedSessionOrder,
  setSidebarProjectOrderIds,
  setSidebarSessionOrderIds,
  setSidebarSessionOrderManual,
  setSidebarWorkspaceOrderIds,
  setSidebarWorkspaceParentOrderIds,
  SIDEBAR_SESSIONS_PAGE_SIZE,
  unpinSession
} from '@/store/layout'
import { notifyError } from '@/store/notifications'
import {
  $profiles,
  $profileScope,
  ALL_PROFILES,
  normalizeProfileKey,
  sidebarProfileForScope
} from '@/store/profile'
import { $projectScope, ALL_PROJECTS, exitProjectScope } from '@/store/project-scope'
import {
  $activeProjectId,
  $projectOwnerBySessionId,
  $projects,
  $projectTree,
  $projectTreeLoading,
  $reposScanning,
  enterProject,
  followEnteredProjectCwd,
  refreshProjects,
  refreshProjectTree,
  refreshWorktrees,
  scanAndRecordRepos
} from '@/store/projects'
import {
  $prBranchBySession,
  $pullRequestsByBranch,
  pullRequestBucket,
  recoverSessionPullRequests,
  refreshPullRequests,
  sessionPrKey
} from '@/store/pull-requests'
import {
  $cronSessions,
  $gatewayState,
  $messagingSessions,
  $sessionProfilesTruncated,
  $sessions,
  $sessionsLoadError,
  $sessionsLoading,
  sessionPinId
} from '@/store/session'
import { $sessionDotStateById, sessionStatusBucket } from '@/store/session-dot-state'
import { $focusedSessionIsTile, $focusedStoredSessionId } from '@/store/session-focus'
import { $unconfirmedPinWrites } from '@/store/session-pin-sync'
import { $removedSessionIds } from '@/store/session-removal'
import { $workingSessionIds } from '@/store/session-states'
import { markSessionUnread } from '@/store/session-unread-remote'
import { $archivedSessions, loadArchivedSessions } from '@/store/sidebar-archive'
import { $sidebarSessionRankIds } from '@/store/sidebar-sort'
import {
  $sidebarEffectiveGrouping,
  $sidebarSectionCollapsed,
  $sidebarSourceFilter,
  sidebarSectionCollapsed
} from '@/store/sidebar-studio'

import { type AppView } from '../../routes'
import type { SidebarNavItem } from '../../types'
import { type NewSessionSplitHandler } from '../new-session-drag'

import { useGatewaySessionGroups } from './gateway-group-model'
import { SidebarLoadMoreRow } from './load-more-row'
import { orderByIds, reconcileOrderIds, resolveManualSessionOrderIds, sameIds } from './order'
import { filterSessionsByProfileScope } from './profile-scope'
import { ProjectDialog } from './project-dialog'
import { filterToSessionBearingProjects, resolveLiveProjectFilter } from './project-filter'
import {
  excludeProjectSessions,
  orderProjectsByIds,
  overlayLiveLanes,
  overlayLivePreviews,
  PROJECT_PREVIEW_COUNT,
  projectTreeCwd,
  reconcileEnteredProjectSessions,
  sessionBucketId,
  sessionMatchesProjectFilter,
  type SidebarProjectTree,
  type SidebarWorkspaceTree,
  sortProjectsForOverview,
  useRepoWorktreeMap
} from './projects'
import { WorktreeDialog } from './projects/worktree-dialog'
import {
  SidebarLoadErrorState,
  SidebarSessionSkeletons,
  SidebarStorageCorruptNotice
} from './section-states'
import { buildSessionByAnyId, resolvePinnedSessions } from './session-index'
import { SidebarSessionsSection } from './sessions-section'
import { SidebarContributedSections } from './studio/contributed-sections'
import { $projectTreeSettled, $reposScanSettled, $sessionsSettled } from './studio/first-load'
import { flatListGrouping } from './studio/flat-groupings'
import { SidebarNav } from './studio/nav'
import { projectNewSessionPath } from './studio/project-row'
import { SidebarProjectsSection } from './studio/projects-section'
import { SidebarScopeChip } from './studio/scope-chip'
import { SidebarSearchButton } from './studio/search-button'
import { SidebarSectionHeader, useSidebarSection } from './studio/section-header'
import { mergeSessionPool } from './studio/session-pool'
import { compareSourceBuckets, sessionSourceBucket } from './studio/session-source'
import { SessionsAddButton } from './studio/sessions-add-button'
import { SessionsFilteredEmpty, SessionsQuietEmpty } from './studio/sessions-empty'
import { SidebarFooter } from './studio/sidebar-footer'
import { publishSidebarTopBarActions } from './studio/top-bar'
import { useMessagingPaging } from './studio/use-messaging-paging'
import { SidebarViewOptions } from './studio/view-options'
import { useEnteredProjectSessions } from './use-entered-project-sessions'

// How long after connecting to warm the project tree for someone who isn't in
// the grouped view. Long enough that the flat list — the thing actually on
// screen — has the connection to itself first.
const PROJECT_TREE_WARM_MS = 2_000

// Vertical scroll only — never a horizontal bar from glow bleed, long titles,
// etc. The bar itself only shows while the pointer is in the list.
const SCROLL_Y = 'overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-fade'

// The list reserves its bar's width whether or not one is showing, so filtering
// or collapsing a section doesn't reflow every row sideways.
const SCROLL_GUTTER = '[scrollbar-gutter:stable]'

interface ChatSidebarProps extends React.ComponentProps<typeof Sidebar> {
  currentView: AppView
  onNavigate: (item: SidebarNavItem) => void
  onLoadMoreSessions: () => Promise<void> | void
  onRetrySessions: () => Promise<void> | void
  onLoadMoreMessaging?: (platform: string) => Promise<void> | void
  onResumeSession: (sessionId: string, session?: SessionInfo) => void
  onDeleteSession: (sessionId: string) => void
  onArchiveSession: (sessionId: string) => void
  onBranchSession: (sessionId: string) => void
  onNewSessionInWorkspace: (path: null | string) => void
  /** Create a brand-new session and open it as a tile. `dir` is the dock edge
   *  (or `center` to stack a tab); `anchor`/`before` optionally pin it to a
   *  specific zone / tab-strip slot, and `cwd` pins it to a project's path —
   *  used by the new-session drags (the "New session" row and the project "+"
   *  buttons), which land a fresh session exactly where it's dropped. The
   *  context-menu "Open in split" path passes just a `dir`. */
  onNewSessionSplit: NewSessionSplitHandler
  // Cron jobs are managed on the Automations page now; kept on the props so
  // the controller's SidebarActions contract stays stable.
  onManageCronJob: (jobId: string) => void
  onTriggerCronJob: (jobId: string) => Promise<void>
}

export function ChatSidebar({
  currentView: routeView,
  onNavigate,
  onLoadMoreSessions,
  onRetrySessions,
  onLoadMoreMessaging,
  onResumeSession,
  onDeleteSession,
  onArchiveSession,
  onBranchSession,
  onNewSessionInWorkspace,
  onNewSessionSplit
}: ChatSidebarProps) {
  const { t } = useI18n()
  const s = t.sidebar

  // The titlebar band (studio/top-bar) mounts outside this component; hand it
  // the controller's new-session actions.
  useEffect(() => publishSidebarTopBarActions({ onNavigate, onNewSessionSplit }), [onNavigate, onNewSessionSplit])

  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const scrollElement = useCallback(() => scrollerRef.current, [])

  const panesFlipped = useStore($panesFlipped)
  const grouping = useStore($sidebarGrouping)
  const effectiveGrouping = useStore($sidebarEffectiveGrouping)
  const sourceFilter = useStore($sidebarSourceFilter)
  const ordering = useStore($sidebarOrdering)
  const statusFilter = useStore($sidebarStatusFilter)
  const persistedProjectFilter = useStore($sidebarProjectFilter)
  const profileFilter = useStore($sidebarProfileFilter)
  const prFilter = useStore($sidebarPrFilter)
  const prDataWanted = useStore($sidebarPrDataWanted)
  const prBranchOverrides = useStore($prBranchBySession)
  const pullRequests = useStore($pullRequestsByBranch)
  const filtersActive = useStore($sidebarFiltersActive)
  const showArchived = useStore($sidebarShowArchived)
  const cardRows = useStore($sidebarCardRows)
  const archivedSessions = useStore($archivedSessions)
  const dotStates = useStore($sessionDotStateById)
  // The active sort key as an id order. The flat list applies it within its
  // dividers; groups apply it to their own lanes.
  const sortOrderIds = useStore($sidebarSessionRankIds)
  const agentsGrouped = effectiveGrouping === 'project'
  const showAllSessions = useStore($sidebarShowAllSessions)
  const pinnedSessionIds = useStore($pinnedSessionIds)
  const unconfirmedPinWrites = useStore($unconfirmedPinWrites)
  const [pinsCollapsed, togglePins] = useSidebarSection('pinned')
  const projectsCollapsed = sidebarSectionCollapsed(useStore($sidebarSectionCollapsed), 'projects')
  const [sessionsCollapsed, toggleSessions] = useSidebarSection('sessions')
  // The sidebar highlight tracks the FOCUSED session — the interacted tile's
  // tab, else the main selection — so it stays 1:1 with whatever tab is active.
  const selectedSessionId = useStore($focusedStoredSessionId)
  const focusedSessionIsTile = useStore($focusedSessionIsTile)
  const currentView = focusedSessionIsTile ? 'chat' : routeView
  const sessions = useStore($sessions)
  const cronSessions = useStore($cronSessions)
  const messagingSessions = useStore($messagingSessions)
  const sessionsLoading = useStore($sessionsLoading)
  const sessionsLoadError = useStore($sessionsLoadError)
  const sessionProfilesTruncated = useStore($sessionProfilesTruncated)
  const profiles = useStore($profiles)
  const profileScope = useStore($profileScope)
  const activeConnectionId = useStore($activeConnectionId)

  // Toggle the persisted read-state watermark from a row menu. The row's own
  // `unread` prop mirrors what the dot paints; flip it and let the backend
  // become the truth (optimistic update + rollback in markSessionUnread).
  const toggleUnread = (storedId: string) => {
    const row = $sessions.get().find(r => r.id === storedId)

    if (!row) {
      return
    }

    markSessionUnread(storedId, row.unread !== true).catch(err => notifyError(err, s.row.unreadFailed))
  }

  // Only surface the profile switcher when more than one profile exists, so
  // single-profile users see the unchanged sidebar.
  const multiProfile = profiles.length > 1
  // Gate ALL-profiles grouping on multiProfile too: if a user drops back to one
  // profile while scope is still ALL (persisted), the rail is hidden and they'd
  // otherwise be stuck in the grouped view with no way out.
  const showAllProfiles = multiProfile && profileScope === ALL_PROFILES
  const messagingProfile = sidebarProfileForScope(profileScope)
  const agentOrderIds = useStore($sidebarSessionOrderIds)
  const agentOrderManual = useStore($sidebarSessionOrderManual)
  const workspaceOrderIds = useStore($sidebarWorkspaceOrderIds)
  const workspaceParentOrderIds = useStore($sidebarWorkspaceParentOrderIds)
  const projectOrderIds = useStore($sidebarProjectOrderIds)
  const projects = useStore($projects)
  const projectTree = useStore($projectTree)
  const projectOwners = useStore($projectOwnerBySessionId)

  // The persisted project filter's storage is shared across profiles, so ids
  // picked in another profile don't resolve in the active one and the raw
  // membership whitelist empties every tier of the sidebar (#96246). Narrow
  // to ids the ACTIVE tree resolves; dead ids are inert, not fatal.
  const projectFilter = useMemo(
    () => resolveLiveProjectFilter(persistedProjectFilter, projectTree),
    [persistedProjectFilter, projectTree]
  )

  const projectTreeLoading = useStore($projectTreeLoading)
  const removedSessionIds = useStore($removedSessionIds)
  const reposScanning = useStore($reposScanning)
  // Loading states show for each list's first fetch only (see first-load).
  const projectTreeSettled = useStore($projectTreeSettled)
  const reposScanSettled = useStore($reposScanSettled)
  const sessionsSettled = useStore($sessionsSettled)
  const activeProjectId = useStore($activeProjectId)
  const projectScope = useStore($projectScope)
  const gatewayState = useStore($gatewayState)
  const dismissedAutoProjects = useStore($dismissedAutoProjectIds)
  const [messagingLoadMorePending, setMessagingLoadMorePending] = useState<Record<string, boolean>>({})
  const [recentsLoadMorePending, setRecentsLoadMorePending] = useState(false)
  const activeSidebarSessionId = currentView === 'chat' ? selectedSessionId : null

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Profile scope = the "workspace switcher" context. Concrete scope shows only
  // that profile's sessions (clean rows, no per-row tags); ALL fans every
  // profile in. Grouped rendering stays gated on `showAllProfiles` (multi-profile
  // + ALL) so a single-profile user is never stranded in a grouped view with no
  // rail — but the *data* still has to fan in when the persisted scope is ALL
  // (Grouping → Profile). Filtering that pool against the `__all__` sentinel
  // matches nothing and empties recents + pins.
  const scopedSessions = useMemo(() => filterSessionsByProfileScope(sessions, profileScope), [sessions, profileScope])

  // Archived rows are excluded from the sessions query; "Show archived
  // sessions" fetches their own set and lists it inline (Studio).
  const archivedScoped = useMemo(
    () => (showArchived ? filterSessionsByProfileScope(archivedSessions, profileScope) : []),
    [archivedSessions, showArchived, profileScope]
  )

  // One predicate for the status/project filters, so the flat list and the
  // project lanes narrow by the same rule. A project lane holds rows the loaded
  // page may not, so it has to be answerable per session rather than by
  // membership in the filtered set. Detached rows file under the Home bucket id
  // (same rule as the overview overlay), so filtering to Home keeps Home's rows.
  const sessionMatchesFilters = useCallback(
    (session: SessionInfo) => {
      if (statusFilter.length && !statusFilter.includes(sessionStatusBucket(dotStates[session.id]))) {
        return false
      }

      // Narrowing to a few of the profiles on screen. Scoped to one profile the
      // list is already that profile's, so a stale selection can't blank it.
      if (showAllProfiles && profileFilter.length && !profileFilter.includes(normalizeProfileKey(session.profile))) {
        return false
      }

      if (prFilter.length) {
        const key = sessionPrKey(session)

        if (!prFilter.includes(pullRequestBucket(key ? pullRequests[key] : undefined))) {
          return false
        }
      }

      if (sourceFilter.length && !sourceFilter.includes(sessionSourceBucket(session))) {
        return false
      }

      // Same membership the sidebar groups and colors by (backend owner first,
      // cwd walk otherwise), so a filtered row lands in the lane the user
      // picked it from.
      return sessionMatchesProjectFilter(session, projectFilter, projects, projectOwners)
    },
    [
      statusFilter,
      projectFilter,
      profileFilter,
      showAllProfiles,
      prFilter,
      pullRequests,
      projects,
      projectOwners,
      sourceFilter,
      dotStates
    ]
  )

  const filtersNarrow =
    statusFilter.length > 0 ||
    projectFilter.length > 0 ||
    prFilter.length > 0 ||
    sourceFilter.length > 0 ||
    (showAllProfiles && profileFilter.length > 0)

  const visibleSessions = useMemo(
    () => (filtersNarrow ? scopedSessions.filter(sessionMatchesFilters) : scopedSessions),
    [scopedSessions, filtersNarrow, sessionMatchesFilters]
  )

  const visibleCronSessions = useMemo(
    () => filterSessionsByProfileScope(cronSessions, profileScope),
    [cronSessions, profileScope]
  )

  const visibleMessagingSessions = useMemo(
    () => filterSessionsByProfileScope(messagingSessions, profileScope),
    [messagingSessions, profileScope]
  )

  // Index sessions by every id a pin might be stored under — recents, cron,
  // AND messaging, since all three can be pinned (see session-index.ts).
  const sessionByAnyId = useMemo(
    () => buildSessionByAnyId(visibleSessions, visibleCronSessions, visibleMessagingSessions),
    [visibleSessions, visibleCronSessions, visibleMessagingSessions]
  )

  // Local pin ids first (hand-picked order), then server-flagged pins the
  // local set doesn't know about — a backend `pinned=1` row must never be
  // invisible just because localStorage is cold or was clobbered (#85969) —
  // minus the rows whose flag our own in-flight pin write already contradicts.
  const pinnedSessions = useMemo(
    () =>
      resolvePinnedSessions(
        pinnedSessionIds,
        sessionByAnyId,
        [...visibleSessions, ...cronSessions, ...messagingSessions],
        unconfirmedPinWrites
      ),
    [pinnedSessionIds, sessionByAnyId, visibleSessions, cronSessions, messagingSessions, unconfirmedPinWrites]
  )

  // Every id a pin is reachable under: the raw stored ids, plus BOTH identities
  // of each session we resolved one to. A pin is stored on the durable lineage
  // root, but the lists that must filter it out are fed from three independent
  // fetches (recents, the messaging slice, the backend project tree) and each
  // can surface the same conversation under either its live tip or its root.
  // Comparing one identity against the other is how a pinned session ended up
  // rendered twice — once in Pinned, once in its project group.
  const pinnedIdentitySet = useMemo(() => {
    const ids = new Set(pinnedSessionIds)

    for (const session of pinnedSessions) {
      ids.add(session.id)

      if (session._lineage_root_id) {
        ids.add(session._lineage_root_id)
      }
    }

    return ids
  }, [pinnedSessionIds, pinnedSessions])

  // A pinned session belongs to the Pinned section and nowhere else, so every
  // other list filters it out. Match on either identity the row carries — a
  // backend snapshot can surface either side of a compression tip rotation.
  const isPinnedSession = useCallback(
    (session: SessionInfo) =>
      pinnedIdentitySet.has(session.id) ||
      (session._lineage_root_id != null && pinnedIdentitySet.has(session._lineage_root_id)),
    [pinnedIdentitySet]
  )

  // What the project tree drops: pins (they live in their own section) plus
  // anything the active filters exclude, so filtering works the same whether
  // you're looking at the flat list or the lanes.
  const isHiddenFromProjects = useCallback(
    (session: SessionInfo) => isPinnedSession(session) || (filtersNarrow && !sessionMatchesFilters(session)),
    [isPinnedSession, filtersNarrow, sessionMatchesFilters]
  )

  // The Sessions list is ONE pool (Studio): local chats and messaging threads
  // side by side (each with its source chip), archived rows inline when shown,
  // narrowed by the filters and the project scope, by activity (last_active ||
  // started_at). Scheduled runs live on the Automations page. Ordering by
  // status doesn't sort here — it re-slots rows *inside* whatever dividers are
  // on, via sortOrderIds.
  const unpinnedAgentSessions = useMemo(
    () =>
      mergeSessionPool({
        archived: archivedScoped,
        isPinned: isPinnedSession,
        local: scopedSessions,
        matches: session =>
          (!filtersNarrow || sessionMatchesFilters(session)) &&
          (projectScope === ALL_PROJECTS || sessionMatchesProjectFilter(session, [projectScope], projects, projectOwners)),
        messaging: visibleMessagingSessions
      }),
    [
      archivedScoped,
      filtersNarrow,
      isPinnedSession,
      projectOwners,
      projectScope,
      projects,
      scopedSessions,
      sessionMatchesFilters,
      visibleMessagingSessions
    ]
  )

  // Source buckets present in the list — View options' source chips.
  const poolSources = useMemo(
    () => [...new Set([...scopedSessions, ...visibleMessagingSessions].map(sessionSourceBucket))].sort(compareSourceBuckets),
    [scopedSessions, visibleMessagingSessions]
  )

  useEffect(() => {
    const next = resolveManualSessionOrderIds(
      unpinnedAgentSessions.map(s => s.id),
      agentOrderIds,
      agentOrderManual
    )

    if (!next.length && agentOrderManual) {
      setSidebarSessionOrderManual(false)
    }

    if (!next.length && agentOrderIds.length) {
      setSidebarSessionOrderIds([])

      return
    }

    if (next.length && !sameIds(next, agentOrderIds)) {
      setSidebarSessionOrderIds(next)
    }
  }, [agentOrderIds, agentOrderManual, unpinnedAgentSessions])

  // Recents render in recency order. The hand-picked order is layered on per
  // date group inside the section (orderRowsWithinGroups) rather than baked
  // into the list here, so a drag ranks a row among its own day's chats
  // instead of flattening the whole sidebar into an undated manual mode.
  const agentSessions = unpinnedAgentSessions

  // Recents are local-only: messaging-platform sessions are fetched as their
  // own slice ($messagingSessions) and rendered in self-managed per-platform
  // sections below, so there is no source-grouping magic to untangle here.
  //
  // Workspace grouping is a `project -> repo -> lane -> sessions` tree computed
  // authoritatively on the backend (projects.tree). Parents reorder via
  // workspaceParentOrderIds; worktrees within a parent via workspaceOrderIds.
  const worktreeGroupingActive = agentsGrouped
  // The Projects section lists the tree whenever it is open, so the tree's
  // fetches follow it as well as the project grouping.
  const projectsWanted = worktreeGroupingActive || !projectsCollapsed
  const gatewayReady = gatewayState === 'open'

  // The backend project tree is a structural snapshot, NOT a per-message feed.
  // Refresh it on structural edges only — entering the grouped view, a profile
  // switch, gateway (re)connect — plus the once-per-run disk scan. Live session
  // changes between refreshes are reflected by the in-memory overlay
  // (overlayLiveLanes / overlayLivePreviews) off `$sessions`, so a turn
  // completing does NOT re-run the heavy list_sessions_rich scan. Project
  // mutations refresh the tree from their own store actions.
  useEffect(() => {
    if (!gatewayReady) {
      return
    }

    if (projectsWanted) {
      void refreshProjects()

      // The all-profiles tree is served off every profile's databases at once
      // and deliberately leaves discovery out — a repo with no sessions is the
      // same repo in every profile, so scanning here would multiply empty lanes
      // by the profile count and write the result into profiles the user isn't
      // driving.
      if (showAllProfiles) {
        void refreshProjectTree()

        return
      }

      // Paint the list from the fast tree fetch (explicit projects + repos from
      // existing sessions / the backend cache) FIRST, then kick off the heavy
      // home-dir git crawl so newly-discovered repos fold in afterward — instead
      // of the crawl blocking the first render.
      void refreshProjectTree().finally(() => void scanAndRecordRepos())

      return
    }

    // Flat view: warm the tree in the background anyway. Fetching it only on
    // the switch meant the first switch of every run paid for the whole round
    // trip behind a skeleton, and the menu's Project filter had nothing to
    // list until you'd visited the grouped view at least once.
    const warm = window.setTimeout(() => void refreshProjectTree(), PROJECT_TREE_WARM_MS)

    return () => window.clearTimeout(warm)
  }, [activeConnectionId, projectsWanted, showAllProfiles, profileScope, gatewayReady])

  // Widen the existing tree query when the user expands previews, without
  // repeating repo discovery. Initial load/scope changes use the effect above.
  useEffect(
    () =>
      $sidebarShowAllSessions.listen(() => {
        if (gatewayReady && worktreeGroupingActive) {
          void refreshProjectTree()
        }
      }),
    [gatewayReady, worktreeGroupingActive]
  )

  // Sessions the branch join can't answer for get one look at their own
  // transcript — a `gh pr create` in there names the PR outright. Backfills
  // whatever is loaded, whether or not the badge is on: gating it on the badge
  // meant switching PR on showed a half-empty list until a second pass caught
  // up. One request per batch of never-scanned rows, and the scanned set makes
  // that batch empty from the second pass on, so this settles to nothing.
  useEffect(() => {
    if (!gatewayReady) {
      return
    }

    const warm = window.setTimeout(() => void recoverSessionPullRequests(scopedSessions), PROJECT_TREE_WARM_MS)

    return () => window.clearTimeout(warm)
  }, [gatewayReady, scopedSessions])

  // PR state is only fetched for someone who asked to see it — the badge or the
  // filter — and it asks about the branches on screen, so the answer can't be
  // crowded out by a busy repo's newer PRs.
  const prLookupsByRepo = useMemo(() => {
    if (!prDataWanted) {
      return {}
    }

    const byRepo: Record<string, string[]> = {}

    for (const session of scopedSessions) {
      // The row's own key, so a session bound to a branch (or a PR number) it
      // was stamped with asks about THAT, not the branch it started on.
      const [root, lookup] = sessionPrKey(session)?.split('\n') ?? []

      if (root && lookup && !byRepo[root]?.includes(lookup)) {
        byRepo[root] = [...(byRepo[root] ?? []), lookup]
      }
    }

    return byRepo
    // prBranchOverrides is what `sessionPrKey` reads through — a recovered PR
    // has to re-ask with the key it just learned.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prDataWanted, scopedSessions, prBranchOverrides])

  // A stable identity for "the same question as last time", so a re-render that
  // rebuilds the map doesn't re-ask GitHub.
  const prQueryKey = JSON.stringify(
    Object.entries(prLookupsByRepo)
      .map(([root, lookups]) => [root, [...lookups].sort()] as const)
      .sort(([a], [b]) => a.localeCompare(b))
  )

  useEffect(() => {
    if (prQueryKey === '[]') {
      return
    }

    const byRepo = Object.fromEntries(JSON.parse(prQueryKey) as [string, string[]][])

    void refreshPullRequests(byRepo)

    // A PR opens, merges or gets closed on github.com, not in here — so like
    // the project tree, re-pull when the window comes back. The store's own
    // staleness window keeps a flurry of focus events to one call per repo.
    const onActive = () => {
      if (document.visibilityState !== 'hidden') {
        void refreshPullRequests(byRepo)
      }
    }

    window.addEventListener('focus', onActive)
    document.addEventListener('visibilitychange', onActive)

    return () => {
      window.removeEventListener('focus', onActive)
      document.removeEventListener('visibilitychange', onActive)
    }
  }, [prQueryKey])

  // Out-of-band repo changes (a `git init` / `rm -rf` in another terminal) emit
  // no git events, so — like every git GUI — re-pull on window focus / tab
  // visibility instead of stranding the tree until a hard reload. The tree
  // fetch is cheap and runs every focus (picks up explicit create/delete +
  // session regrouping); the heavy disk crawl that surfaces brand-new repos is
  // throttled. Agent-driven changes already refresh via $workspaceChangeTick.
  useEffect(() => {
    if (!projectsWanted || !gatewayReady) {
      return
    }

    let lastScanAt = 0
    const SCAN_THROTTLE_MS = 30_000

    const onActive = () => {
      if (document.visibilityState === 'hidden') {
        return
      }

      void refreshProjects()
      void refreshProjectTree()

      // Discovery stays off while browsing every profile, for the reason the
      // first fetch leaves it out.
      if (showAllProfiles) {
        return
      }

      const now = Date.now()

      if (now - lastScanAt >= SCAN_THROTTLE_MS) {
        lastScanAt = now
        void scanAndRecordRepos(true)
      }
    }

    window.addEventListener('focus', onActive)
    document.addEventListener('visibilitychange', onActive)

    return () => {
      window.removeEventListener('focus', onActive)
      document.removeEventListener('visibilitychange', onActive)
    }
  }, [projectsWanted, showAllProfiles, gatewayReady])

  // Apply the persisted repo + worktree orders to a project's repo subtrees.
  const orderRepos = useCallback(
    (repos: SidebarWorkspaceTree[]): SidebarWorkspaceTree[] =>
      orderByIds(repos, parent => parent.id, workspaceParentOrderIds).map(parent => ({
        ...parent,
        groups: orderByIds(parent.groups, group => group.id, workspaceOrderIds)
      })),
    [workspaceParentOrderIds, workspaceOrderIds]
  )

  // ── Projects: the single top-level model (authoritative, from the backend) ──
  // `projects.tree` already unifies explicit projects + auto repos and folds
  // linked worktrees under their main repo. The desktop only layers local view
  // state on top: dismissed auto-projects, persisted repo/lane order, and the
  // overview sort. Membership is the backend tree's — never re-derived here.
  const projectModel = useMemo<SidebarProjectTree[]>(() => {
    const sorted = sortProjectsForOverview(
      filterToSessionBearingProjects(filterVisibleProjects(projectTree, dismissedAutoProjects))
        // A filtered-out project drops its whole lane, header included — hiding
        // only its rows would leave a row of empty folders behind.
        .filter(project => !projectFilter.length || projectFilter.includes(project.id))
        .map(project =>
          excludeProjectSessions(
            {
              ...project,
              // Home is synthetic, so its name is ours to translate — every
              // other label is a repo basename or a name the user typed.
              label: project.isNoProject ? s.projects.home : project.label,
              repos: orderRepos(project.repos)
            },
            isHiddenFromProjects
          )
        ),
      activeProjectId
    )

    // Layer the user's manual drag-order on top of the deterministic sort. Empty
    // (default) returns `sorted` untouched; projects the user hasn't ordered yet
    // keep their sorted position rather than jumping the hand-picked list.
    // Deduplicate by id — safety net for backend merge edge cases
    // (e.g. Windows path-casing differences across profiles).
    const seen = new Set<string>()

    const deduped = sorted.filter(project => {
      if (seen.has(project.id)) {
        return false
      }

      seen.add(project.id)

      return true
    })

    return orderProjectsByIds(deduped, projectOrderIds)
  }, [
    projectTree,
    dismissedAutoProjects,
    orderRepos,
    activeProjectId,
    projectFilter,
    projectOrderIds,
    isHiddenFromProjects,
    s
  ])

  // The overview only renders in grouped mode; the model stays live regardless
  // so scoping is consistent across views.
  const agentProjectTree = worktreeGroupingActive ? projectModel : undefined

  // ── Project switcher (drill-in) ────────────────────────────────────────────
  // Grouped, single-profile view is a project switcher: ALL_PROJECTS shows the
  // overview (a list you click into); a concrete scope means you've "entered" a
  // project, so the Sessions list shows ONLY that project's worktrees/sessions.
  const projectsActive = Boolean(agentProjectTree?.length)

  // The overview node for the entered project (structure + counts, empty lanes).
  const overviewEnteredProject =
    projectsActive && projectScope !== ALL_PROJECTS
      ? agentProjectTree?.find(node => node.id === projectScope)
      : undefined

  const inProject = Boolean(overviewEnteredProject)
  const enteredProjectId = overviewEnteredProject?.id

  // Entering a project lazily hydrates its full lanes (repo -> lane -> sessions)
  // from the backend — same grouping/ids as the overview, just with rows.
  const {
    project: enteredProjectTree,
    failed: projectLoadFailed,
    loading: projectLoading,
    retry: retryProject
  } = useEnteredProjectSessions(enteredProjectId, gatewayReady, projectTree, `${activeConnectionId}:${profileScope}`)

  // Prefer the hydrated tree; fall back to the overview node (empty lanes) while
  // the drill-in fetch is in flight, so the header/structure render immediately.
  const enteredProject = useMemo<SidebarProjectTree | undefined>(() => {
    if (!overviewEnteredProject) {
      return undefined
    }

    const hydrated =
      enteredProjectTree && enteredProjectTree.id === overviewEnteredProject.id
        ? enteredProjectTree
        : overviewEnteredProject

    // The live-session overlay (creates/evictions) is applied per-repo in
    // RepoFlatSection, AFTER the visual git-worktree lanes are merged in (so
    // out-of-tree worktrees can be placed). Here we just order the snapshot and
    // drop pinned rows — the hydrated lanes come straight from the backend, so
    // they haven't been through projectModel's filter.
    // The label comes from the overview node either way — that's the model's
    // presentation copy (Home is translated there), not the raw payload's.
    return excludeProjectSessions(
      { ...hydrated, label: overviewEnteredProject.label, repos: orderRepos(hydrated.repos) },
      isHiddenFromProjects
    )
  }, [overviewEnteredProject, enteredProjectTree, orderRepos, isHiddenFromProjects])

  const enteredProjectOverlaySessions = useMemo(
    () => reconcileEnteredProjectSessions(agentSessions, overviewEnteredProject?.previewSessions),
    [agentSessions, overviewEnteredProject?.previewSessions]
  )

  // Overlay live `$sessions` onto the entered project so a just-created session
  // (which the backend snapshot hasn't folded in yet) counts as content and
  // renders immediately. Also carry over the overview's current preview rows:
  // its project tree and the separately hydrated drill-in can resolve at
  // different times, but a row visible in the overview must not disappear on
  // entry. The backend seeds each project folder as an (empty) repo, so the
  // overlay always has a lane to place a missing in-project session into.
  const enteredProjectContent = useMemo(
    () =>
      enteredProject
        ? overlayLiveLanes(enteredProject, enteredProjectOverlaySessions, removedSessionIds, projectOwners)
        : undefined,
    [enteredProject, enteredProjectOverlaySessions, removedSessionIds, projectOwners]
  )

  const scopedRepoPaths = useMemo(
    () =>
      enteredProject ? enteredProject.repos.map(repo => repo.path).filter((path): path is string => Boolean(path)) : [],
    [enteredProject]
  )

  // git worktree list is a VISUAL-only enhancer (empty lanes); never membership.
  const inEnteredProject = Boolean(enteredProject && !showAllProfiles)
  const [scopedRepoWorktrees] = useRepoWorktreeMap(scopedRepoPaths, inEnteredProject)

  // Re-probe worktree lanes on out-of-band git changes the renderer can't see.
  // A turn can `git worktree add/remove` in the terminal (e.g. you ask Hermes to
  // "remove that worktree"), and the window never blurs during an in-app chat,
  // so nothing would otherwise re-run the visual probe. Re-sync when a working
  // session settles (its turn finished) or the window refocuses (an external
  // terminal may have changed things) — only while a project is entered, and
  // only the cheap per-repo `git worktree list`, never the heavy tree scan.
  //
  // Listened to rather than rendered from: a settling turn is a side effect,
  // and reading it with `useStore` repainted this whole component — every
  // section, every row — on each status edge, to run an effect that touches no
  // markup. The rows subscribe to their own status, so nothing above them needs
  // to re-render for one of them to change color.
  useEffect(() => {
    if (!inEnteredProject) {
      return
    }

    let previous = $workingSessionIds.get()

    return $workingSessionIds.listen(working => {
      // A session leaving the working set means its turn just completed.
      const aTurnSettled = previous.some(id => !working.includes(id))

      previous = working

      if (aTurnSettled) {
        refreshWorktrees()
      }
    })
  }, [inEnteredProject])

  useEffect(() => {
    if (!inEnteredProject) {
      return
    }

    const onFocus = () => refreshWorktrees()
    window.addEventListener('focus', onFocus)

    return () => window.removeEventListener('focus', onFocus)
  }, [inEnteredProject])

  const lastProjectCwdSyncRef = useRef<null | string>(null)

  const syncProjectCwd = useCallback((project: SidebarProjectTree) => {
    const target = projectTreeCwd(project)

    if (target) {
      followEnteredProjectCwd(target)
    }
  }, [])

  // The project the Sessions list is scoped to (Studio: in every grouping).
  const scopedProject = useMemo(
    () => (projectScope === ALL_PROJECTS ? undefined : projectModel.find(node => node.id === projectScope)),
    [projectModel, projectScope]
  )

  // eslint-disable-next-line no-restricted-syntax -- legitimate non-atom ref write (see eslint rule comment)
  useEffect(() => {
    if (!scopedProject) {
      lastProjectCwdSyncRef.current = null

      return
    }

    if (lastProjectCwdSyncRef.current === scopedProject.id) {
      return
    }

    syncProjectCwd(scopedProject)
    lastProjectCwdSyncRef.current = scopedProject.id
  }, [scopedProject, syncProjectCwd])

  // A persisted scope can go stale (project archived/removed, or a profile
  // switch swapped the whole catalog). Once projects have loaded, drop the
  // scope if the scoped id is gone.
  useEffect(() => {
    const gone = projectsActive
      ? !enteredProject
      : projectTree.length > 0 && !projectTree.some(node => node.id === projectScope)

    if (projectScope !== ALL_PROJECTS && gone) {
      exitProjectScope()
    }
  }, [projectScope, projectsActive, enteredProject, projectTree])

  // The project overview (drill-in list) vs. the entered project's content.
  const projectOverview = projectsActive && !inProject ? agentProjectTree : undefined

  // Preview rows come from the backend tree (each project carries its
  // most-recent sessions), overlaid with live $sessions so a just-created
  // session shows under its project instantly (and with its working arc),
  // matching the flat Recents list. Keyed by project id for the rows.
  const overviewPreviews = useMemo<Record<string, SessionInfo[]>>(
    () =>
      overlayLivePreviews(
        projectOverview ?? [],
        agentSessions,
        projects,
        showAllSessions ? Infinity : PROJECT_PREVIEW_COUNT,
        {
          removed: removedSessionIds,
          // Rank before the trim, so "3 priciest in this project" isn't "3 most
          // recent, priciest first".
          rankIds: sortOrderIds
        }
      ),
    [projectOverview, agentSessions, projects, removedSessionIds, sortOrderIds, showAllSessions]
  )

  // A row's "Show all" hydrates raw backend lanes, which — like the drill-in —
  // must go through the same exclusion as the previews above (pins, filter
  // misses, optimistic removals), or a pinned chat renders twice and a
  // just-deleted one comes back. The per-project count of loaded sessions
  // that exclusion hides also corrects the backend's `sessionCount` in the
  // "Show all N" label (a pin is always loaded — it renders in Pinned).
  const overviewHidden = useMemo(() => {
    const isHidden = (session: SessionInfo) => isHiddenFromProjects(session) || removedSessionIds.has(session.id)
    const counts: Record<string, number> = {}

    for (const session of sessions) {
      const projectId = isHidden(session) ? sessionBucketId(session, projects, projectOwners) : null

      if (projectId) {
        counts[projectId] = (counts[projectId] ?? 0) + 1
      }
    }

    return { isHidden, counts }
  }, [sessions, projects, projectOwners, isHiddenFromProjects, removedSessionIds])

  const onEnterProject = useCallback(
    (id: string) => {
      const project = projectModel.find(node => node.id === id)

      if (project) {
        syncProjectCwd(project)
      }

      enterProject(id)
    },
    [projectModel, syncProjectCwd]
  )

  // Scope the Sessions list to a project from the Projects section, or clear it.
  const selectScope = useCallback(
    (id: null | string) => (id ? onEnterProject(id) : exitProjectScope()),
    [onEnterProject]
  )

  // Real projects (the synthetic Home bucket is not one) for the Projects section.
  const sectionProjects = useMemo(() => projectModel.filter(node => !node.isNoProject), [projectModel])

  // Mirror the section's skeleton gate (projectsLoading + nothing to show yet):
  // while the skeleton is up there's no point also spinning the header count.
  const projectsSkeletonVisible =
    worktreeGroupingActive &&
    projectTreeLoading &&
    !projectTreeSettled &&
    !projectOverview?.length &&
    !(inProject && (enteredProject?.sessionCount ?? 0) > 0)

  const runKeyedLoad = useCallback(
    (
      key: string,
      load: ((key: string) => Promise<void> | void) | undefined,
      setPending: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
    ) => {
      if (!load) {
        return
      }

      setPending(prev => ({ ...prev, [key]: true }))

      void Promise.resolve(load(key))
        .catch(() => undefined)
        .finally(() => setPending(({ [key]: _done, ...rest }) => rest))
    },
    []
  )

  const loadMoreForMessaging = useCallback(
    (platform: string) => runKeyedLoad(platform, onLoadMoreMessaging, setMessagingLoadMorePending),
    [onLoadMoreMessaging, runKeyedLoad]
  )

  // Messaging threads live in the one Sessions list now; each platform still
  // pages its own older threads, alongside the local recents.
  const messagingPaging = useMessagingPaging(visibleMessagingSessions, messagingProfile, isPinnedSession)
  const hasMoreMessaging = messagingPaging.some(page => page.hasMore)

  // Every row — local, messaging, scheduled — files under its owner
  // ([connectionId, profile]) when grouped by gateway and profile.
  const ownerGrouped = profileScope === ALL_PROFILES && grouping === 'profile'
  const profileGroups = useGatewaySessionGroups(agentSessions, ownerGrouped)

  // The flat Sessions list always shows ALL recent sessions; Projects is a
  // parallel grouped view, not a filter on this one — nothing is hidden here.
  const displayAgentSessions = agentSessions

  // Pagination is scope-aware. In "All profiles" mode it tracks the global
  // unified set; scoped to one profile it tracks that profile's own truncation
  // flag — otherwise a huge default profile keeps "Load more" stuck on while
  // you browse a small one. The backend reports whether its page was capped
  // rather than an exact count, so no COUNT(*) runs per refresh.
  const loadedSessionCount = showAllProfiles ? sessions.length : scopedSessions.length

  // The archived view is its own (single, capped) query — paging the live
  // sessions list from under it would just fold un-archived rows back in.
  const hasMoreSessions =
    (showAllProfiles
      ? Object.values(sessionProfilesTruncated).some(Boolean)
      : Boolean(sessionProfilesTruncated[profileScope]))

  const displayRecentsCountRef = useRef(0)
  const loadedRecentsCountRef = useRef(0)
  displayRecentsCountRef.current = displayAgentSessions.length
  loadedRecentsCountRef.current = loadedSessionCount

  const onLoadMoreRecents = useCallback(async () => {
    if (recentsLoadMorePending) {
      return
    }

    setRecentsLoadMorePending(true)

    try {
      const startVisible = displayRecentsCountRef.current
      const targetVisible = startVisible + SIDEBAR_SESSIONS_PAGE_SIZE
      let lastLoaded = loadedRecentsCountRef.current

      // Project-less recents can be sparse in the global recent stream (because
      // project-scoped sessions are filtered out in the UI). Keep paging until
      // we actually reveal a full page of visible rows, or the backend window
      // stops growing.
      for (let attempt = 0; attempt < 6; attempt += 1) {
        await Promise.resolve(onLoadMoreSessions())
        await new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()))

        const visibleNow = displayRecentsCountRef.current
        const loadedNow = loadedRecentsCountRef.current

        if (visibleNow >= targetVisible) {
          break
        }

        if (loadedNow <= lastLoaded) {
          break
        }

        lastLoaded = loadedNow
      }
    } finally {
      setRecentsLoadMorePending(false)
    }
  }, [onLoadMoreSessions, recentsLoadMorePending])

  // One pager for the one list: the next page of local recents and of every
  // messaging platform that still has older threads.
  const loadMoreList = useCallback(() => {
    if (hasMoreSessions) {
      void onLoadMoreRecents()
    }

    for (const page of messagingPaging) {
      if (page.hasMore) {
        loadMoreForMessaging(page.sourceId)
      }
    }
  }, [hasMoreSessions, loadMoreForMessaging, messagingPaging, onLoadMoreRecents])

  // Archived rows are excluded from the sessions query, so the view has to
  // fetch its own set.
  useEffect(() => {
    if (showArchived) {
      void loadArchivedSessions()
    }
  }, [showArchived])

  // Ranking by size is a question about the whole list ("what did I burn money
  // on"), so it drops the calendar dividers and ranks globally — "Today" above
  // the priciest session you have ever had would be a lie. Time- and
  // state-based keys stay bucketed, where they read correctly per day.
  const rankedGlobally = ordering === 'cost' || ordering === 'tokens'

  const displayAgentGroups = profileGroups

  // The recents list owns its own (virtualized) scroll container only when it's a
  // long flat list. In that case it must keep its scroller even in short mode, so
  // we don't flatten it (flattening would defeat virtualization). Short flat lists
  // and grouped views (profile groups or the worktree tree) flatten into the
  // single outer scroll instead.
  // Whichever grouping is active, the flat set of repo subtrees on screen — the
  // single source for reconciling repo/worktree order, whether repos hang off
  // the bare tree or are nested under projects.
  const activeRepoTrees = useMemo<SidebarWorkspaceTree[]>(
    () => (agentProjectTree ? agentProjectTree.flatMap(project => project.repos) : []),
    [agentProjectTree]
  )

  // Keep the persisted parent + worktree orders reconciled with what's on screen:
  // freshly-seen repos/worktrees surface at the top, vanished ones drop out of
  // the saved order.
  useEffect(() => {
    if (!activeRepoTrees.length) {
      return
    }

    const nextParents = reconcileOrderIds(
      activeRepoTrees.map(parent => parent.id),
      workspaceParentOrderIds
    )

    if (!sameIds(nextParents, workspaceParentOrderIds)) {
      setSidebarWorkspaceParentOrderIds(nextParents)
    }

    const nextWorktrees = reconcileOrderIds(
      activeRepoTrees.flatMap(parent => parent.groups.map(group => group.id)),
      workspaceOrderIds
    )

    if (!sameIds(nextWorktrees, workspaceOrderIds)) {
      setSidebarWorkspaceOrderIds(nextWorktrees)
    }
  }, [activeRepoTrees, workspaceParentOrderIds, workspaceOrderIds])

  // Skeletons mean "still loading", so they key off the UNFILTERED set. Keyed
  // off the filtered one, a filter that matches nothing showed skeletons on
  // every background refresh instead of the empty state. Likewise only the
  // first load: an empty list's background refreshes keep its empty state.
  const showSessionSkeletons = sessionsLoading && !sessionsSettled && scopedSessions.length === 0
  const studioFiltersActive = filtersActive || sourceFilter.length > 0

  // The sidebar's session-area mode — exposed as data-attributes so custom
  // skins can target project mode (overview vs. entered), archived, or search
  // without relying on internal class names. `data-sessions-project` carries
  // the entered project's id for per-project targeting.
  const sessionsMode: 'archived' | 'flat' | 'project' | 'projects' = showArchived
    ? 'archived'
    : inProject
      ? 'project'
      : worktreeGroupingActive
        ? 'projects'
        : 'flat'

  // Each reorderable list reports its OWN new id order; persisting is a direct,
  // typed write — no id-prefix sniffing to figure out which level moved.
  const reorderSessions = (ids: string[]) => {
    setSidebarSessionOrderManual(true)
    setSidebarSessionOrderIds(ids)
  }

  // Persist the new project overview order (drag-to-reorder); orderByIds applies
  // it over the default sort, so stale/new ids reconcile on the next render.
  const reorderProjects = (ids: string[]) => setSidebarProjectOrderIds(ids)

  // Sortable rows carry live session ids; the pinned store is keyed by durable
  // (lineage-root) ids, so translate before persisting the new order.
  const reorderPinned = (ids: string[]) =>
    setPinnedSessionOrder(
      ids.map(id => {
        const session = sessionByAnyId.get(id)

        return session ? sessionPinId(session) : id
      })
    )

  return (
    <Sidebar
      className={cn(
        // Visibility is the layout tree's job (a hidden zone is display:none;
        // the narrow overlay renders the live instance) — the sidebar always
        // paints itself fully.
        'relative h-full min-w-0 overflow-hidden border-t-0 border-b-0 text-foreground transition-none',
        panesFlipped ? 'border-l border-r-0' : 'border-r border-l-0',
        'border-(--sidebar-edge-border) bg-(--ui-sidebar-surface-background) opacity-100'
      )}
      collapsible="none"
      data-tip-region=""
      data-tour="sessions-sidebar"
    >
      <SidebarContent className="gap-0 overflow-hidden bg-transparent pt-1.5">
        <SidebarSearchButton />
        <SidebarStorageCorruptNotice />
        {/* ONE scroller for nav and every section (prototype .sb-scroll); the
            long session list virtualizes against it. */}
        <div className={cn('min-h-0 flex-1', SCROLL_Y, SCROLL_GUTTER)} data-slot="sidebar-scroll" ref={scrollerRef}>
          <div className="flex min-h-full flex-col px-2.5 pb-2.5">
            <SidebarNav currentView={currentView} onNavigate={onNavigate} />

            <SidebarProjectsSection
              activeProjectId={activeProjectId}
              dndSensors={dndSensors}
              loading={projectTreeLoading && !projectTreeSettled}
              onNewSessionInWorkspace={onNewSessionInWorkspace}
              onNewSessionSplit={onNewSessionSplit}
              onReorder={showAllProfiles ? undefined : reorderProjects}
              onSelectScope={selectScope}
              projects={sectionProjects}
              scanning={reposScanning && !reposScanSettled}
              scopedProjectId={scopedProject?.id ?? null}
            />

            {/* The session area (Pinned + Sessions). Scoped into a project
                grouping, the whole area is that project's drop target. */}
            <div
              className="flex flex-col"
              data-sessions-mode={sessionsMode}
              data-sessions-project={inProject ? (enteredProjectId ?? undefined) : undefined}
            >
                {pinnedSessions.length > 0 && (
                  <SidebarSessionsSection
                    activeSessionId={activeSidebarSessionId}
                    // Inbox style rides whichever view is active — pinned rows
                    // included, so one column never mixes card and inline
                    // geometry at the section boundary.
                    card={cardRows}
                    contentClassName="flex flex-col gap-px"
                    dndSensors={dndSensors}
                    emptyState={null}
                    header={
                      <SidebarSectionHeader
                        collapsed={pinsCollapsed}
                        count={pinnedSessions.length}
                        onToggle={togglePins}
                        title={s.pinned}
                      />
                    }
                    label={s.pinned}
                    onArchiveSession={onArchiveSession}
                    onBranchSession={onBranchSession}
                    onDeleteSession={onDeleteSession}
                    onReorderSessions={reorderPinned}
                    onResumeSession={onResumeSession}
                    onToggle={togglePins}
                    onTogglePin={unpinSession}
                    onToggleUnread={toggleUnread}
                    open={!pinsCollapsed}
                    pinned
                    rootClassName="mt-1.5 p-0"
                    sessions={pinnedSessions}
                    showProfileTags={showAllProfiles}
                    sortable={pinnedSessions.length > 1}
                  />
                )}

                {inProject && projectLoadFailed && <SidebarLoadErrorState onRetry={retryProject} />}
                <SidebarSessionsSection
                  activeProjectId={activeProjectId}
                  activeSessionId={activeSidebarSessionId}
                  // Inbox style is a render variant, not a grouping — it rides
                  // whichever view is active: flat recents, project lanes, and
                  // the overview previews all render the same card.
                  card={cardRows}
                  contentClassName="flex flex-col gap-px"
                  dndSensors={dndSensors}
                  emptyState={
                    inProject && projectLoadFailed ? null : showSessionSkeletons || (inProject && projectLoading) ? (
                      <SidebarSessionSkeletons />
                    ) : !inProject && sessionsLoadError ? (
                      <SidebarLoadErrorState onRetry={() => void onRetrySessions()} />
                    ) : studioFiltersActive && !inProject ? (
                      <SessionsFilteredEmpty />
                    ) : (
                      <SessionsQuietEmpty
                        text={inProject ? s.projectEmpty : pinnedSessions.length > 0 ? s.allPinned : s.noSessions}
                      />
                    )
                  }
                  footer={
                    // Hidden only when workspace-grouped — those groups page
                    // themselves. Profile groups don't: this one footer fetches the
                    // next page, which grows every profile at once.
                    !agentsGrouped && !showSessionSkeletons && (hasMoreSessions || hasMoreMessaging) ? (
                      <SidebarLoadMoreRow
                        loading={
                          sessionsLoading ||
                          recentsLoadMorePending ||
                          Object.keys(messagingLoadMorePending).length > 0
                        }
                        onClick={loadMoreList}
                        // Recents are post-filtered to non-project sessions, so a
                        // backend page size (50) is not a truthful "rows you'll
                        // see" count. Use the generic label instead of a fake N.
                        step={0}
                      />
                    ) : null
                  }
                  forceEmptyState={showSessionSkeletons}
                  // Archived is a plain list, and so is a magnitude-ranked one.
                  // Otherwise project lanes stay chronological whatever the flat
                  // list does — only the flat list can swap its dividers for
                  // WORKING / DONE.
                  grouping={flatListGrouping(effectiveGrouping, rankedGlobally)}
                  groups={displayAgentGroups}
                  header={
                    <SidebarSectionHeader
                      collapsed={sessionsCollapsed}
                      count={displayAgentSessions.length}
                      extra={
                        scopedProject ? (
                          <SidebarScopeChip label={scopedProject.label} onClear={exitProjectScope} />
                        ) : undefined
                      }
                      onToggle={toggleSessions}
                      title={s.sessions}
                      tools={
                        <>
                          <SidebarViewOptions sources={poolSources} />
                          <SessionsAddButton
                            cwd={scopedProject ? projectNewSessionPath(scopedProject) : null}
                            onNewSession={onNewSessionInWorkspace}
                            onNewSessionSplit={onNewSessionSplit}
                          />
                        </>
                      }
                    />
                  }
                  label={s.sessions}
                  liveSessions={inProject ? enteredProjectOverlaySessions : undefined}
                  manualOrderIds={agentOrderManual ? agentOrderIds : sortOrderIds}
                  onArchiveSession={onArchiveSession}
                  onBranchSession={onBranchSession}
                  onDeleteSession={onDeleteSession}
                  onEnterProject={onEnterProject}
                  onNewSessionInWorkspace={onNewSessionInWorkspace}
                  onNewSessionSplit={onNewSessionSplit}
                  onReorderProjects={showAllProfiles ? undefined : reorderProjects}
                  onReorderSessions={showAllProfiles ? undefined : reorderSessions}
                  onResumeSession={onResumeSession}
                  onToggle={toggleSessions}
                  onTogglePin={pinSession}
                  onToggleUnread={toggleUnread}
                  open={!sessionsCollapsed}
                  pinned={false}
                  projectContent={inProject ? enteredProjectContent : undefined}
                  projectOverview={projectOverview}
                  projectOverviewHidden={overviewHidden}
                  projectOverviewPreviews={overviewPreviews}
                  projectRepoWorktrees={inProject ? scopedRepoWorktrees : undefined}
                  projectsLoading={worktreeGroupingActive ? projectTreeLoading : false}
                  removedSessionIds={inProject ? removedSessionIds : undefined}
                  rootClassName="mt-1.5 p-0"
                  scrollElement={scrollElement}
                  sessions={displayAgentSessions}
                  // Every profile in one flat list: each row says whose it is (#66003).
                  showProfileTags={showAllProfiles && !ownerGrouped}
                  sortable={!showAllProfiles && agentSessions.length > 1}
                />
            </div>

            <SidebarContributedSections />
          </div>
        </div>

        <SidebarFooter />
      </SidebarContent>
      <ProjectDialog />
      {/* One mount for the whole app. The header of WorktreeDialog tells why. */}
      <WorktreeDialog />
    </Sidebar>
  )
}
