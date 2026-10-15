import type { ReactNode } from 'react'

import { FormDisclosure, FormGroup, FormRow, FormSection } from '@/components/studio/pages/form'
import { DetailBody, DetailHead } from '@/components/studio/pages/master-detail'
import { SheetBody, SheetFooter, SheetHeader } from '@/components/studio/pages/sheet'
import { Callout } from '@/components/studio/pages/surfaces'
import { Dot, IconTile } from '@/components/studio/pages/tile'
import { ActionsContextMenu, ActionsMenu } from '@/components/ui/actions-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { CopyButton } from '@/components/ui/copy-button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { WebhookRoute } from '@/hermes'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

import { type CronMenuItem, renderCronMenu } from './cron-ui'

// Presentation of the Automations › Webhook tab (prototype pages.js:248-261,
// overlays.js:324). WebhooksView (app/webhooks) keeps the profile-owned state,
// requests and guards; these components only paint. Edit, rotate-secret and
// test-event have no backend endpoint yet, so they are not offered.

export function WebhookItem({
  active,
  menuItems,
  menuLabel,
  onSelect,
  sub
}: {
  active: boolean
  menuItems: CronMenuItem[]
  menuLabel: string
  onSelect: () => void
  sub: WebhookRoute
}) {
  const { t } = useI18n()

  return (
    <ActionsContextMenu ariaLabel={menuLabel} contentClassName="w-44" items={renderCronMenu(menuItems)}>
      <div
        className={cn(
          'group/row relative flex w-full items-center rounded-[9px] transition-colors duration-[120ms]',
          active ? 'bg-(--ui-selected)' : 'hover:bg-(--ui-hover)'
        )}
        data-panel-row={sub.name}
      >
        <button
          aria-current={active ? 'true' : undefined}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-[9px] py-[7px] pr-1 pl-[9px] text-left text-[0.8125rem] outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          onClick={onSelect}
          type="button"
        >
          <Dot tone={sub.enabled ? 'green' : 'gray'} />
          <span className="flex min-w-0 flex-1 flex-col">
            <b className="truncate font-mono text-[0.78125rem] font-medium text-(--ui-text-primary)">{sub.name}</b>
            <span className="truncate text-[0.71875rem] text-(--ui-text-tertiary)">
              {sub.events.length > 0 ? sub.events.join(', ') : t.webhooks.all}
            </span>
          </span>
        </button>
        <div className="shrink-0 pr-1.5 opacity-0 transition-opacity duration-100 group-focus-within/row:opacity-100 group-hover/row:opacity-100 has-[[data-state=open]]:opacity-100">
          <ActionsMenu ariaLabel={menuLabel} contentClassName="w-44" items={renderCronMenu(menuItems)}>
            <Button aria-label={menuLabel} size="icon-xs" variant="ghost">
              <Codicon name="ellipsis" size="0.875rem" />
            </Button>
          </ActionsMenu>
        </div>
      </div>
    </ActionsContextMenu>
  )
}

function MonoValue({ children }: { children: ReactNode }) {
  return <span className="min-w-0 truncate font-mono text-xs text-(--ui-text-primary)">{children}</span>
}

export function WebhookDetailView({
  onDelete,
  onToggle,
  sub
}: {
  onDelete: () => void
  onToggle: (enabled: boolean) => void
  sub: WebhookRoute
}) {
  const { t } = useI18n()
  const w = t.webhooks
  const s = t.studio.pages.webhooks

  return (
    <DetailBody key={sub.name}>
      <DetailHead
        subtitle={s.runsOnEvent}
        title={sub.name}
        titleClassName="font-mono text-[1.0625rem]"
        trailing={<Switch aria-label={s.enableAria(sub.name)} checked={sub.enabled} onCheckedChange={onToggle} />}
      />
      <FormGroup>
        <FormRow description={s.receiveUrlHint} title={s.receiveUrl}>
          <MonoValue>{sub.url}</MonoValue>
          <CopyButton appearance="icon" buttonSize="icon-sm" label={w.copy} text={sub.url} />
        </FormRow>
        <FormRow description={s.signingSecretHint} title={s.signingSecret}>
          <Badge variant={sub.secret_set ? 'success' : 'muted'}>{sub.secret_set ? s.secretSet : s.secretNotSet}</Badge>
        </FormRow>
        <FormRow title={s.events}>
          <MonoValue>{sub.events.length > 0 ? sub.events.join(', ') : w.all}</MonoValue>
        </FormRow>
        <FormRow title={s.skills}>
          <MonoValue>{sub.skills.length > 0 ? sub.skills.join(', ') : s.none}</MonoValue>
        </FormRow>
        <FormRow title={s.deliverTo}>
          {sub.deliver_only ? <Badge variant="warn">{w.deliverOnly}</Badge> : null}
          <span className="text-(--ui-text-primary)">{w.deliverOptions[sub.deliver] ?? sub.deliver}</span>
        </FormRow>
      </FormGroup>
      {sub.description ? (
        <FormSection title={w.fieldDescription}>
          <p className="m-0 px-1 text-[0.8125rem] leading-relaxed text-(--ui-text-secondary)">{sub.description}</p>
        </FormSection>
      ) : null}
      {sub.prompt ? (
        <FormSection title={w.fieldPrompt}>
          <div className="max-h-56 overflow-auto rounded-xl bg-(--pg-card) px-3.5 py-3 text-[0.8125rem] leading-relaxed whitespace-pre-wrap break-words shadow-(--pg-card-ring)">
            {sub.prompt}
          </div>
        </FormSection>
      ) : null}
      <div className="flex items-center gap-2">
        <span className="flex-1" />
        <Button onClick={onDelete} variant="destructive">
          {t.studio.pages.common.deleteEllipsis}
        </Button>
      </div>
    </DetailBody>
  )
}

interface WebhookBannersProps {
  enabled: boolean
  enabling: boolean
  onEnable: () => void
  onOpenReceiverSettings?: () => void
  onRestart: () => void
  restartError: null | string
  restartNeeded: boolean
  restarting: boolean
}

export function WebhookBanners({
  enabled,
  enabling,
  onEnable,
  onOpenReceiverSettings,
  onRestart,
  restartError,
  restartNeeded,
  restarting
}: WebhookBannersProps) {
  const { t } = useI18n()
  const w = t.webhooks

  return (
    <>
      {!enabled && (
        <Callout icon="globe" tone="warn">
          <b className="font-semibold">{w.disabledTitle}</b>
          <p className="mt-0.5 mb-0">{w.disabledBody}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button disabled={enabling} onClick={onEnable} size="sm">
              {enabling ? w.enabling : w.enable}
            </Button>
            {onOpenReceiverSettings ? (
              <Button onClick={onOpenReceiverSettings} size="sm" variant="outline">
                {t.studio.pages.webhooks.receiverSettings}
              </Button>
            ) : null}
          </div>
        </Callout>
      )}
      {restartNeeded && (
        <Callout tone="warn">
          <p className="m-0">{restartError ?? w.restartNeeded}</p>
          <div className="mt-2">
            <Button disabled={restarting} onClick={onRestart} size="sm" variant="outline">
              <Codicon name="refresh" size="0.8125rem" spinning={restarting} />
              {restarting ? w.restartingGateway : w.restartGateway}
            </Button>
          </div>
        </Callout>
      )}
    </>
  )
}

export interface WebhookDraft {
  deliver: string
  deliverOnly: boolean
  description: string
  events: string
  name: string
  prompt: string
  skills: string
}

interface WebhookCreateFormProps {
  creating: boolean
  deliverOptions: readonly string[]
  draft: WebhookDraft
  moreOpen: boolean
  onCancel: () => void
  onChange: (patch: Partial<WebhookDraft>) => void
  onMoreOpenChange: (open: boolean) => void
}

/** The new-webhook sheet's form body + footer (rendered inside a `<form>`). */
export function WebhookCreateForm({
  creating,
  deliverOptions,
  draft,
  moreOpen,
  onCancel,
  onChange,
  onMoreOpenChange
}: WebhookCreateFormProps) {
  const { t } = useI18n()
  const w = t.webhooks
  const s = t.studio.pages.webhooks

  return (
    <>
      <SheetBody>
        <FormGroup>
          <FormRow htmlFor="webhook-name" title={w.fieldName}>
            <Input
              autoFocus
              className="w-56 max-w-full"
              id="webhook-name"
              onChange={event => onChange({ name: event.target.value })}
              placeholder={w.fieldNamePlaceholder}
              value={draft.name}
            />
          </FormRow>
          <FormRow description={w.fieldEventsPlaceholder} htmlFor="webhook-events" title={w.fieldEvents}>
            <Input
              className="w-56 max-w-full font-mono"
              id="webhook-events"
              onChange={event => onChange({ events: event.target.value })}
              value={draft.events}
            />
          </FormRow>
          <FormRow htmlFor="webhook-prompt" stack title={s.promptQuestion}>
            <Textarea
              className="min-h-20 w-full"
              id="webhook-prompt"
              onChange={event => onChange({ prompt: event.target.value })}
              placeholder={w.fieldPromptPlaceholder}
              value={draft.prompt}
            />
          </FormRow>
          <FormRow htmlFor="webhook-deliver" title={s.deliverTo}>
            <Select onValueChange={deliver => onChange({ deliver })} value={draft.deliver}>
              <SelectTrigger className="h-7 w-44 rounded-[7px]" id="webhook-deliver">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {deliverOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {w.deliverOptions[option] ?? option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormDisclosure label={s.moreOptions} onOpenChange={onMoreOpenChange} open={moreOpen}>
            <FormRow htmlFor="webhook-description" title={w.fieldDescription}>
              <Input
                className="w-56 max-w-full"
                id="webhook-description"
                onChange={event => onChange({ description: event.target.value })}
                placeholder={w.fieldDescriptionPlaceholder}
                value={draft.description}
              />
            </FormRow>
            <FormRow htmlFor="webhook-skills" title={w.fieldSkills}>
              <Input
                className="w-56 max-w-full"
                id="webhook-skills"
                onChange={event => onChange({ skills: event.target.value })}
                placeholder={w.fieldSkillsPlaceholder}
                value={draft.skills}
              />
            </FormRow>
            <FormRow htmlFor="webhook-deliver-only" title={w.fieldDeliverOnly}>
              <Switch
                checked={draft.deliverOnly}
                id="webhook-deliver-only"
                onCheckedChange={deliverOnly => onChange({ deliverOnly })}
                size="xs"
              />
            </FormRow>
          </FormDisclosure>
        </FormGroup>
      </SheetBody>
      <SheetFooter>
        <span className="flex-1" />
        <Button disabled={creating} onClick={onCancel} type="button" variant="secondary">
          {t.common.cancel}
        </Button>
        <Button disabled={creating} type="submit">
          {creating ? w.creating : w.create}
        </Button>
      </SheetFooter>
    </>
  )
}

/** After a create: the receive URL and the one-time signing secret. */
export function WebhookCreatedBody({ onDone, secret, url }: { onDone: () => void; secret: string; url: string }) {
  const { t } = useI18n()
  const w = t.webhooks

  return (
    <>
      <SheetBody>
        <p className="m-0 text-[0.78125rem] text-(--ui-text-tertiary)">{w.createdSecretHint}</p>
        <FormGroup>
          <FormRow stack title={w.webhookUrl}>
            <div className="flex w-full items-center gap-1">
              <MonoValue>{url}</MonoValue>
              <span className="flex-1" />
              <CopyButton appearance="icon" buttonSize="icon-sm" label={w.copy} text={url} />
            </div>
          </FormRow>
          <FormRow stack title={w.secretOnce}>
            <div className="flex w-full items-center gap-1">
              <MonoValue>{secret}</MonoValue>
              <span className="flex-1" />
              <CopyButton appearance="icon" buttonSize="icon-sm" label={w.copy} text={secret} />
            </div>
          </FormRow>
        </FormGroup>
      </SheetBody>
      <SheetFooter>
        <span className="flex-1" />
        <Button onClick={onDone}>{w.done}</Button>
      </SheetFooter>
    </>
  )
}

export function WebhookSheetHeader({ created }: { created: boolean }) {
  const { t } = useI18n()

  return (
    <SheetHeader
      lead={<IconTile icon="globe" size={30} tone="green" />}
      title={created ? t.webhooks.createdTitle : t.studio.pages.webhooks.newTitle}
    />
  )
}
