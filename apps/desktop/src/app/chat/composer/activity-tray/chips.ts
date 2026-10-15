/**
 * The activity tray's chip table. The composer status stack decides which
 * sections exist (and in what order); this table only says which chip opens
 * each one. A section key the table does not know — a group upstream adds
 * later — lands in the "More" chip, so nothing the stack emits is ever lost.
 */

export type TrayChipId =
  'approval' | 'background' | 'control' | 'needs' | 'other' | 'preview' | 'queue' | 'subagent' | 'todo'

/** Stack section key → the chip whose panel shows it. */
export const SECTION_CHIP: Readonly<Record<string, TrayChipId>> = {
  background: 'background',
  goal: 'control',
  preview: 'preview',
  queue: 'queue',
  'retained-todo': 'todo',
  'session-control': 'control',
  subagent: 'subagent',
  todo: 'todo'
}

/** Notices outrank activity: they stay visible above the tray and never fold into a chip. */
export const NOTICE_SECTIONS: ReadonlySet<string> = new Set(['billing', 'free-tier', 'shared-metrics'])

/** Left-to-right chip order: what needs you first, then the plan, then the work. */
export const CHIP_ORDER: readonly TrayChipId[] = [
  'approval',
  'needs',
  'todo',
  'control',
  'subagent',
  'queue',
  'background',
  'preview',
  'other'
]

export const chipForSection = (key: string): TrayChipId => SECTION_CHIP[key] ?? 'other'

/** Chips that answer a click by jumping to their card in the transcript (the
 *  decision is made there), not by opening a panel. */
export const JUMP_CHIPS: ReadonlySet<TrayChipId> = new Set(['approval', 'needs'])
