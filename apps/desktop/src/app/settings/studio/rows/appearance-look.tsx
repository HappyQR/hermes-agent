import { AccentSwatch } from '@/components/ui/accent-swatch'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'
import { accentsFor, type AccentSwatchSpec } from '@/themes/accents'
import { normalizeHex } from '@/themes/color'
import { getBaseColors, type ThemeMode, useTheme } from '@/themes/context'
import { persistAccent } from '@/themes/persist-accent'
import { resolveTheme } from '@/themes/user-themes'

import { ListRow } from '../../primitives'

const MODES = ['light', 'dark', 'system'] as const satisfies readonly ThemeMode[]

/** A tiny window: sidebar strip + content with an accent bar, in the theme's own colors. */
function ModePreview({ mode, themeName }: { mode: ThemeMode; themeName: string }) {
  const light = getBaseColors(themeName, 'light')
  const dark = getBaseColors(themeName, 'dark')
  const side = mode === 'light' ? light : dark
  const main = mode === 'dark' ? dark : light

  return (
    <span className="flex h-14 w-[5.375rem] overflow-hidden rounded-lg" data-slot="mode-preview">
      <span className="w-[34%]" style={{ background: side.sidebarBackground ?? side.muted }} />
      <span className="relative flex-1" style={{ background: main.background }}>
        <span className="absolute inset-x-[18%] bottom-[14%] h-[18%] rounded-[4px] bg-primary opacity-85" />
      </span>
    </span>
  )
}

/** Light / Dark / Auto as preview cards (prototype .mode-cards). */
export function ColorModeCards() {
  const { t } = useI18n()
  const r = t.studio.settings.rows
  const { mode, setMode, themeName } = useTheme()
  const labels: Record<(typeof MODES)[number], string> = { dark: r.modeDark, light: r.modeLight, system: r.modeAuto }

  return (
    <div
      aria-label={r.modeGroup}
      className="flex flex-wrap gap-4 px-3.5 py-3"
      data-slot="mode-cards"
      role="group"
    >
      {MODES.map(id => {
        const active = mode === id

        return (
          <button
            aria-pressed={active}
            className="flex flex-col items-center gap-1.5 text-xs text-(--ui-text-primary) outline-none"
            key={id}
            onClick={() => {
              triggerHaptic('crisp')
              setMode(id)
            }}
            type="button"
          >
            <span
              className={cn(
                'rounded-lg transition-shadow duration-100',
                active ? 'shadow-[0_0_0_2.5px_var(--dt-primary)]' : 'shadow-[0_0_0_0.5px_var(--ui-line-2)]'
              )}
            >
              <ModePreview mode={id} themeName={themeName} />
            </span>
            {labels[id]}
          </button>
        )
      })}
    </div>
  )
}

const SWATCH_NAME_KEYS = {
  green: 'accentGreen',
  hermes: 'accentHermes',
  mono: 'accentMono',
  nous: 'accentNous',
  orange: 'accentOrange',
  pink: 'accentPink',
  red: 'accentRed',
  violet: 'accentViolet'
} as const

/** The accent the live theme paints, as a swatch id (`nous` = the theme's own). */
function activeSwatchId(themeName: string, swatches: readonly { id: string; hexes: string[] }[]): null | string {
  const theme = resolveTheme(themeName)

  if (!theme?.accentOf) {
    return 'nous'
  }

  const hex = normalizeHex(theme.colors.primary)

  return swatches.find(swatch => swatch.hexes.includes(hex ?? ''))?.id ?? null
}

/** Accent color: the eight macOS swatches (themes/accents.ts), saved on the live profile's theme. */
export function AccentColorRow() {
  const { t } = useI18n()
  const r = t.studio.settings.rows
  const { renderedMode, themeName } = useTheme()
  const swatches: AccentSwatchSpec[] = accentsFor(renderedMode === 'dark')

  const known = accentsFor(false).map((light, index) => ({
    hexes: [light.hex, accentsFor(true)[index]?.hex ?? light.hex].map(hex => normalizeHex(hex) ?? hex),
    id: light.id
  }))

  const active = activeSwatchId(themeName, known)

  return (
    <ListRow
      action={
        <div className="flex flex-wrap items-center gap-2.5" data-slot="accent-row" role="group">
          {swatches.map(swatch => (
            <AccentSwatch
              active={active === swatch.id}
              hex={swatch.hex}
              key={swatch.id}
              name={r[SWATCH_NAME_KEYS[swatch.id as keyof typeof SWATCH_NAME_KEYS]] ?? swatch.name}
              onPick={() => {
                triggerHaptic('crisp')
                // The theme's own accent saves as `null` (back to the base theme).
                persistAccent(swatch.id === 'nous' ? null : swatch.hex)
              }}
              size="sm"
            />
          ))}
        </div>
      }
      description={r.accentDesc}
      title={r.accentTitle}
    />
  )
}
