import { atom, computed } from 'nanostores'

import { setTerminalTakeover } from '@/app/right-sidebar/store'
import type { GroupNode, LayoutNode } from '@/components/pane-shell/tree/model'
import {
  $collapsedTreeSides,
  $layoutTree,
  paneRootSide,
  revealTreePane,
  setTreeGroupMinimized
} from '@/components/pane-shell/tree/store'
import { $fileBrowserOpen, setFileBrowserOpen } from '@/store/layout'
import { openBrowserTab } from '@/store/preview'
import { revealReview } from '@/store/review'

import { type InspectorKind, inspectorKindOf, isInspectorZone, panesOfKind } from './kinds'

/** Zones touching the window's top edge — the ones with a titlebar band. */
function topEdgeGroups(node: LayoutNode): GroupNode[] {
  if (node.type === 'group') {
    return [node]
  }

  return node.orientation === 'row'
    ? node.children.flatMap(topEdgeGroups)
    : node.children[0]
      ? topEdgeGroups(node.children[0])
      : []
}

/** The layout's inspector: a top-edge zone of inspector panes (custom
 *  layouts may have none — a lone terminal deck below the chat is not one). */
export function inspectorGroup(tree: LayoutNode | null = $layoutTree.get()): GroupNode | null {
  return (tree && topEdgeGroups(tree).find(group => isInspectorZone(group.panes))) || null
}

/** The side the inspector folds with: its first non-preview pane's root side. */
function inspectorSide(group: GroupNode) {
  const anchor = group.panes.find(id => inspectorKindOf(id) !== 'preview')

  return anchor ? paneRootSide(anchor) : null
}

/** On screen: present, not folded to a rail, and its side not collapsed. A
 *  layout without an inspector reports the right side's file tree instead
 *  (what ⌘J toggles there). */
export const $inspectorShown = computed(
  [$layoutTree, $collapsedTreeSides, $fileBrowserOpen],
  (tree, collapsed, fileBrowserOpen) => {
    const group = inspectorGroup(tree)

    if (!group) {
      return fileBrowserOpen
    }

    const side = inspectorSide(group)

    return !group.minimized && !(side && collapsed.has(side))
  }
)

/** Whether the Agents pane is open (the controller binds the pane to it).
 *  Session-only, like the review flag: a fresh boot rests it. */
export const $agentsPaneOpen = atom(false)

// The kind a bare "show inspector" reopens on.
let lastKind: InspectorKind = 'files'

// Per kind, the pane last fronted (a preview kind holds several tiles).
const lastPane = new Map<InspectorKind, string>()

/** Remember what the inspector shows so a bare toggle and a segment click
 *  come back to it. Called by the header as the active pane changes. */
export function noteInspectorPane(paneId: string) {
  const kind = inspectorKindOf(paneId)

  if (kind) {
    lastKind = kind
    lastPane.set(kind, paneId)
  }
}

/** The pane a segment fronts: the kind's last pane, else its first. */
export function inspectorPaneFor(kind: InspectorKind, paneIds: readonly string[]): null | string {
  const remembered = lastPane.get(kind)
  const panes = panesOfKind(paneIds, kind)

  return remembered && panes.includes(remembered) ? remembered : (panes[0] ?? null)
}

/** Bring a kind to the front, opening it the way its own command does. */
export function revealInspectorKind(kind: InspectorKind) {
  const group = inspectorGroup()
  lastKind = kind

  if (kind === 'preview') {
    const pane = group ? inspectorPaneFor('preview', group.panes) : null

    if (pane) {
      revealTreePane(pane)
    } else {
      openBrowserTab()
    }

    return
  }

  if (kind === 'review') {
    revealReview()

    return
  }

  if (kind === 'terminal') {
    // The terminal's own open flag must agree, or its collapse binding folds the zone.
    setTerminalTakeover(true)
  }

  if (kind === 'agents') {
    $agentsPaneOpen.set(true)
  }

  revealTreePane(kind)
}

/** Prototype "View in Inspector" (live pill, delegation card, tray): front the
 *  running agents — the inspector's Agents segment, or wherever the pane docks
 *  in a layout without an inspector. Never hides, unlike the segment toggle. */
export function showAgentsPane() {
  if (inspectorGroup()) {
    showInspector('agents')
  } else {
    revealInspectorKind('agents')
  }
}

/** Hide the whole inspector (prototype ×): its side collapses, no rail.
 *  A rearranged inspector without the file tree folds to its rail instead. */
export function hideInspector() {
  const group = inspectorGroup()

  if (group && !group.panes.includes('files')) {
    setTreeGroupMinimized(group.id, true)
  } else {
    setFileBrowserOpen(false)
  }
}

export function showInspector(kind?: InspectorKind) {
  const group = inspectorGroup()

  setFileBrowserOpen(true)

  if (group?.minimized) {
    setTreeGroupMinimized(group.id, false)
  }

  revealInspectorKind(kind ?? (group && inspectorKindOf(group.active)) ?? lastKind)
}

/**
 * Prototype toggleInspector(tab): the tab already showing hides the
 * inspector; anything else opens it on that tab. False when the layout has no
 * inspector zone, so callers keep their pre-Studio behavior there.
 */
export function toggleInspector(kind?: InspectorKind): boolean {
  const group = inspectorGroup()

  if (!group) {
    return false
  }

  if ($inspectorShown.get() && (!kind || inspectorKindOf(group.active) === kind)) {
    hideInspector()
  } else {
    showInspector(kind)
  }

  return true
}

/** A segment's own command (⇧⌘L, files, ⌘G, ⌃`, agents) toggles the inspector
 *  on that segment — when the kind lives there. False otherwise (the terminal
 *  docked below in Terminal deck, a custom layout), so the command keeps its
 *  pre-Studio behavior. Previews join the inspector whenever one exists. */
export function toggleInspectorKind(kind: InspectorKind): boolean {
  const group = inspectorGroup()

  if (!group || (kind !== 'preview' && !group.panes.some(id => inspectorKindOf(id) === kind))) {
    return false
  }

  return toggleInspector(kind)
}
