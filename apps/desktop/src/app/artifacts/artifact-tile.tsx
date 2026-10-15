import { memo, useEffect, useState } from 'react'

import { IconTile } from '@/components/studio/pages/tile'
import { FileTypeIcon } from '@/components/ui/file-type-icon'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { resolveBrandIcon } from '@/lib/brand-icon'
import { shortHostLabel, urlSlugTitleLabel, useLinkTitle } from '@/lib/external-link'
import { cn } from '@/lib/utils'

import { formatWhen } from '../automations/format'

import { artifactImageSrc, type ArtifactRecord } from './artifact-utils'
import { type ArtifactViewKind, fileExtension, viewKindOf } from './view-kind'

// 产物 gallery tile (prototype pages.js:301-303 `.g-item`): a 4:3 thumbnail
// that lifts on hover, the name and "session · time". Activating it opens
// Quick Look.

/** A link's title: fetched when known, else the URL's slug. */
export function useArtifactLabel(artifact: ArtifactRecord): string {
  const isLink = artifact.kind === 'link'
  const fetched = useLinkTitle(isLink ? artifact.href : null)

  return isLink ? fetched || urlSlugTitleLabel(artifact.href) : artifact.label
}

export function useArtifactImageSrc(artifact: ArtifactRecord, enabled: boolean, onError: () => void): string {
  const [src, setSrc] = useState('')

  useEffect(() => {
    if (!enabled) {
      return
    }

    let active = true

    setSrc('')
    void artifactImageSrc(artifact.value)
      .then(next => {
        if (active) {
          setSrc(next)
        }
      })
      .catch(() => {
        if (active) {
          onError()
        }
      })

    return () => {
      active = false
    }
    // onError is a stable callback from the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifact.value, enabled])

  return src
}

interface ArtifactThumbProps {
  artifact: ArtifactRecord
  failedImage: boolean
  kind: ArtifactViewKind
  large?: boolean
  onImageError: (id: string) => void
}

/** What an artifact looks like: the image itself, or its kind's mark. */
export function ArtifactThumb({ artifact, failedImage, kind, large = false, onImageError }: ArtifactThumbProps) {
  const src = useArtifactImageSrc(artifact, kind === 'image' && !failedImage, () => onImageError(artifact.id))

  if (kind === 'image' && !failedImage) {
    return src ? (
      <img
        alt=""
        className="absolute inset-0 size-full object-cover"
        decoding="async"
        loading="lazy"
        onError={() => onImageError(artifact.id)}
        src={src}
      />
    ) : null
  }

  return (
    <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-(--ui-text-tertiary)">
      <ThumbMark artifact={artifact} kind={kind} large={large} />
    </span>
  )
}

function ThumbMark({ artifact, kind, large }: { artifact: ArtifactRecord; kind: ArtifactViewKind; large: boolean }) {
  if (kind === 'link') {
    const Brand = resolveBrandIcon(shortHostLabel(artifact.href))

    return Brand ? (
      <Brand aria-hidden className={cn('text-(--ui-text-secondary)', large ? 'size-14' : 'size-9')} />
    ) : (
      <StudioIcon className="text-primary" name="link" size={large ? 48 : 30} />
    )
  }

  if (kind === 'web') {
    return <IconTile icon="compass" size={large ? 56 : 40} tone="blue" />
  }

  if (kind === 'image') {
    return <StudioIcon name="photo" size={large ? 48 : 30} />
  }

  const extension = fileExtension(artifact.value)

  return (
    <>
      <FileTypeIcon className="text-(--ui-text-secondary)" path={artifact.value} size={large ? '3rem' : '2rem'} />
      {extension ? (
        <span className="font-mono text-[0.6875rem] font-semibold tracking-wide text-(--ui-text-tertiary)">
          {extension}
        </span>
      ) : null}
    </>
  )
}

interface ArtifactTileProps {
  artifact: ArtifactRecord
  failedImage: boolean
  onImageError: (id: string) => void
  onOpen: (artifact: ArtifactRecord) => void
}

export const ArtifactTile = memo(function ArtifactTile({
  artifact,
  failedImage,
  onImageError,
  onOpen
}: ArtifactTileProps) {
  const { locale } = useI18n()
  const kind = viewKindOf(artifact)
  const label = useArtifactLabel(artifact)

  return (
    <button
      aria-label={label}
      className="group flex min-w-0 cursor-pointer flex-col gap-2 rounded-[14px] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      data-artifact-kind={kind}
      data-tour="artifact-card"
      onClick={() => onOpen(artifact)}
      type="button"
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-(--pg-recessed) shadow-(--pg-card-ring) transition-[transform,box-shadow] duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:shadow-(--pg-card-lift) motion-safe:group-hover:-translate-y-0.5">
        <ArtifactThumb artifact={artifact} failedImage={failedImage} kind={kind} onImageError={onImageError} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5 px-0.5">
        <b className="truncate text-[0.8125rem] font-semibold text-(--ui-text-primary)">{label}</b>
        <span className="truncate text-[0.71875rem] text-(--ui-text-tertiary)">
          {artifact.sessionTitle} · {formatWhen(artifact.timestamp, locale)}
        </span>
      </span>
    </button>
  )
})
