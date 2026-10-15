import { useEffect, useState } from 'react'

import type { ProfileScope } from '@/api/client'
import { CodeEditor } from '@/components/chat/code-editor'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getProfileSoul, updateProfileSoul } from '@/hermes'
import { useI18n } from '@/i18n'
import { notify, notifyError } from '@/store/notifications'

// Right-click → Edit SOUL.md for a sidebar profile — the same in-app markdown
// editor as the memory-graph node edit, so a profile's persona is editable
// without opening the Manage overlay.
export function EditSoulDialog({
  gatewayLabel,
  onClose,
  profileName,
  scope
}: {
  gatewayLabel?: string
  onClose: () => void
  profileName: null | string
  scope?: ProfileScope
}) {
  const { t } = useI18n()
  const p = t.profiles
  const [content, setContent] = useState('')
  const [missing, setMissing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profileName) {
      return
    }

    let cancelled = false
    setLoading(true)
    setContent('')
    setMissing(false)

    getProfileSoul(profileName, scope)
      .then(soul => {
        if (!cancelled) {
          setContent(soul.content)
          setMissing(soul.exists === false)
        }
      })
      .catch(err => !cancelled && notifyError(err, p.failedLoadSoul))
      .finally(() => !cancelled && setLoading(false))

    return () => void (cancelled = true)
  }, [p, profileName, scope])

  const save = async () => {
    if (!profileName) {
      return
    }

    setSaving(true)

    try {
      await updateProfileSoul(profileName, content, scope)
      notify({ kind: 'success', title: p.soulSaved, message: profileName })
      onClose()
    } catch (err) {
      notifyError(err, p.failedSaveSoul)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog onOpenChange={open => !open && !saving && onClose()} open={profileName !== null}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {gatewayLabel && profileName ? p.fleet.onGateway(profileName, gatewayLabel) : profileName} · SOUL.md
          </DialogTitle>
        </DialogHeader>
        {missing && <p className="text-xs text-muted-foreground">{p.soulMissing}</p>}
        <div className="h-80">
          {!loading && profileName && (
            <CodeEditor
              filePath="SOUL.md"
              framed
              initialValue={content}
              key={profileName}
              onCancel={() => !saving && onClose()}
              onChange={setContent}
              onSave={() => void save()}
            />
          )}
        </div>
        <DialogFooter>
          <Button disabled={saving} onClick={onClose} type="button" variant="ghost">
            {t.common.cancel}
          </Button>
          <Button disabled={saving || loading} onClick={() => void save()}>
            {saving ? p.saving : p.saveSoul}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
