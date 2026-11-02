import { useCallback, useState } from 'react'

import { createProfile, updateProfileSoul } from '@/hermes'
import { useI18n } from '@/i18n'

const PROFILE_NAME_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/

export function isValidProfileName(name: string): boolean {
  return PROFILE_NAME_RE.test(name.trim())
}

/**
 * The one create flow (name + clone source + optional SOUL.md), shared by the
 * rail's Create dialog and the Profiles sheet's inline pane. Owns the
 * createProfile/updateProfileSoul calls; `onCreated` refreshes/selects, then
 * `onDone` runs after the "Created" beat.
 */
export function useCreateProfile({
  onCreated,
  onDone
}: {
  onCreated?: (name: string) => Promise<void> | void
  onDone: () => void
}) {
  const { t } = useI18n()
  const p = t.profiles
  const [name, setName] = useState('')
  const [cloneFrom, setCloneFrom] = useState<null | string>('default')
  const [soul, setSoul] = useState('')
  const [status, setStatus] = useState<'done' | 'idle' | 'saving'>('idle')
  const [error, setError] = useState<null | string>(null)

  const trimmed = name.trim()
  const invalid = trimmed !== '' && !isValidProfileName(trimmed)
  const busy = status === 'saving' || status === 'done'

  const reset = useCallback(() => {
    setName('')
    setCloneFrom('default')
    setSoul('')
    setError(null)
    setStatus('idle')
  }, [])

  async function submit(event?: { preventDefault: () => void }) {
    event?.preventDefault()

    if (!trimmed || invalid) {
      setError(invalid ? p.invalidName(p.nameHint) : p.nameRequired)

      return
    }

    setStatus('saving')
    setError(null)

    try {
      const result = await createProfile({ name: trimmed, clone_from: cloneFrom, ...(soul.trim() ? { soul } : {}) })

      // Older remote backends do not accept an initial persona in the create request.
      if (soul.trim() && !result.soul_set) {
        await updateProfileSoul(trimmed, soul, trimmed)
      }

      await onCreated?.(trimmed)
      setStatus('done')
      window.setTimeout(onDone, 800)
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : p.failedCreate)
    }
  }

  return { busy, cloneFrom, error, invalid, name, reset, setCloneFrom, setName, setSoul, soul, status, submit, trimmed }
}
