import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { KeyRound, Lock, Plus, ShieldLock, Trash2 } from '@/lib/icons'

import { ListRow, Pill, SectionHeading } from './primitives'
import { useSettingsWindow } from './studio/window-context'
import type { VaultItem, VaultSource, VaultSourceName } from './vault-settings'

const CAPTION_CLASS =
  'mb-2 text-[length:var(--conversation-caption-font-size)] leading-(--conversation-caption-line-height) text-(--ui-text-tertiary)'

/** Title + Add + blurb above the saved items (the Settings window titles the section itself). */
export function VaultCredentialsHeader({ count, onAdd }: { count: number; onAdd: () => void }) {
  const { t } = useI18n()
  const v = t.settings.vault

  if (useSettingsWindow()) {
    return null
  }

  return (
    <>
      <SectionHeading
        aside={
          <Button className="gap-1.5" onClick={onAdd} size="sm" type="button" variant="outline">
            <Plus className="size-3.5" />
            {v.add}
          </Button>
        }
        icon={ShieldLock}
        meta={count > 0 ? v.count(count) : undefined}
        page
        title={v.title}
      />
      <p className={CAPTION_CLASS}>{v.blurb}</p>
    </>
  )
}

/**
 * Below the saved items: the empty state, and in the Settings window the
 * prototype's closing "Add credential" row (the classic page adds from its header).
 */
export function VaultCredentialsFooter({ empty, onAdd }: { empty: boolean; onAdd: () => void }) {
  const { t } = useI18n()
  const v = t.settings.vault
  const r = t.studio.settings.rows

  if (!useSettingsWindow()) {
    return empty ? <EmptyState description={v.emptyDesc} title={v.empty} /> : null
  }

  return (
    <>
      {empty && <ListRow description={v.blurb} title={v.empty} />}
      <ListRow
        action={
          <Button onClick={onAdd} size="sm" type="button" variant="outline">
            {r.addCredentialAction}
          </Button>
        }
        description={r.addCredentialDesc}
        title={r.addCredentialTitle}
      />
    </>
  )
}

interface VaultItemRowProps {
  formatCreated: (iso: string) => string
  item: VaultItem
  kindLabel: (kind: string) => string
  onDelete: (item: VaultItem) => void
  sourceLabel: (name: VaultSourceName) => string
}

/** One saved credential: label + kind, identifier · origin · date, and remove (local items only). */
export function VaultItemRow({ formatCreated, item, kindLabel, onDelete, sourceLabel }: VaultItemRowProps) {
  const { t } = useI18n()
  const v = t.settings.vault

  return (
    <ListRow
      action={
        item.backend && item.backend !== 'local' ? (
          <Pill tone="muted">{sourceLabel(item.backend)}</Pill>
        ) : (
          <Button
            aria-label={v.deleteAction}
            className="text-(--ui-text-tertiary) hover:text-destructive"
            onClick={() => onDelete(item)}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Trash2 className="size-3.5" />
          </Button>
        )
      }
      description={
        // identifier · origin · date, separated so the row scans as three facts; the origin is
        // omitted when the label already IS the host (save-on-page items are labelled by host).
        <span className="flex flex-wrap items-center gap-x-2">
          {item.identifier && <span className="truncate">{v.identifierShown(item.identifier)}</span>}
          {item.origin && item.origin.replace(/^https?:\/\//, '') !== item.label && (
            <>
              {item.identifier && (
                <span aria-hidden className="text-(--ui-text-tertiary)">
                  ·
                </span>
              )}
              <span className="truncate">{item.origin}</span>
            </>
          )}
          <span aria-hidden className="text-(--ui-text-tertiary)">
            ·
          </span>
          <span>{v.createdOn(formatCreated(item.created_at))}</span>
        </span>
      }
      title={
        <span className="flex items-center gap-2">
          <span className="truncate">{item.label}</span>
          <Pill tone={item.kind === 'login' ? 'primary' : 'muted'}>{kindLabel(item.kind)}</Pill>
          {item.has_otp && <Pill tone="muted">{v.twoFactorBadge}</Pill>}
        </span>
      }
    />
  )
}

/** Title + blurb above the password managers (the Settings window titles the section itself). */
export function VaultSourcesHeader({ spaced }: { spaced: boolean }) {
  const { t } = useI18n()
  const v = t.settings.vault

  if (useSettingsWindow()) {
    return null
  }

  return (
    <>
      <div className={spaced ? 'mt-6' : undefined}>
        <SectionHeading icon={KeyRound} page title={v.sources.title} />
      </div>
      <p className={CAPTION_CLASS}>{v.sources.blurb}</p>
    </>
  )
}

interface VaultSourceRowProps {
  lockPending: boolean
  onLock: (name: VaultSourceName) => void
  onToggle: (name: VaultSourceName, enabled: boolean) => void
  onUnlock: (source: VaultSource) => void
  source: VaultSource
  togglePending: boolean
}

function sourceStatus(
  source: VaultSource,
  s: { statusLocked: string; statusNotDetected: string; statusOff: string; statusUnlocked: string }
) {
  if (!source.installed) {
    return s.statusNotDetected
  }

  if (!source.enabled) {
    return s.statusOff
  }

  return source.unlocked ? s.statusUnlocked : s.statusLocked
}

/** One external password manager: status, lock/unlock for this session, and the on/off switch. */
export function VaultSourceRow({
  lockPending,
  onLock,
  onToggle,
  onUnlock,
  source,
  togglePending
}: VaultSourceRowProps) {
  const { t } = useI18n()
  const s = t.settings.vault.sources

  const description = !source.installed
    ? s.notInstalled(source.display_name)
    : source.enabled
      ? source.unlocked
        ? s.unlockedDesc
        : s.lockedDesc
      : s.disabledDesc

  return (
    <ListRow
      action={
        <span className="flex items-center justify-end gap-2">
          {source.enabled &&
            (source.unlocked ? (
              <Button
                className="gap-1.5"
                disabled={lockPending}
                onClick={() => onLock(source.name)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Lock className="size-3.5" />
                {s.lock}
              </Button>
            ) : (
              <Button className="gap-1.5" onClick={() => onUnlock(source)} size="sm" type="button" variant="outline">
                <KeyRound className="size-3.5" />
                {s.unlock}
              </Button>
            ))}
          {source.installed && (
            <Switch
              aria-label={source.display_name}
              checked={source.enabled}
              disabled={togglePending}
              onCheckedChange={enabled => {
                triggerHaptic('selection')
                onToggle(source.name, enabled)
              }}
            />
          )}
        </span>
      }
      description={description}
      title={
        <span className="flex items-center gap-2">
          <span>{source.display_name}</span>
          <Pill tone={source.enabled && source.unlocked ? 'primary' : 'muted'}>{sourceStatus(source, s)}</Pill>
        </span>
      }
    />
  )
}
