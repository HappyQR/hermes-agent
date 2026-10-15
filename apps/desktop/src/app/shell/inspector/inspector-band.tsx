import { useStore } from '@nanostores/react'
import { useEffect } from 'react'

import type { ZoneBandContext } from '@/components/pane-shell/tree/renderer/track-model'
import { registerZoneBand } from '@/components/pane-shell/tree/renderer/zone-band'
import { activateTreePane, restoreTreePane } from '@/components/pane-shell/tree/store'
import { Button } from '@/components/ui/button'
import { useSegmentThumb } from '@/components/ui/segmented-control'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip, TipKeybindLabel } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'
import { $interfaceMode, shownInMode } from '@/store/interface-mode'

import { hideInspector, inspectorPaneFor, noteInspectorPane, revealInspectorKind } from './inspector-state'
import {
  INSPECTOR_KIND_ACTION,
  INSPECTOR_KIND_ICON,
  INSPECTOR_KINDS,
  type InspectorKind,
  inspectorKindOf,
  isInspectorZone,
  panesOfKind
} from './kinds'

/**
 * The inspector zone's 52px header (prototype `.insp-head`): an icon-only
 * segmented control over the kinds the zone can show, the current kind's
 * name, and a close ×. The kinds with several panes (previews; terminal +
 * logs) list them as chips on the strip below.
 */
export function InspectorBand({ activeId, groupId, panes, shown }: ZoneBandContext) {
  const { t } = useI18n()
  const copy = t.studio.shell.inspector
  const advanced = shownInMode(useStore($interfaceMode))({ tier: 'advanced' })
  const activeKind = inspectorKindOf(activeId)

  // What the inspector can switch to: the Browser (it can always open one),
  // the kinds on screen, and — in Advanced — every kind the zone holds even
  // while its own toggle has it closed (a click opens it through that toggle).
  // Simple keeps files, changes and the terminal resting (prototype settings).
  const kinds = INSPECTOR_KINDS.filter(
    kind =>
      kind === 'preview' ||
      shown.some(id => inspectorKindOf(id) === kind) ||
      (advanced && panes.some(id => inspectorKindOf(id) === kind))
  )

  const { thumb, trackRef } = useSegmentThumb(activeKind ?? '', kinds.length, '[aria-selected="true"]')

  useEffect(() => noteInspectorPane(activeId), [activeId])

  const select = (kind: InspectorKind) => {
    triggerHaptic('selection')
    const pane = inspectorPaneFor(kind, shown)

    if (pane) {
      restoreTreePane(pane)
      activateTreePane(groupId, pane)
    } else {
      revealInspectorKind(kind)
    }
  }

  return (
    <div className="flex h-full min-w-0 flex-1 items-center gap-1.5" data-slot="inspector-header">
      <div
        aria-label={copy.label}
        className="relative inline-grid shrink-0 auto-cols-fr grid-flow-col rounded-[8px] bg-(--ui-fill) p-0.5"
        ref={trackRef}
        role="tablist"
      >
        {thumb && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0.5 rounded-[6px] bg-(--ui-bg-editor) shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.06)] transition-[left,width] duration-[220ms] ease-(--studio-ease) motion-reduce:transition-none dark:bg-[color-mix(in_srgb,var(--ui-text-primary)_22%,var(--ui-bg-editor))]"
            style={{ left: thumb.left, width: thumb.width }}
          />
        )}
        {kinds.map(kind => {
          const selected = kind === activeKind

          return (
            <Tip key={kind} label={<TipKeybindLabel actionId={INSPECTOR_KIND_ACTION[kind]} text={copy[kind]} />} side="bottom">
              <button
                aria-label={copy[kind]}
                aria-selected={selected}
                className={cn(
                  'relative z-1 grid h-6 w-8 place-items-center rounded-[6px] transition-colors duration-[120ms]',
                  selected ? 'text-(--ui-text-primary)' : 'text-(--ui-text-secondary) hover:text-(--ui-text-primary)'
                )}
                data-inspector-kind={kind}
                data-tree-tab={panesOfKind(shown, kind)[0]}
                onClick={() => select(kind)}
                role="tab"
                type="button"
              >
                <StudioIcon name={INSPECTOR_KIND_ICON[kind]} size={15} />
              </button>
            </Tip>
          )
        })}
      </div>
      <span className="min-w-0 flex-1" />
      {activeKind && (
        <span className="min-w-0 truncate text-[0.78125rem] font-semibold text-(--ui-text-secondary)">
          {copy[activeKind]}
        </span>
      )}
      <Tip label={<TipKeybindLabel actionId="view.toggleRightSidebar" text={copy.close} />} side="bottom">
        <Button aria-label={copy.close} onClick={hideInspector} size="icon-toolbar" variant="ghost">
          <StudioIcon name="x" size={13} />
        </Button>
      </Tip>
    </div>
  )
}

/** The chips under the header: every preview while Preview is showing (the
 *  prototype's tab row, with its "+"), and terminal + logs once both exist. */
function activeKindPanes(shown: readonly string[], activeId: string): string[] {
  const kind = inspectorKindOf(activeId)
  const panes = panesOfKind(shown, kind)

  return kind === 'preview' || panes.length > 1 ? panes : []
}

export function registerInspectorBand() {
  return registerZoneBand({
    Band: InspectorBand,
    matches: isInspectorZone,
    stripPanes: activeKindPanes,
    stripVariant: 'chips',
    surface: 'var(--ui-bg-inspector)'
  })
}
