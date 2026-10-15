'use client'

import { Badge, type BadgeProps } from '@/components/ui/badge'
import { useI18n } from '@/i18n'

export type ClarifyHeadState = 'answered' | 'pending' | 'skipped'

const TONE: Record<ClarifyHeadState, BadgeProps['variant']> = {
  answered: 'success',
  pending: 'warn',
  skipped: 'muted'
}

/** The card's head (prototype clarify card): a state tag — needs your choice,
 *  answered, skipped — and the question count or progress beside it. */
export function ClarifyHead({ count, state }: { count: string; state: ClarifyHeadState }) {
  const { t } = useI18n()
  const studio = t.studio.chat.transcript

  const label: Record<ClarifyHeadState, string> = {
    answered: studio.answered,
    pending: studio.needsChoice,
    skipped: t.assistant.clarify.skipped
  }

  return (
    <div className="studio-clarify-head">
      <Badge variant={TONE[state]}>{label[state]}</Badge>
      <span className="studio-clarify-count">{count}</span>
    </div>
  )
}
