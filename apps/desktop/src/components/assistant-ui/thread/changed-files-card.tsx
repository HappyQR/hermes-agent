import { useStore } from '@nanostores/react'
import { type FC, useMemo } from 'react'

import { useComposerScope } from '@/app/chat/composer/scope'
import { useSessionView } from '@/app/chat/session-view'
import { deriveChangedFiles } from '@/components/assistant-ui/thread/changed-files'
import { WIDGET_SHELL_CLASS } from '@/components/chat/widget-shell'
import { Button } from '@/components/ui/button'
import { DiffCount } from '@/components/ui/diff-count'
import { FadeScroll } from '@/components/ui/fade-scroll'
import { FileTypeIcon } from '@/components/ui/file-type-icon'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { displayPath } from '@/lib/display-path'
import { cn } from '@/lib/utils'
import { openReviewForPath, revealReview } from '@/store/review'

// ~5 rows. A turn that rewrites twenty files should still read as one card in
// the transcript, not a wall the user has to scroll past to reach the composer.
const MAX_ROWS_HEIGHT = '9.375rem'

/** The row's path (prototype mono path): relative to the surface's repo when
 *  the file lives under it, else just the file name — never a long absolute. */
function rowPath(path: string, name: string, cwd: string): string {
  const root = cwd.replace(/[\\/]+$/, '')

  return root && path.startsWith(`${root}/`) ? path.slice(root.length + 1) : name
}

/**
 * Cursor-style "N files changed" summary closing out the newest assistant turn:
 * one row per file it edited with that file's +/-, and a Review action opening
 * the diff pane (⌘G). A row click opens that file's diff directly.
 *
 * Wears the shared `WIDGET_SHELL_CLASS` so it reads as the same panel as the
 * transcript's other inline widgets rather than inventing its own chrome.
 */
export const ChangedFilesCard: FC<{ parts: readonly unknown[] }> = ({ parts }) => {
  const { t } = useI18n()
  const copy = t.assistant.thread
  const files = useMemo(() => deriveChangedFiles(parts), [parts])
  // Review THIS surface's repo: a tile transcript pins the pane to the tile's
  // worktree; the primary passes null (follow the active session, as before).
  const view = useSessionView()
  const viewCwd = useStore(view.$cwd)
  const scopeCwd = view.kind === 'primary' ? null : viewCwd || null
  const composerScope = useComposerScope()

  if (files.length === 0) {
    return null
  }

  const added = files.reduce((sum, file) => sum + file.added, 0)
  const removed = files.reduce((sum, file) => sum + file.removed, 0)

  return (
    <div
      className={cn(WIDGET_SHELL_CLASS, 'mt-1.5 text-[length:var(--conversation-tool-font-size)]')}
      data-slot="aui_changed-files"
    >
      <div className="studio-files-head flex items-center gap-2">
        <StudioIcon className="shrink-0 text-(--ui-text-tertiary)" name="diff" size={15} />
        <span className="min-w-0 truncate font-semibold text-(--ui-text-primary)">{copy.filesChanged(files.length)}</span>
        <DiffCount added={added} className="me-auto" removed={removed} />
        <Button onClick={() => revealReview(scopeCwd, composerScope.target)} size="xs" type="button" variant="secondary">
          {copy.reviewChanges}
        </Button>
      </div>
      <FadeScroll className="-mx-1.5 mt-1.5 flex flex-col overscroll-y-auto px-1.5" maxHeight={MAX_ROWS_HEIGHT}>
        {files.map(file => (
          <Tip key={file.path} label={displayPath(file.path)}>
            <button
              className="row-hover flex shrink-0 items-center gap-2 rounded-md px-1.5 py-1 text-left"
              onClick={() => void openReviewForPath(file.path, scopeCwd, composerScope.target)}
              type="button"
            >
              <FileTypeIcon className="shrink-0 text-(--ui-text-tertiary)" path={file.path} size="0.875rem" />
              <span className="min-w-0 flex-1 truncate font-mono text-[0.75rem] text-(--ui-text-secondary)">
                {rowPath(file.path, file.name, viewCwd || '')}
              </span>
              <DiffCount added={file.added} removed={file.removed} />
            </button>
          </Tip>
        ))}
      </FadeScroll>
    </div>
  )
}
