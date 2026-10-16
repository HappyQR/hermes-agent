import { useState } from 'react'

import { FormCell, FormGroup, FormRow } from '@/app/overlays/studio/form-group'
import { ActionStatus } from '@/components/ui/action-status'
import { Button } from '@/components/ui/button'
import { SanitizedInput } from '@/components/ui/sanitized-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/i18n'
import { AlertTriangle } from '@/lib/icons'
import { PROFILE_SWATCHES } from '@/lib/profile-color'
import { slug } from '@/lib/sanitize'
import { cn } from '@/lib/utils'
import { setProfileColor } from '@/store/profile'
import type { ProfileInfo } from '@/types/hermes'

import { useCreateProfile } from './use-create-profile'

/**
 * New profile — the Profiles sheet's inline create pane (same flow as the
 * rail's Create dialog: name, clone source, optional SOUL.md) plus a colour.
 */
export function CreateProfilePane({
  onCreated,
  profiles
}: {
  onCreated: (name: string) => Promise<void> | void
  profiles: ProfileInfo[]
}) {
  const { t } = useI18n()
  const p = t.profiles
  const [color, setColor] = useState<null | string>(null)

  const form = useCreateProfile({
    onCreated: async name => {
      if (color) {
        setProfileColor(name, color)
      }

      await onCreated(name)
    },
    onDone: () => form.reset()
  })

  return (
    <form className="flex flex-col gap-3" onSubmit={event => void form.submit(event)}>
      <FormGroup>
        <FormRow
          description={p.nameHint}
          title={<label htmlFor="sheet-new-profile-name">{p.nameLabel}</label>}
        >
          <SanitizedInput
            aria-invalid={form.invalid}
            autoFocus
            className="w-52"
            id="sheet-new-profile-name"
            onValueChange={form.setName}
            placeholder="my-profile"
            sanitize={slug}
            value={form.name}
          />
        </FormRow>
        <FormRow description={p.cloneFromDesc} title={<label htmlFor="sheet-new-profile-clone">{p.cloneFrom}</label>}>
          <Select
            onValueChange={value => form.setCloneFrom(value === '__none__' ? null : value)}
            value={form.cloneFrom ?? '__none__'}
          >
            <SelectTrigger className="w-44" id="sheet-new-profile-clone">
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
        </FormRow>
        <FormRow title={p.colorFor}>
          <div className="flex flex-wrap justify-end gap-2" role="group">
            {PROFILE_SWATCHES.slice(0, 8).map(swatch => (
              <button
                aria-label={p.setColor(swatch)}
                aria-pressed={color === swatch}
                className={cn(
                  'size-5 rounded-full shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.15)] transition-transform hover:scale-110',
                  color === swatch && 'ring-2 ring-(--ui-text-primary) ring-offset-2 ring-offset-(--ui-bg-editor)'
                )}
                key={swatch}
                onClick={() => setColor(current => (current === swatch ? null : swatch))}
                style={{ backgroundColor: swatch }}
                type="button"
              />
            ))}
          </div>
        </FormRow>
        <FormRow stack title={<label htmlFor="sheet-new-profile-soul">SOUL.md</label>}>
          <Textarea
            className="min-h-28 font-mono text-xs leading-5"
            id="sheet-new-profile-soul"
            onChange={event => form.setSoul(event.target.value)}
            placeholder={p.soulPlaceholder(form.cloneFrom ? p.soulPlaceholderCloned : p.soulPlaceholderEmpty)}
            value={form.soul}
          />
        </FormRow>
        {form.error && (
          <FormCell className="flex items-start gap-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>{form.error}</span>
          </FormCell>
        )}
        <FormCell className="flex justify-end">
          <Button disabled={form.busy || !form.trimmed || form.invalid} type="submit">
            <ActionStatus busy={p.creating} done={p.created} idle={p.createAction} state={form.status} />
          </Button>
        </FormCell>
      </FormGroup>
    </form>
  )
}
