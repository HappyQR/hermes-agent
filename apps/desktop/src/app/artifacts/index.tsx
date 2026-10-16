import type * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { PageLoader } from '@/components/page-loader'
import { StudioPage } from '@/components/studio/pages/page'
import { Button } from '@/components/ui/button'
import { SearchField } from '@/components/ui/search-field'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { getSessionMessages, listAllProfileSessions } from '@/hermes'
import { useI18n } from '@/i18n'
import { downloadGatewayMediaFile, isArtifactFilePath, isRemoteGateway } from '@/lib/media'
import { normalize } from '@/lib/text'
import { notify, notifyError } from '@/store/notifications'

import { useRefreshHotkey } from '../hooks/use-refresh-hotkey'
import { useRouteEnumParam } from '../hooks/use-route-enum-param'
import { openSessionFromPicker } from '../open-session'
import { PanelEmpty } from '../overlays/panel'
import type { SetStatusbarItemGroup } from '../shell/statusbar-controls'

import { ArtifactQuickLook } from './artifact-quick-look'
import { ArtifactTile } from './artifact-tile'
import { type ArtifactRecord, loadArtifactsForSessions } from './artifact-utils'
import { ARTIFACT_VIEWS, type ArtifactView, matchesView, viewKindOf } from './view-kind'

interface ArtifactsViewProps extends React.ComponentProps<'section'> {
  setStatusbarItemGroup?: SetStatusbarItemGroup
}

// One grid page; "Show more" adds another.
const GALLERY_PAGE = 48

/** Artifacts (prototype pages.js:296-306): what the last 30 sessions produced — web
 *  pages, images, files and links — as a gallery; any item opens Quick Look. */
export function ArtifactsView({ setStatusbarItemGroup: _setStatusbarItemGroup, ...props }: ArtifactsViewProps) {
  const { t } = useI18n()
  const a = t.artifacts
  const s = t.studio.pages.artifacts
  const navigate = useNavigate()
  const [artifacts, setArtifacts] = useState<ArtifactRecord[] | null>(null)
  const [query, setQuery] = useState('')

  const [view, setView] = useRouteEnumParam('tab', ARTIFACT_VIEWS, 'all')

  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(() => new Set())
  const [limit, setLimit] = useState(GALLERY_PAGE)
  const [quickLookId, setQuickLookId] = useState<null | string>(null)

  const [refreshing, setRefreshing] = useState(false)
  const refreshInFlightRef = useRef(false)

  const refreshArtifacts = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return
    }

    refreshInFlightRef.current = true
    setRefreshing(true)

    try {
      const sessions = (await listAllProfileSessions(30, 1)).sessions

      const { artifacts: nextArtifacts, failures } = await loadArtifactsForSessions(sessions, (session, page) =>
        getSessionMessages(session.id, session.profile, {
          ...page,
          includeCompacted: true,
          order: 'oldest'
        })
      )

      if (failures.length > 0) {
        const safeLimitFailures = failures.filter(({ error }) =>
          String(error instanceof Error ? error.message : error).includes('safe-load limit')
        ).length

        const otherFailures = failures.length - safeLimitFailures

        const detail = [
          safeLimitFailures ? s.partialSafeLimit(safeLimitFailures) : '',
          otherFailures ? s.partialUnreadable(otherFailures) : ''
        ]
          .filter(Boolean)
          .join(' ')

        notify({
          id: 'artifacts-partial-load',
          kind: 'warning',
          title: a.failedLoad,
          message: s.partialSkipped(failures.length, sessions.length),
          detail,
          durationMs: 10_000
        })
      }

      setArtifacts(nextArtifacts.sort((left, right) => right.timestamp - left.timestamp))
    } catch (err) {
      notifyError(err, a.failedLoad)
      setArtifacts([])
    } finally {
      refreshInFlightRef.current = false
      setRefreshing(false)
    }
  }, [a, s])

  useRefreshHotkey(refreshArtifacts)

  useEffect(() => {
    void refreshArtifacts()
  }, [refreshArtifacts])

  useEffect(() => {
    setLimit(GALLERY_PAGE)
  }, [artifacts, view, query])

  const visibleArtifacts = useMemo(() => {
    if (!artifacts) {
      return []
    }

    const q = normalize(query)

    return artifacts.filter(artifact => {
      if (!matchesView(artifact, view)) {
        return false
      }

      if (!q) {
        return true
      }

      return (
        artifact.label.toLowerCase().includes(q) ||
        artifact.value.toLowerCase().includes(q) ||
        artifact.sessionTitle.toLowerCase().includes(q)
      )
    })
  }, [artifacts, view, query])

  const counts = useMemo(() => {
    const counted: Record<ArtifactView, number> = { all: 0, file: 0, image: 0, link: 0, web: 0 }

    for (const artifact of artifacts ?? []) {
      counted.all += 1
      counted[viewKindOf(artifact)] += 1
    }

    return counted
  }, [artifacts])

  const openArtifact = useCallback(
    async (artifact: ArtifactRecord) => {
      const { href } = artifact

      try {
        // A gateway-local file resolves to file:// in remote mode (the file
        // lives on the gateway, not this disk). Opening that locally fails —
        // and an OAuth remote connection has no query token to build a download
        // URL. Fetch the bytes over the authenticated fs bridge instead.
        // Tilde/relative hrefs have no file URL form. Keep them gateway-owned:
        // expanding them on the client would target the wrong home or cwd.
        if (isRemoteGateway() && isArtifactFilePath(artifact.value)) {
          await downloadGatewayMediaFile(artifact.value, { sessionId: artifact.sessionId, profile: artifact.profile })

          return
        }

        if (window.hermesDesktop?.openExternal) {
          await window.hermesDesktop.openExternal(href)
        } else {
          window.open(href, '_blank', 'noopener,noreferrer')
        }
      } catch (err) {
        notifyError(err, a.openFailed)
      }
    },
    [a]
  )

  const markImageFailed = useCallback((id: string) => {
    setFailedImageIds(current => {
      if (current.has(id)) {
        return current
      }

      return new Set(current).add(id)
    })
  }, [])

  const openQuickLook = useCallback((artifact: ArtifactRecord) => setQuickLookId(artifact.id), [])
  const openChat = useCallback((sessionId: string) => openSessionFromPicker(sessionId, navigate), [navigate])
  const quickLookIndex = quickLookId ? visibleArtifacts.findIndex(artifact => artifact.id === quickLookId) : -1

  const stepQuickLook = (step: -1 | 1) => {
    const next = visibleArtifacts[quickLookIndex + step]

    if (next) {
      setQuickLookId(next.id)
    }
  }

  const tools = (
    <>
      {counts.all > 0 ? (
        <SearchField
          aria-label={s.search}
          containerClassName="w-[13.75rem] max-w-full"
          onChange={setQuery}
          placeholder={s.search}
          value={query}
          variant="filled"
        />
      ) : null}
      <Tip label={refreshing ? a.refreshing : a.refresh}>
        <Button
          aria-label={refreshing ? a.refreshing : a.refresh}
          disabled={refreshing}
          onClick={() => void refreshArtifacts()}
          size="icon-sm"
          variant="ghost"
        >
          <StudioIcon className={refreshing ? 'motion-safe:animate-spin' : undefined} name="retry" size={15} />
        </Button>
      </Tip>
    </>
  )

  return (
    <StudioPage
      {...props}
      subtitle={s.subtitle}
      title={s.title}
      toolbar={
        // The type bar hugs its segments, like every other segmented control
        // (the prototype ran its track the page width, half of it empty).
        <div className="flex min-w-0" data-tour="page-tabs">
          <SegmentedControl<ArtifactView>
            aria-label={s.typeLabel}
            onChange={setView}
            options={ARTIFACT_VIEWS.map(id => ({
              dataTour: `tab-${id}`,
              id,
              label: s.tabs[id],
              meta: artifacts && counts[id] > 0 ? counts[id] : undefined
            }))}
            value={view}
          />
        </div>
      }
      tools={tools}
    >
      {!artifacts ? (
        <PageLoader className="min-h-80" label={a.indexing} />
      ) : visibleArtifacts.length === 0 ? (
        <div className="flex min-h-80 flex-col">
          <PanelEmpty
            description={counts.all === 0 ? a.noArtifactsDesc : s.noMatchDesc}
            icon="files"
            title={a.noArtifactsTitle}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-x-3.5 gap-y-4">
            {visibleArtifacts.slice(0, limit).map(artifact => (
              <ArtifactTile
                artifact={artifact}
                failedImage={failedImageIds.has(artifact.id)}
                key={artifact.id}
                onImageError={markImageFailed}
                onOpen={openQuickLook}
              />
            ))}
          </div>
          {visibleArtifacts.length > limit ? (
            <Button
              className="self-center"
              onClick={() => setLimit(current => current + GALLERY_PAGE)}
              variant="outline"
            >
              {s.showMore(limit, visibleArtifacts.length)}
            </Button>
          ) : null}
        </>
      )}
      <ArtifactQuickLook
        artifact={quickLookIndex >= 0 ? visibleArtifacts[quickLookIndex] : null}
        failedImageIds={failedImageIds}
        onClose={() => setQuickLookId(null)}
        onImageError={markImageFailed}
        onNavigate={stepQuickLook}
        onOpenExternally={artifact => void openArtifact(artifact)}
        onOpenSession={openChat}
      />
    </StudioPage>
  )
}
