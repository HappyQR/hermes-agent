import { type NewSessionSplitHandler, startNewSessionDrag } from '@/app/chat/new-session-drag'
import { Button } from '@/components/ui/button'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'

/**
 * The Sessions header "+": a new session — in the scoped project's folder when
 * the list is scoped. Also a drag source (drop onto a zone to create the session
 * exactly there); a sub-threshold release stays the click.
 */
export function SessionsAddButton({
  cwd,
  onNewSession,
  onNewSessionSplit
}: {
  cwd: null | string
  onNewSession: (path: null | string) => void
  onNewSessionSplit?: NewSessionSplitHandler
}) {
  const { t } = useI18n()
  const label = t.sidebar.nav['new-session']

  return (
    <Tip label={label} placement="row">
      <Button
        aria-label={label}
        className="size-5.5 rounded-[6px] text-(--ui-text-tertiary) hover:bg-(--ui-hover) hover:text-foreground"
        onClick={event => {
          event.stopPropagation()
          onNewSession(cwd)
        }}
        onPointerDown={
          onNewSessionSplit
            ? event =>
                startNewSessionDrag(
                  placement =>
                    onNewSessionSplit(placement.dir, {
                      anchor: placement.anchor,
                      before: placement.before,
                      ...(cwd ? { cwd } : {})
                    }),
                  event,
                  cwd ? { cwd, label } : undefined
                )
            : undefined
        }
        size="icon-xs"
        variant="ghost"
      >
        <StudioIcon name="plus" size={13} />
      </Button>
    </Tip>
  )
}
