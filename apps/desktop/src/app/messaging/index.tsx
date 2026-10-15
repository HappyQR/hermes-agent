import { useStore } from '@nanostores/react'
import type * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { StatusTone } from '@/components/status-dot'
import { FormDisclosure, FormGroup, FormRow, FormSection } from '@/components/studio/pages/form'
import { DetailBody, DetailHead } from '@/components/studio/pages/master-detail'
import { Callout } from '@/components/studio/pages/surfaces'
import { monogramFor } from '@/components/ui/avatar-chip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Switch } from '@/components/ui/switch'
import { Tip } from '@/components/ui/tooltip'
import {
  approvePairing,
  getMessagingPlatforms,
  getPairing,
  type MessagingEnvVarInfo,
  type MessagingPlatformInfo,
  type MessagingPlatformUpdate,
  type PairingUser,
  revokePairing,
  type TelegramOnboardingApplyResponse,
  updateMessagingPlatform
} from '@/hermes'
import { type Translations, useI18n } from '@/i18n'
import { openExternalLink } from '@/lib/external-link'
import { ExternalLink, RefreshCw, Save, Trash2 } from '@/lib/icons'
import { platformStatusTone } from '@/lib/platform-status'
import { normalize } from '@/lib/text'
import { $changeEventsAvailable, $pairingChangeTick, $platformsChangeTick } from '@/store/live-sync'
import { notify, notifyError } from '@/store/notifications'
import { $settingsRequestProfile } from '@/store/settings-scope'
import { $gatewayRestarting, runGatewayRestart, watchGatewayRestartOutcome } from '@/store/system-actions'

import { useRefreshHotkey } from '../hooks/use-refresh-hotkey'
import { useRouteEnumParam } from '../hooks/use-route-enum-param'
import { credentialPreview } from '../settings/helpers'
import type { SetStatusbarItemGroup } from '../shell/statusbar-controls'

import { AllowlistField } from './allowlist-field'
import { PlatformTile } from './platform-tile'
import { MessagingPage } from './studio/messaging-page'
import { TelegramQrSetup } from './telegram-qr-setup'

interface MessagingViewProps extends React.ComponentProps<'section'> {
  setStatusbarItemGroup?: SetStatusbarItemGroup
}

type EditMap = Record<string, Record<string, string>>

const stateLabel = (state: null | string | undefined, m: Translations['messaging']) =>
  state ? m.states[state] || state.replace(/_/g, ' ') : m.unknown

// Filter order: what needs you first, then what's fine, then what's off.
const STATUS_FILTER_ORDER: StatusTone[] = ['bad', 'warn', 'good', 'muted']

function platformMatches(platform: MessagingPlatformInfo, tone: 'all' | StatusTone, query: string): boolean {
  const q = normalize(query)

  return (
    (tone === 'all' || platformStatusTone(platform) === tone) &&
    (!q ||
      [platform.id, platform.name, platform.description, platform.state]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(q)))
  )
}

const trimEdits = (edits: Record<string, string>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(edits)
      .map(([k, v]) => [k, v.trim()])
      .filter(([, v]) => v)
  )

/** A saved allowlist emptied in its editor is a clear: trimEdits alone reads "" as untouched. */
function platformChanges(platform: MessagingPlatformInfo, draft: Record<string, string>): MessagingPlatformUpdate {
  const env = trimEdits(draft)

  const clearEnv = platform.env_vars
    .filter(field => field.is_list && field.is_set && draft[field.key]?.trim() === '')
    .map(field => field.key)

  return clearEnv.length ? { env, clear_env: clearEnv } : { env }
}

const hasChanges = (update: MessagingPlatformUpdate) =>
  Object.keys(update.env || {}).length + (update.clear_env?.length ?? 0) > 0

/** Stable row identity: a user id is only unique within its platform. */
const pairingKey = (user: PairingUser) => `${user.platform}:${user.user_id}`

const pairingLabel = (user: PairingUser) => user.user_name || user.user_id

/** Group pairing rows by platform id so a detail pane can slice its own. */
function byPlatform(rows: PairingUser[]): Record<string, PairingUser[]> {
  const grouped: Record<string, PairingUser[]> = {}

  for (const row of rows) {
    ;(grouped[row.platform] ||= []).push(row)
  }

  return grouped
}

const FIELD_COPY: Record<string, { advanced?: boolean }> = {
  TELEGRAM_PROXY: { advanced: true },
  DISCORD_REPLY_TO_MODE: { advanced: true },
  DISCORD_ALLOW_ALL_USERS: { advanced: true },
  DISCORD_HOME_CHANNEL: { advanced: true },
  DISCORD_HOME_CHANNEL_NAME: { advanced: true },
  BLUEBUBBLES_ALLOW_ALL_USERS: { advanced: true },
  MATTERMOST_ALLOW_ALL_USERS: { advanced: true },
  MATTERMOST_HOME_CHANNEL: { advanced: true },
  QQ_ALLOW_ALL_USERS: { advanced: true },
  QQBOT_HOME_CHANNEL: { advanced: true },
  QQBOT_HOME_CHANNEL_NAME: { advanced: true },
  WHATSAPP_ENABLED: { advanced: true },
  WHATSAPP_MODE: { advanced: true }
}

function fieldCopy(field: MessagingEnvVarInfo, m: Translations['messaging']) {
  const copy = FIELD_COPY[field.key] || {}
  const localized = m.fieldCopy[field.key] || {}

  return {
    label: localized.label || field.prompt || field.key,
    help: localized.help || field.description,
    placeholder: localized.placeholder || field.prompt,
    advanced: Boolean(copy.advanced || field.advanced)
  }
}

export function MessagingView({ setStatusbarItemGroup: _setStatusbarItemGroup, ...props }: MessagingViewProps) {
  const { t } = useI18n()
  const m = t.messaging
  // Shared settings "Applies to" scope, request-shaped (undefined → follow
  // the active profile; the API helpers treat null as "target primary").
  const scopeProfile = useStore($settingsRequestProfile)
  const [platforms, setPlatforms] = useState<MessagingPlatformInfo[] | null>(null)
  // A saved credential/toggle only takes effect on the next gateway start, so a
  // vanishing toast is not enough: the page keeps a banner up until a restart
  // actually happens (dashboard parity). Cleared on a completed restart.
  const [restartNeeded, setRestartNeeded] = useState(false)
  const gatewayRestarting = useStore($gatewayRestarting)

  const [pairing, setPairing] = useState<{ approved: PairingUser[]; pending: PairingUser[] }>({
    approved: [],
    pending: []
  })

  const [approving, setApproving] = useState<null | string>(null)
  const [pendingRevoke, setPendingRevoke] = useState<null | PairingUser>(null)
  const [edits, setEdits] = useState<EditMap>({})
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | StatusTone>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const platformIds = useMemo(() => platforms?.map(p => p.id) ?? [], [platforms])
  const [selectedId, setSelectedId] = useRouteEnumParam('platform', platformIds, platformIds[0] ?? '')

  const restartGatewayNow = useCallback(async () => {
    // runGatewayRestart never rejects: it toasts the failure and settles the
    // statusbar indicator; the banner stays if the restart did not complete.
    const ok = await runGatewayRestart()

    if (ok) {
      setRestartNeeded(false)
      window.setTimeout(() => void refreshPlatformsRef.current(true), 4000)
    }
  }, [])

  // A multiplexed named profile is re-served from its new config at once (`hot_served`): no restart
  // banner; re-read status once the adapter had a moment to connect. Anything else needs a restart.
  const settleAfterUpdate = useCallback((hotServed: boolean | undefined) => {
    if (hotServed) {
      window.setTimeout(() => void refreshPlatformsRef.current(true), 4000)

      return
    }

    setRestartNeeded(true)
  }, [])

  // The scope each in-flight fetch was issued for. A→B: A's request can resolve
  // AFTER the switch and repaint A's platforms/env snapshot (its redacted
  // Telegram token included) under B until B's own response lands (#96542).
  // A response whose scope is no longer the rendered one is dropped.
  const scopeRef = useRef(scopeProfile)

  scopeRef.current = scopeProfile

  const refreshPlatforms = useCallback(
    async (silent = false) => {
      if (!silent) {
        setRefreshing(true)
      }

      try {
        const result = await getMessagingPlatforms(scopeProfile)

        if (scopeRef.current === scopeProfile) {
          setPlatforms(result.platforms)
        }
      } catch (err) {
        if (!silent) {
          notifyError(err, m.loadFailed)
        }
      } finally {
        if (!silent) {
          setRefreshing(false)
        }
      }
    },
    [m, scopeProfile]
  )

  // Latest-callback ref: the deferred post-restart refresh must not capture a
  // stale scope closure from before a profile switch.
  const refreshPlatformsRef = useRef(refreshPlatforms)

  refreshPlatformsRef.current = refreshPlatforms

  // Pairing has its own signal. platforms.changed tracks connect/disconnect
  // health via gateway_state.json, which a new pairing request never moves —
  // riding it would leave a pending row invisible until something unrelated
  // reconnected. Failures stay silent: an older backend without the endpoint
  // should show no rows, not an error banner over a working page.
  const refreshPairing = useCallback(async () => {
    try {
      const result = await getPairing(scopeProfile)

      if (scopeRef.current === scopeProfile) {
        setPairing({ approved: result.approved ?? [], pending: result.pending ?? [] })
      }
    } catch {
      // Leave the last known rows in place rather than blanking them.
    }
  }, [scopeProfile])

  const refreshAll = useCallback(
    async (silent = false) => {
      await Promise.all([refreshPlatforms(silent), refreshPairing()])
    },
    [refreshPairing, refreshPlatforms]
  )

  useRefreshHotkey(() => void refreshAll())

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  // Scope switch: the mounted list still shows the PREVIOUS profile's
  // platforms/pairing while the new fetch is in flight — blank it so stale
  // rows can't be toggled against the wrong backend. This must run during
  // render, not in an effect: passive effects fire after paint, and that
  // first painted frame would show the previous profile's credential
  // placeholders (e.g. a redacted Telegram token) under the new profile's
  // scope for the ~1s until the fetch lands (#96542). Setting state during
  // render makes React throw the stale frame away before it reaches the
  // screen.
  const [prevScope, setPrevScope] = useState(scopeProfile)

  if (prevScope !== scopeProfile) {
    setPrevScope(scopeProfile)
    setPlatforms(null)
    setPairing({ approved: [], pending: [] })
    setEdits({})
  }

  const changeEventsAvailable = useStore($changeEventsAvailable)
  const platformsChangeTick = useStore($platformsChangeTick)
  const pairingChangeTick = useStore($pairingChangeTick)

  // A new pending request (or a grant from another surface) moves the pairing
  // store on disk; the change watcher turns that into pairing.changed.
  useEffect(() => {
    if (!changeEventsAvailable || pairingChangeTick === 0 || document.hidden) {
      return
    }

    void refreshPairing()
  }, [changeEventsAvailable, pairingChangeTick, refreshPairing])

  // Connection status updates without a manual "check" click. platforms.changed
  // (the gateway persisting connect/disconnect/health to gateway_state.json)
  // drives the refresh on event-capable backends — no timer; older backends
  // keep the legacy visible-tab poll.
  useEffect(() => {
    if (!changeEventsAvailable || platformsChangeTick === 0 || document.hidden) {
      return
    }

    void refreshPlatforms(true)
  }, [changeEventsAvailable, platformsChangeTick, refreshPlatforms])

  useEffect(() => {
    if (changeEventsAvailable) {
      return
    }

    let cancelled = false

    function tick() {
      if (cancelled || document.hidden) {
        return
      }

      void refreshAll(true)
    }

    const id = window.setInterval(tick, 6000)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [changeEventsAvailable, refreshAll])

  const selected = useMemo(() => {
    if (!platforms) {
      return null
    }

    return platforms.find(platform => platform.id === selectedId) || platforms[0] || null
  }, [platforms, selectedId])

  const pendingByPlatform = useMemo(() => byPlatform(pairing.pending), [pairing.pending])
  const approvedByPlatform = useMemo(() => byPlatform(pairing.approved), [pairing.approved])

  // Only tones some platform is actually in get a tab; a filter whose last
  // platform changed state falls back to All instead of an empty list.
  const presentTones = useMemo(
    () => STATUS_FILTER_ORDER.filter(tone => platforms?.some(platform => platformStatusTone(platform) === tone)),
    [platforms]
  )

  const activeStatusFilter = statusFilter !== 'all' && presentTones.includes(statusFilter) ? statusFilter : 'all'

  const visiblePlatforms = useMemo(
    () => platforms?.filter(platform => platformMatches(platform, activeStatusFilter, query)) ?? [],
    [activeStatusFilter, platforms, query]
  )

  // Picking a filter moves the detail pane into it. Only on that click: a
  // platform that leaves the filter because you just enabled it stays open.
  function handleStatusFilter(next: 'all' | StatusTone) {
    setStatusFilter(next)

    if (selected && !platformMatches(selected, next, query)) {
      const first = platforms?.find(platform => platformMatches(platform, next, query))

      if (first) {
        setSelectedId(first.id)
      }
    }
  }

  async function handleToggle(platform: MessagingPlatformInfo, enabled: boolean) {
    setSaving(`enabled:${platform.id}`)

    try {
      const result = await updateMessagingPlatform(platform.id, { enabled }, scopeProfile)
      setPlatforms(
        current =>
          current?.map(row =>
            row.id === platform.id
              ? {
                  ...row,
                  enabled,
                  state: enabled ? (row.configured ? 'pending_restart' : 'not_configured') : 'disabled'
                }
              : row
          ) ?? current
      )
      settleAfterUpdate(result.hot_served)
      notify({
        kind: 'success',
        title: enabled ? m.platformEnabled(platform.name) : m.platformDisabled(platform.name),
        message: result.hot_served ? m.appliedLive : m.restartToApply
      })
    } catch (err) {
      notifyError(err, m.failedUpdate(platform.name))
    } finally {
      setSaving(null)
    }
  }

  async function handleSave(platform: MessagingPlatformInfo) {
    const update = platformChanges(platform, edits[platform.id] || {})

    if (!hasChanges(update)) {
      return
    }

    setSaving(`env:${platform.id}`)

    try {
      const result = await updateMessagingPlatform(platform.id, update, scopeProfile)
      // Refresh before dropping the drafts so list editors re-seed from the saved value, not the old one.
      await refreshPlatforms()
      setEdits(current => ({ ...current, [platform.id]: {} }))
      settleAfterUpdate(result.hot_served)
      notify({
        kind: 'success',
        title: m.setupSaved(platform.name),
        message: result.hot_served ? m.connectingLive : m.restartToReconnect
      })
    } catch (err) {
      notifyError(err, m.failedSave(platform.name))
    } finally {
      setSaving(null)
    }
  }

  async function handleClear(platform: MessagingPlatformInfo, key: string) {
    setSaving(`clear:${key}`)

    try {
      const result = await updateMessagingPlatform(platform.id, { clear_env: [key] }, scopeProfile)
      setEdits(current => ({
        ...current,
        [platform.id]: {
          ...(current[platform.id] || {}),
          [key]: ''
        }
      }))
      await refreshPlatforms()
      settleAfterUpdate(result.hot_served)
      notify({ kind: 'success', title: m.keyCleared(key), message: m.setupUpdated(platform.name) })
    } catch (err) {
      notifyError(err, m.failedClear(key))
    } finally {
      setSaving(null)
    }
  }

  // QR onboarding wrote the token + allowlist and asked the backend to restart
  // the gateway. restart_started only means the child spawned; watch its exit
  // so a failed restart lands in the banner instead of a silent "stopped".
  async function handleTelegramApplied(result: TelegramOnboardingApplyResponse) {
    await refreshPlatforms(true)

    if (result.restart_started) {
      const connectedBot = result.bot_username ? `${m.states.connected}: @${result.bot_username}` : null

      notify({
        kind: 'success',
        title: m.setupSaved('Telegram'),
        message: [connectedBot, m.telegramQr.savedRestarting].filter(Boolean).join(' · ')
      })
      setRestartNeeded(false)
      const ok = await watchGatewayRestartOutcome()

      if (!ok) {
        setRestartNeeded(true)
        notify({
          kind: 'error',
          title: m.restartFailedManual,
          message: m.restartFailedManualDetail,
          action: { label: m.restartAgain, onClick: () => void runGatewayRestart() },
          secondaryAction: {
            label: m.openLogs,
            onClick: () => void window.hermesDesktop?.revealLogs?.().catch(() => undefined)
          }
        })
      }

      void refreshPlatforms(true)

      return
    }

    if (result.needs_restart) {
      // Backend could not spawn the restart (or is too old to try): fall back
      // to the app's own restart action, same as the manual-save path.
      await restartGatewayNow()

      if (result.restart_error) {
        notifyError(new Error(result.restart_error), m.telegramQr.savedRestartFailed(`: ${result.restart_error}`))
        setRestartNeeded(true)
      }
    }
  }

  // Approve/revoke paint from a snapshot immediately, then let the
  // authoritative refresh have the last word. A failed write restores the
  // snapshot so the row never silently disappears on an error.
  async function handleApprove(user: PairingUser) {
    if (!user.request_id) {
      return
    }

    const key = pairingKey(user)
    const snapshot = pairing
    setApproving(key)
    setPairing(current => ({
      approved: current.approved,
      pending: current.pending.filter(row => pairingKey(row) !== key)
    }))

    try {
      await approvePairing(user.platform, user.request_id, scopeProfile)
      notify({ kind: 'success', title: m.approvedUser(pairingLabel(user)), message: m.approvedHint })
      await refreshPairing()
    } catch (err) {
      setPairing(snapshot)
      // 429 is the code path's brute-force lockout — a distinct condition the
      // operator can only wait out, so it gets its own message.
      const lockedOut = err instanceof Error && err.message.includes('429')
      notifyError(err, lockedOut ? m.pairingLockedOut : m.failedApprove(pairingLabel(user)))
    } finally {
      setApproving(null)
    }
  }

  // ConfirmDialog owns the pending → done → close beat and shows an inline
  // error when onConfirm throws, so this rethrows instead of swallowing.
  async function handleRevoke(user: PairingUser) {
    const key = pairingKey(user)
    const snapshot = pairing
    setPairing(current => ({
      approved: current.approved.filter(row => pairingKey(row) !== key),
      pending: current.pending
    }))

    try {
      await revokePairing(user.platform, user.user_id, scopeProfile)
      notify({ kind: 'success', title: m.revokedUser(pairingLabel(user)), message: user.platform })
      await refreshPairing()
    } catch (err) {
      setPairing(snapshot)
      throw err
    }
  }

  return (
    <MessagingPage
      {...props}
      detail={
        selected && (
          <PlatformDetail
            approved={approvedByPlatform[selected.id] ?? []}
            approving={approving}
            edits={edits[selected.id] || {}}
            gatewayRestarting={gatewayRestarting}
            hasEdits={hasChanges(platformChanges(selected, edits[selected.id] || {}))}
            onApprove={user => void handleApprove(user)}
            onClear={key => void handleClear(selected, key)}
            onEdit={(key, value) =>
              setEdits(current => ({
                ...current,
                [selected.id]: {
                  ...(current[selected.id] || {}),
                  [key]: value
                }
              }))
            }
            onRestartNow={() => void restartGatewayNow()}
            onRevoke={setPendingRevoke}
            onSave={() => void handleSave(selected)}
            onTelegramApplied={result => void handleTelegramApplied(result)}
            onToggle={enabled => void handleToggle(selected, enabled)}
            pending={pendingByPlatform[selected.id] ?? []}
            platform={selected}
            restartNeeded={restartNeeded}
            saving={saving}
            scopeProfile={scopeProfile}
          />
        )
      }
      filter={{ active: activeStatusFilter, onChange: handleStatusFilter, tones: presentTones }}
      onQueryChange={setQuery}
      onSelect={setSelectedId}
      pendingCount={id => pendingByPlatform[id]?.length ?? 0}
      platforms={platforms}
      query={query}
      selectedId={selected?.id ?? null}
      stateLabel={platform => stateLabel(platform.state, m)}
      visible={visiblePlatforms}
    >
      <ConfirmDialog
        busyLabel={m.revoking}
        cancelLabel={t.common.cancel}
        confirmLabel={m.revoke}
        description={pendingRevoke ? m.revokeDesc(pairingLabel(pendingRevoke)) : null}
        destructive
        onClose={() => setPendingRevoke(null)}
        onConfirm={() => (pendingRevoke ? handleRevoke(pendingRevoke) : undefined)}
        open={Boolean(pendingRevoke)}
        title={m.revokeTitle}
      />
    </MessagingPage>
  )
}

interface PlatformDetailProps {
  approved: PairingUser[]
  approving: null | string
  edits: Record<string, string>
  gatewayRestarting: boolean
  hasEdits: boolean
  onApprove: (user: PairingUser) => void
  onClear: (key: string) => void
  onEdit: (key: string, value: string) => void
  onRestartNow: () => void
  onRevoke: (user: PairingUser) => void
  onSave: () => void
  onTelegramApplied: (result: TelegramOnboardingApplyResponse) => void
  onToggle: (enabled: boolean) => void
  pending: PairingUser[]
  platform: MessagingPlatformInfo
  restartNeeded: boolean
  saving: string | null
  scopeProfile: string | undefined
}

// The selected platform (prototype pages.js:137-189): head with the state tag
// and the enable switch, then what needs attention (restart, error, pairing
// requests), Telegram's QR setup, the credential groups and Save.
function PlatformDetail(props: PlatformDetailProps) {
  const { approved, edits, onClear, onEdit, onRevoke, platform, saving } = props
  const { t } = useI18n()
  const m = t.messaging
  const s = t.studio.pages.messaging
  const [showAdvanced, setShowAdvanced] = useState(false)

  const requiredFields = platform.env_vars.filter(field => field.required)
  const optionalFields = platform.env_vars.filter(field => !field.required && !fieldCopy(field, m).advanced)
  const advancedFields = platform.env_vars.filter(field => !field.required && fieldCopy(field, m).advanced)

  const field = (env: MessagingEnvVarInfo) => (
    <MessagingField edits={edits} field={env} key={env.key} onClear={onClear} onEdit={onEdit} saving={saving} />
  )

  return (
    <DetailBody key={platform.id}>
      <PlatformHead {...props} />
      <PlatformAttention
        {...props}
        firstFieldId={requiredFields[0] ? `messaging-field-${requiredFields[0].key}` : null}
      />
      {platform.id === 'telegram' && (
        <TelegramQrSetup onApplied={props.onTelegramApplied} platform={platform} scopeProfile={props.scopeProfile} />
      )}
      <FormSection title={m.required}>
        <FormGroup>
          <FormRow description={introCopy(platform, m)} title={m.getCredentials}>
            {platform.docs_url && <SetupGuideButton href={platform.docs_url} />}
          </FormRow>
          {requiredFields.length > 0 ? requiredFields.map(field) : <FormRow description={m.noTokenNeeded} />}
        </FormGroup>
      </FormSection>
      {optionalFields.length > 0 || approved.length > 0 || platform.home_channel ? (
        <FormSection title={m.recommended}>
          <FormGroup>
            {platform.home_channel ? (
              <FormRow description={s.homeChannelHint} title={s.homeChannel}>
                <span className="truncate font-mono text-xs text-(--ui-text-secondary)">
                  {platform.home_channel.name || platform.home_channel.chat_id || s.homeChannelNone}
                </span>
              </FormRow>
            ) : null}
            {optionalFields.map(field)}
            {approved.length > 0 && (
              <FormRow description={s.pairedUsersHint} stack title={m.approvedUsers(approved.length)}>
                <div className="flex flex-wrap gap-1.5">
                  {approved.map(user => (
                    <Badge className="gap-1 rounded-full pr-1" key={pairingKey(user)} size="lg" variant="muted">
                      {pairingLabel(user)}
                      <Button
                        aria-label={m.revokeAria(pairingLabel(user))}
                        className="size-4 rounded-full"
                        onClick={() => onRevoke(user)}
                        size="icon-xs"
                        variant="ghost"
                      >
                        <StudioIcon name="x" size={9} />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </FormRow>
            )}
          </FormGroup>
        </FormSection>
      ) : null}
      {advancedFields.length > 0 && (
        <FormGroup>
          <FormDisclosure label={m.advanced(advancedFields.length)} onOpenChange={setShowAdvanced} open={showAdvanced}>
            {advancedFields.map(field)}
          </FormDisclosure>
        </FormGroup>
      )}
      <PlatformSaveBar hasEdits={props.hasEdits} onSave={props.onSave} platform={platform} saving={saving} />
    </DetailBody>
  )
}

const STATE_BADGE: Record<StatusTone, 'default' | 'destructive' | 'muted' | 'success' | 'warn'> = {
  bad: 'destructive',
  good: 'success',
  muted: 'muted',
  warn: 'warn'
}

function PlatformHead({ onToggle, platform, saving }: PlatformDetailProps) {
  const { t } = useI18n()
  const m = t.messaging

  return (
    <>
      <DetailHead
        lead={<PlatformTile platformId={platform.id} platformName={platform.name} size={44} />}
        subtitle={platform.description}
        title={platform.name}
        trailing={
          <>
            <Badge size="lg" variant={STATE_BADGE[platformStatusTone(platform)]}>
              {stateLabel(platform.state, m)}
            </Badge>
            {/* The visible state is the tag; the label names the switch for tests and AT. */}
            <label className="flex cursor-pointer items-center">
              <Switch
                aria-label={platform.enabled ? m.disableAria(platform.name) : m.enableAria(platform.name)}
                checked={platform.enabled}
                disabled={saving === `enabled:${platform.id}`}
                onCheckedChange={onToggle}
              />
              <span className="sr-only">{platform.enabled ? m.enabled : m.disabled}</span>
            </label>
          </>
        }
      />
      <PlatformHint platform={platform} />
    </>
  )
}

/** What needs the user now: a pending restart, a platform error, pairing requests. */
function PlatformAttention({
  approving,
  firstFieldId,
  gatewayRestarting,
  onApprove,
  onRestartNow,
  pending,
  platform,
  restartNeeded
}: PlatformDetailProps & { firstFieldId: null | string }) {
  const { t } = useI18n()
  const m = t.messaging
  const s = t.studio.pages.messaging

  return (
    <>
      {restartNeeded && (
        <Callout tone="warn">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{m.restartNeeded}</span>
            <Button disabled={gatewayRestarting} onClick={onRestartNow} size="sm" variant="outline">
              <RefreshCw className={gatewayRestarting ? 'animate-spin' : undefined} />
              {gatewayRestarting ? m.restarting : m.restartNow}
            </Button>
          </div>
        </Callout>
      )}
      {platform.error_message && (
        <Callout tone="warn">
          <p className="m-0 break-words">{platform.error_message}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {firstFieldId ? (
              <Button onClick={() => document.getElementById(firstFieldId)?.focus()} size="sm">
                {s.updateCredentials}
              </Button>
            ) : null}
            <Button
              onClick={() => void window.hermesDesktop?.revealLogs?.().catch(() => undefined)}
              size="sm"
              variant="outline"
            >
              {m.openLogs}
            </Button>
          </div>
        </Callout>
      )}
      {/* Rendered only when someone is actually waiting to be let in. */}
      {pending.map(user => {
        const busy = approving === pairingKey(user)
        const label = pairingLabel(user)
        const waited = typeof user.age_minutes === 'number' ? m.waitingSince(user.age_minutes) : null

        return (
          <div
            className="flex items-center gap-3 rounded-[11px] bg-(--pg-card) px-3.5 py-3 shadow-(--pg-card-ring)"
            data-slot="pairing-request"
            key={pairingKey(user)}
          >
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-(--pg-tile-cyan) text-[0.8125rem] font-semibold text-white"
            >
              {monogramFor(label)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <b className="truncate text-[0.8125rem] font-semibold text-(--ui-text-primary)">
                <span>{label}</span>
                {s.pairingRequest}
              </b>
              {/* An unnamed requester is only a user id — no need to repeat it. */}
              <span className="text-xs text-(--ui-text-tertiary)">
                {[user.user_name ? user.user_id : null, waited].filter(Boolean).join(' · ')}
              </span>
            </span>
            <Button disabled={busy || !user.request_id} onClick={() => onApprove(user)}>
              {busy ? m.approving : m.approve}
            </Button>
          </div>
        )
      })}
    </>
  )
}

function SetupGuideButton({ href }: { href: string }) {
  const { t } = useI18n()

  return (
    <Button asChild size="sm" variant="outline">
      <a
        href={href}
        onClick={event => {
          // Route through the validated external opener instead of letting
          // Electron resolve the anchor: a packaged build resolves an empty or
          // relative href to the app's own index.html (#plugin platforms ship
          // no docs_url, which is why the caller renders this only with one).
          event.preventDefault()
          openExternalLink(href)
        }}
        rel="noreferrer"
        target="_blank"
      >
        {t.messaging.openSetupGuide}
        <ExternalLink className="size-3.5" />
      </a>
    </Button>
  )
}

function PlatformSaveBar({
  hasEdits,
  onSave,
  platform,
  saving
}: {
  hasEdits: boolean
  onSave: () => void
  platform: MessagingPlatformInfo
  saving: string | null
}) {
  const { t } = useI18n()
  const m = t.messaging
  const isSavingEnv = saving === `env:${platform.id}`

  return (
    <div className="flex items-center gap-2.5" data-slot="messaging-save-bar">
      <span className="flex-1" />
      {hasEdits && <span className="text-xs text-(--ui-text-tertiary)">{m.unsavedChanges}</span>}
      <Button disabled={!hasEdits || isSavingEnv} onClick={onSave}>
        <Save />
        {isSavingEnv ? m.saving : m.saveChanges}
      </Button>
    </div>
  )
}

const PLATFORM_INTRO: Record<string, string> = {
  telegram:
    'In Telegram, talk to @BotFather, run /newbot, and copy the token it gives you. Then grab your numeric user ID from @userinfobot.',
  discord:
    'Open the Discord Developer Portal, create an application, add a Bot, then copy its token. Invite the bot to your server with the right scopes.',
  slack:
    'Create a Slack app, enable Socket Mode, install it to your workspace, then copy the bot token and app-level token.',
  mattermost:
    'On your Mattermost server, create a bot account or personal access token, then paste the server URL and token here.',
  matrix: 'Sign in to your homeserver with the bot account, then copy the access token, user ID, and homeserver URL.',
  signal:
    'Run a signal-cli REST bridge somewhere reachable, then point Hermes at the URL and the registered phone number.',
  whatsapp:
    'Start the WhatsApp bridge that ships with Hermes, scan the QR code on first run, then enable the platform.',
  bluebubbles:
    'Run BlueBubbles Server on a Mac with iMessage, expose its API, then point Hermes at the URL with the server password.',
  homeassistant:
    'In Home Assistant, open your profile and create a long-lived access token. Paste it here along with your HA URL.',
  email:
    'Use a dedicated mailbox. For Gmail/Workspace, create an app password and use imap.gmail.com / smtp.gmail.com.',
  sms: 'Get your Twilio Account SID and Auth Token from the Twilio console, plus a phone number that can send SMS.',
  dingtalk: 'Create a DingTalk app in the developer console, then copy the Client ID (App key) and Client Secret here.',
  feishu:
    'Create a Feishu / Lark app, configure the bot capability, and copy the App ID, App secret, and event encryption keys.',
  wecom:
    'Add a group robot in WeCom and copy its webhook key as WECOM_BOT_ID. Send-only — use the WeCom (app) option for two-way.',
  wecom_callback:
    'Set up a WeCom self-built app, expose its callback URL, and provide the corp ID, secret, agent ID, and AES key.',
  weixin:
    "Run `hermes gateway setup`, select Weixin, then scan and confirm the QR code with a personal WeChat account. Hermes connects through Tencent's iLink Bot API and saves the credentials.",
  qqbot: 'Register an app on the QQ Open Platform (q.qq.com) and copy the App ID and Client Secret.',
  api_server:
    'Expose Hermes as an OpenAI-compatible API. Set an auth key, then point Open WebUI / LobeChat / etc. at the host:port.',
  webhook:
    'Run an HTTP server that other tools (GitHub, GitLab, custom apps) can POST to. Use the secret to verify signatures.'
}

const introCopy = (platform: MessagingPlatformInfo, m: Translations['messaging']) =>
  m.platformIntro[platform.id] || PLATFORM_INTRO[platform.id] || platform.description

function MessagingField({
  edits,
  field,
  onClear,
  onEdit,
  saving
}: {
  edits: Record<string, string>
  field: MessagingEnvVarInfo
  onClear: (key: string) => void
  onEdit: (key: string, value: string) => void
  saving: string | null
}) {
  const { t } = useI18n()
  const m = t.messaging
  const copy = fieldCopy(field, m)
  const fieldId = `messaging-field-${field.key}`

  const tools = (
    <>
      {field.url && (
        <Tip label={m.openDocs}>
          <Button asChild className="size-8 shrink-0" variant="ghost">
            <a href={field.url} rel="noreferrer" target="_blank">
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        </Tip>
      )}
      {/* A list clears by removing its last entry and saving; a second trash icon would read as "remove row". */}
      {field.is_set && !field.is_list && (
        <Tip label={m.clearField(field.key)}>
          <Button
            className="size-8 shrink-0"
            disabled={saving === `clear:${field.key}`}
            onClick={() => onClear(field.key)}
            variant="ghost"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </Tip>
      )}
    </>
  )

  return (
    <FormRow
      description={copy.help}
      stack={field.is_list}
      title={
        <span className="flex flex-wrap items-center gap-2">
          <label htmlFor={fieldId}>{copy.label}</label>
          {field.is_set && <Badge variant="success">{m.saved}</Badge>}
        </span>
      }
    >
      {field.is_list ? (
        <AllowlistField
          field={field}
          fieldId={fieldId}
          label={copy.label}
          onEdit={onEdit}
          pending={edits[field.key]}
          tools={tools}
        />
      ) : (
        <div className="flex w-full items-center gap-1.5">
          <Input
            className="w-60 max-w-full"
            id={fieldId}
            onChange={event => onEdit(field.key, event.target.value)}
            placeholder={field.is_set ? credentialPreview(field.redacted_value) || m.replaceValue : copy.placeholder}
            type={field.is_password ? 'password' : 'text'}
            value={edits[field.key] || ''}
          />
          {tools}
        </div>
      )}
    </FormRow>
  )
}

function PlatformHint({ platform }: { platform: MessagingPlatformInfo }) {
  const { t } = useI18n()
  const m = t.messaging

  // A served secondary's api_server/webhook live on the shared gateway listener under
  // /p/<profile>/: the state tag says connected, this line says where to point the client.
  if (platform.ingress_url) {
    return (
      <p className="m-0 text-xs leading-5 break-all text-(--ui-text-tertiary)">
        {m.sharedListenerUrl}{' '}
        <code className="font-mono text-(--ui-text-primary)" data-slot="ingress-url">
          {platform.ingress_url}
        </code>
      </p>
    )
  }

  // Resting states earn no note — only actionable ones (setup, a stopped gateway, a pending restart).
  const notes = [
    !platform.configured && platform.state !== 'not_configured' ? m.needsSetup : null,
    !platform.gateway_running && platform.state !== 'gateway_stopped' ? m.gatewayStopped : null,
    platform.enabled && platform.state === 'pending_restart'
      ? m.hintPendingRestart
      : platform.enabled && platform.state !== 'connected' && !platform.gateway_running
        ? m.hintGatewayStopped
        : null
  ].filter(Boolean)

  return notes.length > 0 ? (
    <p className="m-0 text-xs leading-5 text-(--ui-text-tertiary)">{notes.join(' · ')}</p>
  ) : null
}
