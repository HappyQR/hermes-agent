import { createContext, useContext, useEffect } from 'react'

/**
 * A drill-in inside a Settings page (a plugin's page, Billing › Plans, Local
 * models): the window header shows its title and enables Back while it is
 * registered. Pages register with `useSettingsDrill`; `null` clears it.
 */
export interface SettingsDrill {
  onBack: () => void
  title: string
}

export const SettingsDrillContext = createContext<(drill: null | SettingsDrill) => void>(() => undefined)

export function useSettingsDrill(drill: null | SettingsDrill): void {
  const setDrill = useContext(SettingsDrillContext)
  const title = drill?.title
  const onBack = drill?.onBack

  useEffect(() => {
    setDrill(title !== undefined && onBack ? { onBack, title } : null)

    return () => setDrill(null)
  }, [onBack, setDrill, title])
}
