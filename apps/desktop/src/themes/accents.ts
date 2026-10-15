/**
 * Accent swatches and the ids the agent and the picker use for them.
 *
 * A swatch can paint differently per surface (Mono is black on light, white on
 * dark), so callers resolve an id against the rendered mode at the moment of
 * the pick. `custom:#rrggbb` names a colour that is not a swatch.
 */

// Studio's default accent (macOS system blue); the theme paints it, so it resolves to `null`.
export const NOUS_ACCENT = '#0a7aff'

export const CUSTOM_ACCENT_PREFIX = 'custom:'

interface Swatch {
  dark: string
  id: string
  light: string
  name: string
}

// Hermes Studio: the macOS accent row, in the prototype's order. `nous` stays
// the theme's own accent (system blue under Studio) so the ids the backend's
// set_theme tool validates (tools/set_theme_tool.py) keep landing; `hermes` is
// Studio's brand blue. `cyan` is no longer offered but still resolves for the
// agent and for picks saved before the fork.
const SWATCHES: readonly Swatch[] = [
  { id: 'nous', name: 'Blue', light: NOUS_ACCENT, dark: '#0a84ff' },
  { id: 'hermes', name: 'Hermes blue', light: '#2456f5', dark: '#4d7bff' },
  { id: 'violet', name: 'Purple', light: '#9b51e0', dark: '#bf5af2' },
  { id: 'pink', name: 'Pink', light: '#e8457f', dark: '#ff375f' },
  { id: 'red', name: 'Red', light: '#e5483c', dark: '#ff453a' },
  { id: 'orange', name: 'Orange', light: '#e8790f', dark: '#ff9f0a' },
  { id: 'green', name: 'Green', light: '#2f9e47', dark: '#32d74b' },
  { id: 'mono', name: 'Graphite', light: '#7d7d84', dark: '#98989d' }
]

const RETIRED_SWATCHES: readonly Swatch[] = [{ id: 'cyan', name: 'Cyan', light: '#1fa6c4', dark: '#40c8e0' }]

export const ACCENT_SWATCH_IDS: readonly string[] = [...SWATCHES, ...RETIRED_SWATCHES].map(swatch => swatch.id)

export interface AccentSwatchSpec {
  hex: string
  id: string
  name: string
}

export const accentsFor = (dark: boolean): AccentSwatchSpec[] =>
  SWATCHES.map(({ dark: onDark, id, light, name }) => ({ hex: dark ? onDark : light, id, name }))

/** A pick the agent or a card names: its hex on this surface and the id reported back (`null` = the theme's own). */
export interface ResolvedAccent {
  hex: null | string
  id: null | string
}

/**
 * Resolve `theme`, a swatch id, `#rrggbb` or `custom:#rrggbb` to what gets painted. Nous blue is the default
 * skin's accent, so it resolves to the theme's own (`null`), the same as `theme`. Unknown input → `undefined`.
 */
export function resolveAccentPick(value: string, dark: boolean): ResolvedAccent | undefined {
  if (value === 'theme' || value === 'nous') {
    return { hex: null, id: null }
  }

  const swatch = [...SWATCHES, ...RETIRED_SWATCHES]
    .map(({ dark: onDark, id, light, name }) => ({ hex: dark ? onDark : light, id, name }))
    .find(candidate => candidate.id === value)

  if (swatch) {
    return { hex: swatch.hex, id: swatch.id }
  }

  const raw = value.startsWith(CUSTOM_ACCENT_PREFIX) ? value.slice(CUSTOM_ACCENT_PREFIX.length) : value

  if (!/^#[0-9a-f]{6}$/i.test(raw)) {
    return undefined
  }

  const hex = raw.toLowerCase()

  return hex === NOUS_ACCENT ? { hex: null, id: null } : { hex, id: `${CUSTOM_ACCENT_PREFIX}${hex}` }
}

/** The name a settled card shows for a reported accent id. */
export function accentName(id: string): string {
  return [...SWATCHES, ...RETIRED_SWATCHES].find(swatch => swatch.id === id)?.name ?? id.replace(CUSTOM_ACCENT_PREFIX, '')
}
