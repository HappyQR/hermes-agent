import type { StudioOverlaysAuxTranslations } from './types_studio_overlays_aux'

/** Hermes Studio — Overlays: command palette, system status, sheets, quick ask, HUD, onboarding. */
export interface StudioOverlaysTranslations {
  quickAsk: string
  /** Aux windows, boot/onboarding surfaces and toasts (one file per locale: *_studio_overlays_aux.ts). */
  aux: StudioOverlaysAuxTranslations
}
