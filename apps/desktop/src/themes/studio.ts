/**
 * Studio — the Hermes Studio default: macOS system neutrals (white content,
 * frosted sidebar, #1d1d1f ink) with the system blue accent. Mirrors the
 * design prototype's light/dark tokens; every other surface is derived by
 * applyTheme from these seeds.
 */

import type { DesktopTheme } from './types'

// The UI reads like a native Mac app: SF Pro (PingFang for CJK) everywhere.
const STUDIO_SANS =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", ' +
  '"Segoe UI", system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", emoji'

// Bundled JetBrains Mono first, like every theme (#61392 glyph coverage; the
// terminal uses it too), then the platform mono.
const STUDIO_MONO =
  '"JetBrains Mono", ui-monospace, "SF Mono", SFMono-Regular, Menlo, "Cascadia Mono", "DejaVu Sans Mono", ' +
  '"Liberation Mono", Consolas, monospace, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", emoji'

export const STUDIO_ACCENT = { light: '#0a7aff', dark: '#0a84ff' } as const

export const studioTheme: DesktopTheme = {
  name: 'studio',
  label: 'Studio',
  description: 'macOS neutrals with the system blue accent',
  colors: {
    background: '#ffffff',
    foreground: '#1d1d1f',
    card: '#ffffff',
    cardForeground: '#1d1d1f',
    muted: '#f2f2f5',
    mutedForeground: '#6b6b71',
    popover: '#f6f6f9',
    popoverForeground: '#1d1d1f',
    primary: STUDIO_ACCENT.light,
    primaryForeground: '#ffffff',
    secondary: '#ebebf0',
    secondaryForeground: '#1d1d1f',
    accent: '#e3efff',
    accentForeground: '#1d1d1f',
    border: '#dcdce1',
    input: '#ffffff',
    ring: STUDIO_ACCENT.light,
    midground: STUDIO_ACCENT.light,
    midgroundForeground: '#ffffff',
    composerRing: STUDIO_ACCENT.light,
    destructive: '#e5332a',
    destructiveForeground: '#ffffff',
    sidebarBackground: '#eaeaef',
    sidebarBorder: '#d6d6db',
    userBubble: '#f0f0f4',
    userBubbleBorder: '#f0f0f4'
  },
  darkColors: {
    background: '#1c1c1e',
    foreground: '#f2f2f5',
    card: '#252528',
    cardForeground: '#f2f2f5',
    muted: '#2b2b2f',
    mutedForeground: '#9d9da6',
    popover: '#2a2a30',
    popoverForeground: '#f2f2f5',
    primary: STUDIO_ACCENT.dark,
    primaryForeground: '#ffffff',
    secondary: '#2f2f34',
    secondaryForeground: '#f2f2f5',
    accent: '#16314f',
    accentForeground: '#f2f2f5',
    border: '#3a3a40',
    input: '#1c1c1e',
    ring: STUDIO_ACCENT.dark,
    midground: STUDIO_ACCENT.dark,
    midgroundForeground: '#ffffff',
    composerRing: STUDIO_ACCENT.dark,
    destructive: '#ff453a',
    destructiveForeground: '#ffffff',
    sidebarBackground: '#242429',
    sidebarBorder: '#333338',
    userBubble: '#2c2c30',
    userBubbleBorder: '#2c2c30'
  },
  typography: { fontSans: STUDIO_SANS, fontMono: STUDIO_MONO }
}
