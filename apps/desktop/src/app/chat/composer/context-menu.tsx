import { type ReactNode, useRef, useState } from 'react'

import { composerPanelCard } from '@/components/chat/composer-dock'
import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Kbd } from '@/components/ui/kbd'
import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

import { useComposerAttachmentProviders } from './contrib'
import { GHOST_ICON_BTN } from './controls'
import type { ChatBarState } from './types'

const SNIPPET_KEYS = ['codeReview', 'implementationPlan', 'explainThis']

export function ContextMenu({
  extraItems,
  state,
  onInsertText,
  onOpenUrlDialog,
  onPasteClipboardImage,
  onPickFiles,
  onPickFolders,
  onPickImages
}: ContextMenuProps) {
  const { t } = useI18n()
  const c = t.composer
  // Prompt snippets used to be a Radix submenu. That submenu didn't open
  // reliably when the parent menu was positioned at the bottom of the
  // window (composer "+" anchor), so we promoted it to a real Dialog —
  // easier to grow with search / descriptions, and no positioning math.
  const [snippetsOpen, setSnippetsOpen] = useState(false)
  // `composer.attachments` contributions — plugin/core-registered rows that
  // extend this menu through the same registry as every other surface.
  const attachmentProviders = useComposerAttachmentProviders()
  // An action that moves focus (into the editor) runs once the menu has
  // closed — otherwise Radix hands focus back to this trigger right after.
  const afterClose = useRef<(() => void) | null>(null)

  return (
    <>
      <DropdownMenu>
        <Tip label={t.studio.chat.composer.addContextHint} placement="control">
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={state.tools.enabled ? t.studio.chat.composer.addContext : state.tools.label}
              className={cn(
                GHOST_ICON_BTN,
                'data-[state=open]:bg-(--chrome-action-hover) data-[state=open]:text-foreground'
              )}
              disabled={!state.tools.enabled}
              size="icon"
              type="button"
              variant="ghost"
            >
              {/* The prototype's plus glyph; `codicon-add` stays the e2e hook. */}
              <StudioIcon className="codicon-add" name="plus" size={18} />
            </Button>
          </DropdownMenuTrigger>
        </Tip>
        <DropdownMenuContent
          align="start"
          className={cn('w-60', composerPanelCard)}
          onCloseAutoFocus={event => {
            const action = afterClose.current

            if (action) {
              afterClose.current = null
              event.preventDefault()
              action()
            }
          }}
          side="top"
          sideOffset={6}
        >
          <DropdownMenuLabel className="px-2 pb-0.5 pt-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-(--ui-text-tertiary)">
            {c.attachLabel}
          </DropdownMenuLabel>
          <ContextMenuItem disabled={!onPickFiles} icon="clip" onSelect={onPickFiles}>
            {c.files}
          </ContextMenuItem>
          <ContextMenuItem disabled={!onPickFolders} icon="folder" onSelect={onPickFolders}>
            {c.folder}
          </ContextMenuItem>
          <ContextMenuItem disabled={!onPickImages} icon="photo" onSelect={onPickImages}>
            {c.images}
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!onPasteClipboardImage}
            icon="image"
            onSelect={onPasteClipboardImage ? () => void onPasteClipboardImage() : undefined}
          >
            {c.pasteImage}
          </ContextMenuItem>
          <ContextMenuItem icon="link" onSelect={onOpenUrlDialog}>
            {c.url}
          </ContextMenuItem>

          <DropdownMenuSeparator />

          <ContextMenuItem icon="doc" onSelect={() => setSnippetsOpen(true)}>
            {c.promptSnippets}
          </ContextMenuItem>
          {extraItems?.({
            runAfterClose: action => {
              afterClose.current = action
            }
          })}

          {attachmentProviders.length > 0 && <DropdownMenuSeparator />}
          {attachmentProviders.map(provider => (
            <DropdownMenuItem
              className="text-[length:var(--conversation-tool-font-size)] focus:bg-(--ui-bg-tertiary)"
              key={provider.key}
              onSelect={() => void provider.run({ insertText: onInsertText })}
            >
              <Codicon name={provider.icon ?? 'plug'} size="0.875rem" />
              <span>{provider.label}</span>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <div className="px-2 py-1 text-[0.7rem] text-muted-foreground/80">
            {c.tipPre}
            <Kbd size="sm">@</Kbd>
            {c.tipPost}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <PromptSnippetsDialog onInsertText={onInsertText} onOpenChange={setSnippetsOpen} open={snippetsOpen} />
    </>
  )
}

function PromptSnippetsDialog({ onInsertText, onOpenChange, open }: PromptSnippetsDialogProps) {
  const { t } = useI18n()
  const c = t.composer

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{c.snippetsTitle}</DialogTitle>
          <DialogDescription>{c.snippetsDesc}</DialogDescription>
        </DialogHeader>
        <ul className="grid gap-1">
          {SNIPPET_KEYS.map(key => {
            const snippet = c.snippets[key]

            return (
              <li key={key}>
                <button
                  className="group/snippet flex w-full cursor-pointer items-start gap-2.5 rounded-md border border-transparent px-2.5 py-2 text-left transition-colors hover:border-(--ui-stroke-tertiary) hover:bg-(--ui-control-hover-background) focus-visible:border-(--ui-stroke-tertiary) focus-visible:bg-(--ui-control-hover-background) focus-visible:outline-none"
                  onClick={() => {
                    onInsertText(snippet.text)
                    onOpenChange(false)
                  }}
                  type="button"
                >
                  <StudioIcon
                    className="mt-0.5 text-(--ui-text-tertiary) group-hover/snippet:text-foreground"
                    name="doc"
                    size={14}
                  />
                  <span className="grid min-w-0 gap-0.5">
                    <span className="text-sm font-medium text-foreground">{snippet.label}</span>
                    <span className="text-[length:var(--conversation-caption-font-size)] text-(--ui-text-tertiary)">
                      {snippet.description}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </DialogContent>
    </Dialog>
  )
}

export function ContextMenuItem({ children, disabled, icon, onSelect }: ContextMenuItemProps) {
  return (
    // Override font size + highlight to match the / · @ completion rows exactly.
    <DropdownMenuItem
      className="text-[length:var(--conversation-tool-font-size)] focus:bg-(--ui-bg-tertiary)"
      disabled={disabled}
      onSelect={onSelect}
    >
      <StudioIcon name={icon} size={15} />
      <span>{children}</span>
    </DropdownMenuItem>
  )
}

interface ContextMenuItemProps {
  children: string
  disabled?: boolean
  icon: StudioIconName
  onSelect?: () => void
}

interface ContextMenuProps {
  /** Hermes Studio rows after the prompt snippets (skills, approval mode, pop-out). */
  extraItems?: (helpers: { runAfterClose: (action: () => void) => void }) => ReactNode
  onInsertText: (text: string) => void
  onOpenUrlDialog: () => void
  onPasteClipboardImage?: (opts?: { silent?: boolean }) => Promise<boolean> | void
  onPickFiles?: () => void
  onPickFolders?: () => void
  onPickImages?: () => void
  state: ChatBarState
}

interface PromptSnippetsDialogProps {
  onInsertText: (text: string) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}
