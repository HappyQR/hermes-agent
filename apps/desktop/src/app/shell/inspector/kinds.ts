import type { StudioIconName } from '@/components/ui/studio-icon'
import { PREVIEW_TILE_PREFIX } from '@/store/preview-explicit'

/**
 * Hermes Studio's inspector (prototype inspector.js): one right-hand zone whose
 * panes are previews, files, changes, the terminal and the running agents. A
 * zone is the inspector when every pane in it is one of these kinds and at
 * least one is not a preview (a lone Browser column stays a plain zone).
 */
export const INSPECTOR_KINDS = ['preview', 'files', 'review', 'terminal', 'agents'] as const

export type InspectorKind = (typeof INSPECTOR_KINDS)[number]

const PANE_KINDS: Readonly<Record<string, InspectorKind>> = {
  agents: 'agents',
  files: 'files',
  logs: 'terminal',
  review: 'review',
  terminal: 'terminal'
}

export function inspectorKindOf(paneId: string): InspectorKind | null {
  if (paneId.startsWith(`${PREVIEW_TILE_PREFIX}:`)) {
    return 'preview'
  }

  return PANE_KINDS[paneId] ?? null
}

export function isInspectorZone(paneIds: readonly string[]): boolean {
  const kinds = paneIds.map(inspectorKindOf)

  return kinds.length > 0 && kinds.every(Boolean) && kinds.some(kind => kind !== 'preview')
}

export const panesOfKind = (paneIds: readonly string[], kind: InspectorKind | null) =>
  kind ? paneIds.filter(id => inspectorKindOf(id) === kind) : []

/** Segment glyphs, as the prototype draws them. */
export const INSPECTOR_KIND_ICON: Readonly<Record<InspectorKind, StudioIconName>> = {
  agents: 'tree',
  files: 'folder',
  preview: 'compass',
  review: 'diff',
  terminal: 'terminal'
}

/** The shortcut each segment advertises (the action that opens that kind). */
export const INSPECTOR_KIND_ACTION: Readonly<Record<InspectorKind, string>> = {
  agents: 'view.showAgents',
  files: 'view.showFiles',
  preview: 'view.showBrowser',
  review: 'view.toggleReview',
  terminal: 'view.showTerminal'
}

/** Inspector panes size the zone's track: 380px, between 300 and 620 (prototype .insp). */
export const INSPECTOR_PANE_SIZE = { maxWidth: '620px', minWidth: '300px', width: '380px' } as const
