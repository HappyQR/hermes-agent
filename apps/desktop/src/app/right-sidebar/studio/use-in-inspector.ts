import { useStore } from '@nanostores/react'

import { inspectorGroup } from '@/app/shell/inspector/inspector-state'
import { usePaneGroup } from '@/components/pane-shell/pane-visibility'
import { $layoutTree } from '@/components/pane-shell/tree/store'

/** True when this pane is a tab of the inspector zone (its band names the
 *  kind and owns the close ×), so pane-level self-titles and closes step back. */
export function useInInspector(): boolean {
  const groupId = usePaneGroup()
  const tree = useStore($layoutTree)

  return Boolean(groupId) && inspectorGroup(tree)?.id === groupId
}
