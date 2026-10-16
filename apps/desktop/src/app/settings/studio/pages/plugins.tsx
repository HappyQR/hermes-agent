import { useCallback } from 'react'

import { FormCell, FormRow } from '@/app/overlays/studio/form-group'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { StudioIcon } from '@/components/ui/studio-icon'
import { type PluginSettingsEntry, pluginSettingsRouteOf, type PluginSettingsTarget } from '@/contrib/settings-pages'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'

import { CAPABILITIES_ROUTE } from '../../../routes'
import { type OpenPluginSettings, PluginSettingsPane, usePluginSettingsRoute } from '../../plugin-settings'
import { EmptyState } from '../../primitives'
import { useSettingsDrill } from '../drill'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

const MANAGE_PLUGINS_HREF = `#${CAPABILITIES_ROUTE}?tab=plugins`

function PluginRows({ entries, onOpen }: { entries: readonly PluginSettingsEntry[]; onOpen: OpenPluginSettings }) {
  const { t } = useI18n()
  const copy = t.settings.pluginPages

  if (entries.length === 0) {
    return (
      <FormCell>
        <EmptyState title={copy.empty} />
      </FormCell>
    )
  }

  return entries.map(entry => {
    // The landing page counts as one; sub-pages add to it.
    const pages = entry.children.length + 1

    return (
      <button
        className="flex min-h-[2.625rem] w-full items-center gap-3 px-3.5 py-2 text-left text-[0.8125rem] shadow-[inset_0_0.5px_0_var(--ui-line)] transition-colors duration-100 hover:bg-(--ui-hover)"
        data-testid={`plugin-settings-row-${entry.uid}`}
        key={entry.uid}
        onClick={() => {
          triggerHaptic('selection')
          onOpen(pluginSettingsRouteOf(entry))
        }}
        type="button"
      >
        <StudioIcon className="text-(--ui-text-tertiary)" name="puzzle" size={16} />
        <span className="min-w-0 flex-1 truncate">{entry.title}</span>
        {pages > 1 && <span className="shrink-0 text-xs text-(--ui-text-tertiary)">{copy.pageCount(pages)}</span>}
        <StudioIcon className="text-(--ui-text-tertiary)" name="chev-r" size={12} />
      </button>
    )
  })
}

/** A plugin's page in the window: its sub-pages as tabs, the page itself on a card. */
function PluginDrill({
  onOpen,
  plugins,
  target
}: {
  onOpen: OpenPluginSettings
  plugins: ReturnType<typeof usePluginSettingsRoute>
  target: PluginSettingsTarget | null
}) {
  const entry = target?.entry
  const children = entry?.children ?? []
  const current = target?.child ? (target.child.agentKey ?? target.child.id) : ''

  return (
    <>
      {entry && children.length > 0 && (
        <div className="flex justify-center">
          <SegmentedControl
            aria-label={entry.title}
            onChange={id => {
              const child = children.find(node => (node.agentKey ?? node.id) === id)
              onOpen(pluginSettingsRouteOf(entry, child))
            }}
            options={[
              { id: '', label: entry.title },
              ...children.map(node => ({ id: node.agentKey ?? node.id, label: node.title }))
            ]}
            value={current}
          />
        </div>
      )}
      <SettingsWindowSection id="pages" page="plugins">
        <FormCell>
          <PluginSettingsPane
            entries={plugins.entries}
            missing={plugins.missing}
            onOpen={plugins.open}
            pending={plugins.pending}
            target={target}
          />
        </FormCell>
      </SettingsWindowSection>
    </>
  )
}

/** Plugins: one row per plugin with settings (drill-in with Back), then Install & Enable. */
export function PluginsPage() {
  const { t } = useI18n()
  const s = t.studio.settings.sections.plugins
  const copy = t.settings.pluginPages
  const plugins = usePluginSettingsRoute(true)
  const target = plugins.target
  const drilled = Boolean(target) || plugins.pending
  const open = plugins.open
  const back = useCallback(() => open(null), [open])

  useSettingsDrill(drilled ? { onBack: back, title: target?.child?.title ?? target?.entry.title ?? s.pages } : null)

  if (drilled) {
    return <PluginDrill onOpen={plugins.open} plugins={plugins} target={target} />
  }

  return (
    <>
      <SettingsWindowSection
        aside={<SettingsScopeBadge page="plugins" />}
        id="pages"
        note={plugins.missing ? copy.missing : copy.blurb}
        page="plugins"
        title={s.pages}
      >
        <PluginRows entries={plugins.entries} onOpen={plugins.open} />
      </SettingsWindowSection>
      <SettingsWindowSection id="manage" page="plugins" title={s.manage}>
        <FormRow description={t.studio.settings.rows.pluginsManageDesc} title={copy.manage}>
          <Button asChild size="sm" variant="secondary">
            <a href={MANAGE_PLUGINS_HREF}>{t.studio.settings.rows.pluginsManageAction}</a>
          </Button>
        </FormRow>
      </SettingsWindowSection>
    </>
  )
}
