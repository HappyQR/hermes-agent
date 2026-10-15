import { useStore } from '@nanostores/react'

import { SessionTitleMenu } from '@/app/chat/session-tile'
import { paneChrome } from '@/components/pane-shell/tree/renderer/track-model'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useContributions } from '@/contrib/react/use-contributions'
import { useI18n } from '@/i18n'
import { NEW_SESSION_TITLE } from '@/lib/chat-runtime'
import { cn } from '@/lib/utils'
import { $selectedStoredSessionId } from '@/store/session'
import { $focusedStoredSessionId } from '@/store/session-focus'
import { $toolbarPageTitle } from '@/store/toolbar'

const TILE_PANE_PREFIX = 'session-tile:'

/** Prototype `.tb-title`: 13.5px semibold, a hover fill, chevron in the tertiary ink. */
const titleClass =
  'inline-flex h-7 min-w-0 max-w-full items-center gap-1 rounded-[7px] pr-1.5 pl-2 text-[0.84375rem] font-semibold text-(--ui-text-primary)'

/**
 * The focused chat's title (a split tile when one has focus, as the prototype's
 * toolbar follows focus). It reads the chat's own pane label so drafts, bot
 * chats and tiles caption exactly like their tabs, and opens the same session
 * verbs as the tab's menu.
 */
export function ToolbarTitle() {
  const { t } = useI18n()
  const focused = useStore($focusedStoredSessionId)
  const selected = useStore($selectedStoredSessionId)
  const panes = useContributions('panes')
  const tileFocused = Boolean(focused && focused !== selected)

  const pane =
    (tileFocused ? panes.find(p => p.id === `${TILE_PANE_PREFIX}${focused}`) : undefined) ??
    panes.find(p => p.id === 'workspace')

  // The tab's own label rule (tree-group tabLabel): its live node, else the
  // pane title — an untitled stored chat carries the English sentinel there.
  const title = pane?.title === NEW_SESSION_TITLE ? t.studio.shell.toolbar.newSessionTitle : pane?.title
  const label = paneChrome(pane).tabTitle?.() ?? title
  const sessionId = tileFocused ? focused : selected

  if (!sessionId) {
    return (
      <span className={titleClass} data-slot="toolbar-title">
        <span className="min-w-0 truncate">{label}</span>
      </span>
    )
  }

  return (
    <SessionTitleMenu storedSessionId={sessionId}>
      <button
        className={cn(titleClass, 'hover:bg-(--ui-hover) data-[state=open]:bg-(--ui-hover)')}
        data-slot="toolbar-title"
        type="button"
      >
        <span className="min-w-0 truncate">{label}</span>
        <StudioIcon className="text-(--ui-text-tertiary)" name="chev-d" size={12} />
      </button>
    </SessionTitleMenu>
  )
}

/** On pages the title fades in once the page's own large title scrolls away. */
export function ToolbarPageTitle() {
  const page = useStore($toolbarPageTitle)

  return (
    <span
      aria-hidden={page?.shown ? undefined : true}
      className={cn(
        titleClass,
        'pointer-events-none translate-y-1.5 opacity-0 transition-[opacity,translate] duration-[220ms] ease-(--studio-ease)',
        page?.shown && 'translate-y-0 opacity-100'
      )}
      data-slot="toolbar-page-title"
    >
      <span className="min-w-0 truncate">{page?.title}</span>
    </span>
  )
}
