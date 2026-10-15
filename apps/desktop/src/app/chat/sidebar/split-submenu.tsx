import {
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger
} from '@/components/ui/context-menu'
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import { StudioIcon } from '@/components/ui/studio-icon'
import { type Translations, useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import type { SplitDir } from '@/store/session-states'

/** The leaf + submenu components for one menu flavour, so the split submenu
 *  renders in either the `…` dropdown or a right-click context menu. */
export interface SplitMenuKit {
  Item: typeof DropdownMenuItem | typeof ContextMenuItem
  Sub: typeof DropdownMenuSub | typeof ContextMenuSub
  SubContent: typeof DropdownMenuSubContent | typeof ContextMenuSubContent
  SubTrigger: typeof DropdownMenuSubTrigger | typeof ContextMenuSubTrigger
}

export const DROPDOWN_SPLIT_KIT: SplitMenuKit = {
  Item: DropdownMenuItem,
  Sub: DropdownMenuSub,
  SubContent: DropdownMenuSubContent,
  SubTrigger: DropdownMenuSubTrigger
}

export const CONTEXT_SPLIT_KIT: SplitMenuKit = {
  Item: ContextMenuItem,
  Sub: ContextMenuSub,
  SubContent: ContextMenuSubContent,
  SubTrigger: ContextMenuSubTrigger
}

type SplitMenuCopy = Translations['studio']['sidebar']['menu']

// Ordered so the default (right) sits first, one hop away.
const SPLIT_DIRS: { dir: SplitDir; label: (copy: SplitMenuCopy) => string }[] = [
  { dir: 'right', label: copy => copy.splitRight },
  { dir: 'bottom', label: copy => copy.splitDown },
  { dir: 'left', label: copy => copy.splitLeft },
  { dir: 'top', label: copy => copy.splitUp }
]

interface SplitSubmenuProps {
  kit: SplitMenuKit
  label: string
  onSplit: (dir: SplitDir) => void
  disabled?: boolean
  /** Dismiss the owning menu after the row's default (right) split — the
   *  dropdown is controlled and can; a context menu can't, so it's a no-op. */
  close?: () => void
}

/**
 * "Open in split ▸": in a dismissable menu, clicking the row splits right (the
 * common case); the submenu picks any edge. Shared by session rows, page nav
 * rows and the top bar's new-session button.
 */
export function SplitSubmenu({ close, disabled, kit, label, onSplit }: SplitSubmenuProps) {
  const { Item, Sub, SubContent, SubTrigger } = kit
  const copy = useI18n().t.studio.sidebar.menu

  const split = (dir: SplitDir) => {
    triggerHaptic('selection')
    onSplit(dir)
  }

  return (
    <Sub>
      <SubTrigger
        disabled={disabled}
        // A menu that can be dismissed takes the click as "split right"; one
        // that can't (a context menu) lets the row open its submenu instead of
        // splitting under a menu that stays up.
        onClick={
          close
            ? () => {
                split('right')
                close()
              }
            : undefined
        }
      >
        <StudioIcon name="split" size={15} />
        <span>{label}</span>
      </SubTrigger>
      <SubContent>
        {SPLIT_DIRS.map(({ dir, label: dirLabel }) => (
          <Item key={dir} onSelect={() => split(dir)}>
            <span>{dirLabel(copy)}</span>
          </Item>
        ))}
      </SubContent>
    </Sub>
  )
}
