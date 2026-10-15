import type { StudioIconName } from '@/components/ui/studio-icon'
import type { Translations } from '@/i18n'
import { luminance } from '@/themes/color'
import type { ThemeMode, useTheme } from '@/themes/context'
import { isUserTheme, resolveTheme } from '@/themes/user-themes'

import type { PaletteItem, PalettePage } from './types'

type ThemeApi = ReturnType<typeof useTheme>

export type ThemeRowsContext = Pick<
  ThemeApi,
  'availableThemes' | 'mode' | 'previewTheme' | 'resolvedMode' | 'setMode' | 'setTheme' | 'themeName'
> & {
  /** `system` resolved to the brightness it paints right now. */
  resolveThemeMode: (target: ThemeMode) => 'dark' | 'light'
  t: Translations
}

const THEME_MODES: ReadonlyArray<{ glyph: StudioIconName; mode: ThemeMode }> = [
  { glyph: 'sun', mode: 'light' },
  { glyph: 'moon', mode: 'dark' },
  { glyph: 'contrast', mode: 'system' }
]

// Which Light/Dark groups a theme belongs in. Built-ins render in both modes
// (the engine synthesises the missing side). Imported VS Code themes only carry
// the variant(s) the extension shipped — a single dark theme like Dracula lives
// under Dark only, while a GitHub/Solarized family (light + dark) lives in both.
function themeSupportsMode(name: string, target: 'dark' | 'light'): boolean {
  if (!isUserTheme(name)) {
    return true
  }

  const resolved = resolveTheme(name)

  if (!resolved) {
    return true
  }

  const background =
    target === 'dark' ? (resolved.darkColors ?? resolved.colors).background : resolved.colors.background

  return target === 'dark' ? luminance(background) <= 0.5 : luminance(background) > 0.5
}

/** The mode a theme previews (and commits) in: the current one, unless it can only render the other. */
function previewModeFor(name: string, resolvedMode: 'dark' | 'light'): 'dark' | 'light' {
  if (themeSupportsMode(name, resolvedMode)) {
    return resolvedMode
  }

  return resolvedMode === 'dark' ? 'light' : 'dark'
}

/**
 * Every palette once, applied on top of the selected mode, with live preview
 * (keepOpen + onHighlight). An import that only ships one variant (Dracula)
 * flips the mode to the side it can actually render.
 */
export function themeItems(ctx: ThemeRowsContext, idPrefix: string): PaletteItem[] {
  return ctx.availableThemes.map(theme => {
    const previewMode = previewModeFor(theme.name, ctx.resolvedMode)

    return {
      active: ctx.themeName === theme.name,
      glyph: 'brush',
      id: `${idPrefix}-${theme.name}`,
      keepOpen: true,
      keywords: ['theme', 'appearance', 'color', 'palette', 'skin', theme.name, theme.label, theme.description ?? ''],
      label: theme.label,
      onHighlight: () => ctx.previewTheme(theme.name, previewMode),
      run: () => {
        ctx.setTheme(theme.name)

        if (previewMode !== ctx.resolvedMode) {
          ctx.setMode(previewMode)
        }
      }
    }
  })
}

/** Light / Dark / System, previewing the committed skin at the highlighted brightness. */
export function modeItems(ctx: ThemeRowsContext, idPrefix: string): PaletteItem[] {
  return THEME_MODES.map(entry => {
    const label = ctx.t.settings.modeOptions[entry.mode].label

    return {
      active: ctx.mode === entry.mode,
      glyph: entry.glyph,
      id: `${idPrefix}-${entry.mode}`,
      keepOpen: true,
      keywords: ['appearance', 'brightness', 'color mode', entry.mode, label],
      label,
      onHighlight: () => ctx.previewTheme(ctx.themeName, ctx.resolveThemeMode(entry.mode)),
      run: () => ctx.setMode(entry.mode)
    }
  })
}

/**
 * Nested palette pages (VS Code-style submenus). Reusable: add an entry here
 * and point a root item at it via `to`. `pets` and `install-theme` are
 * server-driven: their pages render their own lists.
 */
export function buildSubPages(ctx: ThemeRowsContext): Record<string, PalettePage> {
  const { t } = ctx
  const appearance = t.settings.appearance

  return {
    theme: {
      title: appearance.themeTitle,
      placeholder: appearance.themeDesc,
      groups: [
        // Pinned at the top: drills into the Marketplace browser.
        {
          items: [
            {
              glyph: 'download',
              id: 'theme-install',
              keywords: ['install', 'marketplace', 'vscode', 'vs code', 'download', 'new', 'color'],
              label: t.commandCenter.installTheme.title,
              to: 'install-theme'
            }
          ],
          scope: 'actions'
        },
        // Brightness lives with the palettes: one mode toggle for the whole
        // list instead of splitting every theme across a Light and a Dark group.
        { heading: appearance.colorMode, items: modeItems(ctx, 'theme-mode'), scope: 'actions' },
        { heading: appearance.themeTitle, items: themeItems(ctx, 'theme'), scope: 'actions' }
      ]
    },
    'color-mode': {
      title: appearance.colorMode,
      placeholder: appearance.colorModeDesc,
      groups: [{ heading: appearance.colorMode, items: modeItems(ctx, 'mode'), scope: 'actions' }]
    },
    // Server-driven page: browse petdex gallery, adopt/switch, toggle off.
    pets: { title: t.commandCenter.pets.title, placeholder: t.commandCenter.pets.placeholder, groups: [] },
    // Server-driven page: items come from the Marketplace, rendered by
    // <MarketplaceThemePage> (loader + live search + per-row install).
    'install-theme': {
      title: t.commandCenter.installTheme.pageTitle,
      placeholder: t.commandCenter.installTheme.placeholder,
      groups: []
    }
  }
}
