import { type TileTone, toneForKey } from '@/components/studio/pages/tile'
import type { StudioIconName } from '@/components/ui/studio-icon'

// App-icon-like tiles for skills and toolsets (prototype data.js SKILLS /
// TOOLSETS): a glyph from the skill's name or category, coloured per glyph so
// the same kind of thing always wears the same tile.

export interface CapabilityTile {
  icon: StudioIconName
  tone: TileTone
}

const ICON_TONE: Partial<Record<StudioIconName, TileTone>> = {
  book: 'brown',
  bot: 'indigo',
  branch: 'graphite',
  brush: 'pink',
  bubbles: 'cyan',
  calendar: 'blue',
  card: 'green',
  chart: 'purple',
  code: 'blue',
  compass: 'green',
  cpu: 'purple',
  cube: 'gray',
  database: 'indigo',
  doc: 'red',
  dollar: 'green',
  eye: 'purple',
  film: 'red',
  gamepad: 'purple',
  globe: 'blue',
  heart: 'red',
  house: 'cyan',
  image: 'pink',
  import: 'brown',
  link: 'orange',
  mail: 'blue',
  mic: 'orange',
  paw: 'brown',
  pencil: 'yellow',
  plug: 'gray',
  pr: 'graphite',
  search: 'indigo',
  server: 'gray',
  shield: 'red',
  table: 'green',
  terminal: 'teal',
  todo: 'green',
  wave: 'mint'
}

// Name keywords first (a skill's own job beats its shelf), then the category.
const NAME_ICONS: readonly [RegExp, StudioIconName][] = [
  [/github|pull-?request|\bpr\b|code-?review/, 'pr'],
  [/\bgit\b|branch|commit/, 'branch'],
  [/debug|terminal|shell|\bcli\b|bash/, 'terminal'],
  [/arxiv|paper|pdf|docx?\b|report|digest/, 'doc'],
  [/research|search|lookup|find/, 'search'],
  [/mail|gmail|inbox/, 'mail'],
  [/calendar|meeting|schedul/, 'calendar'],
  [/invoice|sheet|excel|csv|table/, 'table'],
  [/chart|plot|dashboard|analytic/, 'chart'],
  [/sql|database|postgres|sqlite/, 'database'],
  [/image|photo|art|draw|design|figma|svg/, 'brush'],
  [/video|youtube|film|movie/, 'film'],
  [/audio|music|spotify|song|speech|voice|podcast/, 'mic'],
  [/home|hue|light|thermostat/, 'house'],
  [/server|docker|kube|k8s|deploy|ops|nas/, 'server'],
  [/note|obsidian|notion|journal|diary/, 'pencil'],
  [/twitter|tweet|reddit|social|discord|telegram|slack/, 'bubbles'],
  [/money|financ|stock|budget|tax/, 'dollar'],
  [/pay|stripe|checkout/, 'card'],
  [/secur|auth|password|vault/, 'shield'],
  [/game|minecraft|pokemon|chess/, 'gamepad'],
  [/agent|\bbot\b|delegat/, 'bot'],
  [/web|browser|site|html|scrape|crawl/, 'globe'],
  [/code|dev|refactor|test|lint|onboard/, 'code']
]

const CATEGORY_ICONS: Readonly<Record<string, StudioIconName>> = {
  apple: 'command',
  'autonomous-ai-agents': 'bot',
  blockchain: 'link',
  communication: 'bubbles',
  creative: 'brush',
  'data-science': 'chart',
  devops: 'server',
  dogfood: 'paw',
  email: 'mail',
  finance: 'dollar',
  gaming: 'gamepad',
  github: 'pr',
  health: 'heart',
  mcp: 'plug',
  media: 'film',
  migration: 'import',
  mlops: 'cpu',
  'note-taking': 'pencil',
  payments: 'card',
  productivity: 'todo',
  research: 'search',
  security: 'shield',
  'smart-home': 'house',
  'social-media': 'bubbles',
  'software-development': 'code',
  web: 'globe',
  'web-development': 'globe'
}

function tileFor(icon: StudioIconName, key: string): CapabilityTile {
  return { icon, tone: ICON_TONE[icon] ?? toneForKey(key) }
}

export function skillTile(name: string, category: string): CapabilityTile {
  const lower = name.toLowerCase()
  const byName = NAME_ICONS.find(([pattern]) => pattern.test(lower))?.[1]

  return tileFor(byName ?? CATEGORY_ICONS[category.toLowerCase()] ?? 'cube', name)
}

const TOOLSET_TILES: Readonly<Record<string, CapabilityTile>> = {
  browser: { icon: 'compass', tone: 'green' },
  clarify: { icon: 'question', tone: 'cyan' },
  code_execution: { icon: 'code', tone: 'indigo' },
  computer_use: { icon: 'cursor', tone: 'gray' },
  connections: { icon: 'plug', tone: 'gray' },
  cronjob: { icon: 'clock', tone: 'orange' },
  delegation: { icon: 'tree', tone: 'orange' },
  file: { icon: 'doc', tone: 'teal' },
  homeassistant: { icon: 'house', tone: 'cyan' },
  image_gen: { icon: 'image', tone: 'pink' },
  kanban: { icon: 'kanban', tone: 'indigo' },
  memory: { icon: 'brain', tone: 'purple' },
  session_search: { icon: 'search', tone: 'teal' },
  skills: { icon: 'cube', tone: 'blue' },
  spotify: { icon: 'wave', tone: 'green' },
  stt: { icon: 'mic', tone: 'red' },
  terminal: { icon: 'terminal', tone: 'graphite' },
  todo: { icon: 'todo', tone: 'green' },
  tts: { icon: 'speaker', tone: 'orange' },
  video: { icon: 'film', tone: 'red' },
  video_gen: { icon: 'film', tone: 'orange' },
  vision: { icon: 'eye', tone: 'purple' },
  web: { icon: 'globe', tone: 'blue' },
  x_search: { icon: 'search', tone: 'graphite' }
}

export function toolsetTile(name: string): CapabilityTile {
  return TOOLSET_TILES[name] ?? tileFor('wrench', name)
}
