import './wake-indicator.css'

import { useEffect, useState } from 'react'

import { useI18n } from '@/i18n'
import type { WakeIndicatorState } from '@/lib/wake-indicator'

export function WakeIndicatorApp() {
  const { t } = useI18n()
  const [state, setState] = useState<WakeIndicatorState>('hidden')

  useEffect(() => {
    const api = window.hermesDesktop?.wakeIndicator
    let mounted = true
    let receivedLiveState = false

    const unsubscribe = api?.onState(next => {
      if (mounted) {
        receivedLiveState = true
        setState(next)
      }
    })

    void api
      ?.getState()
      .then(next => {
        if (mounted && !receivedLiveState) {
          setState(next)
        }
      })
      .catch(() => undefined)

    return () => {
      mounted = false
      unsubscribe?.()
    }
  }, [])

  return (
    <main aria-hidden className="wake-indicator-surface" data-state={state}>
      <div className="wake-indicator-light">
        <span className="wake-indicator-bars">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="wake-indicator-label">{t.studio.overlays.aux.wake.listening}</span>
      </div>
    </main>
  )
}
