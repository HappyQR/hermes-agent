import type { ReactNode } from 'react'

import { SheetFooter, SheetHeader, STUDIO_SHEET_BODY, STUDIO_SHEET_CONTENT } from '@/components/studio/pages/sheet'
import { IconTile, Spinner } from '@/components/studio/pages/tile'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { ProfileScope } from '@/hermes'
import { useI18n } from '@/i18n'
import { useStoreSelector } from '@/lib/use-session-slice'
import { $hubActions, UPDATE_ALL_KEY, updateHubSkills } from '@/store/hub-actions'
import { notify, notifyError } from '@/store/notifications'

import { EmbeddedHubPicker } from '../skills/embedded-hub-picker'

// 技能中心 (prototype pages.js:31; overlays.js:342): the live Skills Hub page in
// an extra-wide sheet. "+ Add to this Agent" inside the frame installs into the
// page's profile through the hub action pipeline; the frame (and its message
// listener) exists only while the sheet is open.

interface CatalogSheetFrameProps {
  children: ReactNode
  description: ReactNode
  footer?: ReactNode
  icon: 'globe' | 'puzzle'
  onOpenChange: (open: boolean) => void
  open: boolean
  title: string
}

/** The shared frame of the hub and plugin-catalog sheets. */
export function CatalogSheetFrame({
  children,
  description,
  footer,
  icon,
  onOpenChange,
  open,
  title
}: CatalogSheetFrameProps) {
  const { t } = useI18n()

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent bodyClassName={STUDIO_SHEET_BODY} className={STUDIO_SHEET_CONTENT.xwide} showCloseButton={false}>
        <SheetHeader description={description} lead={<IconTile icon={icon} size={30} tone="indigo" />} title={title} />
        <div className="mx-[18px] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[11px] bg-(--pg-card) shadow-(--pg-card-ring)">
          {children}
        </div>
        <SheetFooter>
          {footer}
          <span className="flex-1" />
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {t.studio.pages.capabilities.skills.done}
          </Button>
        </SheetFooter>
      </DialogContent>
    </Dialog>
  )
}

interface HubSheetProps {
  installedNames: ReadonlySet<string>
  onOpenChange: (open: boolean) => void
  open: boolean
  profile: ProfileScope
}

export function HubSheet({ installedNames, onOpenChange, open, profile }: HubSheetProps) {
  const { t } = useI18n()
  const h = t.skills.hub
  const c = t.studio.pages.capabilities.skills
  const updating = useStoreSelector($hubActions, actions => actions[UPDATE_ALL_KEY]?.running ?? false)

  const updateAll = () => {
    notify({ kind: 'success', message: h.actionLog, title: h.updateStarted })
    void updateHubSkills(profile).catch(err => notifyError(err, h.actionFailed))
  }

  return (
    <CatalogSheetFrame
      description={c.hubHint}
      footer={
        <Button disabled={updating} onClick={updateAll} variant="ghost">
          {updating ? <Spinner /> : null}
          {updating ? h.updating : h.updateAll}
        </Button>
      }
      icon="globe"
      onOpenChange={onOpenChange}
      open={open}
      title={c.hubTitle}
    >
      <EmbeddedHubPicker installedNames={installedNames} profile={profile} variant="sheet" />
    </CatalogSheetFrame>
  )
}
