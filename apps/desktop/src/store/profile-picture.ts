import { useStore } from '@nanostores/react'
import { atom } from 'nanostores'
import { useEffect } from 'react'

import { translateNow } from '@/i18n'

import { $gateway } from './gateway'
import { notify, notifyError } from './notifications'
import { normalizeProfileKey } from './profile'
import { $gatewayState } from './session'

// Profile pictures: the backend's per-profile `avatar` asset
// (profiles.get_asset / profiles.set_asset), the same image Bot Mode shows for
// a bot. Cached per gateway socket as data URLs; null = the profile has none.

/** Picked images are squared to this edge, Bot Mode's upload size. */
const PICTURE_EDGE = 256

/** Bot Mode rasterizes a bot's live face to a 160px PNG for inter-agent
 *  notices. That copy stands in for the face; it is not a chosen picture. */
const FACE_COPY_EDGE = 160

const PICTURE_TYPES = 'image/png,image/jpeg,image/webp,image/gif'

interface AssetReply {
  data?: string
  found?: boolean
}

export const $profilePictures = atom<Record<string, null | string>>({})

const loading = new Set<string>()
let generation = 0

// Another socket can be another gateway, or the same one restarted: forget
// what the old one answered and ask again.
$gateway.listen(() => {
  generation += 1
  loading.clear()
  $profilePictures.set({})
})

/** Whether a data URL is Bot Mode's 160px face copy (read from the PNG header). */
export function isFaceCopy(dataUrl: string): boolean {
  const prefix = 'data:image/png;base64,'

  if (!dataUrl.startsWith(prefix)) {
    return false
  }

  try {
    const head = atob(dataUrl.slice(prefix.length, prefix.length + 32))

    if (head.length < 24) {
      return false
    }

    const word = (at: number) =>
      ((head.charCodeAt(at) << 24) |
        (head.charCodeAt(at + 1) << 16) |
        (head.charCodeAt(at + 2) << 8) |
        head.charCodeAt(at + 3)) >>>
      0

    return word(16) === FACE_COPY_EDGE && word(20) === FACE_COPY_EDGE
  } catch {
    return false
  }
}

function remember(key: string, picture: null | string) {
  $profilePictures.set({ ...$profilePictures.get(), [key]: picture })
}

/** Ask the active gateway for a profile's picture once per socket. A failed
 *  ask stores nothing, so the next open socket asks again. */
export function loadProfilePicture(name: string): void {
  const key = normalizeProfileKey(name)
  const gateway = $gateway.get()

  if (!gateway || key in $profilePictures.get() || loading.has(key)) {
    return
  }

  const asked = generation
  loading.add(key)

  gateway
    .request<AssetReply>('profiles.get_asset', { asset: 'avatar', name: key })
    .then(reply => {
      if (asked === generation) {
        const data = reply?.found && typeof reply.data === 'string' ? reply.data : null

        remember(key, data && !isFaceCopy(data) ? data : null)
      }
    })
    .catch(() => undefined)
    .finally(() => {
      if (asked === generation) {
        loading.delete(key)
      }
    })
}

/** A profile's picture on the active gateway; null while unknown or absent. */
export function useProfilePicture(name: null | string | undefined): null | string {
  const pictures = useStore($profilePictures)
  const gateway = useStore($gateway)
  const open = useStore($gatewayState) === 'open'
  const key = name == null ? null : normalizeProfileKey(name)

  useEffect(() => {
    if (key && open) {
      loadProfilePicture(key)
    }
  }, [gateway, key, open])

  return key ? (pictures[key] ?? null) : null
}

async function storePicture(name: string, data: null | string): Promise<void> {
  const key = normalizeProfileKey(name)
  const gateway = $gateway.get()

  if (!gateway) {
    throw new Error('Hermes gateway unavailable')
  }

  await gateway.request(
    'profiles.set_asset',
    data ? { asset: 'avatar', data, name: key } : { asset: 'avatar', clear: true, name: key }
  )
  remember(key, data)
}

/** The file panel; null when it is dismissed. Opened straight from the click
 *  so the panel keeps the user's gesture. */
function pickPictureFile(): Promise<File | null> {
  return new Promise(resolve => {
    const input = document.createElement('input')

    input.type = 'file'
    input.accept = PICTURE_TYPES
    input.addEventListener('change', () => resolve(input.files?.[0] ?? null), { once: true })
    input.addEventListener('cancel', () => resolve(null), { once: true })
    input.click()
  })
}

/** The image cropped to its centre square and scaled to a PNG of PICTURE_EDGE. */
async function squarePicture(file: Blob): Promise<string> {
  const bitmap = await createImageBitmap(file)

  try {
    const side = Math.min(bitmap.width, bitmap.height)
    const canvas = document.createElement('canvas')

    canvas.width = PICTURE_EDGE
    canvas.height = PICTURE_EDGE

    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Canvas unavailable')
    }

    context.imageSmoothingQuality = 'high'
    context.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      PICTURE_EDGE,
      PICTURE_EDGE
    )

    return canvas.toDataURL('image/png')
  } finally {
    bitmap.close()
  }
}

/** Choose Picture…: the file panel, then the picked image as the profile's picture. */
export function chooseProfilePicture(name: string): void {
  void pickPictureFile().then(async file => {
    if (!file) {
      return
    }

    let picture: string

    try {
      picture = await squarePicture(file)
    } catch {
      notify({
        kind: 'error',
        message: translateNow('profiles.pictureUnreadable'),
        title: translateNow('profiles.pictureFailed')
      })

      return
    }

    try {
      await storePicture(name, picture)
    } catch (error) {
      notifyError(error, translateNow('profiles.pictureFailed'))
    }
  })
}

/** Remove Picture: back to the profile's color mark (or the home mark). */
export function removeProfilePicture(name: string): void {
  void storePicture(name, null).catch((error: unknown) => notifyError(error, translateNow('profiles.pictureFailed')))
}
