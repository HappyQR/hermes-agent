import { useCallback } from 'react'

import { useI18n } from '@/i18n'

import { BillingSettings } from '../../billing'
import { useSettingsDrill } from '../drill'
import type { SettingsWindowLocation } from '../use-settings-location'

/**
 * Billing: the billing page lays out its own sections (overview cards,
 * plan, payment and credits, usage); Plans is a drill-in with Back.
 */
export function BillingPage({ location }: { location: SettingsWindowLocation }) {
  const { t } = useI18n()
  const { updateParams } = location
  const plans = location.params.get('bview') === 'plans'
  const back = useCallback(() => updateParams(next => next.delete('bview')), [updateParams])

  useSettingsDrill(plans ? { onBack: back, title: t.settings.subpages.billingPlans } : null)

  return (
    <div className="flex flex-col gap-[1.375rem]" data-slot="settings-billing">
      <BillingSettings />
    </div>
  )
}
