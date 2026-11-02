import '../ui/page.css'
import './catalog-sheet.css'

import { type ReactNode, useState } from 'react'

import { SheetFooter, SheetHeader, STUDIO_SHEET_BODY, STUDIO_SHEET_CONTENT } from '@/components/studio/pages/sheet'
import { IconTile, Spinner } from '@/components/studio/pages/tile'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { ProfileScope } from '@/hermes'
import { useI18n } from '@/i18n'
import { useStoreSelector } from '@/lib/use-session-slice'
import { $hubActions, UPDATE_ALL_KEY, updateHubSkills } from '@/store/hub-actions'
import { notify, notifyError } from '@/store/notifications'
import type { SkillInfo } from '@/types/hermes'

import { SkillCatalog } from '../catalog/skill-catalog'

// Skills Hub (prototype pages.js:31; overlays.js:342): the in-app skills
// catalog in an extra-wide sheet. The public feed, the official optional
// skills and this profile's installed skills share one browser; "+" installs
// into the page's profile through the hub action pipeline. The catalog (and
// its feed request) exists only while the sheet is open.

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
        {/* The catalog brings its own cards, so the sheet body is not framed as one. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden" data-slot="studio-catalog-sheet">
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
  /** Installed skills still loading or failed: installs wait for them. */
  installedPending: boolean
  onOpenChange: (open: boolean) => void
  open: boolean
  profile: ProfileScope
  /** The on/off switch an installed skill's card carries. */
  renderInstalledAction: (skill: SkillInfo) => ReactNode
  /** What an installed skill's detail offers beyond the catalog facts. */
  renderInstalledDetail: (skill: SkillInfo) => ReactNode
  skills: SkillInfo[]
}

export function HubSheet({ onOpenChange, open, profile, ...catalog }: HubSheetProps) {
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
      <HubCatalog profile={profile} {...catalog} />
    </CatalogSheetFrame>
  )
}

/** Mounted with the sheet's content, so every visit starts with an empty search. */
function HubCatalog({
  installedPending,
  profile,
  renderInstalledAction,
  renderInstalledDetail,
  skills
}: Omit<HubSheetProps, 'onOpenChange' | 'open'>) {
  const [query, setQuery] = useState('')

  return (
    <SkillCatalog
      installedPending={installedPending}
      onQueryChange={setQuery}
      profile={profile}
      query={query}
      renderInstalledAction={renderInstalledAction}
      renderInstalledDetail={renderInstalledDetail}
      skills={skills}
    />
  )
}
