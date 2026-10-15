// The one floating-list look. DropdownMenu, Select, and every Popover + cmdk
// picker (`<PopoverContent variant="menu">` + `<Command variant="menu">`) paint
// through these, so a list reads the same wherever it opens. Change the menu
// here, never per call site.

// `dt-portal-scrollbar` reproduces the thin themed scrollbar from
// `.scrollbar-dt` for portaled overlays (Radix renders under document.body,
// outside #root's scope). See styles.css.
// Hermes Studio: the macOS menu — frosted --ui-menu fill, 0.5px ring inside
// shadow-md (no border), 11px corners, 13px text.
export const menuSurfaceClass =
  'dt-portal-scrollbar rounded-xl bg-(--ui-menu) p-[5px] text-[0.8125rem] text-popover-foreground shadow-md backdrop-blur-[36px] backdrop-saturate-[1.8]'

// Motion lives in studio.css (keyed on data-slot + data-state), so menus,
// selects and popovers share one spring pop-in and a quick fade-out.
export const menuMotionClass = ''

// Row shape only. Each primitive adds its own highlight/disabled selectors:
// Radix rows take real focus (`focus:`), cmdk rows stay behind the input and
// mark `data-selected="true"`.
export const menuItemClass =
  "relative flex min-h-6 items-center gap-2 rounded-[5px] px-2 py-[3px] text-[0.8125rem] leading-[1.25rem] outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5"

// macOS highlight: accent fill, white label and glyphs.
export const menuItemFocusClass =
  'focus:bg-(--dt-primary) focus:text-(--ui-on-accent) focus:[&_svg]:text-(--ui-on-accent) focus:[&_*]:text-(--ui-on-accent)'

export const menuLabelClass = 'px-2 pt-1.5 pb-1 text-[0.71875rem] font-semibold text-(--ui-text-tertiary)'
