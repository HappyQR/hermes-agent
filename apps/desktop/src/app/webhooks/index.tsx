import { useStore } from '@nanostores/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { PageLoader } from '@/components/page-loader'
import { StudioMasterDetail } from '@/components/studio/pages/master-detail'
import { STUDIO_SHEET_BODY, STUDIO_SHEET_CONTENT } from '@/components/studio/pages/sheet'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { SearchField } from '@/components/ui/search-field'
import {
  createWebhook,
  deleteWebhook,
  enableWebhooks,
  getWebhooks,
  setWebhookEnabled,
  type WebhooksResponse
} from '@/hermes'
import { useI18n } from '@/i18n'
import { Plus } from '@/lib/icons'
import { notify, notifyError } from '@/store/notifications'
import { $activeGatewayProfile, normalizeProfileKey } from '@/store/profile'
import { runGatewayRestart } from '@/store/system-actions'

import { $automationCreateRequest, takeAutomationCreateRequest } from '../automations/requests'
import {
  WebhookBanners,
  WebhookCreatedBody,
  WebhookCreateForm,
  WebhookDetailView,
  type WebhookDraft,
  WebhookItem,
  WebhookSheetHeader
} from '../automations/webhooks-ui'
import { useRefreshHotkey } from '../hooks/use-refresh-hotkey'
import { PanelEmpty } from '../overlays/panel'

const DELIVER_OPTIONS: readonly string[] = ['log', 'telegram', 'discord', 'slack', 'email', 'github_comment']

const EMPTY_DRAFT: WebhookDraft = {
  deliver: 'log',
  deliverOnly: false,
  description: '',
  events: '',
  name: '',
  prompt: '',
  skills: ''
}

interface CreatedWebhook {
  secret: string
  url: string
}

interface WebhooksViewProps {
  /** Legacy overlay close; the Automations page hosts the view in place. */
  onClose?: () => void
  /** Messaging › Webhook holds the receiver's port and global secret. */
  onOpenReceiverSettings?: () => void
}

interface ProfileOwnedWebhooksViewProps extends WebhooksViewProps {
  backendProfile: string
}

export function WebhooksView({ onOpenReceiverSettings }: WebhooksViewProps) {
  const backendProfile = normalizeProfileKey(useStore($activeGatewayProfile))

  // Profile-owned draft/dialog/secret state must disappear at the same
  // boundary as its backend owner: the key unmounts the old operation scope
  // synchronously on switch, including while the profile rail stays in All
  // profiles mode (#71352). AGENTS.md: a live profile swap is a re-home —
  // the previous context must not leak into the next one.
  return (
    <ProfileOwnedWebhooksView
      backendProfile={backendProfile}
      key={backendProfile}
      onOpenReceiverSettings={onOpenReceiverSettings}
    />
  )
}

function ProfileOwnedWebhooksView({ backendProfile, onOpenReceiverSettings }: ProfileOwnedWebhooksViewProps) {
  const { t } = useI18n()
  const w = t.webhooks
  const queryClient = useQueryClient()
  const queryKey = useMemo(() => ['webhooks', backendProfile] as const, [backendProfile])
  const ownerActive = useRef(true)

  // StrictMode rehearses this effect as mount → cleanup → mount; setting the
  // flag in setup (not only clearing it in cleanup) keeps ordinary completions
  // working after the rehearsal. The guard drops late completions from an
  // already-unmounted profile owner.
  // eslint-disable-next-line no-restricted-syntax -- lifecycle ownership flag, not an atom mirror
  useEffect(() => {
    ownerActive.current = true

    return () => {
      ownerActive.current = false
    }
  }, [])

  const [query, setQuery] = useState('')
  const [enabling, setEnabling] = useState(false)
  const [restartNeeded, setRestartNeeded] = useState(false)
  const [restartError, setRestartError] = useState<null | string>(null)
  const [restarting, setRestarting] = useState(false)
  // Master/detail: the subscription whose config fills the right pane.
  const [selectedName, setSelectedName] = useState<null | string>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [draft, setDraft] = useState<WebhookDraft>(EMPTY_DRAFT)
  const [moreOpen, setMoreOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<CreatedWebhook | null>(null)

  const [pendingDelete, setPendingDelete] = useState<null | string>(null)

  const {
    data,
    error,
    isPending: loading,
    refetch
  } = useQuery({
    queryKey,
    queryFn: () => getWebhooks(backendProfile)
  })

  // React Query v5 dropped useQuery onError; surface a load failure toast once
  // per error object instead.
  useEffect(() => {
    if (error) {
      notifyError(error, w.loadFailed)
    }
  }, [error, w.loadFailed])

  const enabled = data?.enabled ?? false
  const subscriptions = useMemo(() => data?.subscriptions ?? [], [data])

  // Pull fresh backend truth into the cache. `silent` swallows the error toast
  // for post-mutation reconciles (the mutation already reported success/failure).
  const reload = useCallback(
    async (silent = false) => {
      try {
        await queryClient.invalidateQueries({ queryKey })
      } catch (err) {
        if (!silent && ownerActive.current) {
          notifyError(err, w.loadFailed)
        }
      }
    },
    [queryClient, queryKey, w.loadFailed]
  )

  useRefreshHotkey(() => void refetch())

  const restartGatewayNow = useCallback(async () => {
    setRestarting(true)

    // runGatewayRestart never rejects (it toasts its own failure); the boolean
    // is the only signal that the receiver actually came back.
    const ok = await runGatewayRestart(backendProfile)

    if (!ownerActive.current) {
      return
    }

    if (ok) {
      setRestartNeeded(false)
      setRestartError(null)
      // Give the receiver a moment to bind before re-reading state.
      window.setTimeout(() => {
        if (ownerActive.current) {
          void reload(true)
        }
      }, 4000)
    } else {
      setRestartNeeded(true)
      setRestartError(w.restartFailed(''))
    }

    setRestarting(false)
  }, [backendProfile, reload, w])

  const handleEnable = useCallback(async () => {
    setEnabling(true)
    setRestartNeeded(false)
    setRestartError(null)

    try {
      const result = await enableWebhooks(backendProfile)
      await reload(true)

      if (!ownerActive.current) {
        return
      }

      if (result.restart_started) {
        notify({ kind: 'success', message: w.enabledRestarting })
        window.setTimeout(() => {
          if (ownerActive.current) {
            void reload(true)
          }
        }, 4000)
      } else {
        const detail = result.restart_error ? `: ${result.restart_error}` : '.'
        setRestartNeeded(true)
        setRestartError(w.restartFailed(detail))
        notify({ kind: 'error', message: w.restartFailed(detail) })
      }
    } catch (err) {
      if (ownerActive.current) {
        notifyError(err, w.restartFailed(''))
      }
    } finally {
      if (ownerActive.current) {
        setEnabling(false)
      }
    }
  }, [backendProfile, reload, w])


  const resetForm = useCallback(() => {
    setDraft(EMPTY_DRAFT)
    setMoreOpen(false)
  }, [])

  const closeCreate = useCallback(() => {
    if (creating) {
      return
    }

    setCreateOpen(false)
    setCreated(null)
  }, [creating])

  const handleCreate = useCallback(async () => {
    if (!draft.name.trim()) {
      notify({ kind: 'error', message: w.nameRequired })

      return
    }

    setCreating(true)

    try {
      const eventsList = draft.events
        .split(',')
        .map(e => e.trim())
        .filter(Boolean)

      const skillsList = draft.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const res = await createWebhook(
        {
          deliver: draft.deliver,
          deliver_only: draft.deliverOnly,
          description: draft.description.trim() || undefined,
          events: eventsList.length ? eventsList : undefined,
          name: draft.name.trim(),
          prompt: draft.prompt.trim() || undefined,
          skills: skillsList.length ? skillsList : undefined
        },
        backendProfile
      )

      if (!ownerActive.current) {
        return
      }

      notify({ kind: 'success', message: w.created })
      setCreated({ secret: res.secret, url: res.url })
      resetForm()
      void reload(true)
    } catch (err) {
      if (ownerActive.current) {
        notifyError(err, w.createFailed(''))
      }
    } finally {
      if (ownerActive.current) {
        setCreating(false)
      }
    }
  }, [backendProfile, draft, reload, resetForm, w])

  const handleToggle = useCallback(
    async (subName: string, nextEnabled: boolean) => {
      // Optimistic cache paint; the invalidate below lets backend truth win.
      queryClient.setQueryData<WebhooksResponse>(queryKey, current =>
        current
          ? {
              ...current,
              subscriptions: current.subscriptions.map(s => (s.name === subName ? { ...s, enabled: nextEnabled } : s))
            }
          : current
      )

      try {
        await setWebhookEnabled(subName, nextEnabled, backendProfile)

        if (!ownerActive.current) {
          return
        }

        notify({ kind: 'success', message: nextEnabled ? w.enabled(subName) : w.disabled(subName) })
        void reload(true)
      } catch (err) {
        if (!ownerActive.current) {
          return
        }

        await reload(true)
        notifyError(err, w.toggleFailed(subName, nextEnabled))
      }
    },
    [backendProfile, queryClient, queryKey, reload, w]
  )

  // ConfirmDialog owns the pending→done→close beat; throw to surface its inline
  // error and keep the dialog open. Success toast matches the cron delete idiom
  // (title + name).
  const handleDelete = useCallback(async () => {
    if (!pendingDelete) {
      return
    }

    try {
      await deleteWebhook(pendingDelete, backendProfile)

      if (!ownerActive.current) {
        return
      }

      notify({ kind: 'success', title: w.deleted, message: pendingDelete })
      void reload(true)
    } catch (err) {
      if (!ownerActive.current) {
        return
      }

      notifyError(err, w.deleteFailed(pendingDelete))
      throw err
    }
  }, [backendProfile, pendingDelete, reload, w])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) {
      return subscriptions
    }

    return subscriptions.filter(s =>
      [s.name, s.description, s.deliver, ...s.events].filter(Boolean).some(v => v.toLowerCase().includes(q))
    )
  }, [query, subscriptions])

  // Detail always reflects a concrete sub: the explicitly selected one, else the
  // first visible row, so the right pane is never empty while subs exist.
  const selectedSub = useMemo(
    () => visible.find(s => s.name === selectedName) ?? visible[0] ?? null,
    [visible, selectedName]
  )


  // The page head's "New webhook…" (it may be picked before this tab mounted).
  const createRequest = useStore($automationCreateRequest)

  const openCreate = useCallback(() => {
    setCreated(null)
    setCreateOpen(true)
  }, [])

  useEffect(() => {
    if (createRequest === 'webhook' && takeAutomationCreateRequest('webhook')) {
      openCreate()
    }
  }, [createRequest, openCreate])

  const banners = (
    <WebhookBanners
      enabled={enabled}
      enabling={enabling}
      onEnable={() => void handleEnable()}
      onOpenReceiverSettings={onOpenReceiverSettings}
      onRestart={() => void restartGatewayNow()}
      restartError={restartError}
      restarting={restarting}
      restartNeeded={restartNeeded}
    />
  )

  return (
    <>
      {loading ? (
        <PageLoader label={w.loading} />
      ) : subscriptions.length === 0 ? (
        <>
          {banners}
          <PanelEmpty
            action={
              <Button disabled={!enabled || enabling} onClick={openCreate} size="sm">
                <Plus />
                {w.newSubscription}
              </Button>
            }
            description={w.empty}
            icon="globe"
          />
        </>
      ) : (
        <>
          {banners}
          <StudioMasterDetail
            detail={
              selectedSub ? (
                <WebhookDetailView
                  onDelete={() => setPendingDelete(selectedSub.name)}
                  onToggle={next => void handleToggle(selectedSub.name, next)}
                  sub={selectedSub}
                />
              ) : (
                <PanelEmpty description={w.empty} icon="search" />
              )
            }
            list={
              visible.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-(--ui-text-tertiary)">{w.empty}</p>
              ) : (
                visible.map(sub => (
                  <WebhookItem
                    active={selectedSub?.name === sub.name}
                    key={sub.name}
                    menuItems={[
                      {
                        icon: sub.enabled ? 'x-circle' : 'check-circle',
                        key: 'toggle',
                        label: sub.enabled ? w.disableRow : w.enableRow,
                        onSelect: () => void handleToggle(sub.name, !sub.enabled)
                      },
                      {
                        danger: true,
                        icon: 'trash',
                        key: 'delete',
                        label: t.studio.pages.common.deleteEllipsis,
                        onSelect: () => setPendingDelete(sub.name),
                        separatorBefore: true
                      }
                    ]}
                    menuLabel={t.studio.pages.common.moreActions}
                    onSelect={() => setSelectedName(sub.name)}
                    sub={sub}
                  />
                ))
              )
            }
            listHeader={
              <SearchField
                aria-label={w.search}
                containerClassName="w-full"
                onChange={setQuery}
                placeholder={w.search}
                value={query}
                variant="filled"
              />
            }
            listLabel={t.studio.pages.webhooks.listLabel}
          />
        </>
      )}

      {/* New webhook sheet; after a create it shows the one-time secret. */}
      <Dialog onOpenChange={open => !open && closeCreate()} open={createOpen}>
        <DialogContent bodyClassName={STUDIO_SHEET_BODY} className={STUDIO_SHEET_CONTENT.md} showCloseButton={false}>
          <WebhookSheetHeader created={created !== null} />
          {created ? (
            <WebhookCreatedBody onDone={closeCreate} secret={created.secret} url={created.url} />
          ) : (
            <form
              className="contents"
              onSubmit={e => {
                e.preventDefault()
                void handleCreate()
              }}
            >
              <WebhookCreateForm
                creating={creating}
                deliverOptions={DELIVER_OPTIONS}
                draft={draft}
                moreOpen={moreOpen}
                onCancel={closeCreate}
                onChange={patch => setDraft(current => ({ ...current, ...patch }))}
                onMoreOpenChange={setMoreOpen}
              />
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        busyLabel={w.deleting}
        cancelLabel={t.common.cancel}
        confirmLabel={w.delete}
        description={
          pendingDelete ? (
            <>
              {w.deleteDescPrefix}
              <span className="font-medium text-foreground">{pendingDelete}</span>
              {w.deleteDescSuffix}
            </>
          ) : null
        }
        destructive
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        open={pendingDelete !== null}
        title={w.deleteTitle}
      />
    </>
  )
}
