import { useStore } from '@nanostores/react'

import { Button } from '@/components/ui/button'
import { Capsule, CapsuleSeparator } from '@/components/ui/capsule'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip, TipKeybindLabel } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { runBuiltinAction } from '@/lib/keybinds/plugin-actions'
import { cn } from '@/lib/utils'
import { $fileBrowserOpen } from '@/store/layout'

import { LayoutMenuItems } from './layout-menu'
import { ToolbarMenu } from './toolbar-kit'

/** The toolbar's right capsule (prototype `.capsule`): Layout ▾ | inspector toggle. */
export function ToolbarCapsule() {
  const { t } = useI18n()
  const copy = t.studio.shell.toolbar
  const inspectorOpen = useStore($fileBrowserOpen)
  const inspectorLabel = inspectorOpen ? copy.hideInspector : copy.showInspector

  return (
    <Capsule aria-label={copy.layoutMenu} data-slot="toolbar-capsule">
      <ToolbarMenu align="end" ariaLabel={copy.layoutMenu} contentClassName="min-w-60" items={() => <LayoutMenuItems />} tip={copy.layoutMenu}>
        <Button aria-label={copy.layoutMenu} size="icon-capsule" variant="ghost">
          <StudioIcon name="split" />
        </Button>
      </ToolbarMenu>
      <CapsuleSeparator />
      <Tip label={<TipKeybindLabel actionId="view.toggleRightSidebar" text={inspectorLabel} />} side="bottom">
        <Button
          aria-label={inspectorLabel}
          aria-pressed={inspectorOpen}
          className={cn(inspectorOpen && 'text-(--ui-accent) hover:text-(--ui-accent)')}
          data-slot="toolbar-inspector-toggle"
          onClick={() => {
            triggerHaptic('tap')
            runBuiltinAction('view.toggleRightSidebar')
          }}
          size="icon-capsule"
          variant="ghost"
        >
          <StudioIcon name="inspector" />
        </Button>
      </Tip>
    </Capsule>
  )
}
