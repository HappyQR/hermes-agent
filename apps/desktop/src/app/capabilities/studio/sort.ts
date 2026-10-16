import { type Codec, persistentAtom } from '@/lib/persisted'
import { readKey } from '@/lib/storage'
import type { SkillInfo } from '@/types/hermes'

import { asText } from '../../settings/helpers'

// The Skills toolbar's sort pop-up (prototype Most used / Least used / Name). Seeded
// from the old most/least flip so an existing preference carries over.

export const SKILL_SORTS = ['most', 'least', 'name'] as const

export type SkillSort = (typeof SKILL_SORTS)[number]

const SKILL_SORT_CODEC: Codec<SkillSort> = {
  decode: raw => ((SKILL_SORTS as readonly string[]).includes(raw) ? (raw as SkillSort) : 'most'),
  encode: value => value
}

const legacyDesc = readKey('hermes.desktop.capabilities.skillsSortDesc')

export const $skillsSort = persistentAtom<SkillSort>(
  'hermes.desktop.capabilities.skillsSort',
  legacyDesc === 'false' ? 'least' : 'most',
  SKILL_SORT_CODEC
)

/** `filteredSkills` already orders by usage; Name re-sorts A–Z. */
export function applySkillSort(skills: SkillInfo[], sort: SkillSort): SkillInfo[] {
  return sort === 'name' ? [...skills].sort((a, b) => asText(a.name).localeCompare(asText(b.name))) : skills
}
