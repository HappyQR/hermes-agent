import { useEffect, useRef, useState } from 'react'

import { renameSessionPreferringRpc } from '@/app/chat/sidebar/session-actions-menu'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/i18n'
import { isSubmitEnter } from '@/lib/ime'
import { notify, notifyError } from '@/store/notifications'
import { applyRenamedSessionTitle } from '@/store/projects'
import { applySessionTitle } from '@/store/session'

import { useNativeMenu } from './native-menu'
import type { MenuSessionActions } from './native-menu-commands'
import type { MenuSessionTarget } from './native-menu-state'

/**
 * The macOS application menu (see native-menu.ts), mounted once per window in
 * the contrib wiring. Renders nothing but the Session › Rename… sheet.
 */
export function NativeMenu({ actions }: { actions: MenuSessionActions }) {
  const rename = useNativeMenu(actions)

  return rename.target ? <RenameSessionSheet onClose={rename.close} open={rename.open} target={rename.target} /> : null
}

/** Session › Rename… — the same rename the session menus run
 *  (`renameSessionPreferringRpc`, then the same title fan-out). */
function RenameSessionSheet({
  onClose,
  open,
  target
}: {
  onClose: () => void
  open: boolean
  target: MenuSessionTarget
}) {
  const { t } = useI18n()
  const r = t.sidebar.row
  const [value, setValue] = useState(target.title)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setValue(target.title)
      window.setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [open, target])

  const submit = async () => {
    const next = value.trim()

    if (submitting) {
      return
    }

    if (next === target.title.trim()) {
      onClose()

      return
    }

    setSubmitting(true)

    try {
      const result = await renameSessionPreferringRpc(target.id, next, target.profile)
      const finalTitle = result.title || next || ''

      applySessionTitle(target.id, finalTitle || null)
      applyRenamedSessionTitle(target.id, finalTitle || null)
      notify({ durationMs: 2_000, kind: 'success', message: r.renamed })
      onClose()
    } catch (err) {
      notifyError(err, r.renameFailed)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog onOpenChange={next => (next ? undefined : onClose())} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{r.renameTitle}</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          disabled={submitting}
          onChange={event => setValue(event.target.value)}
          onKeyDown={event => {
            if (isSubmitEnter(event)) {
              event.preventDefault()
              void submit()
            } else if (event.key === 'Escape') {
              onClose()
            }
          }}
          placeholder={r.untitledPlaceholder}
          ref={inputRef}
          value={value}
        />
        <DialogFooter>
          <Button disabled={submitting} onClick={onClose} type="button" variant="ghost">
            {t.common.cancel}
          </Button>
          <Button disabled={submitting} onClick={() => void submit()} type="button">
            {t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
