import { type TileTone } from '@/app/overlays/studio/icon-tile'
import { RowButton } from '@/components/ui/row-button'
import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { Check, ChevronRight, Terminal } from '@/lib/icons'
import { PROVIDER_DISPLAY_NAMES } from '@/lib/model-status-label'
import type { OAuthProvider } from '@/types/hermes'

import { ChoiceRow } from '../studio-onboarding/boot-kit'

/** `row` (default): the compact list row Settings › Providers uses. `choice`:
 *  the onboarding picker's large choice card (Hermes Studio). */
export type ProviderRowVariant = 'choice' | 'row'

const CHOICE_TRAIL = (
  <StudioIcon
    className="text-(--ui-text-tertiary) transition group-hover:translate-x-0.5 group-hover:text-(--ui-text-primary)"
    name="chev-r"
    size={14}
  />
)

// The tile a sign-in flow wears in the choice picker.
const FLOW_TILE: Record<OAuthProvider['flow'], { glyph: StudioIconName; tone: TileTone }> = {
  device_code: { glyph: 'key', tone: 'purple' },
  external: { glyph: 'terminal', tone: 'graphite' },
  pkce: { glyph: 'globe', tone: 'indigo' }
}

// Titles live in PROVIDER_DISPLAY_NAMES (shared with the model pill); this is
// only the featured order. Both Anthropic entries sit at the bottom: the API-key
// path first, then the subscription OAuth path (only works with extra usage credits).
const PROVIDER_ORDER: Record<string, number> = {
  nous: 0,
  'openai-codex': 1,
  'minimax-oauth': 2,
  'qwen-oauth': 3,
  'xai-oauth': 4,
  anthropic: 5,
  'claude-code': 6
}

const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

export const providerTitle = (p: OAuthProvider) => PROVIDER_DISPLAY_NAMES[p.id] ?? p.name
const orderOf = (p: OAuthProvider) => PROVIDER_ORDER[p.id] ?? 99

export const sortProviders = (providers: OAuthProvider[]) =>
  [...providers].sort((a, b) => orderOf(a) - orderOf(b) || a.name.localeCompare(b.name))

export function FeaturedProviderRow({
  onSelect,
  provider,
  variant = 'row'
}: {
  onSelect: (provider: OAuthProvider) => void
  provider: OAuthProvider
  variant?: ProviderRowVariant
}) {
  const { t } = useI18n()
  const freeTier = provider.status?.free_tier === true
  const loggedIn = provider.status?.logged_in && !freeTier

  if (variant === 'choice') {
    // The recommended path wears the accent ring, like the prototype's
    // preselected choice — it is still a one-click action, not a selection.
    return (
      <ChoiceRow
        description={freeTier ? t.freeTier.providerRowPitch : t.onboarding.featuredPitch}
        media={
          <span className="inline-flex size-[38px] shrink-0 overflow-hidden rounded-[10px] shadow-[0_0_0_0.5px_var(--ui-line-2)]">
            <img alt="" className="size-full" src={assetPath('apple-touch-icon.png')} />
          </span>
        }
        onClick={() => onSelect(provider)}
        selected
        title={freeTier ? t.freeTier.providerRowTitle : providerTitle(provider)}
        titleAside={freeTier ? <FreeTierTag /> : loggedIn ? <ConnectedTag /> : <RecommendedTag />}
        trailing={CHOICE_TRAIL}
      />
    )
  }

  return (
    <button
      className="group relative flex w-full items-center justify-between gap-4 rounded-[8px] bg-primary/[0.06] px-3 py-2.5 text-left transition-colors hover:bg-primary/10"
      onClick={() => onSelect(provider)}
      type="button"
    >
      <span aria-hidden className="arc-border arc-reverse arc-nous" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <img alt="" className="size-5 shrink-0 rounded" src={assetPath('apple-touch-icon.png')} />
          <span className="text-[length:var(--conversation-text-font-size)] font-semibold">
            {freeTier ? t.freeTier.providerRowTitle : providerTitle(provider)}
          </span>
          {freeTier ? (
            <FreeTierTag />
          ) : loggedIn ? (
            <ConnectedTag />
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-primary px-2 py-0.5 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground">
              <span aria-hidden="true" className="dither inline-block size-2 shrink-0" />
              {t.onboarding.recommended}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {freeTier ? t.freeTier.providerRowPitch : t.onboarding.featuredPitch}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-primary transition group-hover:translate-x-0.5" />
    </button>
  )
}

function RecommendedTag() {
  const { t } = useI18n()

  return (
    <span className="inline-flex h-5 items-center rounded-[6px] bg-primary px-[7px] text-[0.71875rem] font-semibold text-primary-foreground">
      {t.onboarding.recommended}
    </span>
  )
}

// The free tier is an identity without an account: never "Connected", never the account's name.
function FreeTierTag() {
  const { t } = useI18n()

  return (
    <span className="inline-flex items-center gap-1 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      {t.onboarding.freeTier}
    </span>
  )
}

function ConnectedTag() {
  const { t } = useI18n()

  return (
    <span className="inline-flex items-center gap-1 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      <Check className="size-3" />
      {t.onboarding.connected}
    </span>
  )
}

const PROVIDER_ROW_CLASS =
  'group flex w-full items-center justify-between gap-3 rounded-[6px] px-3 py-2.5 text-left transition-colors hover:bg-(--ui-control-hover-background)'

/** Quick-key row for API-key providers (Fireworks leads the expanded list after Nous, OpenRouter further down). */
export function KeyProviderRow({
  glyph = 'key',
  onClick,
  pitch,
  title,
  tone = 'orange',
  variant = 'row'
}: {
  glyph?: StudioIconName
  onClick: () => void
  pitch: string
  title: string
  tone?: TileTone
  variant?: ProviderRowVariant
}) {
  if (variant === 'choice') {
    return (
      <ChoiceRow
        description={pitch}
        glyph={glyph}
        onClick={onClick}
        title={title}
        tone={tone}
        trailing={CHOICE_TRAIL}
      />
    )
  }

  return (
    <RowButton className={PROVIDER_ROW_CLASS} onClick={onClick}>
      <div className="min-w-0">
        <span className="text-[length:var(--conversation-text-font-size)] font-semibold">{title}</span>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{pitch}</p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground transition group-hover:text-foreground" />
    </RowButton>
  )
}

export function FireworksProviderRow({ onClick, variant }: { onClick: () => void; variant?: ProviderRowVariant }) {
  const { t } = useI18n()

  return <KeyProviderRow onClick={onClick} pitch={t.onboarding.fireworksPitch} title="Fireworks AI" variant={variant} />
}

/** Onboarding row for the managed local runtime: no account, no key — the
 *  destination is the Local Models pane where install/download live. */
export function LocalModelsProviderRow({ onClick, variant }: { onClick: () => void; variant?: ProviderRowVariant }) {
  const { t } = useI18n()

  return (
    <KeyProviderRow
      glyph="drive"
      onClick={onClick}
      pitch={t.onboarding.localModelsPitch}
      title={t.onboarding.localModelsTitle}
      tone="graphite"
      variant={variant}
    />
  )
}

export function OpenRouterProviderRow({ onClick, variant }: { onClick: () => void; variant?: ProviderRowVariant }) {
  const { t } = useI18n()

  return <KeyProviderRow onClick={onClick} pitch={t.onboarding.openRouterPitch} title="OpenRouter" variant={variant} />
}

export function ProviderRow({
  onSelect,
  provider,
  variant = 'row'
}: {
  onSelect: (provider: OAuthProvider) => void
  provider: OAuthProvider
  variant?: ProviderRowVariant
}) {
  const { t } = useI18n()
  const freeTier = provider.status?.free_tier === true
  const loggedIn = provider.status?.logged_in && !freeTier
  const Trail = provider.flow === 'external' ? Terminal : ChevronRight

  if (variant === 'choice') {
    const tile = FLOW_TILE[provider.flow] ?? FLOW_TILE.pkce

    return (
      <ChoiceRow
        description={t.onboarding.flowSubtitles[provider.flow]}
        glyph={tile.glyph}
        onClick={() => onSelect(provider)}
        title={freeTier ? t.freeTier.providerRowTitle : providerTitle(provider)}
        titleAside={freeTier ? <FreeTierTag /> : loggedIn ? <ConnectedTag /> : null}
        tone={tile.tone}
        trailing={CHOICE_TRAIL}
      />
    )
  }

  return (
    <RowButton className={PROVIDER_ROW_CLASS} onClick={() => onSelect(provider)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[length:var(--conversation-text-font-size)] font-semibold">
            {freeTier ? t.freeTier.providerRowTitle : providerTitle(provider)}
          </span>
          {freeTier ? <FreeTierTag /> : loggedIn ? <ConnectedTag /> : null}
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{t.onboarding.flowSubtitles[provider.flow]}</p>
      </div>
      <Trail className="size-4 text-muted-foreground transition group-hover:text-foreground" />
    </RowButton>
  )
}
