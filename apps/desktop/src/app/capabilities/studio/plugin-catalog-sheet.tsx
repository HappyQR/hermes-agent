import { type ReactNode, useState } from 'react'

import { useI18n } from '@/i18n'
import { openCatalogPluginInstall } from '@/store/plugin-catalog-install'

import { CatalogBrowser } from '../catalog/catalog-browser'
import type { CatalogEntry } from '../catalog/catalog-data'

import { CatalogSheetFrame } from './hub-sheet'

// Browse plugin catalog: the in-app plugin catalog in an extra-wide sheet.
// "+" opens the shared dual-target install modal (agent half → catalog-pinned
// install into the page's profile; desktop half → this app). Installed
// packages are managed in the Plugins table; here they only show as installed,
// with the package's on/off switch. The catalog exists only while the sheet
// is open.

interface PluginCatalogSheetProps {
  /** The installed list is still loading: "+" waits until it can tell. */
  installedPending: boolean
  /** A catalog row the page already has installed (matched by catalog name). */
  isInstalled: (entry: CatalogEntry) => boolean
  onOpenChange: (open: boolean) => void
  open: boolean
  /** The whole-package switch for an installed row; null for the rest. */
  renderInstalledAction: (entry: CatalogEntry) => ReactNode
  /** The bare profile name installs target (null = the active profile). */
  scope: null | string
}

export function PluginCatalogSheet({ onOpenChange, open, ...catalog }: PluginCatalogSheetProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities.plugins

  return (
    <CatalogSheetFrame
      description={c.catalogHint}
      icon="puzzle"
      onOpenChange={onOpenChange}
      open={open}
      title={c.catalogTitle}
    >
      <PluginCatalog {...catalog} />
    </CatalogSheetFrame>
  )
}

/** Mounted with the sheet's content, so every visit starts with an empty search. */
function PluginCatalog({
  installedPending,
  isInstalled,
  renderInstalledAction,
  scope
}: Omit<PluginCatalogSheetProps, 'onOpenChange' | 'open'>) {
  const [query, setQuery] = useState('')

  return (
    <CatalogBrowser
      installedPending={installedPending}
      isInstalled={isInstalled}
      kind="plugins"
      // A plugin row's `source` IS its catalog tier (catalog-data.ts::catalogEntry);
      // CatalogEntry has no `tier` field, so don't "fix" this to entry.tier.
      onInstall={entry => openCatalogPluginInstall(entry, scope, { tier: entry.source })}
      onQueryChange={setQuery}
      query={query}
      renderInstalledAction={renderInstalledAction}
    />
  )
}
