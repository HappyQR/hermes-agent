import { Fragment, type ReactNode, useRef } from 'react'

import { FormRow } from '@/app/overlays/studio/form-group'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'

import { ConfigSettings, type ConfigSettingsLayoutApi } from '../config-settings'
import { voiceFieldVisible } from '../helpers'
import { ListRowSkeleton } from '../primitives'
import type { SettingsPageProps } from '../types'

import type { SettingsPageId } from './categories'
import { configFieldLocation } from './locations'

/**
 * Config-schema keys that render on (page, section), in the classic section
 * order. Unplaced keys of a legacy section fall to that section's window home,
 * so a field the backend adds later still shows up somewhere.
 */
export function placedFields(
  api: ConfigSettingsLayoutApi,
  page: SettingsPageId,
  section: string,
  exclude: readonly string[] = []
): string[] {
  const keys: string[] = []

  for (const [legacySection, entries] of api.fields) {
    for (const [key] of entries) {
      const location = configFieldLocation(key, legacySection)

      if (location.page === page && location.section === section && !exclude.includes(key)) {
        keys.push(key)
      }
    }
  }

  // Voice provider fields only show for the provider that is selected.
  return api.config ? keys.filter(key => voiceFieldVisible(key, api.config!)) : keys
}

/**
 * The config rows of one section: skeleton rows while the draft loads, a retry
 * row when it failed, otherwise each field exactly as the classic page draws it.
 */
export function ConfigRows({
  api,
  keys,
  skeleton = 2
}: {
  api: ConfigSettingsLayoutApi
  keys: readonly string[]
  skeleton?: number
}): ReactNode {
  const { t } = useI18n()

  if (api.failed) {
    return (
      <FormRow title={t.settings.config.failedLoad}>
        <Button onClick={api.retry} size="sm" variant="secondary">
          {t.skills.refresh}
        </Button>
      </FormRow>
    )
  }

  if (!api.ready) {
    return Array.from({ length: skeleton }, (_, index) => <ListRowSkeleton key={index} />)
  }

  return keys.map(key => <Fragment key={key}>{api.renderField(key)}</Fragment>)
}

export type ConfigPageProps = Pick<SettingsPageProps, 'onConfigSaved' | 'onMainModelChanged'>

/**
 * A window page backed by ONE ConfigSettings draft: every config row of every
 * section shares it, so autosaves never clobber each other. `legacySection`
 * keeps that section's deep-link handler (`?setting=` ids of `config:<id>`).
 */
export function ConfigPage({
  children,
  legacySection,
  onConfigSaved,
  onMainModelChanged
}: ConfigPageProps & { children: (api: ConfigSettingsLayoutApi) => ReactNode; legacySection: string }) {
  const importRef = useRef<HTMLInputElement | null>(null)

  return (
    <ConfigSettings
      activeSectionId={legacySection}
      importInputRef={importRef}
      layout={children}
      onConfigSaved={onConfigSaved}
      onMainModelChanged={onMainModelChanged}
    />
  )
}
