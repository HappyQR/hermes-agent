/** Hermes Studio — Overlays: Quick Ask, HUD, wake pill, pet, onboarding/boot surfaces and toasts. */
export interface StudioOverlaysAuxTranslations {
  /** The global-hotkey Quick Ask window (app/quick-entry). */
  quickEntry: {
    placeholder: string
    disconnected: string
    sendTo: string
    targetLabel: string
    targetCurrent: string
    targetNew: string
    /** Hint words after the Return / Escape key glyphs: "↵ send · Esc close". */
    send: string
    dismiss: string
    /** Hint naming the live global shortcut. */
    summon: (combo: string) => string
    deliveryFailed: string
  }
  /** The wake-word pill under the menu bar (app/wake-indicator). */
  wake: {
    listening: string
  }
  pet: {
    label: (name: string) => string
    messagePlaceholder: string
    openInHermes: string
    /** Speech-bubble phrasings per mood, picked at random. Keep them short; the bubble never wraps. */
    lines: {
      run: string[]
      review: string[]
      failed: string[]
      waiting: string[]
      /** Said when the pet is clicked while Hermes is idle. */
      idle: string[]
    }
  }
  /** Connecting / onboarding / boot surfaces. */
  boot: {
    connecting: string
    step: (current: number, total: number) => string
  }
}
