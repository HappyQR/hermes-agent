import { useStore } from '@nanostores/react'

import { requestCloseSessionTile } from '@/app/chat/session-tile'
import { hudTargetSessionId } from '@/app/hud/handoff'
import { toggleLayoutEditMode } from '@/components/pane-shell/edit-mode'
import { isLayoutNode } from '@/components/pane-shell/tree/model'
import { applyLayoutPreset, isUserPreset, layoutPresetTier, LAYOUTS_AREA } from '@/components/pane-shell/tree/presets'
import { $activePresetId, resetLayoutTree } from '@/components/pane-shell/tree/store'
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useContributions } from '@/contrib/react/use-contributions'
import { useI18n } from '@/i18n'
import { sessionTitle } from '@/lib/chat-runtime'
import { triggerHaptic } from '@/lib/haptics'
import { runBuiltinAction } from '@/lib/keybinds/plugin-actions'
import { toggleHud } from '@/store/hud'
import { $interfaceMode, shownInMode } from '@/store/interface-mode'
import { $selectedStoredSessionId, $sessions } from '@/store/session'
import { $sessionTiles, openSessionTile } from '@/store/session-states'
import { $statusbarVisible, toggleStatusbarVisible } from '@/store/statusbar-prefs'
import { $tabStripDefault, setTabStripDefault, type TabStripDefault } from '@/store/tabstrip-prefs'

import { MenuHint } from './toolbar-kit'

const SPLIT_CANDIDATES = 6
const ICON = 15

/** "Split side by side ▸": recent chats that aren't already on screen. */
function SplitSubmenu() {
  const { t } = useI18n()
  const sessions = useStore($sessions)
  const selected = useStore($selectedStoredSessionId)
  const tiles = useStore($sessionTiles)
  const open = new Set([selected, ...tiles.map(tile => tile.storedSessionId)])
  const candidates = sessions.filter(session => !open.has(session.id)).slice(0, SPLIT_CANDIDATES)

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <StudioIcon name="split" size={ICON} />
        <span>{t.studio.shell.toolbar.splitWith}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="max-w-72">
        {candidates.length === 0 ? (
          <DropdownMenuItem disabled>{t.studio.shell.toolbar.noOtherSessions}</DropdownMenuItem>
        ) : (
          candidates.map(session => (
            <DropdownMenuItem key={session.id} onSelect={() => openSessionTile(session.id, 'right')}>
              <span className="min-w-0 truncate">{sessionTitle(session)}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

/** "Layout templates ▸": the same presets the layout editor's picker offers. */
function TemplatesSubmenu() {
  const { t } = useI18n()
  const presets = useContributions(LAYOUTS_AREA)
  const activePreset = useStore($activePresetId)
  const shown = shownInMode(useStore($interfaceMode))
  const layouts = presets.filter(preset => isLayoutNode(preset.data) && shown({ tier: layoutPresetTier(preset.id) }))
  const ordered = [...layouts.filter(p => !isUserPreset(p.id)), ...layouts.filter(p => isUserPreset(p.id))]

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <StudioIcon name="grid" size={ICON} />
        <span>{t.studio.shell.toolbar.layoutTemplates}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup value={activePreset ?? ''}>
          {ordered.map(preset => (
            <DropdownMenuRadioItem
              key={`${preset.source ?? 'core'}:${preset.id}`}
              onSelect={() => isLayoutNode(preset.data) && applyLayoutPreset(preset.id, preset.data)}
              value={preset.id}
            >
              {preset.title ?? preset.id}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {shown({ tier: 'advanced' }) && (
          <>
            <DropdownMenuSeparator />
            {/* Naming and saving live in the layout editor's picker. */}
            <DropdownMenuItem onSelect={() => toggleLayoutEditMode()}>
              {t.studio.shell.toolbar.saveLayoutAs}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

function TabBarSubmenu() {
  const { t } = useI18n()
  const copy = t.studio.shell.toolbar
  const value = useStore($tabStripDefault)

  const options: { id: TabStripDefault; label: string }[] = [
    { id: 'auto', label: copy.tabBarAuto },
    { id: 'always', label: copy.tabBarAlways },
    { id: 'never', label: copy.tabBarNever }
  ]

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <StudioIcon name="dock" size={ICON} />
        <span>{copy.tabBar}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup onValueChange={next => setTabStripDefault(next as TabStripDefault)} value={value}>
          {options.map(option => (
            <DropdownMenuRadioItem key={option.id} value={option.id}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

/**
 * The toolbar's Layout ▾ menu (prototype chat.js layoutMenu): single pane /
 * split, swap sides, templates, the layout editor (and its reset), HUD, tab
 * bar, and the Advanced status bar. Every row runs the existing command.
 */
export function LayoutMenuItems() {
  const { t } = useI18n()
  const copy = t.studio.shell.toolbar
  const tiles = useStore($sessionTiles)
  const statusbarVisible = useStore($statusbarVisible)
  const advanced = shownInMode(useStore($interfaceMode))({ tier: 'advanced' })

  const singlePane = () => {
    // Quiet tiles close at once; a busy one asks first (the tab ✕'s guard).
    for (const tile of tiles) {
      requestCloseSessionTile(tile.storedSessionId)
    }
  }

  return (
    <>
      <DropdownMenuCheckboxItem checked={tiles.length === 0} onSelect={singlePane}>
        <StudioIcon name="window" size={ICON} />
        <span>{copy.singlePane}</span>
      </DropdownMenuCheckboxItem>
      <SplitSubmenu />
      <DropdownMenuSeparator />
      {advanced && (
        <DropdownMenuItem onSelect={() => runBuiltinAction('view.flipPanes')}>
          <StudioIcon name="layout" size={ICON} />
          <span>{t.keybinds.actions['view.flipPanes']}</span>
          <MenuHint actionId="view.flipPanes" />
        </DropdownMenuItem>
      )}
      <TemplatesSubmenu />
      <DropdownMenuItem onSelect={() => toggleLayoutEditMode()}>
        <StudioIcon name="sliders" size={ICON} />
        <span>{copy.editLayout}</span>
        <MenuHint actionId="layout.editMode" />
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => {
          triggerHaptic('warning')
          resetLayoutTree()
        }}
      >
        <StudioIcon name="retry" size={ICON} />
        <span>{copy.resetLayout}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {advanced && (
        <DropdownMenuItem onSelect={() => toggleHud(hudTargetSessionId())}>
          <StudioIcon name="hud" size={ICON} />
          <span>{t.titlebar.enterHud}</span>
          <MenuHint actionId="view.toggleHud" />
        </DropdownMenuItem>
      )}
      <TabBarSubmenu />
      {advanced && (
        <DropdownMenuItem onSelect={toggleStatusbarVisible}>
          <StudioIcon name="minus" size={ICON} />
          <span>{statusbarVisible ? copy.hideStatusBar : copy.showStatusBar}</span>
          <MenuHint actionId="view.toggleStatusbar" />
        </DropdownMenuItem>
      )}
    </>
  )
}
