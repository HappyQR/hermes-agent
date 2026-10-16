import type { ModelOptionProvider } from '@hermes/shared'
import { REASONING_EFFORT_VALUES } from '@hermes/shared'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/i18n'
import { Loader2 } from '@/lib/icons'
import { isSubmitEnter } from '@/lib/ime'
import { catalogProviderMatches } from '@/lib/model-options'
import { cn } from '@/lib/utils'

import { CONTROL_TEXT } from './constants'
import { ModelSelect } from './model-select'
import { ListRow } from './primitives'
import { useSettingsWindow } from './studio/window-context'

export type SpeedTier = 'fast' | 'normal' | 'ultrafast'

/** Everything the main-model section draws; the state and actions stay in ModelSettings. */
export interface ModelMainSectionProps {
  activating: boolean
  apiKeyDraft: string
  applying: boolean
  /** The saved main model; the window hides Apply until the picks differ from it. */
  currentModel: { model: string; provider: string } | null
  effortValue: string
  errorNotice: ReactNode
  fastOn: boolean
  fastSupported: boolean
  mainProviderOptions: readonly { models?: readonly string[]; name: string; slug: string }[]
  needsSetup: boolean
  onActivateApiKey: () => void
  onApiKeyDraftChange: (value: string) => void
  onApply: () => void
  onModelChange: (model: string) => void
  onProviderChange: (slug: string) => void
  onStartSetup: () => void
  onWriteDefault: (key: string, value: boolean | string) => void
  reasoningSupported: boolean
  selectedModel: string
  selectedProvider: string
  selectedProviderModels: readonly string[]
  selectedProviderRow: ModelOptionProvider | undefined
  setupIsApiKey: boolean
  /** The reasoning/speed defaults exist for the configured main model. */
  showDefaults: boolean
  speedValue: SpeedTier
  /** The "auxiliary tasks still on the old provider" warning, when it applies. */
  staleAuxWarning: ReactNode
  ultrafastSupported: boolean
}

function ProviderSelect({
  mainProviderOptions,
  onProviderChange,
  selectedProvider,
  selectedProviderRow
}: ModelMainSectionProps) {
  const { t } = useI18n()
  const m = t.settings.model

  return (
    <Select onValueChange={onProviderChange} value={selectedProviderRow?.slug ?? selectedProvider}>
      <SelectTrigger aria-label={m.provider} className={cn('min-w-40', CONTROL_TEXT)}>
        <SelectValue placeholder={m.provider} />
      </SelectTrigger>
      <SelectContent>
        {mainProviderOptions.map(provider => (
          <SelectItem key={provider.slug || 'none'} value={provider.slug || 'none'}>
            {provider.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** The picks differ from the saved main model (or there is none yet). */
function pickChanged({ currentModel, selectedModel, selectedProvider, selectedProviderRow }: ModelMainSectionProps) {
  if (!currentModel) {
    return true
  }

  const sameProvider = selectedProviderRow
    ? catalogProviderMatches(selectedProviderRow, currentModel.provider)
    : selectedProvider === currentModel.provider

  return !sameProvider || selectedModel !== currentModel.model
}

/** The model picker + Apply, or — for a provider without credentials — its inline setup. */
function ModelOrSetup({ hideCleanApply = false, ...props }: ModelMainSectionProps & { hideCleanApply?: boolean }) {
  const { t } = useI18n()
  const m = t.settings.model
  const r = t.studio.settings.rows
  const { selectedProviderRow: row } = props

  if (props.needsSetup && props.setupIsApiKey) {
    return (
      <>
        <Input
          autoComplete="off"
          className={cn('min-w-60 flex-1', CONTROL_TEXT)}
          onChange={event => props.onApiKeyDraftChange(event.target.value)}
          onKeyDown={event => {
            if (isSubmitEnter(event)) {
              props.onActivateApiKey()
            }
          }}
          placeholder={r.pasteKeyPlaceholder(row?.key_env ?? r.apiKeyFallback)}
          type="password"
          value={props.apiKeyDraft}
        />
        <Button disabled={!props.apiKeyDraft.trim() || props.activating} onClick={props.onActivateApiKey} size="sm">
          {props.activating && <Loader2 className="size-3.5 animate-spin" />}
          {props.activating ? r.activatingKey : r.activateKey}
        </Button>
      </>
    )
  }

  if (props.needsSetup) {
    return (
      <Button onClick={props.onStartSetup} size="sm" variant="textStrong">
        {m.setUpProvider(row?.name ?? m.setupProviderFallback)}
      </Button>
    )
  }

  return (
    <>
      <ModelSelect
        className={hideCleanApply ? 'w-52' : 'min-w-60'}
        models={props.selectedProviderModels}
        onValueChange={props.onModelChange}
        provider={row}
        providerSlug={props.selectedProvider}
        value={props.selectedModel}
      />
      {(!hideCleanApply || props.applying || pickChanged(props)) && (
        <Button
          disabled={!props.selectedProvider || !props.selectedModel || props.applying}
          onClick={props.onApply}
          size="sm"
        >
          {props.applying && <Loader2 className="size-3.5 animate-spin" />}
          {props.applying ? m.applying : t.common.apply}
        </Button>
      )}
    </>
  )
}

function SetupHint({ needsSetup, selectedProviderRow: row, setupIsApiKey }: ModelMainSectionProps): ReactNode {
  const { t } = useI18n()
  const r = t.studio.settings.rows

  if (!needsSetup || setupIsApiKey || !row) {
    return null
  }

  return row.auth_type === 'api_key' ? r.providerNeedsKey(row.name) : r.providerBrowserSignIn(row.name)
}

function EffortSelect({ effortValue, onWriteDefault }: ModelMainSectionProps) {
  const { t } = useI18n()
  const m = t.settings.model

  return (
    <Select onValueChange={value => onWriteDefault('agent.reasoning_effort', value)} value={effortValue}>
      <SelectTrigger aria-label={m.reasoning} className={cn('min-w-28', CONTROL_TEXT)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {REASONING_EFFORT_VALUES.map(value => (
          <SelectItem key={value} value={value}>
            {value === 'none' ? m.reasoningOff : t.shell.modelOptions[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function SpeedControl({
  fastOn,
  fastSupported,
  onWriteDefault,
  speedValue,
  ultrafastSupported
}: ModelMainSectionProps) {
  const { t } = useI18n()
  const m = t.settings.model

  if (ultrafastSupported) {
    return (
      <Select onValueChange={value => onWriteDefault('agent.service_tier', value)} value={speedValue}>
        <SelectTrigger aria-label={m.speed} className={cn('min-w-28', CONTROL_TEXT)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="normal">{m.speedStandard}</SelectItem>
          {fastSupported && <SelectItem value="fast">{t.shell.modelOptions.fast}</SelectItem>}
          <SelectItem value="ultrafast">{t.shell.modelOptions.ultrafast}</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  return fastSupported ? (
    <Switch
      aria-label={t.shell.modelOptions.fast}
      checked={fastOn}
      onCheckedChange={checked => onWriteDefault('agent.service_tier', checked ? 'fast' : 'normal')}
      size="xs"
    />
  ) : null
}

/** Standard / Fast / Ultrafast as one segmented control (the window's Speed row). */
function SpeedSegments({ fastSupported, onWriteDefault, speedValue, ultrafastSupported }: ModelMainSectionProps) {
  const { t } = useI18n()
  const m = t.settings.model

  const options = [
    { id: 'normal' as const, label: m.speedStandard },
    ...(fastSupported ? [{ id: 'fast' as const, label: t.shell.modelOptions.fast }] : []),
    ...(ultrafastSupported ? [{ id: 'ultrafast' as const, label: t.shell.modelOptions.ultrafast }] : [])
  ]

  return (
    <SegmentedControl
      aria-label={m.speed}
      onChange={value => onWriteDefault('agent.service_tier', value)}
      options={options}
      value={speedValue}
    />
  )
}

/** The Settings window: one row per choice (prototype Models › Main model). */
function WindowModelMainSection(props: ModelMainSectionProps) {
  const { t } = useI18n()
  const m = t.settings.model

  return (
    <>
      <ListRow action={<ProviderSelect {...props} />} title={m.provider} />
      <ListRow
        action={
          <div className="flex items-center justify-end gap-2">
            <ModelOrSetup {...props} hideCleanApply />
          </div>
        }
        description={<SetupHint {...props} />}
        title={m.model}
      />
      {props.showDefaults && props.reasoningSupported && (
        <ListRow action={<EffortSelect {...props} />} title={m.reasoning} />
      )}
      {props.showDefaults && (props.fastSupported || props.ultrafastSupported) && (
        <ListRow action={<SpeedSegments {...props} />} title={m.speed} />
      )}
      {props.errorNotice ? <div className="px-3.5 pb-2">{props.errorNotice}</div> : null}
      {props.staleAuxWarning ? <div className="px-3.5 py-2">{props.staleAuxWarning}</div> : null}
    </>
  )
}

/** Main model: provider + model + Apply (or provider setup), then the reasoning/speed defaults. */
export function ModelMainSection(props: ModelMainSectionProps) {
  const { t } = useI18n()
  const m = t.settings.model
  const windowed = useSettingsWindow()

  if (windowed) {
    return <WindowModelMainSection {...props} />
  }

  return (
    <section>
      <p className="mb-3 text-xs text-muted-foreground">{m.appliesDesc}</p>
      <div className="flex flex-wrap items-center gap-2">
        <ProviderSelect {...props} />
        <ModelOrSetup {...props} />
      </div>
      {props.needsSetup && !props.setupIsApiKey && props.selectedProviderRow && (
        <p className="mt-2 text-xs text-muted-foreground">
          <SetupHint {...props} />
        </p>
      )}
      {props.showDefaults && (props.reasoningSupported || props.fastSupported || props.ultrafastSupported) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="text-xs text-muted-foreground">{m.defaultsLabel}</span>
          {props.reasoningSupported && (
            <div className="flex items-center gap-2 text-xs">
              <span className="shrink-0 whitespace-nowrap">{m.reasoning}</span>
              <EffortSelect {...props} />
            </div>
          )}
          {props.ultrafastSupported ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="shrink-0 whitespace-nowrap">{m.speed}</span>
              <SpeedControl {...props} />
            </div>
          ) : (
            props.fastSupported && (
              <label className="flex items-center gap-2 text-xs">
                {t.shell.modelOptions.fast}
                <SpeedControl {...props} />
              </label>
            )
          )}
        </div>
      )}
      {props.errorNotice}
      {props.staleAuxWarning ? <div className="mt-2">{props.staleAuxWarning}</div> : null}
    </section>
  )
}
