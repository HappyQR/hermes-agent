import { Fragment } from 'react'

import { StudioToolbar, ToolbarSpacer } from '@/components/studio/pages/page'
import {
  Callout,
  CardGrid,
  FilterChips,
  GridCard,
  GridCardFoot,
  GridCardText,
  SectionTitle
} from '@/components/studio/pages/surfaces'
import { Spinner } from '@/components/studio/pages/tile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { ConnectorLogo } from '@/components/ui/connector-logo'
import { SearchField } from '@/components/ui/search-field'
import { Switch } from '@/components/ui/switch'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import type { StudioCapabilitiesTranslations } from '@/i18n/types_studio_pages'
import { connectorIconUrl } from '@/lib/connector-tools'
import { cn } from '@/lib/utils'

import { PanelEmpty } from '../../overlays/panel'
import { showsCatalogMark } from '../connectors/connector-kind'
import type { ConnectorsDirectoryProps } from '../connectors/connectors-directory'
import { cardKey, EMPTY_CONNECTORS_FILTER, twinPillOf } from '../connectors/derive'
import { derivePage, showsAttentionFirst } from '../connectors/derive-page'
import { ToolsWash } from '../connectors/tools-status'
import type {
  ConnectorCardModel,
  ConnectorFact,
  ConnectorGroupModel,
  ConnectorSegmentId,
  ConnectorState
} from '../connectors/types'

import { CapToolbarSlot, useInCapabilitiesToolbar } from './toolbar-slots'

// 连接器 (prototype pages.js:79-91): filter chips (all · connected · available
// · off · local) over app cards — logo, name, kind · tools, a state tag with
// the account, the reason or description, and the next step (Connect, Sign in
// again, Manage…). The name is the card's stretched link to its sheet. Same
// props as ConnectorsDirectory; ConnectorsTab renders this one.

type ConnectorsCopy = StudioCapabilitiesTranslations['connectors']

const FILTER_ORDER: readonly ConnectorSegmentId[] = ['all', 'connected', 'available', 'off', 'local']

const REASON_TONE: Record<ConnectorState, string> = {
  available: 'text-(--ui-text-secondary)',
  broken: 'text-(--ui-red)',
  connected: 'text-(--ui-text-secondary)',
  connecting: 'text-(--ui-text-secondary)',
  expired: 'text-(--ui-orange)',
  off: 'text-(--ui-text-secondary)',
  unknown: 'text-(--ui-text-secondary)'
}

function factText(c: ConnectorsCopy, fact: ConnectorFact): string {
  switch (fact.key) {
    case 'tools':
      return c.tools(fact.count)

    case 'toolsOff':
      return c.toolsOff(fact.count)

    case 'toolsOn':
      return c.toolsOn(fact.count)

    default:
      return c.toolsSomeOn(fact.count, fact.on ?? 0)
  }
}

function kindWord(card: ConnectorCardModel, c: ConnectorsCopy): string {
  if (card.residency === 'hosted') {
    return c.kindManaged
  }

  if (card.plugin) {
    return c.kindPlugin(card.plugin)
  }

  return card.ways.local?.inCatalog === true ? c.kindCatalog : c.kindCustom
}

function stateTone(card: ConnectorCardModel): 'default' | 'destructive' | 'muted' | 'success' | 'warn' {
  if (card.state === 'broken') {
    return 'destructive'
  }

  if (card.state === 'expired' || card.state === 'connecting') {
    return 'warn'
  }

  if (card.state === 'connected') {
    return card.residency === 'local' ? 'default' : 'success'
  }

  return 'muted'
}

export function StudioConnectorsDirectory({
  addYourOwn,
  busyKey = null,
  cards,
  filter,
  hostedFailed = false,
  loading = false,
  notices,
  onFilterChange,
  onOpen,
  onPrefetch,
  onRetryHosted,
  onServerToggle,
  onVerb,
  selectedKey = null
}: ConnectorsDirectoryProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities.connectors
  const inPage = useInCapabilitiesToolbar()
  const set = (patch: Partial<typeof filter>) => onFilterChange({ ...filter, ...patch })

  const { groups, hiddenMatches, segment, segments } = derivePage(cards, filter)
  const ordered = FILTER_ORDER.flatMap(id => segments.filter(option => option.id === id))
  const showSegments = segments.length > 2
  const segmentFellBack = segments.length > 0 && segment !== filter.segment

  const search =
    cards.length === 0 ? null : (
      <CapToolbarSlot name="search">
        <SearchField
          aria-label={c.searchApps(cards.length)}
          containerClassName="w-[16.25rem] max-w-full"
          onChange={query => set({ query })}
          placeholder={c.searchApps(cards.length)}
          value={filter.query}
          variant="filled"
        />
      </CapToolbarSlot>
    )

  const add = addYourOwn ? <CapToolbarSlot name="end">{addYourOwn}</CapToolbarSlot> : null

  return (
    <div className="flex min-w-0 flex-col gap-3" data-slot="connectors-directory">
      {inPage ? (
        <>
          {search}
          {add}
        </>
      ) : (
        <StudioToolbar>
          {search}
          <ToolbarSpacer />
          {add}
        </StudioToolbar>
      )}

      {showSegments || segmentFellBack || hiddenMatches > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {showSegments ? (
            <FilterChips
              aria-label={c.filtersLabel}
              onChange={next => set({ segment: next })}
              options={ordered.map(option => ({ count: option.count, id: option.id, label: c.filters[option.id] }))}
              value={segment}
            />
          ) : null}
          {segmentFellBack ? (
            <span className="text-xs text-(--ui-text-tertiary)">{c.segmentNoMatch(c.filters[filter.segment])}</span>
          ) : null}
          {hiddenMatches > 0 ? (
            <span className="flex items-center gap-1 text-xs text-(--ui-text-tertiary)">
              {c.matchesElsewhere(hiddenMatches)}
              <Button onClick={() => set({ segment: 'all' })} size="inline" variant="link">
                {c.showAllMatches}
              </Button>
            </span>
          ) : null}
        </div>
      ) : null}

      {notices}

      {hostedFailed && onRetryHosted ? (
        <Callout tone="warn">
          <span className="font-medium">{c.hostedFailedTitle}</span> {c.hostedFailedBody}{' '}
          <Button onClick={onRetryHosted} size="inline" variant="link">
            {c.retry}
          </Button>
        </Callout>
      ) : null}

      {loading ? (
        <ToolsWash label={c.loading} rows={10} />
      ) : groups.length > 0 ? (
        groups.map(group => (
          <Fragment key={group.id}>
            {segment === 'all' ? <GroupTitle group={group} /> : null}
            <CardGrid>
              {group.cards.map(card => {
                const key = cardKey(card)

                return (
                  <ConnectorGridCard
                    busy={busyKey === key}
                    card={card}
                    key={key}
                    onOpen={() => onOpen(card)}
                    onPrefetch={onPrefetch ? () => onPrefetch(card) : undefined}
                    onServerToggle={onServerToggle ? next => onServerToggle(card, next) : undefined}
                    onVerb={onVerb ? () => onVerb(card) : undefined}
                    selected={selectedKey === key}
                  />
                )
              })}
            </CardGrid>
          </Fragment>
        ))
      ) : cards.length === 0 ? (
        hostedFailed ? null : (
          <PanelEmpty action={addYourOwn} icon="plug" title={c.emptyTitle} />
        )
      ) : (
        <PanelEmpty
          action={
            <div className="flex items-center gap-2">
              <Button onClick={() => set(EMPTY_CONNECTORS_FILTER)} size="sm" variant="outline">
                {c.clearSearch}
              </Button>
              {addYourOwn}
            </div>
          }
          description={c.noMatchBody}
          icon="search"
          title={c.noMatchTitle}
        />
      )}
    </div>
  )
}

function GroupTitle({ group }: { group: ConnectorGroupModel }) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities.connectors

  const note =
    group.id === 'connected' && showsAttentionFirst(group) ? c.connectedNote : group.id === 'off' ? c.offNote : null

  return (
    <SectionTitle count={group.cards.length}>
      {c.groups[group.id]}
      {note ? <span className="truncate text-xs font-normal text-(--ui-text-tertiary)">{note}</span> : null}
    </SectionTitle>
  )
}

interface ConnectorGridCardProps {
  busy: boolean
  card: ConnectorCardModel
  onOpen: () => void
  onPrefetch?: () => void
  onServerToggle?: (next: boolean) => void
  onVerb?: () => void
  selected: boolean
}

function ConnectorGridCard({
  busy,
  card,
  onOpen,
  onPrefetch,
  onServerToggle,
  onVerb,
  selected
}: ConnectorGridCardProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities.connectors
  const reason = card.reason ? (card.reason.text ?? c.reason[card.reason.key]) : undefined

  return (
    <GridCard
      className={cn(selected && 'shadow-[0_0_0_2px_var(--dt-primary)]')}
      data-connector={card.slug}
      onFocus={onPrefetch}
      onPointerEnter={onPrefetch}
    >
      <ConnectorCardHead card={card} onOpen={onOpen} onServerToggle={onServerToggle} />
      <ConnectorCardState card={card} />
      {reason ? (
        <p className={cn('m-0 text-xs leading-normal', REASON_TONE[card.state])}>{reason}</p>
      ) : card.description ? (
        <GridCardText>{card.description}</GridCardText>
      ) : null}
      <GridCardFoot>
        <span className="flex-1" />
        <ConnectorCardAction busy={busy} card={card} onOpen={onOpen} onVerb={onVerb} />
      </GridCardFoot>
    </GridCard>
  )
}

/** Logo, the name (the card's stretched link), kind · tools and the local server switch. */
function ConnectorCardHead({
  card,
  onOpen,
  onServerToggle
}: Pick<ConnectorGridCardProps, 'card' | 'onOpen' | 'onServerToggle'>) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities.connectors
  const local = card.residency === 'local'
  const server = card.ways.local
  const hostedFact = card.residency === 'hosted' && card.fact ? factText(c, card.fact) : null
  const canToggleServer = local && card.plugin === undefined && server?.installed === true && onServerToggle

  return (
    <div className="flex items-start gap-2.5">
      <ConnectorLogo
        className="size-9 shrink-0 rounded-[9px]"
        connector={{ iconUrl: local ? undefined : connectorIconUrl(card.slug), name: card.slug, title: card.name }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* The card's stretched link: the whole card opens the connector. */}
        <button
          className="min-w-0 truncate text-left text-[0.84375rem] font-semibold text-(--ui-text-primary) outline-none after:absolute after:inset-0 after:rounded-[14px] focus-visible:after:ring-2 focus-visible:after:ring-ring/40"
          onClick={onOpen}
          type="button"
        >
          {card.name}
          <span className="sr-only">{` — ${c.open(card.name)}`}</span>
        </button>
        <span className="flex min-w-0 items-center gap-1 text-[0.71875rem] text-(--ui-text-tertiary)">
          <span className="truncate">{hostedFact ? `${kindWord(card, c)} · ${hostedFact}` : kindWord(card, c)}</span>
          {showsCatalogMark(card) ? (
            <Tip label={c.inCatalog}>
              <span aria-label={c.inCatalog} className="relative z-10 flex shrink-0" role="img">
                <Codicon name="verified-filled" size="0.75rem" />
              </span>
            </Tip>
          ) : null}
        </span>
      </div>
      {canToggleServer ? (
        <Switch
          aria-label={server.serverEnabled ? c.turnServerOff(card.name) : c.turnServerOn(card.name)}
          checked={server.serverEnabled ?? false}
          className="relative z-10"
          onCheckedChange={onServerToggle}
          size="xs"
        />
      ) : null}
    </div>
  )
}

/** The state tag, the signed-in account(s) and the twin tag. */
function ConnectorCardState({ card }: { card: ConnectorCardModel }) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities.connectors
  const accounts = card.ways.hosted?.accounts ?? []
  const accountSummary = accounts.length > 1 ? c.accounts(accounts.length) : accounts[0]?.alias
  const stateLabel = card.residency === 'local' && card.fact ? factText(c, card.fact) : c.state[card.stateWord]
  const twin = twinPillOf(card)

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <Badge variant={stateTone(card)}>{stateLabel}</Badge>
      {accountSummary ? (
        <span
          className="min-w-0 truncate text-[0.71875rem] text-(--ui-text-secondary)"
          data-slot="connector-account-summary"
        >
          {accountSummary}
        </span>
      ) : null}
      {twin ? <Badge variant="muted">{twin === 'hostedTwin' ? c.hostedTwin : c.alsoLocal}</Badge> : null}
    </div>
  )
}

/** The next step: the card's verb (Connect, Sign in again…) or Manage. */
function ConnectorCardAction({
  busy,
  card,
  onOpen,
  onVerb
}: Pick<ConnectorGridCardProps, 'busy' | 'card' | 'onOpen' | 'onVerb'>) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities.connectors

  if (!card.verb || !onVerb) {
    return (
      <Button className="relative z-10" onClick={onOpen} size="xs" variant="outline">
        {c.manage}
      </Button>
    )
  }

  const primary = card.verb === 'connect' || card.verb === 'reconnect' || card.verb === 'authenticate'

  return (
    <Button
      className="relative z-10"
      disabled={busy}
      onClick={onVerb}
      size="xs"
      variant={primary ? 'default' : 'outline'}
    >
      {busy ? <Spinner /> : null}
      {c.verb[card.verb]}
    </Button>
  )
}
