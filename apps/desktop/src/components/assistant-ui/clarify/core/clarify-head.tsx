'use client'

import { useI18n } from '@/i18n'

export type ClarifyHeadState = 'answered' | 'pending' | 'skipped'

const TONE: Record<ClarifyHeadState, string | undefined> = {
  answered: 'green',
  pending: 'orange',
  skipped: undefined
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
      <span className="studio-tag" data-tone={TONE[state]}>
        {label[state]}
      </span>
      <span className="studio-clarify-count">{count}</span>
    </div>
  )
}
