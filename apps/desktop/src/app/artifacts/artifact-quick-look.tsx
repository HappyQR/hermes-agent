import { useEffect, useRef, useState } from 'react'

import { LocalFilePreview } from '@/app/chat/right-rail/preview-file'
import { pickRevealLabel } from '@/app/right-sidebar/file-actions'
import { SheetBody, SheetHeader, STUDIO_SHEET_BODY, STUDIO_SHEET_CONTENT } from '@/components/studio/pages/sheet'
import { Spinner } from '@/components/studio/pages/tile'
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
import { useI18n } from '@/i18n'
import { copyTextToClipboard } from '@/lib/desktop-fs'
import { ExternalLink, hostPathLabel } from '@/lib/external-link'
import { normalizeOrLocalPreviewTarget } from '@/lib/local-preview'
import { isRemoteGateway } from '@/lib/media'
import { revealFile } from '@/store/file-actions'
import { notify, notifyError } from '@/store/notifications'
import { openPreview, type PreviewTarget, renderedHtmlTarget } from '@/store/preview'

import { formatWhen } from '../automations/format'

import { ArtifactThumb, useArtifactImageSrc, useArtifactLabel } from './artifact-tile'
import type { ArtifactRecord } from './artifact-utils'
import { type ArtifactViewKind, viewKindOf } from './view-kind'

// Quick Look (prototype overlays.js:363-373): the artifact in a wide sheet —
// name, kind · from «session» · time, Open in Inspector, a ⋯ menu (its
// session, reveal, copy, open with the default app / download) and the
// content itself. Space closes; ←/→ step through the gallery.

/** A local path Finder can reveal (absolute or file://), else null. */
function revealablePath(value: string): null | string {
  if (/^(?:\/|[A-Za-z]:[\\/])/.test(value)) {
    return value
  }

  if (/^file:\/\//i.test(value)) {
    try {
      return decodeURIComponent(new URL(value).pathname)
    } catch {
      return null
    }
  }

  return null
}

interface ArtifactQuickLookProps {
  artifact: ArtifactRecord | null
  failedImageIds: ReadonlySet<string>
  onClose: () => void
  onImageError: (id: string) => void
  onNavigate: (step: -1 | 1) => void
  onOpenExternally: (artifact: ArtifactRecord) => void
  onOpenSession: (sessionId: string) => void
}

export function ArtifactQuickLook({ artifact, onClose, ...props }: ArtifactQuickLookProps) {
  const last = useRef(artifact)

  if (artifact) {
    last.current = artifact
  }

  const shown = artifact ?? last.current

  return (
    <Dialog onOpenChange={open => !open && onClose()} open={artifact !== null}>
      {shown ? <QuickLookContent artifact={shown} key={shown.id} onClose={onClose} {...props} /> : null}
    </Dialog>
  )
}

function QuickLookContent({
  artifact,
  failedImageIds,
  onClose,
  onImageError,
  onNavigate,
  onOpenExternally,
  onOpenSession
}: Omit<ArtifactQuickLookProps, 'artifact'> & { artifact: ArtifactRecord }) {
  const { locale, t } = useI18n()
  const s = t.studio.pages.artifacts
  const kind = viewKindOf(artifact)
  const label = useArtifactLabel(artifact)
  const bodyRef = useRef<HTMLDivElement>(null)
  const when = formatWhen(artifact.timestamp, locale)

  const openInInspector = async () => {
    try {
      const target: null | PreviewTarget =
        kind === 'link'
          ? { kind: 'url', label, source: artifact.href, url: artifact.href }
          : await normalizeOrLocalPreviewTarget(artifact.value)

      if (!target) {
        throw new Error(s.previewUnavailable)
      }

      openPreview(kind === 'web' ? renderedHtmlTarget(target) : target)
      onClose()
    } catch (err) {
      notifyError(err, t.artifacts.openFailed)
    }
  }

  return (
    <DialogContent
      bodyClassName={STUDIO_SHEET_BODY}
      className={STUDIO_SHEET_CONTENT.wide}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          onNavigate(event.key === 'ArrowLeft' ? -1 : 1)
        } else if (event.key === ' ' && event.target === bodyRef.current) {
          // Space toggles Quick Look, as in Finder.
          event.preventDefault()
          onClose()
        }
      }}
      onOpenAutoFocus={event => {
        event.preventDefault()
        bodyRef.current?.focus()
      }}
      showCloseButton={false}
    >
      <SheetHeader
        description={s.sourceLine(s.kind[kind], artifact.sessionTitle, when)}
        title={label}
        trailing={
          <>
            <Button onClick={() => void openInInspector()} size="sm" variant="outline">
              {s.openInInspector}
            </Button>
            <QuickLookMenu
              artifact={artifact}
              kind={kind}
              onOpenExternally={onOpenExternally}
              onOpenSession={sessionId => {
                onClose()
                onOpenSession(sessionId)
              }}
            />
          </>
        }
      />
      <SheetBody className="pb-[18px]">
        <div
          className="relative flex h-[min(34rem,62vh)] min-h-64 flex-col overflow-hidden rounded-xl bg-(--pg-recessed) shadow-(--pg-card-ring) outline-none"
          data-slot="quick-look-body"
          ref={bodyRef}
          tabIndex={-1}
        >
          <QuickLookBody
            artifact={artifact}
            failedImage={failedImageIds.has(artifact.id)}
            kind={kind}
            label={label}
            onImageError={onImageError}
          />
        </div>
      </SheetBody>
    </DialogContent>
  )
}

function QuickLookMenu({
  artifact,
  kind,
  onOpenExternally,
  onOpenSession
}: {
  artifact: ArtifactRecord
  kind: ArtifactViewKind
  onOpenExternally: (artifact: ArtifactRecord) => void
  onOpenSession: (sessionId: string) => void
}) {
  const { t } = useI18n()
  const s = t.studio.pages.artifacts
  const m = t.fileMenu
  const isLink = kind === 'link'
  const remote = isRemoteGateway()
  const localPath = !isLink && !remote ? revealablePath(artifact.value) : null

  const copy = async () => {
    try {
      await copyTextToClipboard(artifact.value)
      notify({ durationMs: 1500, kind: 'info', message: isLink ? t.artifacts.copyUrl : m.pathCopied })
    } catch (err) {
      notifyError(err, t.common.copyFailed)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={t.studio.pages.common.moreActions} size="icon-sm" variant="ghost">
          <StudioIcon name="more" size={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem onSelect={() => onOpenSession(artifact.sessionId)}>
          <StudioIcon name="bubbles" size={14} />
          {s.openSession}
        </DropdownMenuItem>
        {localPath ? (
          <DropdownMenuItem onSelect={() => void revealFile(localPath)}>
            <StudioIcon name="reveal" size={14} />
            {pickRevealLabel(m.revealFinder, m.revealExplorer, m.revealFileManager)}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onSelect={() => void copy()}>
          <StudioIcon name="copy" size={14} />
          {isLink ? t.artifacts.copyUrl : t.artifacts.copyPath}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onOpenExternally(artifact)}>
          <StudioIcon name={remote && !isLink ? 'download' : 'external'} size={14} />
          {isLink ? t.artifactPreview.openInBrowser : remote ? m.download : s.openWithDefault}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function QuickLookBody({
  artifact,
  failedImage,
  kind,
  label,
  onImageError
}: {
  artifact: ArtifactRecord
  failedImage: boolean
  kind: ArtifactViewKind
  label: string
  onImageError: (id: string) => void
}) {
  if (kind === 'image') {
    return <QuickLookImage artifact={artifact} failedImage={failedImage} label={label} onImageError={onImageError} />
  }

  if (kind === 'link') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="relative block size-28">
          <ArtifactThumb artifact={artifact} failedImage={false} kind="link" large onImageError={onImageError} />
        </span>
        <b className="max-w-full text-[0.9375rem] font-semibold wrap-anywhere text-(--ui-text-primary)">{label}</b>
        <ExternalLink className="max-w-full text-xs wrap-anywhere text-(--ui-accent-text)" href={artifact.href}>
          {hostPathLabel(artifact.value)}
        </ExternalLink>
      </div>
    )
  }

  return <QuickLookFile artifact={artifact} kind={kind} onImageError={onImageError} />
}

function QuickLookImage({
  artifact,
  failedImage,
  label,
  onImageError
}: {
  artifact: ArtifactRecord
  failedImage: boolean
  label: string
  onImageError: (id: string) => void
}) {
  const src = useArtifactImageSrc(artifact, !failedImage, () => onImageError(artifact.id))

  if (failedImage || !src) {
    return (
      <span className="relative flex-1">
        <ArtifactThumb artifact={artifact} failedImage kind="image" large onImageError={onImageError} />
      </span>
    )
  }

  return (
    <img
      alt={label}
      className="m-auto max-h-full max-w-full object-contain p-3"
      onError={() => onImageError(artifact.id)}
      src={src}
    />
  )
}

/** Web pages and files: the same preview the Inspector shows (source, rendered markdown, PDF…). */
function QuickLookFile({
  artifact,
  kind,
  onImageError
}: {
  artifact: ArtifactRecord
  kind: ArtifactViewKind
  onImageError: (id: string) => void
}) {
  const { t } = useI18n()
  const [target, setTarget] = useState<null | PreviewTarget | undefined>(undefined)

  useEffect(() => {
    let active = true

    void normalizeOrLocalPreviewTarget(artifact.value)
      .then(next => active && setTarget(next))
      .catch(() => active && setTarget(null))

    return () => {
      active = false
    }
  }, [artifact.value])

  if (target === undefined) {
    return (
      <span className="m-auto text-(--ui-text-tertiary)">
        <Spinner />
      </span>
    )
  }

  if (!target) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="relative block size-28">
          <ArtifactThumb artifact={artifact} failedImage={false} kind={kind} large onImageError={onImageError} />
        </span>
        <span className="text-xs text-(--ui-text-tertiary)">{t.studio.pages.artifacts.previewUnavailable}</span>
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-hidden bg-(--ui-bg-editor)" data-selectable-text="true">
      <LocalFilePreview reloadKey={0} target={target} />
    </div>
  )
}
