import { useEffect, useState } from 'react'

import { FormCell, FormDisclosure } from '@/app/overlays/studio/form-group'
import { useI18n } from '@/i18n'

import type { ConfigSettingsLayoutApi } from '../../config-settings'
import { ModelSettings } from '../../model-settings'
import { ConfigPage, type ConfigPageProps, ConfigRows, placedFields } from '../config-layout'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'
import type { SettingsWindowLocation } from '../use-settings-location'

/** A disclosure that also opens when a deep link points inside it. */
function useForcedOpen(wanted: boolean): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(wanted)

  useEffect(() => {
    if (wanted) {
      setOpen(true)
    }
  }, [wanted])

  return [open, setOpen]
}

function ModelsSections({
  api,
  location,
  onMainModelChanged
}: {
  api: ConfigSettingsLayoutApi
  location: SettingsWindowLocation
  onMainModelChanged?: ConfigPageProps['onMainModelChanged']
}) {
  const { t } = useI18n()
  const s = t.studio.settings.sections.models
  const [auxOpen, setAuxOpen] = useForcedOpen(Boolean(location.params.get('aux')) || location.section === 'auxiliary')
  const [moaOpen, setMoaOpen] = useForcedOpen(location.section === 'moa')

  return (
    <>
      <SettingsWindowSection aside={<SettingsScopeBadge page="models" />} id="main" page="models" title={s.main}>
        <FormCell>
          <ModelSettings onMainModelChanged={onMainModelChanged} scopeProfile={api.scopeProfile} subpage="main" />
        </FormCell>
        <ConfigRows api={api} keys={placedFields(api, 'models', 'main')} skeleton={1} />
      </SettingsWindowSection>
      <SettingsWindowSection id="fallbacks" note={s.fallbacksNote} page="models" title={s.fallbacks}>
        <ConfigRows api={api} keys={placedFields(api, 'models', 'fallbacks')} skeleton={1} />
      </SettingsWindowSection>
      <SettingsWindowSection id="auxiliary" page="models" title={s.auxiliary}>
        <FormDisclosure onOpenChange={setAuxOpen} open={auxOpen} title={s.auxiliaryDisclosure}>
          <FormCell>
            <ModelSettings onMainModelChanged={onMainModelChanged} scopeProfile={api.scopeProfile} subpage="auxiliary" />
          </FormCell>
          <ConfigRows api={api} keys={placedFields(api, 'models', 'auxiliary')} skeleton={0} />
        </FormDisclosure>
      </SettingsWindowSection>
      <SettingsWindowSection id="moa" page="models" title={s.moa}>
        <FormDisclosure onOpenChange={setMoaOpen} open={moaOpen} title={s.moaDisclosure}>
          <FormCell>
            <ModelSettings onMainModelChanged={onMainModelChanged} scopeProfile={api.scopeProfile} subpage="moa" />
          </FormCell>
          <ConfigRows api={api} keys={placedFields(api, 'models', 'moa')} skeleton={0} />
        </FormDisclosure>
      </SettingsWindowSection>
    </>
  )
}

/** 模型 Models: main model, fallbacks, auxiliary models, mixture of agents (profile). */
export function ModelsPage({ location, ...props }: ConfigPageProps & { location: SettingsWindowLocation }) {
  return (
    <ConfigPage legacySection="model" {...props}>
      {api => <ModelsSections api={api} location={location} onMainModelChanged={props.onMainModelChanged} />}
    </ConfigPage>
  )
}
