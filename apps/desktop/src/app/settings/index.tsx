import { useI18n } from '@/i18n'

import { OverlayView } from '../overlays/overlay-view'

import { SettingsWindow } from './studio/settings-window'
import type { SettingsPageProps } from './types'

/**
 * Settings, as the Hermes Studio window (macOS System Settings): a floating
 * window card with the category list and search on the left and the page on
 * the right. The window composes the classic settings pages; every pre-window
 * deep link (`?tab=config:model&page=…`, `?tab=keys&kview=…`, …) resolves
 * through app/settings/studio/locations.ts.
 */
export function SettingsView({ onClose, onConfigSaved, onMainModelChanged }: SettingsPageProps) {
  const { t } = useI18n()

  return (
    <OverlayView closeLabel={t.settings.closeSettings} onClose={onClose} variant="window">
      <SettingsWindow onClose={onClose} onConfigSaved={onConfigSaved} onMainModelChanged={onMainModelChanged} />
    </OverlayView>
  )
}

export { SettingsView as SettingsPage }
