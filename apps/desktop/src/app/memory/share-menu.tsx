import { useState } from 'react'

import { SheetBody, SheetFooter, SheetHeader, STUDIO_SHEET_BODY, STUDIO_SHEET_CONTENT } from '@/components/studio/pages/sheet'
import { IconTile } from '@/components/studio/pages/tile'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/i18n'
import { copyTextToClipboard } from '@/lib/desktop-fs'
import { notify, notifyError } from '@/store/notifications'
import type { StarmapGraph } from '@/types/hermes'

import { decodeShareCode, encodeShareCode, ShareCodeError } from '../starmap/share-code'

// 分享 (prototype pages.js:397): copy this map as a share code, load someone
// else's, or refresh the scan. A loaded map replaces the canvas until "Back to
// my map"; the list view always shows the live graph.

interface MemoryShareMenuProps {
  /** The live graph (the copy source — never an imported map). */
  graph: StarmapGraph | null
  onImport: (graph: StarmapGraph) => void
  onRefresh: () => void
}

export function MemoryShareMenu({ graph, onImport, onRefresh }: MemoryShareMenuProps) {
  const { t } = useI18n()
  const m = t.studio.pages.memory
  const [loadOpen, setLoadOpen] = useState(false)

  const copyCode = async () => {
    if (!graph) {
      return
    }

    try {
      await copyTextToClipboard(encodeShareCode(graph))
      notify({ kind: 'success', message: m.codeCopiedBody, title: m.codeCopied })
    } catch (err) {
      notifyError(err, t.common.copyFailed)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">
            <StudioIcon name="share" size={14} />
            {m.share}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem disabled={!graph} onSelect={() => void copyCode()}>
            <StudioIcon name="copy" size={14} />
            {m.copyCode}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setLoadOpen(true)}>
            <StudioIcon name="import" size={14} />
            {m.loadCode}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onRefresh}>
            <StudioIcon name="retry" size={14} />
            {t.starmap.refresh}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <LoadMapCodeSheet onImport={onImport} onOpenChange={setLoadOpen} open={loadOpen} />
    </>
  )
}

function LoadMapCodeSheet({
  onImport,
  onOpenChange,
  open
}: {
  onImport: (graph: StarmapGraph) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const { t } = useI18n()
  const m = t.studio.pages.memory
  const [code, setCode] = useState('')
  const [error, setError] = useState<null | string>(null)

  const close = (next: boolean) => {
    onOpenChange(next)
    setCode('')
    setError(null)
  }

  const load = () => {
    const value = code.trim()

    if (!value) {
      setError(t.starmap.importEmpty)

      return
    }

    try {
      const next = decodeShareCode(value)

      onImport(next)
      notify({ kind: 'success', message: t.starmap.importSuccess(next.nodes.length) })
      close(false)
    } catch (err) {
      setError(err instanceof ShareCodeError ? err.message : m.importInvalid)
    }
  }

  return (
    <Dialog onOpenChange={close} open={open}>
      <DialogContent bodyClassName={STUDIO_SHEET_BODY} className={STUDIO_SHEET_CONTENT.md} showCloseButton={false}>
        <SheetHeader
          description={t.starmap.shareHint}
          lead={<IconTile icon="graph" size={30} tone="indigo" />}
          title={m.loadCodeTitle}
        />
        <form
          className="contents"
          onSubmit={event => {
            event.preventDefault()
            load()
          }}
        >
          <SheetBody>
            <Textarea
              aria-label={m.loadCodeTitle}
              autoFocus
              className="h-28 w-full resize-none font-mono text-xs break-all"
              onChange={event => {
                setCode(event.target.value)
                setError(null)
              }}
              placeholder={t.starmap.sharePlaceholder}
              spellCheck={false}
              value={code}
            />
            {error ? <p className="m-0 text-xs text-(--ui-red)">{error}</p> : null}
          </SheetBody>
          <SheetFooter>
            <span className="flex-1" />
            <Button onClick={() => close(false)} type="button" variant="secondary">
              {t.common.cancel}
            </Button>
            <Button disabled={!code.trim()} type="submit">
              {t.starmap.importBtn}
            </Button>
          </SheetFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
