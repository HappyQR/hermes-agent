import { Fragment, useMemo } from 'react'

import {
  CardGrid,
  GridCard,
  GridCardFoot,
  GridCardText,
  GridCardTop,
  SectionTitle
} from '@/components/studio/pages/surfaces'
import { IconTile, Spinner } from '@/components/studio/pages/tile'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/i18n'
import type { OfficialSkillInfo, SkillInfo } from '@/types/hermes'

import { asText, prettyName } from '../../settings/helpers'
import { categoryFor, usageOf } from '../skills/skills-data'

import { skillSourceLabel } from './skill-sheets'
import { skillTile } from './tiles'

// 技能 (prototype pages.js:45-67): installed skills as cards, grouped by
// category in the list's sort order, then the official skills that can still
// be installed. A card's switch turns the skill on/off; its title and Details
// open the skill sheet.

interface CategoryGroup {
  category: string
  skills: SkillInfo[]
}

/** Category sections in the order their first skill appears. */
export function groupByCategory(skills: readonly SkillInfo[]): CategoryGroup[] {
  const groups = new Map<string, SkillInfo[]>()

  for (const skill of skills) {
    const key = categoryFor(skill)
    const bucket = groups.get(key)

    if (bucket) {
      bucket.push(skill)
    } else {
      groups.set(key, [skill])
    }
  }

  return [...groups.entries()].map(([category, members]) => ({ category, skills: members }))
}

// Long lists stay cheap: off-screen cards skip layout and paint.
const LAZY_CARD = '[content-visibility:auto] [contain-intrinsic-size:auto_9.5rem]'

interface SkillsGridProps {
  busy: boolean
  installing: ReadonlySet<string>
  official: readonly OfficialSkillInfo[]
  onInstallOfficial: (skill: OfficialSkillInfo) => void
  onOpenOfficial: (skill: OfficialSkillInfo) => void
  onOpenSkill: (skill: SkillInfo) => void
  onToggleSkill: (skill: SkillInfo, enabled: boolean) => void
  skills: readonly SkillInfo[]
}

export function SkillsGrid({
  busy,
  installing,
  official,
  onInstallOfficial,
  onOpenOfficial,
  onOpenSkill,
  onToggleSkill,
  skills
}: SkillsGridProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities
  const groups = useMemo(() => groupByCategory(skills), [skills])

  return (
    <>
      {groups.map(group => (
        <Fragment key={group.category}>
          <SectionTitle count={group.skills.length}>{prettyName(group.category)}</SectionTitle>
          <CardGrid>
            {group.skills.map(skill => (
              <SkillCard busy={busy} key={skill.name} onOpen={onOpenSkill} onToggle={onToggleSkill} skill={skill} />
            ))}
          </CardGrid>
        </Fragment>
      ))}
      {official.length > 0 ? (
        <>
          <SectionTitle count={official.length}>{c.skills.officialTitle}</SectionTitle>
          <CardGrid>
            {official.map(skill => (
              <OfficialSkillCard
                installing={installing.has(skill.identifier)}
                key={skill.identifier}
                onInstall={onInstallOfficial}
                onOpen={onOpenOfficial}
                skill={skill}
              />
            ))}
          </CardGrid>
        </>
      ) : null}
    </>
  )
}

interface SkillCardProps {
  busy: boolean
  onOpen: (skill: SkillInfo) => void
  onToggle: (skill: SkillInfo, enabled: boolean) => void
  skill: SkillInfo
}

function SkillCard({ busy, onOpen, onToggle, skill }: SkillCardProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities
  const tile = skillTile(skill.name, categoryFor(skill))
  const source = skillSourceLabel(skill, c.skills.source)

  return (
    <GridCard className={LAZY_CARD} data-skill={skill.name}>
      <GridCardTop
        lead={<IconTile icon={tile.icon} tone={tile.tone} />}
        onOpen={() => onOpen(skill)}
        subtitle={skill.provenance === 'agent' ? `${source} · ${c.skills.learnedNote}` : source}
        title={skill.name}
        titleClassName="font-mono text-[0.78125rem]"
        trailing={
          <Switch
            aria-label={skill.name}
            checked={skill.enabled}
            disabled={busy}
            onCheckedChange={enabled => onToggle(skill, enabled)}
            size="xs"
          />
        }
      />
      <GridCardText>{asText(skill.description) || t.skills.noDescription}</GridCardText>
      <GridCardFoot>
        <span className="tabular-nums">{c.usedTimes(usageOf(skill))}</span>
        <span className="flex-1" />
        <Button aria-label={c.skills.detailsAria(skill.name)} onClick={() => onOpen(skill)} size="xs" variant="ghost">
          {c.skills.details}
        </Button>
      </GridCardFoot>
    </GridCard>
  )
}

interface OfficialSkillCardProps {
  installing: boolean
  onInstall: (skill: OfficialSkillInfo) => void
  onOpen: (skill: OfficialSkillInfo) => void
  skill: OfficialSkillInfo
}

function OfficialSkillCard({ installing, onInstall, onOpen, skill }: OfficialSkillCardProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities
  const tile = skillTile(skill.name, skill.category)

  return (
    <GridCard className={LAZY_CARD} data-official-skill={skill.identifier}>
      <GridCardTop
        lead={<IconTile icon={tile.icon} tone={tile.tone} />}
        onOpen={() => onOpen(skill)}
        subtitle={c.skills.officialSource(prettyName(skill.category))}
        title={skill.name}
        titleClassName="font-mono text-[0.78125rem]"
      />
      <GridCardText>{asText(skill.description) || t.skills.noDescription}</GridCardText>
      <GridCardFoot>
        <span className="flex-1" />
        <Button disabled={installing} onClick={() => onInstall(skill)} size="xs">
          {installing ? <Spinner /> : null}
          {installing ? t.skills.hub.installing : t.skills.hub.install}
        </Button>
      </GridCardFoot>
    </GridCard>
  )
}
