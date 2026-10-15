import { atom } from 'nanostores'

/** Whether the read-only keyboard shortcuts sheet (⌘/) is open. Editing lives in Settings › Keyboard. */
export const $keybindsSheetOpen = atom(false)

export function openKeybindsSheet(): void {
  $keybindsSheetOpen.set(true)
}

export function setKeybindsSheetOpen(open: boolean): void {
  $keybindsSheetOpen.set(open)
}

export function toggleKeybindsSheet(): void {
  $keybindsSheetOpen.set(!$keybindsSheetOpen.get())
}
