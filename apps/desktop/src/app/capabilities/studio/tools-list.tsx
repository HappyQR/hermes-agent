import { ListGroup, ListGroupRow } from '@/components/studio/pages/surfaces'
import { IconTile } from '@/components/studio/pages/tile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/i18n'
import type { ToolsetInfo } from '@/types/hermes'

import { asText, toolNames, toolsetDisplayLabel } from '../../settings/helpers'
import { toolsetCalls } from '../toolsets/toolsets-data'

import { toolsetTile } from './tiles'

// 工具 (prototype pages.js:70-77): one inset row per toolset — tile, name,
// what it does · how many tools · how often they ran, a "Needs keys" tag, the
// on/off switch and a chevron into the tool sheet.

interface ToolsListProps {
  busy: boolean
  onOpen: (toolset: ToolsetInfo) => void
  onToggle: (toolset: ToolsetInfo, enabled: boolean) => void
  /** Per-tool call counts; null until the usage scan lands. */
  toolCalls: null | Record<string, number>
  toolsets: readonly ToolsetInfo[]
}

export function ToolsList({ busy, onOpen, onToggle, toolCalls, toolsets }: ToolsListProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities

  return (
    <>
      <ListGroup>
        {toolsets.map(toolset => {
          const label = toolsetDisplayLabel(toolset)
          const tile = toolsetTile(toolset.name)
          const calls = toolCalls ? toolsetCalls(toolset, toolCalls) : 0

          const subtitle = [
            asText(toolset.description),
            c.tools.toolCount(toolNames(toolset).length),
            calls > 0 ? c.usedTimes(calls) : ''
          ]
            .filter(Boolean)
            .join(' · ')

          return (
            <ListGroupRow
              data-toolset={toolset.name}
              key={toolset.name}
              lead={<IconTile icon={tile.icon} size={30} tone={tile.tone} />}
              onOpen={() => onOpen(toolset)}
              subtitle={subtitle}
              title={label}
              trailing={
                <>
                  {toolset.configured ? null : (
                    <Badge asChild size="lg" variant="warn">
                      <button className="cursor-pointer" onClick={() => onOpen(toolset)} type="button">
                        {t.skills.needsKeys}
                      </button>
                    </Badge>
                  )}
                  <Switch
                    aria-label={t.skills.toggleToolset(label, !toolset.enabled)}
                    checked={toolset.enabled}
                    disabled={busy}
                    onCheckedChange={enabled => onToggle(toolset, enabled)}
                  />
                  <Button
                    aria-label={t.skills.configureToolset(label)}
                    className="text-(--ui-text-tertiary)"
                    onClick={() => onOpen(toolset)}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <StudioIcon name="chev-r" size={13} />
                  </Button>
                </>
              }
            />
          )
        })}
      </ListGroup>
      <p className="m-0 text-xs text-(--ui-text-tertiary)">{c.tools.footnote}</p>
    </>
  )
}
