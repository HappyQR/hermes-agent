/**
 * The macOS application menu as data.
 *
 * The renderer owns the menu's copy and live state (labels in every locale,
 * checked/enabled, which commands exist, the user's current key bindings) and
 * sends it as an `ApplicationMenuModel`; main owns the NSMenu and turns the
 * model into a template (electron/application-menu.ts). Clicks travel back as
 * a command id. This module is pure — no electron import — so the renderer can
 * share the constants and helpers.
 */

/** main → renderer: `{ id }` of the clicked item. */
export const MENU_COMMAND_CHANNEL = 'hermes:menu-command'
/** renderer → main: the window's localized `ApplicationMenuModel`. */
export const MENU_MODEL_CHANNEL = 'hermes:menu-model'

/** Placeholder the renderer leaves where a label names the app; main writes
 *  its real product name there (the renderer does not know it). */
export const MENU_APP_NAME_TOKEN = '{{app}}'

export type MenuSectionId = 'app' | 'edit' | 'file' | 'help' | 'session' | 'view' | 'window'

/** Native roles a model may use. Anything else is dropped by `sanitizeMenuModel`. */
export const MENU_ROLES = [
  'services',
  'hide',
  'hideOthers',
  'unhide',
  'quit',
  'undo',
  'redo',
  'cut',
  'copy',
  'paste',
  'pasteAndMatchStyle',
  'delete',
  'selectAll',
  'toggleSpellChecker',
  'showSubstitutions',
  'toggleSmartQuotes',
  'toggleSmartDashes',
  'toggleTextReplacement',
  'startSpeaking',
  'stopSpeaking',
  'forceReload',
  'togglefullscreen',
  'minimize',
  'zoom',
  'front'
] as const

export type MenuRole = (typeof MENU_ROLES)[number]

/** Commands main runs itself; every other id goes to the renderer. */
export const MAIN_MENU_COMMANDS = [
  'main.about',
  'main.checkForUpdates',
  'main.newWindow',
  'main.openFolder',
  'main.closeTab',
  'main.reload',
  'main.toggleDevTools',
  'main.actualSize',
  'main.zoomIn',
  'main.zoomOut',
  'main.quickAsk'
] as const

export type MainMenuCommand = (typeof MAIN_MENU_COMMANDS)[number]

/** Main-owned key equivalents. Close Tab and Reload stay without one on
 *  purpose: on macOS a registered ⌘W is consumed by the menu before the web
 *  contents sees it (`registerAccelerator: false` is a no-op there,
 *  electron#18295), and `before-input-event` must route ⌘W/⌘R so a focused
 *  surface can claim them (installPreviewShortcut in main.ts). */
export const MAIN_MENU_ACCELERATORS: Readonly<Partial<Record<MainMenuCommand, string>>> = {
  'main.toggleDevTools': 'Alt+Command+I',
  'main.actualSize': 'CommandOrControl+0',
  'main.zoomIn': 'CommandOrControl+Plus',
  'main.zoomOut': 'CommandOrControl+-'
}

/**
 * Renderer actions whose CURRENT binding may become the item's key equivalent:
 * app-level chords no focused surface owns (terminal ⌘K/⌘L, find ⌘F/⌘G,
 * preview ⌘R/⌘L, composer ⌘L/⌘↩, Esc, ⌃⇥, ⌘1…⌘9 tab slots are all left out).
 * A fired equivalent is replayed as the same keystroke into the focused web
 * contents, so the keybind dispatcher runs exactly as if the menu weren't
 * there (see `acceleratorKeyInput`).
 */
export const MENU_ACCELERATOR_ACTIONS = [
  'session.new',
  'session.newTab',
  'session.newWindow',
  'workspace.openFolder',
  'workspace.newWorktree',
  'nav.settings',
  'nav.commandCenter',
  'keybinds.openPanel',
  'view.toggleSidebar',
  'view.toggleRightSidebar',
  'view.showBrowser',
  'view.toggleHud',
  'view.flipPanes',
  'layout.editMode',
  'view.toggleStatusbar',
  'composer.modelPicker',
  'profile.toggleAll'
] as const

export interface MenuCommandItem {
  type: 'command'
  id: string
  label: string
  enabled?: boolean
  /** Present → a checkmark item; absent → a plain item. */
  checked?: boolean
  accelerator?: string
}

export interface MenuRoleItem {
  type: 'role'
  role: MenuRole
  label?: string
}

export interface MenuSeparatorItem {
  type: 'separator'
}

export interface MenuSubmenuItem {
  type: 'submenu'
  label: string
  enabled?: boolean
  items: MenuModelItem[]
}

export type MenuModelItem = MenuCommandItem | MenuRoleItem | MenuSeparatorItem | MenuSubmenuItem

export interface MenuModelSection {
  id: MenuSectionId
  label: string
  items: MenuModelItem[]
}

export interface ApplicationMenuModel {
  sections: MenuModelSection[]
}

export interface MenuCommandPayload {
  id: string
}

const SECTION_IDS: ReadonlySet<string> = new Set<MenuSectionId>([
  'app',
  'edit',
  'file',
  'help',
  'session',
  'view',
  'window'
])

const ROLE_SET: ReadonlySet<string> = new Set(MENU_ROLES)
const MAIN_COMMAND_SET: ReadonlySet<string> = new Set(MAIN_MENU_COMMANDS)
const ACCELERATOR_ACTION_SET: ReadonlySet<string> = new Set(MENU_ACCELERATOR_ACTIONS)

export function isMainMenuCommand(id: string): id is MainMenuCommand {
  return MAIN_COMMAND_SET.has(id)
}

export function isMenuAcceleratorAction(id: string): boolean {
  return ACCELERATOR_ACTION_SET.has(id)
}

// ── Accelerators ────────────────────────────────────────────────────────────

const MODIFIER_ORDER = ['Command', 'Control', 'Alt', 'Shift'] as const

type Modifier = (typeof MODIFIER_ORDER)[number]

const COMBO_MODIFIERS: Readonly<Record<string, Modifier>> = {
  mod: 'Command',
  ctrl: 'Control',
  alt: 'Alt',
  shift: 'Shift'
}

const ACCELERATOR_MODIFIERS: Readonly<Record<string, Modifier>> = {
  command: 'Command',
  cmd: 'Command',
  commandorcontrol: 'Command',
  cmdorctrl: 'Command',
  control: 'Control',
  ctrl: 'Control',
  alt: 'Alt',
  option: 'Alt',
  shift: 'Shift'
}

const NAMED_KEYS: Readonly<Record<string, string>> = {
  space: 'Space',
  tab: 'Tab',
  enter: 'Return',
  return: 'Return',
  escape: 'Escape',
  esc: 'Escape',
  backspace: 'Backspace',
  delete: 'Delete',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  plus: 'Plus'
}

const PUNCTUATION_KEYS = new Set(['`', '-', '=', '[', ']', '\\', ';', "'", ',', '.', '/'])

/** A combo/accelerator key token → its accelerator spelling, or null. */
function acceleratorKey(token: string): null | string {
  const lower = token.toLowerCase()

  if (/^[a-z0-9]$/.test(lower)) {
    return lower.toUpperCase()
  }

  if (/^f([1-9]|1[0-9]|2[0-4])$/.test(lower)) {
    return lower.toUpperCase()
  }

  if (PUNCTUATION_KEYS.has(token)) {
    return token
  }

  return NAMED_KEYS[lower] ?? null
}

interface ParsedAccelerator {
  key: string
  modifiers: Modifier[]
}

function formatAccelerator({ key, modifiers }: ParsedAccelerator): string {
  return [...MODIFIER_ORDER.filter(modifier => modifiers.includes(modifier)), key].join('+')
}

function parseAccelerator(value: string): null | ParsedAccelerator {
  if (typeof value !== 'string' || value.length > 60) {
    return null
  }

  // A literal '+' key is spelled `Plus`, so splitting on '+' is lossless.
  const parts = value.split('+').map(part => part.trim())
  const keyToken = parts.pop()
  const key = keyToken ? acceleratorKey(keyToken) : null

  if (!key) {
    return null
  }

  const modifiers: Modifier[] = []

  for (const part of parts) {
    const modifier = ACCELERATOR_MODIFIERS[part.toLowerCase()]

    if (!modifier || modifiers.includes(modifier)) {
      return null
    }

    modifiers.push(modifier)
  }

  return { key, modifiers }
}

/** Canonical form for comparing accelerators ("Shift+Cmd+l" → "Command+Shift+L"). */
export function normalizeAccelerator(value: string): null | string {
  const parsed = parseAccelerator(value)

  return parsed ? formatAccelerator(parsed) : null
}

/** Chords the native menu, macOS or main already own: an action bound to one
 *  of these keeps working through the renderer but never gets a key equivalent. */
const RESERVED_ACCELERATORS: ReadonlySet<string> = new Set(
  [
    'Command+Q',
    'Command+H',
    'Command+Alt+H',
    'Command+M',
    'Command+W',
    'Command+Z',
    'Command+Shift+Z',
    'Command+X',
    'Command+C',
    'Command+V',
    'Command+Alt+Shift+V',
    'Command+A',
    'Command+Control+F',
    'Command+0',
    'Command+=',
    'Command+Shift+=',
    'Command+Plus',
    'Command+-',
    'Command+Alt+I',
    'Command+R',
    'Command+Shift+R',
    'Command+`',
    'Command+Tab',
    'Command+Space',
    'Command+Alt+Escape'
  ].map(value => normalizeAccelerator(value) ?? value)
)

export function isReservedAccelerator(value: string): boolean {
  const normalized = normalizeAccelerator(value)

  return normalized === null || RESERVED_ACCELERATORS.has(normalized)
}

/**
 * A keybind combo (`mod+shift+l`, see src/lib/keybinds/combo.ts) → a macOS
 * accelerator (`Command+Shift+L`). Null for anything that cannot be a safe key
 * equivalent: no Command/Control modifier (it would steal typing), an unknown
 * key, or a chord the menu/OS already owns.
 */
export function comboToAccelerator(combo: string): null | string {
  if (typeof combo !== 'string' || !combo) {
    return null
  }

  const parts = combo.split('+')
  const keyToken = parts.pop() ?? ''
  const key = acceleratorKey(keyToken)

  if (!key) {
    return null
  }

  const modifiers: Modifier[] = []

  for (const part of parts) {
    const modifier = COMBO_MODIFIERS[part]

    if (!modifier || modifiers.includes(modifier)) {
      return null
    }

    modifiers.push(modifier)
  }

  if (!modifiers.includes('Command') && !modifiers.includes('Control')) {
    return null
  }

  const accelerator = formatAccelerator({ key, modifiers })

  return RESERVED_ACCELERATORS.has(accelerator) ? null : accelerator
}

/** `sendInputEvent` modifier names for the four accelerator modifiers. */
export type MenuInputModifier = 'alt' | 'control' | 'meta' | 'shift'

const INPUT_MODIFIERS: Readonly<Record<Modifier, MenuInputModifier>> = {
  Command: 'meta',
  Control: 'control',
  Alt: 'alt',
  Shift: 'shift'
}

/** The `webContents.sendInputEvent` key for an accelerator key: letters go
 *  lowercase (an uppercase keyCode implies Shift in Electron's converter). */
function inputKeyCode(key: string): string {
  return /^[A-Z]$/.test(key) ? key.toLowerCase() : key
}

/**
 * The keystroke an accelerator stands for, as `webContents.sendInputEvent`
 * wants it. Main replays a fired key equivalent into the focused web contents
 * so the renderer's own dispatcher (or a guest page) gets the exact keydown
 * it would have seen without the menu.
 */
export function acceleratorKeyInput(accelerator: string): null | { keyCode: string; modifiers: MenuInputModifier[] } {
  const parsed = parseAccelerator(accelerator)

  if (!parsed) {
    return null
  }

  return {
    keyCode: inputKeyCode(parsed.key),
    modifiers: MODIFIER_ORDER.filter(modifier => parsed.modifiers.includes(modifier)).map(
      modifier => INPUT_MODIFIERS[modifier]
    )
  }
}

// ── Validation ──────────────────────────────────────────────────────────────

const MAX_LABEL = 200
const MAX_ITEMS = 600
const MAX_DEPTH = 3
// `%` admits URI-encoded data (a profile name inside `menu.profile:<name>`).
const COMMAND_ID = /^[A-Za-z0-9._:%-]{1,160}$/

interface SanitizeBudget {
  items: number
}

function cleanLabel(value: unknown): null | string {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_LABEL ? value : null
}

function record(value: unknown): null | Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

function sanitizeCommand(raw: Record<string, unknown>): MenuCommandItem | null {
  const label = cleanLabel(raw.label)

  if (typeof raw.id !== 'string' || !COMMAND_ID.test(raw.id) || !label) {
    return null
  }

  const item: MenuCommandItem = { type: 'command', id: raw.id, label }

  if (typeof raw.enabled === 'boolean') {
    item.enabled = raw.enabled
  }

  if (typeof raw.checked === 'boolean') {
    item.checked = raw.checked
  }

  const accelerator = typeof raw.accelerator === 'string' ? normalizeAccelerator(raw.accelerator) : null

  if (accelerator) {
    item.accelerator = accelerator
  }

  return item
}

function sanitizeItem(value: unknown, depth: number, budget: SanitizeBudget): MenuModelItem | null {
  const raw = record(value)

  budget.items += 1

  if (!raw || budget.items > MAX_ITEMS) {
    return null
  }

  switch (raw.type) {
    case 'separator':
      return { type: 'separator' }
    case 'role': {
      if (typeof raw.role !== 'string' || !ROLE_SET.has(raw.role)) {
        return null
      }

      const label = cleanLabel(raw.label)

      return label ? { type: 'role', role: raw.role as MenuRole, label } : { type: 'role', role: raw.role as MenuRole }
    }

    case 'command':
      return sanitizeCommand(raw)
    case 'submenu': {
      const label = cleanLabel(raw.label)

      if (!label || depth >= MAX_DEPTH || !Array.isArray(raw.items)) {
        return null
      }

      const submenu: MenuSubmenuItem = { type: 'submenu', label, items: sanitizeItems(raw.items, depth + 1, budget) }

      if (typeof raw.enabled === 'boolean') {
        submenu.enabled = raw.enabled
      }

      return submenu
    }

    default:
      return null
  }
}

function sanitizeItems(values: unknown[], depth: number, budget: SanitizeBudget): MenuModelItem[] {
  return values.flatMap(value => {
    const item = sanitizeItem(value, depth, budget)

    return item ? [item] : []
  })
}

/** Validate a model that crossed IPC. Unknown roles, malformed ids/labels and
 *  accelerators are dropped item by item; a model without a usable section is
 *  rejected (null) so main keeps the menu it has. */
export function sanitizeMenuModel(value: unknown): ApplicationMenuModel | null {
  const raw = record(value)

  if (!raw || !Array.isArray(raw.sections)) {
    return null
  }

  const budget: SanitizeBudget = { items: 0 }
  const seen = new Set<string>()

  const sections = raw.sections.flatMap((entry): MenuModelSection[] => {
    const section = record(entry)
    const label = cleanLabel(section?.label)
    const id = section?.id

    if (!section || !label || typeof id !== 'string' || !SECTION_IDS.has(id) || seen.has(id)) {
      return []
    }

    seen.add(id)

    const items = Array.isArray(section.items) ? sanitizeItems(section.items, 1, budget) : []

    return [{ id: id as MenuSectionId, label, items }]
  })

  return sections.length > 0 ? { sections } : null
}

/** Deep equality for plain models (both sides built by the same code, so key
 *  order is stable). Main rebuilds the NSMenu only when this is false. */
export function menuModelsEqual(a: ApplicationMenuModel | null, b: ApplicationMenuModel | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
