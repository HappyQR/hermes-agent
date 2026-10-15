import { useStore } from '@nanostores/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { FormGroup, FormRow, FormSection } from '@/app/overlays/studio/form-group'
import { SheetBody, SheetFooter, SheetHeader } from '@/app/overlays/studio/sheet-header'
import { SETTINGS_ROUTE } from '@/app/routes'
import { settingsPageSearch } from '@/app/settings/studio/categories'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { SearchField } from '@/components/ui/search-field'
import { useContributions } from '@/contrib/react/use-contributions'
import { useI18n } from '@/i18n'
import { KeyboardIcon } from '@/lib/icons-studio-overlays'
import { allKeybindActions, KEYBIND_CATEGORIES, KEYBIND_READONLY, KEYBINDS_AREA } from '@/lib/keybinds/actions'
import { formatCombo } from '@/lib/keybinds/combo'
import { $bindings } from '@/store/keybinds'

import { buildShortcutGroups } from './model'
import { $keybindsSheetOpen, openKeybindsSheet, setKeybindsSheetOpen } from './store'

/**
 * ⌘/ — the read-only map of every bound shortcut (prototype "键盘快捷键"
 * sheet). Rebinding stays in Settings › Keyboard & Shortcuts; the footer link
 * goes there.
 */
export function KeybindsSheet() {
  const open = useStore($keybindsSheetOpen)

  // The palette's core "Keyboard shortcuts" row dispatches this event
  // (contributions have no router or store access of their own).
  useEffect(() => {
    window.addEventListener('hermes:open-keybinds', openKeybindsSheet)

    return () => window.removeEventListener('hermes:open-keybinds', openKeybindsSheet)
  }, [])

  return (
    <Dialog onOpenChange={setKeybindsSheetOpen} open={open}>
      {open ? <KeybindsSheetContent /> : null}
    </Dialog>
  )
}

function KeybindsSheetContent() {
  const { t } = useI18n()
  const s = t.studio.overlays.shortcuts
  const bindings = useStore($bindings)
  const contributions = useContributions(KEYBINDS_AREA)
  const [query, setQuery] = useState('')

  const groups = useMemo(
    () =>
      buildShortcutGroups({
        actions: allKeybindActions(contributions),
        bindings,
        categories: KEYBIND_CATEGORIES,
        familyLabel: (key, first, last) => s[key](first, last),
        format: formatCombo,
        label: (id, fallback) => t.keybinds.actions[id] ?? fallback ?? id,
        query,
        readonly: KEYBIND_READONLY
      }),
    [bindings, contributions, query, s, t.keybinds.actions]
  )

  const settingsPlace = `${t.commandCenter.settings} › ${t.studio.settings.pages.keyboard.title}`

  const navigate = useNavigate()
  const close = () => setKeybindsSheetOpen(false)

  return (
    <DialogContent
      bodyClassName="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0"
      className="h-[min(40rem,calc(100vh-6rem))] max-w-[min(55rem,calc(100vw-2.5rem))]"
      showCloseButton={false}
    >
      <SheetHeader
        closeLabel={s.close}
        icon={KeyboardIcon}
        inDialog
        onClose={close}
        right={
          <SearchField
            aria-label={s.search}
            containerClassName="w-44"
            onChange={setQuery}
            placeholder={s.searchPlaceholder}
            value={query}
            variant="filled"
          />
        }
        subtitle={s.subtitle(settingsPlace)}
        title={s.title}
        tone="gray"
      />
      <SheetBody className="grid grid-cols-[repeat(auto-fill,minmax(16.25rem,1fr))] content-start gap-3.5">
        {groups.length === 0 ? (
          <p className="col-span-full py-10 text-center text-[0.8125rem] text-(--ui-text-tertiary)">
            {s.noResults(query.trim())}
          </p>
        ) : (
          groups.map(group => (
            <FormSection key={group.category} title={t.keybinds.categories[group.category]}>
              <FormGroup>
                {group.rows.map(row => (
                  <FormRow className="min-h-[2.125rem]" key={row.id} title={row.label}>
                    <span className="flex flex-wrap justify-end gap-x-2 text-[0.71875rem] tracking-[0.02em] whitespace-nowrap text-(--ui-text-tertiary)">
                      {row.combos.map(combo => (
                        <kbd className="font-sans" key={combo}>
                          {combo}
                        </kbd>
                      ))}
                    </span>
                  </FormRow>
                ))}
              </FormGroup>
            </FormSection>
          ))
        )}
      </SheetBody>
      <SheetFooter>
        <span className="flex-1" />
        <Button
          onClick={() => {
            close()
            navigate(`${SETTINGS_ROUTE}${settingsPageSearch('keyboard')}`)
          }}
          size="sm"
          variant="secondary"
        >
          {s.editInSettings}
        </Button>
      </SheetFooter>
    </DialogContent>
  )
}
