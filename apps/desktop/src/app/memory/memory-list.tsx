import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { FormSection } from '@/components/studio/pages/form'
import { ListGroup, ListGroupRow } from '@/components/studio/pages/surfaces'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { getHermesConfigRecord } from '@/hermes'
import { useI18n } from '@/i18n'
import { fmtDate } from '@/lib/time'
import type { StarmapGraph } from '@/types/hermes'

import type { NodeActions } from '../starmap/node-actions'

import { learnedSkills, memoryCharCount, type MemoryRow, memoryRows } from './graph-model'

// 列表 (prototype pages.js:404-414): what Hermes remembers (MEMORY.md), what it
// knows about you (USER.md) and the skills it wrote itself, each row editable
// and removable through the same actions as the map's right-click menu.

function configLimit(config: unknown, key: 'memory_char_limit' | 'user_char_limit'): null | number {
  const memory = (config as { memory?: Record<string, unknown> } | undefined)?.memory
  const value = memory?.[key]

  return typeof value === 'number' && value > 0 ? value : null
}

interface MemoryListProps {
  actions: NodeActions
  graph: StarmapGraph
}

export function MemoryList({ actions, graph }: MemoryListProps) {
  const { t } = useI18n()
  const m = t.studio.pages.memory

  // Budgets are configurable (Settings › Memory & Context); show them when known.
  const config = useQuery({ queryKey: ['memory-page', 'config'], queryFn: () => getHermesConfigRecord(), retry: false })
  const memory = memoryRows(graph, 'memory')
  const profile = memoryRows(graph, 'profile')
  const skills = learnedSkills(graph)

  const scope = (file: string, rows: MemoryRow[], limit: null | number) => {
    const used = memoryCharCount(rows)

    return used !== null && limit !== null ? m.usage(file, used, limit) : m.entries(file, rows.length)
  }

  return (
    <>
      <MemorySection
        actions={actions}
        empty={m.emptyMemory}
        icon="brain"
        meta={scope('MEMORY.md', memory, configLimit(config.data, 'memory_char_limit'))}
        rows={memory}
        title={m.listMemory}
      />
      <MemorySection
        actions={actions}
        empty={m.emptyUser}
        icon="person"
        meta={scope('USER.md', profile, configLimit(config.data, 'user_char_limit'))}
        rows={profile}
        title={m.listUser}
      />
      <FormSection meta={m.listSkillsScope} title={m.listSkills}>
        {skills.length === 0 ? (
          <p className="m-0 px-1 text-[0.78125rem] text-(--ui-text-tertiary)">{m.emptySkills}</p>
        ) : (
          <ListGroup>
            {skills.map(skill => (
              <ListGroupRow
                key={skill.id}
                lead={<StudioIcon className="text-(--ui-text-tertiary)" name="cube" size={16} />}
                subtitle={[
                  skill.category,
                  m.usedTimes(skill.useCount),
                  skill.timestamp ? m.lastActive(fmtDate.format(new Date(skill.timestamp * 1000))) : null
                ]
                  .filter(Boolean)
                  .join(' · ')}
                title={<span className="font-mono text-[0.78125rem]">{skill.label}</span>}
                trailing={
                  <>
                    <Badge variant="default">{m.learnedBadge}</Badge>
                    <RowActions
                      label={skill.label}
                      onDelete={() => actions.remove({ id: skill.id, kind: 'skill', label: skill.label })}
                      onEdit={() => void actions.edit({ id: skill.id, kind: 'skill', label: skill.label })}
                      removeLabel={m.archiveSkill}
                    />
                  </>
                }
              />
            ))}
          </ListGroup>
        )}
      </FormSection>
    </>
  )
}

function MemorySection({
  actions,
  empty,
  icon,
  meta,
  rows,
  title
}: {
  actions: NodeActions
  empty: string
  icon: StudioIconName
  meta: ReactNode
  rows: MemoryRow[]
  title: string
}) {
  const { t } = useI18n()
  const m = t.studio.pages.memory

  return (
    <FormSection meta={meta} title={title}>
      {rows.length === 0 ? (
        <p className="m-0 px-1 text-[0.78125rem] text-(--ui-text-tertiary)">{empty}</p>
      ) : (
        <ListGroup>
          {rows.map(row => (
            <ListGroupRow
              key={row.id}
              lead={<StudioIcon className="mt-0.5 self-start text-(--ui-text-tertiary)" name={icon} size={16} />}
              trailing={
                <RowActions
                  label={row.card.title}
                  onDelete={() => actions.remove({ id: row.id, kind: 'memory', label: row.card.title })}
                  onEdit={() => void actions.edit({ id: row.id, kind: 'memory', label: row.card.title })}
                  removeLabel={m.deleteMemory}
                />
              }
            >
              <p className="pg-clamp-3 m-0 min-w-0 flex-1 whitespace-pre-line text-[0.8125rem] leading-normal text-(--ui-text-primary)">
                {row.preview}
              </p>
            </ListGroupRow>
          ))}
        </ListGroup>
      )}
    </FormSection>
  )
}

function RowActions({
  label,
  onDelete,
  onEdit,
  removeLabel
}: {
  label: string
  onDelete: () => void
  onEdit: () => void
  removeLabel: string
}) {
  const { t } = useI18n()
  const m = t.studio.pages.memory

  return (
    <span className="flex shrink-0 items-center gap-0.5">
      <Tip label={m.editRow}>
        <Button aria-label={m.rowActionAria(m.editRow, label)} onClick={onEdit} size="icon-xs" variant="ghost">
          <StudioIcon name="pencil" size={13} />
        </Button>
      </Tip>
      <Tip label={removeLabel}>
        <Button aria-label={m.rowActionAria(removeLabel, label)} onClick={onDelete} size="icon-xs" variant="ghost">
          <StudioIcon name="trash" size={13} />
        </Button>
      </Tip>
    </span>
  )
}
