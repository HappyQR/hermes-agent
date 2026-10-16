import { type ReactNode, useRef, useState } from 'react'

import { ArchiveSkillConfirmDialog, fireOptimistic } from '@/app/learning/archive-skill-confirm-dialog'
import { CodeEditor } from '@/components/chat/code-editor'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { deleteLearningNode, editLearningNode, getLearningNode } from '@/hermes'
import { useI18n } from '@/i18n'
import { notifyError } from '@/store/notifications'
import { evictStarmapNode, loadStarmapGraph } from '@/store/starmap'

import { useOnProfileSwitch } from '../hooks/use-on-profile-switch'

// Edit / delete for one learned node (a skill or a memory entry), shared by the
// star map's right-click menu and the Memory page's list rows so both open the
// same editor and the same confirmations: memories delete optimistically with
// rollback, skills archive (restorable with `hermes curator restore`).

export interface NodeActionTarget {
  id: string
  kind: 'memory' | 'skill'
  label: string
}

interface EditState {
  content: string
  id: string
  kind: NodeActionTarget['kind']
  label: string
}

export interface NodeActions {
  /** True while the editor or a confirmation is open. */
  active: boolean
  /** Node-specific dialogs; render once next to the triggers. */
  dialogs: ReactNode
  /** Fetch the node's source and open the editor; resolves once it is shown (or failed). */
  edit: (target: NodeActionTarget) => Promise<void>
  /** True while an edit is fetching its content. */
  loading: boolean
  /** Ask before deleting a memory / archiving a skill. */
  remove: (target: NodeActionTarget) => void
}

export function useNodeActions({ onNodeRemoved }: { onNodeRemoved?: (id: string) => void } = {}): NodeActions {
  const { t } = useI18n()
  const m = t.studio.pages.memory
  const [editing, setEditing] = useState<EditState | null>(null)
  const [deleting, setDeleting] = useState<NodeActionTarget | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<null | string>(null)

  // Bumped on profile switch so an in-flight edit fetch from profile A can't
  // reopen the editor with A's node content after switching to B.
  const editEpoch = useRef(0)

  // A profile switch swaps the backend under an open edit/delete dialog — its
  // node id belongs to the previous profile, so a Save/Delete after the switch
  // would hit the newly active profile. Close everything on switch.
  useOnProfileSwitch(() => {
    editEpoch.current += 1
    setEditing(null)
    setDeleting(null)
    setError(null)
  })

  const edit = async (target: NodeActionTarget) => {
    const epoch = editEpoch.current
    setLoading(true)
    setError(null)

    try {
      const detail = await getLearningNode(target.id)

      if (editEpoch.current === epoch) {
        setEditing({ content: detail.content, id: target.id, kind: target.kind, label: target.label })
      }
    } catch (e) {
      notifyError(e, target.label)
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    if (!editing) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await editLearningNode(editing.id, editing.content)

      if (!res.ok) {
        throw new Error(res.message)
      }

      setEditing(null)
      void loadStarmapGraph(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const dialogs = (
    <>
      <Dialog onOpenChange={value => !value && !saving && setEditing(null)} open={Boolean(editing)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{m.editTitle(editing?.label ?? '')}</DialogTitle>
          </DialogHeader>
          <div className="h-80">
            {editing && (
              <CodeEditor
                filePath={editing.kind === 'skill' ? 'SKILL.md' : 'memory.md'}
                framed
                initialValue={editing.content}
                key={editing.id}
                onCancel={() => !saving && setEditing(null)}
                onChange={content => setEditing(prev => (prev ? { ...prev, content } : prev))}
                onSave={() => void save()}
              />
            )}
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button disabled={saving} onClick={() => setEditing(null)} type="button" variant="ghost">
              {t.common.cancel}
            </Button>
            <Button disabled={saving} onClick={() => void save()}>
              {saving ? t.common.saving : t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deleting?.kind === 'skill' ? (
        <ArchiveSkillConfirmDialog
          onApply={() => {
            onNodeRemoved?.(deleting.id)

            return evictStarmapNode(deleting.id)
          }}
          onClose={() => setDeleting(null)}
          onFailure={(err, name) => notifyError(err, name)}
          open
          skillId={deleting.id}
          skillName={deleting.label}
        />
      ) : (
        <ConfirmDialog
          confirmLabel={t.common.delete}
          description={m.deleteMemoryBody}
          destructive
          dismissOnConfirm
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            if (!deleting) {
              return
            }

            const { id, label } = deleting
            const rollback = evictStarmapNode(id)
            onNodeRemoved?.(id)

            fireOptimistic(
              deleteLearningNode(id).then(res => {
                if (!res.ok) {
                  throw new Error(res.message)
                }
              }),
              rollback,
              err => notifyError(err, label)
            )
          }}
          open={Boolean(deleting)}
          title={m.deleteMemoryTitle(deleting?.label ?? '')}
        />
      )}
    </>
  )

  return { active: editing !== null || deleting !== null, dialogs, edit, loading, remove: setDeleting }
}
