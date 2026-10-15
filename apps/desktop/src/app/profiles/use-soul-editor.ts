import { useCallback, useEffect, useRef, useState } from 'react'

import { getProfileSoul, updateProfileSoul } from '@/hermes'
import { useI18n } from '@/i18n'
import { notify } from '@/store/notifications'

export interface SoulEditorState {
  content: string
  dirty: boolean
  error: null | string
  loading: boolean
  /** No SOUL.md on disk yet (an existing empty file is not missing). */
  missing: boolean
  save: () => Promise<void>
  saving: boolean
  setContent: (next: string) => void
}

/**
 * A profile's SOUL.md: load on profile change (a stale response for the
 * previous profile is dropped), track dirtiness, save. The sheet's editor and
 * its footer Save button share one instance.
 */
export function useSoulEditor(profileName: null | string): SoulEditorState {
  const { t } = useI18n()
  const p = t.profiles
  const [content, setContent] = useState('')
  const [original, setOriginal] = useState('')
  const [missing, setMissing] = useState(false)
  const [loading, setLoading] = useState(Boolean(profileName))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const requestRef = useRef<null | string>(profileName)

  // eslint-disable-next-line no-restricted-syntax -- legitimate non-atom ref write (see eslint rule comment)
  useEffect(() => {
    requestRef.current = profileName
    setError(null)
    setContent('')
    setOriginal('')
    setMissing(false)

    if (!profileName) {
      setLoading(false)

      return
    }

    setLoading(true)

    void (async () => {
      try {
        const soul = await getProfileSoul(profileName)

        if (requestRef.current === profileName) {
          setContent(soul.content)
          setOriginal(soul.content)
          setMissing(soul.exists === false)
        }
      } catch (err) {
        if (requestRef.current === profileName) {
          setError(err instanceof Error ? err.message : p.failedLoadSoul)
        }
      } finally {
        if (requestRef.current === profileName) {
          setLoading(false)
        }
      }
    })()
  }, [p, profileName])

  const save = useCallback(async () => {
    if (!profileName) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      await updateProfileSoul(profileName, content)
      setOriginal(content)
      setMissing(false)
      notify({ kind: 'success', title: p.soulSaved, message: profileName })
    } catch (err) {
      setError(err instanceof Error ? err.message : p.failedSaveSoul)
    } finally {
      setSaving(false)
    }
  }, [content, p, profileName])

  return { content, dirty: content !== original, error, loading, missing, save, saving, setContent }
}
