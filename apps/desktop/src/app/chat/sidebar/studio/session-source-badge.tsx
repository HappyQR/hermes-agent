import { PlatformAvatar } from '@/app/messaging/platform-icon'
import { StudioIcon } from '@/components/ui/studio-icon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { handoffOriginSource, sessionSourceLabel } from '@/lib/session-source'
import type { SessionInfo } from '@/types/hermes'

import { CRON_SOURCE, DESKTOP_SOURCE, sessionSourceBucket } from './session-source'

/**
 * Where a session came from (prototype `.src-badge`): a 16px chip after the
 * title for anything that did not start on this machine — a messaging platform,
 * a webhook, a scheduled job. A local session handed off from a platform wears
 * that platform's chip with the handoff tip. Desktop sessions carry none.
 */
export function SessionSourceBadge({ session }: { session: SessionInfo }) {
  const { t } = useI18n()
  const copy = t.studio.sidebar.source
  const bucket = sessionSourceBucket(session)

  if (bucket === CRON_SOURCE) {
    return (
      <Tip label={copy.from(copy.cron)} placement="row">
        <span
          aria-label={copy.from(copy.cron)}
          className="inline-grid size-4 shrink-0 place-items-center rounded-[4.5px] bg-[color-mix(in_srgb,var(--ui-dot-orange)_18%,transparent)] text-(--ui-dot-orange)"
          role="img"
        >
          <StudioIcon name="clock" size={11} stroke={2} />
        </span>
      </Tip>
    )
  }

  const handoff = bucket === DESKTOP_SOURCE ? handoffOriginSource(session.handoff_state, session.handoff_platform) : null
  const platform = handoff ?? (bucket === DESKTOP_SOURCE ? null : bucket)

  if (!platform) {
    return null
  }

  const label = sessionSourceLabel(platform) ?? platform
  const tip = handoff ? t.sidebar.row.handoffOrigin(label) : copy.from(label)

  return (
    <Tip label={tip} placement="row">
      <PlatformAvatar
        aria-hidden={false}
        aria-label={tip}
        className="size-4 rounded-[4.5px] text-[0.5rem] [&_svg]:size-2.5"
        platformId={platform}
        platformName={label}
        role="img"
      />
    </Tip>
  )
}
