// Hermes Studio copy (sidebar) — fork-owned so upstream locale merges stay clean.
import type { StudioSidebarTranslations } from './types_studio_sidebar'

export const enStudioSidebar: StudioSidebarTranslations = {
  search: 'Search',
  searchAria: 'Search sessions, pages and commands',
  nav: {
    label: 'Pages',
    automations: 'Automations',
    memory: 'Memory',
    open: 'Open',
    pendingPairing: count => (count === 1 ? '1 pending pairing request' : `${count} pending pairing requests`),
    cronJobs: count => (count === 1 ? '1 scheduled job' : `${count} scheduled jobs`),
    cronFailing: count => (count === 1 ? '1 job is failing' : `${count} jobs are failing`)
  },
  section: {
    expand: 'Expand',
    collapse: 'Collapse',
    collapsedCount: count => `${count} hidden`,
    expandGroups: 'Expand all groups',
    collapseGroups: 'Collapse all groups'
  },
  projects: {
    newProject: 'New project…',
    openFolder: 'Open folder as project…',
    newWorktree: 'New worktree…',
    auto: 'Auto',
    actions: 'Project actions',
    newSessionHere: 'New session in this project',
    newSessionInLane: 'New session in this lane',
    empty: 'No projects yet'
  },
  scope: {
    tip: "Only showing this project's sessions",
    clear: 'Show all sessions'
  },
  sessions: {
    viewOptions: 'View options',
    viewOptionsTip: 'Group, sort and filter',
    noMatches: 'No sessions match these filters.',
    clearFilters: 'Clear filters'
  },
  grouping: {
    label: 'Group by',
    time: 'By time',
    project: 'By project',
    status: 'By status',
    source: 'By source',
    profile: 'By gateway & profile',
    none: 'No grouping',
    noProject: 'No project'
  },
  statusGroup: {
    needsInput: 'Needs input',
    working: 'Running',
    unread: 'Unread',
    draft: 'Draft',
    done: 'Done'
  },
  view: {
    reset: 'Restore defaults',
    sort: 'Sort',
    show: 'Show',
    time: 'Time',
    density: 'List density',
    compact: 'Compact',
    comfortable: 'Comfortable',
    detailed: 'Detailed',
    filters: 'Filters',
    sources: 'Sources',
    prStatus: 'PR status',
    prAny: 'All',
    showArchived: 'Show archived sessions',
    moreFilters: 'More filters'
  },
  source: {
    desktop: 'Desktop',
    cron: 'Scheduled job',
    from: label => `From ${label}`
  },
  row: {
    yesterday: 'Yesterday'
  },
  menu: {
    clickHint: keys => `${keys}-click`,
    openInNewWindow: 'Open in new window',
    splitRight: 'Right',
    splitDown: 'Down',
    splitLeft: 'Left',
    splitUp: 'Up',
    color: 'Color',
    copySessionId: 'Copy session ID',
    branchFromHere: 'Branch from here',
    export: 'Export',
    exportJson: 'JSON…',
    exportMarkdown: 'Markdown…',
    exportFailed: 'Could not export the session',
    newProject: 'New project…',
    delete: 'Delete…'
  },
  footer: {
    updateAvailable: name => `${name} available`,
    updateView: 'Click to view',
    updateBehind: count =>
      count === 1 ? '1 commit behind · Click to view' : `${count} commits behind · Click to view`,
    updateApplying: 'Updating…',
    updateRestart: 'Restart to finish updating',
    account: 'Profiles & gateways',
    ready: 'Ready',
    connecting: 'Connecting…',
    disconnected: 'Disconnected',
    unreachable: 'Unreachable',
    remote: 'Remote',
    thisDevice: 'This device',
    thisMac: 'This Mac',
    defaultSuffix: ' (default)',
    needsInputBadge: count => `${count} need input`,
    unreadBadge: count => `${count} unread`,
    switchHere: 'Switch to this profile',
    newProfile: 'New profile…',
    gateway: 'Gateway',
    reconnect: 'Reconnect',
    recentActivity: 'Recent activity…',
    connectGateway: 'Connect another gateway…',
    systemStatus: 'System status…',
    settings: 'Settings…',
    shortcuts: 'Keyboard shortcuts',
    checkUpdates: 'Check for updates…',
    showRail: 'Show profile rail'
  }
}
