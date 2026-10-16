import { useStore } from '@nanostores/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useInRouterContext, useNavigate } from 'react-router'

import { requestComposerFocus, requestComposerInsert } from '@/app/chat/composer/focus'
import { useComposerScope } from '@/app/chat/composer/scope'
import { DraftProfileChip, DraftProjectChip } from '@/app/chat/sidebar/studio/draft-chips'
import { SESSION_IMPORT_ROUTE } from '@/app/routes'
import { BrandMark } from '@/components/brand-mark'
import { Intro, type IntroProps, useIntroBody } from '@/components/chat/intro'
import { $introHoldsThread } from '@/components/onboarding/first-run/intro'
import { StudioIcon, type StudioIconName } from '@/components/ui/studio-icon'
import { useI18n } from '@/i18n'
import { $hudMode } from '@/store/hud'

type StarterId = 'fixError' | 'organizeFolder' | 'prototype' | 'schedule'

const STARTERS: readonly { icon: StudioIconName; id: StarterId }[] = [
  { icon: 'warn', id: 'fixError' },
  { icon: 'folder', id: 'organizeFolder' },
  { icon: 'clock', id: 'schedule' },
  { icon: 'brush', id: 'prototype' }
]

export type Greeting = 'afternoon' | 'evening' | 'lateNight' | 'morning' | 'noon'

// Hours (local, exclusive upper bound) at which each greeting ends.
const GREETING_UNTIL: readonly [number, Greeting][] = [
  [5, 'lateNight'],
  [11, 'morning'],
  [13, 'noon'],
  [18, 'afternoon']
]

export function greetingFor(hour: number): Greeting {
  return GREETING_UNTIL.find(([until]) => hour < until)?.[1] ?? 'evening'
}

/**
 * Hermes Studio's empty chat (prototype EmptyState): the brand mark, a
 * time-of-day greeting and the personality line above the composer, which
 * rises to the middle of the pane; four starters and "Continue from Claude
 * Code or Codex" under it. Rendered from the thread's empty placeholder but
 * portaled onto the chat surface, so it shares the composer dock's
 * containing block — chat.css places the dock (`:has(> .studio-empty-hello)`)
 * and these blocks from one `--hero-bottom`. The first message mounts the
 * transcript, this unmounts, and the dock glides back down.
 *
 * The first-run guide and the HUD keep the classic splash.
 */
export function StudioIntro(props: IntroProps) {
  const holds = useStore($introHoldsThread)
  const hud = useStore($hudMode)
  const classic = holds || hud
  const anchor = useRef<HTMLSpanElement>(null)
  const [surface, setSurface] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    setSurface(classic ? null : (anchor.current?.closest<HTMLElement>('[data-chat-surface]') ?? null))
  }, [classic])

  if (classic) {
    return <Intro {...props} />
  }

  return (
    <>
      <span aria-hidden className="hidden" ref={anchor} />
      {surface && createPortal(<EmptyStateBlocks {...props} />, surface)}
    </>
  )
}

function EmptyStateBlocks({ personality, seed }: IntroProps) {
  const { t } = useI18n()
  const copy = t.studio.chat.empty
  const [greeting] = useState(() => greetingFor(new Date().getHours()))
  const line = useIntroBody(personality, seed)
  const { target } = useComposerScope()
  const inRouter = useInRouterContext()

  // A starter drafts its prompt into this surface's composer; nothing sends.
  const start = (prompt: string) => {
    requestComposerInsert(prompt, { target })
    requestComposerFocus(target)
  }

  return (
    <>
      <div className="studio-empty-hello" data-slot="studio-empty-state">
        <BrandMark className="studio-empty-mark" />
        <h1>{copy.greeting[greeting]}</h1>
        <p>{line}</p>
      </div>
      <div className="studio-empty-below">
        <div aria-label={copy.startersLabel} className="studio-empty-starters" role="group">
          {STARTERS.map(({ icon, id }) => (
            <button key={id} onClick={() => start(copy.starters[id].prompt)} type="button">
              <StudioIcon name={icon} size={18} />
              <b>{copy.starters[id].title}</b>
              <span>{copy.starters[id].description}</span>
            </button>
          ))}
        </div>
        {inRouter && <EmptyMeta chips={target === 'main'} label={copy.continueFrom} />}
      </div>
    </>
  )
}

// Isolated: useNavigate() throws outside a <Router>. The main chat's draft also
// gets the project and profile chips (prototype .empty-meta); a tile's draft
// keeps only the import link — the chips steer the main workspace.
function EmptyMeta({ chips, label }: { chips: boolean; label: string }) {
  const navigate = useNavigate()

  return (
    <div className="studio-empty-meta">
      {chips && (
        <>
          <DraftProjectChip />
          <DraftProfileChip />
        </>
      )}
      <button className="studio-empty-link" onClick={() => navigate(SESSION_IMPORT_ROUTE)} type="button">
        <StudioIcon name="import" size={13} />
        {label}
      </button>
    </div>
  )
}
