import { group, mirrorTreeHorizontal, split } from '@/components/pane-shell/tree/model'
import { registerBundledPresets } from '@/components/pane-shell/tree/presets'

// ---------------------------------------------------------------------------
// Layout presets — CHAT (main) always dominates.
// ---------------------------------------------------------------------------

// The REAL default (Hermes Studio): sessions | chat | inspector. The inspector is
// ONE zone holding the tooling — files, changes, the terminal and the running
// agents (+ logs and every preview tile join it at runtime) — switched by the
// segmented header in its titlebar band (app/shell/inspector). Ids are a
// contract (tools/set_theme_tool.py names presets; grp-* ids are stable).
export const DEFAULT_TREE = split(
  'row',
  [
    group(['sessions'], { id: 'grp-sessions' }),
    group(['workspace'], { id: 'grp-main' }),
    group(['files', 'review', 'terminal', 'agents'], { active: 'files', id: 'grp-inspector' })
  ],
  [1, 3.4, 1.4],
  'spl-root'
)

// Focus is one column of attention: files and review are tabs BEHIND the chat,
// the terminal a collapsed rail under it — opening the terminal must never
// cover the conversation, which a terminal tab did.
const FOCUS_TREE = split(
  'row',
  [group(['sessions']), split('column', [group(['workspace', 'files', 'review']), group(['terminal'])], [3, 1])],
  [1, 4.6]
)

// Basic is sessions and chat with the tooling RESTING in its own slot: the
// inspector zone, closed until ⌘J / ⌘G / ⌃` opens it on that segment. A tree
// that simply omitted the tooling was a lie — applying it adopts every missing
// pane back in as workspace tabs, which is Focus.
export const BASIC_TREE = split(
  'row',
  [group(['sessions']), group(['workspace']), group(['files', 'review', 'terminal', 'agents'])],
  [1, 3.4, 1.25]
)

const BASIC_RESTING = ['terminal', 'files', 'review', 'agents'] as const

const TERMINAL_TREE = split(
  'column',
  [
    split('row', [group(['sessions']), group(['workspace']), group(['files', 'review', 'agents'])], [1, 3.2, 1.2]),
    group(['terminal'])
  ],
  [3, 1]
)

// Terminal deck places the tooling without opening it: the terminal rests as
// its bottom rail and files/review as a closed right column, so ⌃` and ⌘J open
// each one in its deck slot. Review rests with files: closing the file tree
// collapses their shared column, and an open review there would leave ⌘G
// reading open while nothing shows.
const TERMINAL_RESTING = ['terminal', 'files', 'review', 'agents'] as const

// The first-run intro's borrowed layout: the chat alone, no tab strip. Unlisted,
// and applied while layout persistence is held (onboarding/first-run/assembly.ts).
export const DEMO_LAYOUT_ID = 'demo'

export const DEMO_TREE = group(['workspace'], { tabStrip: 'never' })

const QUAD_TREE = split(
  'column',
  [
    split('row', [group(['sessions', 'files']), group(['workspace'])], [1, 3]),
    split('row', [group(['terminal']), group(['review'])], [1.4, 1])
  ],
  [3, 1]
)

export function registerLayoutPresets() {
  // Simple is always the Basic arrangement; its one choice is which side the
  // sidebar sits. The decks are Advanced — arranging tooling is the point.
  return registerBundledPresets([
    { id: 'sidebar-left', title: 'Sidebar left', order: 0, tree: BASIC_TREE, resting: BASIC_RESTING, tier: 'simple' },
    {
      id: 'sidebar-right',
      title: 'Sidebar right',
      order: 1,
      tree: mirrorTreeHorizontal(BASIC_TREE),
      resting: BASIC_RESTING,
      tier: 'simple'
    },
    { id: 'default', title: 'Default', order: 0, tree: DEFAULT_TREE, tier: 'advanced' },
    { id: 'basic', title: 'Basic', order: 5, tree: BASIC_TREE, resting: BASIC_RESTING, tier: 'advanced' },
    { id: 'focus', title: 'Focus', order: 10, tree: FOCUS_TREE, resting: ['terminal'], tier: 'advanced' },
    {
      id: 'terminal-deck',
      title: 'Terminal deck',
      order: 20,
      tree: TERMINAL_TREE,
      resting: TERMINAL_RESTING,
      tier: 'advanced'
    },
    { id: 'quad', title: 'Quad', order: 30, tree: QUAD_TREE, tier: 'advanced' },
    { id: DEMO_LAYOUT_ID, listed: false, title: 'Demo', order: 40, tree: DEMO_TREE }
  ])
}
