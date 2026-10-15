import { useStore } from '@nanostores/react'

import { SegmentedControl } from '@/components/ui/segmented-control'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { $modeShadowed } from '@/store/interface-mode'
import { $reasoningCollapsedByDefault, setReasoningCollapsedByDefault } from '@/store/reasoning-disclosure'

import type { ConfigSettingsLayoutApi } from '../../config-settings'
import { getNested, setNested } from '../../helpers'
import { ListRow, ListRowSkeleton, ToggleRow } from '../../primitives'
import { SETTING_IDS, settingElementId } from '../../settings-manifest'

type Thinking = 'collapse' | 'hide' | 'show'

// Same truth as store/reasoning-disclosure setShowReasoningFromConfig: on unless explicitly false.
const reasoningShown = (value: unknown) => !(value === false || value === 'false' || value === 0)

/**
 * 思考过程 Thinking: one 3-way choice over the two settings it replaced —
 * `display.show_reasoning` (profile config: Hidden = off) and the
 * device-local "collapse thinking by default" (Show / Collapsed). Both deep
 * link targets (`?field=display.show_reasoning`, `?setting=appearance.reasoning-collapsed`)
 * land on this row.
 */
export function ThinkingRow({ api }: { api: ConfigSettingsLayoutApi }) {
  const { t } = useI18n()
  const r = t.studio.settings.rows
  const collapsed = useStore($reasoningCollapsedByDefault)
  const shadowed = useStore($modeShadowed('reasoningCollapsedByDefault'))
  const config = api.config

  if (!config) {
    return <ListRowSkeleton />
  }

  const shown = reasoningShown(getNested(config, 'display.show_reasoning'))
  const value: Thinking = shown ? (collapsed ? 'collapse' : 'show') : 'hide'

  const pick = (next: Thinking) => {
    triggerHaptic('selection')

    if ((next === 'hide') === shown) {
      api.updateConfig(setNested(config, 'display.show_reasoning', next !== 'hide'))
    }

    if (next !== 'hide') {
      setReasoningCollapsedByDefault(next === 'collapse')
    }
  }

  return (
    <div className="scroll-mt-6" id={settingElementId(SETTING_IDS.appearance.reasoningCollapsed)}>
      <ListRow
        action={
          <SegmentedControl
            aria-label={r.thinkingTitle}
            onChange={pick}
            options={[
              { id: 'show', label: r.thinkingShow },
              { id: 'collapse', label: r.thinkingCollapse },
              { id: 'hide', label: r.thinkingHide }
            ]}
            size="sm"
            value={value}
          />
        }
        description={shadowed ? `${r.thinkingDesc} ${t.interfaceMode.sessionNote}` : r.thinkingDesc}
        id="setting-field-display.show_reasoning"
        title={r.thinkingTitle}
      />
    </div>
  )
}

/** 显示时间戳: `display.timestamps` (profile config) — the timeline timestamps everywhere. */
export function TimestampsRow({ api }: { api: ConfigSettingsLayoutApi }) {
  const { t } = useI18n()
  const config = api.config

  if (!config) {
    return <ListRowSkeleton />
  }

  const value = getNested(config, 'display.timestamps')

  return (
    <ToggleRow
      checked={value === true || value === 'true' || value === 1}
      id="setting-field-display.timestamps"
      label={t.studio.settings.rows.timestampsTitle}
      onChange={on => api.updateConfig(setNested(config, 'display.timestamps', on))}
    />
  )
}
