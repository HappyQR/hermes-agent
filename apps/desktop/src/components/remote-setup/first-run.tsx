import { useState } from 'react'
import type { ReactElement } from 'react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Loader2 } from '@/lib/icons'
import { cn } from '@/lib/utils'

import { BOOT_CARD_CLASS, BOOT_COLUMN_CLASS, BOOT_SURFACE_CLASS, BootHero } from '../studio-onboarding/boot-kit'

import { RemoteSetupFields } from './fields'
import { useRemoteSetup } from './use-remote-setup'

interface FirstRunRemoteSetupProps {
  onBack: () => void
}

export function FirstRunRemoteSetup({ onBack }: FirstRunRemoteSetupProps): ReactElement {
  const { t } = useI18n()
  const copy = t.install
  const setup = useRemoteSetup({ host: 'first-run' })
  const [applying, setApplying] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const apply = async (): Promise<void> => {
    if (!setup.canCommit || applying) {
      return
    }

    setApplying(true)
    setError(null)

    try {
      await window.hermesDesktop.applyConnectionConfig(setup.payload)
      onBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err || t.settings.gateway.applyFailed))
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className={cn('fixed inset-0 z-(--z-setup) flex items-center justify-center overflow-y-auto p-5', BOOT_SURFACE_CLASS)}>
      <div className={cn(BOOT_COLUMN_CLASS, 'w-[min(36rem,100%)]')}>
        <BootHero lead={copy.remoteSetupDesc} title={copy.remoteSetupTitle} />
        <div className={cn('mt-1 w-full p-5 text-left', BOOT_CARD_CLASS)}>
          <RemoteSetupFields disabled={applying} setup={setup} />
          {error ? <div className="mt-3 text-sm text-(--ui-red)">{error}</div> : null}
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <Button disabled={applying} onClick={onBack} size="sm" variant="ghost">
            {copy.backToSetup}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              disabled={setup.testing || applying || !setup.canTest}
              onClick={() => void setup.test()}
              size="sm"
              variant="secondary"
            >
              {setup.testing ? <Loader2 className="animate-spin" /> : null}
              {copy.testConnection}
            </Button>
            <Button disabled={applying || !setup.canCommit} onClick={() => void apply()} size="sm">
              {applying ? <Loader2 className="animate-spin" /> : null}
              {copy.applyRemote}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
