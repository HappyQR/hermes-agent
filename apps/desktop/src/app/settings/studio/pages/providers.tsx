import { useStore } from '@nanostores/react'
import { useCallback } from 'react'

import { FormCell } from '@/app/overlays/studio/form-group'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { $localModelsEnabled } from '@/store/local-models-flag'

import { LocalModelsSettings } from '../../local-models-settings'
import { ListRow } from '../../primitives'
import { ProvidersSettings, type ProviderView } from '../../providers-settings'
import type { SettingsPageProps } from '../../types'
import { useSettingsDrill } from '../drill'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'
import type { SettingsWindowLocation } from '../use-settings-location'

const VIEW_SECTION: Record<ProviderView, string> = {
  accounts: 'accounts',
  'custom-endpoints': 'endpoints',
  keys: 'api-keys',
  local: 'local'
}

/** 账户与提供商 Accounts & Providers: accounts, API keys, custom endpoints, local models (drill-in). */
export function ProvidersPage({
  location,
  onClose,
  onConfigSaved,
  onMainModelChanged
}: SettingsPageProps & { location: SettingsWindowLocation }) {
  const { t } = useI18n()
  const s = t.studio.settings.sections.providers
  const localEnabled = useStore($localModelsEnabled)
  const { openPage, updateParams } = location
  // Local models ships behind the --local launch flag: no flag, no section and no drill.
  const local = localEnabled && location.params.get('pview') === 'local'

  const openLocal = useCallback(() => updateParams(next => next.set('pview', 'local')), [updateParams])
  const closeLocal = useCallback(() => updateParams(next => next.delete('pview')), [updateParams])

  useSettingsDrill(local ? { onBack: closeLocal, title: s.local } : null)

  const onViewChange = useCallback(
    (view: ProviderView) => (view === 'local' ? openLocal() : openPage('providers', VIEW_SECTION[view])),
    [openLocal, openPage]
  )

  if (local) {
    return <LocalModelsSettings />
  }

  const providerProps = { onClose, onConfigSaved, onMainModelChanged, onViewChange }

  return (
    <>
      <SettingsWindowSection aside={<SettingsScopeBadge page="providers" />} id="accounts" page="providers" title={s.accounts}>
        <FormCell>
          <ProvidersSettings view="accounts" {...providerProps} />
        </FormCell>
      </SettingsWindowSection>
      <SettingsWindowSection id="api-keys" page="providers" title={s.apiKeys}>
        <FormCell>
          <ProvidersSettings view="keys" {...providerProps} />
        </FormCell>
      </SettingsWindowSection>
      <SettingsWindowSection id="endpoints" page="providers" title={s.endpoints}>
        <FormCell>
          <ProvidersSettings view="custom-endpoints" {...providerProps} />
        </FormCell>
      </SettingsWindowSection>
      {localEnabled && (
        <SettingsWindowSection id="local" page="providers" title={s.local}>
          <ListRow
            action={
              <Button
                onClick={() => {
                  triggerHaptic('selection')
                  openLocal()
                }}
                size="sm"
                variant="secondary"
              >
                {t.studio.settings.rows.localModelsAction}
              </Button>
            }
            description={t.studio.settings.rows.localModelsDesc}
            title={t.settings.nav.providerLocalModels}
          />
        </SettingsWindowSection>
      )}
    </>
  )
}
