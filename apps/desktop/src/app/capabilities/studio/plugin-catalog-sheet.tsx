import { useEffect } from 'react'

import { useI18n } from '@/i18n'
import { CATALOG_ORIGIN, CATALOG_PICKER_URL } from '@/lib/plugin-catalog'
import { openCatalogPluginInstall } from '@/store/plugin-catalog-install'

import { CatalogSheetFrame } from './hub-sheet'

// Browse plugin catalog: the live Plugin Catalog page (docs site) in an extra-wide sheet.
// `?embed=picker` adds "+ Add to this Agent" per card, which posts
//   { type: 'hermes-plugin-pick', name, repo, sha, subdir, tier, installCmd }
// to this window; a pick opens the shared dual-target install modal (agent half
// → catalog-pinned install into the page's profile; desktop half → this app).
// The frame and its listener exist only while the sheet is open.

interface PluginPickMessage {
  installCmd?: string
  name?: string
  repo?: string
  sha?: string
  subdir?: string
  tier?: string
  type?: string
}

interface PluginCatalogSheetProps {
  onOpenChange: (open: boolean) => void
  open: boolean
  /** The bare profile name installs target (null = the active profile). */
  scope: null | string
}

export function PluginCatalogSheet({ onOpenChange, open, scope }: PluginCatalogSheetProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities.plugins

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== CATALOG_ORIGIN) {
        return
      }

      const data = event.data as null | PluginPickMessage

      if (!data || data.type !== 'hermes-plugin-pick' || !data.name || !data.repo) {
        return
      }

      // Already-installed short-circuit + the dialog itself live in the shared
      // helper so a catalog deep link behaves identically to this pick.
      openCatalogPluginInstall(
        {
          name: String(data.name),
          repo: String(data.repo),
          sha: data.sha ? String(data.sha) : undefined,
          subdir: data.subdir ? String(data.subdir) : undefined
        },
        scope
      )
    }

    window.addEventListener('message', onMessage)

    return () => window.removeEventListener('message', onMessage)
  }, [open, scope])

  return (
    <CatalogSheetFrame
      description={c.catalogHint}
      icon="puzzle"
      onOpenChange={onOpenChange}
      open={open}
      title={c.catalogTitle}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden" data-slot="plugin-catalog-frame">
        <iframe
          className="absolute top-0 left-0 h-[133.34%] w-[133.34%] origin-top-left scale-75 border-0 bg-transparent"
          sandbox="allow-scripts allow-same-origin"
          src={CATALOG_PICKER_URL}
          title={c.catalogTitle}
        />
      </div>
    </CatalogSheetFrame>
  )
}
