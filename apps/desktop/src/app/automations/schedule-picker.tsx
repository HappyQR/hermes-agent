import { useState } from 'react'

import { FormGroup, FormRow } from '@/components/studio/pages/form'
import { FilterChip } from '@/components/studio/pages/surfaces'
import { Codicon } from '@/components/ui/codicon'
import { Input } from '@/components/ui/input'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { useI18n } from '@/i18n'

import {
  cronToPreset,
  DEFAULT_SCHEDULE_PRESET,
  describePreset,
  parseTimeValue,
  presetTimeValue,
  presetToCron,
  SCHEDULE_FREQUENCIES,
  type ScheduleFrequency,
  type SchedulePreset,
  WEEKDAY_ORDER
} from './schedule-builder'
import { useScheduleCopy } from './schedule-copy'

// "When" for the job sheet (prototype overlays.js:291-301): a frequency
// segment, the time, weekday chips (weekly) or the day of month (monthly), and
// one free-text field for anything else — a cron expression or a phrase the
// backend understands ("every 30m"), checked when the job is saved. Mount it
// with a `key` per opened job: its draft is local and seeds from `initialExpr`.

interface SchedulePickerProps {
  id: string
  initialExpr: string
  onChange: (expr: string) => void
}

export function SchedulePicker({ id, initialExpr, onChange }: SchedulePickerProps) {
  const { t } = useI18n()
  const c = t.cron
  const s = t.studio.pages.cron.sheet
  const copy = useScheduleCopy()
  const initialPreset = cronToPreset(initialExpr)
  const [preset, setPreset] = useState<SchedulePreset>(initialPreset ?? DEFAULT_SCHEDULE_PRESET)
  const [custom, setCustom] = useState(initialPreset || !initialExpr.trim() ? '' : initialExpr.trim())
  const usingCustom = custom.trim().length > 0

  const applyPreset = (next: SchedulePreset) => {
    setPreset(next)
    setCustom('')
    onChange(presetToCron(next))
  }

  const toggleWeekday = (day: number) => {
    const on = preset.weekdays.includes(day)
    const weekdays = on ? preset.weekdays.filter(value => value !== day) : [...preset.weekdays, day]

    // A weekly job needs at least one day; the last chip stays on.
    if (weekdays.length > 0) {
      applyPreset({ ...preset, weekdays })
    }
  }

  return (
    <FormGroup>
      <FormRow stack>
        <SegmentedControl
          aria-label={s.frequency}
          onChange={frequency => applyPreset({ ...preset, frequency })}
          options={SCHEDULE_FREQUENCIES.map(frequency => ({
            id: frequency,
            label: c.scheduleLabels[frequency] ?? frequency
          }))}
          size="sm"
          // Free text owns the schedule while it has content: no segment is on.
          value={usingCustom ? ('' as ScheduleFrequency) : preset.frequency}
        />
      </FormRow>
      {!usingCustom && preset.frequency !== 'hourly' ? (
        <FormRow htmlFor={`${id}-time`} title={s.time}>
          <Input
            className="w-[7.5rem]"
            id={`${id}-time`}
            onChange={event => {
              const time = parseTimeValue(event.target.value)

              if (time) {
                applyPreset({ ...preset, ...time })
              }
            }}
            type="time"
            value={presetTimeValue(preset)}
          />
        </FormRow>
      ) : null}
      {!usingCustom && preset.frequency === 'weekly' ? (
        <FormRow title={s.weekdays}>
          <div aria-label={s.weekdays} className="flex flex-wrap gap-1.5" role="group">
            {WEEKDAY_ORDER.map(day => (
              <FilterChip
                aria-label={copy.dayName(day)}
                className="w-[2.125rem] px-0"
                key={day}
                onClick={() => toggleWeekday(day)}
                pressed={preset.weekdays.includes(day)}
              >
                {copy.weekdayShort(day)}
              </FilterChip>
            ))}
          </div>
        </FormRow>
      ) : null}
      {!usingCustom && preset.frequency === 'monthly' ? (
        <FormRow htmlFor={`${id}-dom`} title={s.dayOfMonth}>
          <Input
            className="w-[4.5rem]"
            id={`${id}-dom`}
            max={31}
            min={1}
            onChange={event => {
              const day = Number(event.target.value)

              if (Number.isInteger(day) && day >= 1 && day <= 31) {
                applyPreset({ ...preset, dayOfMonth: day })
              }
            }}
            type="number"
            value={preset.dayOfMonth}
          />
        </FormRow>
      ) : null}
      <FormRow stack>
        <Input
          aria-label={s.customLabel}
          className="w-full font-mono"
          id={`${id}-custom`}
          onChange={event => {
            const next = event.target.value

            setCustom(next)
            onChange(next.trim() ? next : presetToCron(preset))
          }}
          placeholder={s.customPlaceholder}
          value={custom}
        />
      </FormRow>
      <FormRow className="text-[0.78125rem]" stack>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <Codicon className="shrink-0 text-primary" name="calendar" size="0.875rem" />
          <span className="min-w-0 flex-1 truncate">
            {usingCustom ? s.checkedOnSave : describePreset(preset, copy)}
          </span>
          <span className="shrink-0 font-mono text-(--ui-text-tertiary)">
            {usingCustom ? custom.trim() : presetToCron(preset)}
          </span>
        </span>
      </FormRow>
    </FormGroup>
  )
}
