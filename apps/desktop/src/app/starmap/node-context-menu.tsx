import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/i18n'

import { useNodeActions } from './node-actions'

export interface NodeMenuTarget {
  id: string
  kind: 'memory' | 'skill'
  label: string
  x: number
  y: number
}

interface NodeContextMenuProps {
  onClose: () => void
  onNodeRemoved: () => void
  target: NodeMenuTarget | null
}

/** Right-click actions for a star-map node: edit (modal) or delete (confirm). */
export function NodeContextMenu({ onClose, onNodeRemoved, target }: NodeContextMenuProps) {
  const { t } = useI18n()
  const m = t.studio.pages.memory
  const actions = useNodeActions({ onNodeRemoved })

  return (
    <>
      {target && !actions.active ? (
        <DropdownMenu onOpenChange={open => !open && onClose()} open>
          <DropdownMenuTrigger asChild>
            {/* A zero-size anchor at the canvas click point, as AppContextMenu
                does: Radix positions against it like a real trigger and flips or
                shifts the menu back inside the viewport near the window edges,
                so the destructive row can never be clipped off-window. */}
            <span aria-hidden style={{ left: target.x, position: 'fixed', top: target.y }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" onCloseAutoFocus={e => e.preventDefault()} side="bottom">
            <DropdownMenuLabel className="truncate text-[0.68rem] font-normal text-muted-foreground">
              {target.label}
            </DropdownMenuLabel>
            <DropdownMenuItem
              disabled={actions.loading}
              onSelect={e => {
                // Keep the menu up while the node content loads, then hand over to the editor.
                e.preventDefault()
                void actions.edit(target).then(onClose)
              }}
            >
              {target.kind === 'skill' ? m.editSkill : m.editMemory}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => actions.remove({ id: target.id, kind: target.kind, label: target.label })}
              variant="destructive"
            >
              {target.kind === 'skill' ? m.archiveSkill : m.deleteMemory}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {actions.dialogs}
    </>
  )
}
