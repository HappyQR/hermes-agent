import { createContext, useContext } from 'react'

/**
 * True inside the Hermes Studio Settings window. The shared settings
 * primitives (SettingsContent, ListRow/ToggleRow, SectionHeading,
 * SettingsSection, skeletons) switch to the macOS grouped-form look only when
 * it is set, so every other surface — plugins (ListRow/ToggleRow are public
 * SDK), Messaging, the boot-failure gateway form — renders exactly as before.
 */
export const SettingsWindowContext = createContext(false)

export const useSettingsWindow = (): boolean => useContext(SettingsWindowContext)
