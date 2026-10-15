import { useEffect } from 'react'

import { ActionStatus } from '@/components/ui/action-status'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Field, FieldHint } from '@/components/ui/field'
import { SanitizedInput } from '@/components/ui/sanitized-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/i18n'
import { AlertTriangle } from '@/lib/icons'
import { slug } from '@/lib/sanitize'
import type { ProfileInfo } from '@/types/hermes'

import { useCreateProfile } from './use-create-profile'

// Self-contained create flow (name + clone toggle + optional SOUL.md); the
// logic lives in useCreateProfile, shared with the Profiles sheet's inline
// pane. SOUL left blank keeps the cloned/blank persona untouched.
export function CreateProfileDialog({
  onClose,
  onCreated,
  open,
  profiles = []
}: {
  onClose: () => void
  onCreated?: (name: string) => Promise<void> | void
  open: boolean
  profiles?: ProfileInfo[]
}) {
  const { t } = useI18n()
  const p = t.profiles
  const form = useCreateProfile({ onCreated, onDone: onClose })
  const { busy, cloneFrom, error, invalid, name, reset, setCloneFrom, setName, setSoul, soul, status, trimmed } = form

  useEffect(() => {
    if (open) {
      reset()
    }
  }, [open, reset])

  return (
    <Dialog onOpenChange={value => !value && !busy && onClose()} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{p.newProfile}</DialogTitle>
          <DialogDescription>{p.createDesc}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={event => void form.submit(event)}>
          <Field htmlFor="new-profile-name" label={p.nameLabel}>
            <SanitizedInput
              aria-invalid={invalid}
              autoFocus
              id="new-profile-name"
              onValueChange={setName}
              placeholder="my-profile"
              sanitize={slug}
              value={name}
            />
            <FieldHint error={invalid}>{p.nameHint}</FieldHint>
          </Field>

          <Field htmlFor="new-profile-clone-from" label={p.cloneFrom}>
            <Select
              onValueChange={value => setCloneFrom(value === '__none__' ? null : value)}
              value={cloneFrom ?? '__none__'}
            >
              <SelectTrigger className="h-9 rounded-md" id="new-profile-clone-from">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">{p.cloneFromNone}</SelectItem>
                {profiles.map(profile => (
                  <SelectItem key={profile.name} value={profile.name}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldHint>{p.cloneFromDesc}</FieldHint>
          </Field>

          <Field htmlFor="new-profile-soul" label="SOUL.md" optional optionalLabel={p.soulOptional}>
            <Textarea
              className="min-h-28 font-mono text-xs leading-5"
              id="new-profile-soul"
              onChange={event => setSoul(event.target.value)}
              placeholder={p.soulPlaceholder(cloneFrom ? p.soulPlaceholderCloned : p.soulPlaceholderEmpty)}
              value={soul}
            />
          </Field>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter>
            <Button disabled={busy} onClick={onClose} type="button" variant="ghost">
              {t.common.cancel}
            </Button>
            <Button disabled={busy || !trimmed || invalid} type="submit">
              <ActionStatus busy={p.creating} done={p.created} idle={p.createAction} state={status} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
