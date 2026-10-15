import { FormGroup, FormRow } from '@/components/studio/pages/form'
import {
  SheetBody,
  SheetFooter,
  SheetHeader,
  STUDIO_SHEET_BODY,
  STUDIO_SHEET_CONTENT
} from '@/components/studio/pages/sheet'
import { Callout } from '@/components/studio/pages/surfaces'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { StudioIcon } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { openExternalLink } from '@/lib/external-link'
import { isSubmitEnter } from '@/lib/ime'

import { PlatformTile } from '../platform-tile'

// The QR sheet of Telegram's quick setup (prototype overlays.js:344-348): the
// code with its countdown and Open Telegram, then — once Telegram confirms —
// the new bot, the allowed user IDs (the owner pre-filled) and Save and
// restart. Closing cancels the pairing; it cannot close while applying.

export interface TelegramQrSheetProps {
  allowedIds: string[]
  botUsername: null | string
  deepLink: string
  detectedOwnerId: null | string
  error: string
  expiresIn: null | string
  newAllowedId: string
  onAddAllowedId: () => void
  onApply: () => void
  onCancel: () => void
  onNewAllowedIdChange: (value: string) => void
  onRemoveAllowedId: (id: string) => void
  open: boolean
  phase: 'applying' | 'idle' | 'ready' | 'starting' | 'waiting'
  qrDataUrl: string
}

export function TelegramQrSheet({
  allowedIds,
  botUsername,
  deepLink,
  detectedOwnerId,
  error,
  expiresIn,
  newAllowedId,
  onAddAllowedId,
  onApply,
  onCancel,
  onNewAllowedIdChange,
  onRemoveAllowedId,
  open,
  phase,
  qrDataUrl
}: TelegramQrSheetProps) {
  const { t } = useI18n()
  const q = t.messaging.telegramQr
  const s = t.studio.pages.messaging
  const applying = phase === 'applying'
  const confirmed = phase === 'ready' || applying

  return (
    <Dialog onOpenChange={next => !next && !applying && onCancel()} open={open}>
      <DialogContent bodyClassName={STUDIO_SHEET_BODY} className={STUDIO_SHEET_CONTENT.md} showCloseButton={false}>
        <SheetHeader
          closable={!applying}
          description={confirmed ? null : q.scanHint}
          lead={<PlatformTile platformId="telegram" platformName="Telegram" size={30} />}
          title={s.qrSheetTitle}
        />
        <SheetBody className="items-stretch">
          <div className="flex flex-col items-center gap-3 py-1.5">
            {qrDataUrl ? (
              <img
                alt="Telegram setup QR code"
                className="size-44 rounded-[14px] bg-white p-2.5 shadow-[0_0_0_0.5px_var(--ui-line-2)]"
                src={qrDataUrl}
              />
            ) : null}
            <span className="flex flex-wrap items-center justify-center gap-2 text-[0.78125rem] text-(--ui-text-tertiary)">
              {phase === 'waiting' ? <Badge variant="warn">{q.waiting}</Badge> : null}
              <Badge variant={expiresIn ? 'muted' : 'destructive'}>
                {expiresIn ? q.expiresIn(expiresIn) : q.expired}
              </Badge>
            </span>
            <Button onClick={() => openExternalLink(deepLink)} variant="outline">
              <StudioIcon name="external" size={13} />
              {q.openTelegram}
            </Button>
          </div>
          {confirmed ? (
            <FormGroup>
              <FormRow title={q.ready}>
                {botUsername ? (
                  <span className="font-mono text-xs text-(--ui-text-secondary)">@{botUsername}</span>
                ) : null}
              </FormRow>
              <FormRow
                stack
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    {q.allowedUsers}
                    {detectedOwnerId && allowedIds.includes(detectedOwnerId) ? (
                      <Badge variant="success">{q.ownerDetected}</Badge>
                    ) : null}
                  </span>
                }
              >
                <div className="flex w-full flex-col gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {allowedIds.map(id => (
                      <button
                        aria-label={`${t.common.remove} ${id}`}
                        className="inline-flex h-6 items-center gap-1 rounded-full bg-(--ui-fill-2) px-2.5 font-mono text-xs text-(--ui-text-primary) hover:text-(--ui-red)"
                        key={id}
                        onClick={() => onRemoveAllowedId(id)}
                        type="button"
                      >
                        {id}
                        <StudioIcon name="x" size={9} />
                      </button>
                    ))}
                    {allowedIds.length === 0 ? (
                      <span className="text-xs text-(--ui-text-tertiary)">{q.addAtLeastOne}</span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      className="w-52 max-w-full"
                      onChange={event => onNewAllowedIdChange(event.target.value)}
                      onKeyDown={event => {
                        if (isSubmitEnter(event)) {
                          event.preventDefault()
                          onAddAllowedId()
                        }
                      }}
                      placeholder={q.userIdPlaceholder}
                      value={newAllowedId}
                    />
                    <Button onClick={onAddAllowedId} size="sm" variant="outline">
                      <StudioIcon name="plus" size={12} />
                      {q.add}
                    </Button>
                  </div>
                </div>
              </FormRow>
            </FormGroup>
          ) : null}
          {error ? <Callout tone="warn">{error}</Callout> : null}
        </SheetBody>
        <SheetFooter>
          <span className="flex-1" />
          <Button disabled={applying} onClick={onCancel} variant="outline">
            {t.common.cancel}
          </Button>
          {confirmed ? (
            <Button disabled={applying} onClick={onApply}>
              {applying ? q.applying : q.saveAndRestart}
            </Button>
          ) : null}
        </SheetFooter>
      </DialogContent>
    </Dialog>
  )
}
