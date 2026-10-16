import { useStore } from '@nanostores/react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { FormDisclosure } from '@/app/overlays/studio/form-group'
import { navigateToWorkspacePage, STARMAP_ROUTE } from '@/app/routes'
import { Button } from '@/components/ui/button'
import { resetMemory } from '@/hermes'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { confirm } from '@/store/confirm'
import { notify, notifyError } from '@/store/notifications'
import { $settingsScopeOverride } from '@/store/settings-scope'

import type { ConfigSettingsLayoutApi } from '../../config-settings'
import { ListRow } from '../../primitives'
import { ConfigPage, type ConfigPageProps, ConfigRows, placedFields } from '../config-layout'
import { SettingsScopeBadge } from '../scope'
import { SettingsWindowSection } from '../section'

// The compression switch stays visible; its tuning folds into Compression details.
const COMPRESSION_SWITCH = 'compression.enabled'

const DETAILS_ORDER = [
  'context.engine',
  'compression.threshold',
  'compression.protect_last_n',
  'auxiliary.compression.timeout',
  'compression.target_ratio',
  'compression.codex_gpt55_autoraise'
]

const ordered = (keys: string[]) => [
  ...DETAILS_ORDER.filter(key => keys.includes(key)),
  ...keys.filter(key => !DETAILS_ORDER.includes(key))
]

function OpenMemoryRow() {
  const { t } = useI18n()
  const r = t.studio.settings.rows
  const navigate = useNavigate()

  return (
    <ListRow
      action={
        <Button onClick={() => navigateToWorkspacePage(navigate, STARMAP_ROUTE)} size="sm" variant="secondary">
          {r.memoryOpenAction}
        </Button>
      }
      description={r.memoryOpenDesc}
      title={r.memoryOpenTitle}
    />
  )
}

/** Reset MEMORY.md / USER.md (the same backend reset System Status › Maintenance runs). */
function MemoryResetRows() {
  const { t } = useI18n()
  const r = t.studio.settings.rows
  const mm = t.commandCenter.maintenance
  const [busy, setBusy] = useState(false)

  const reset = async (target: 'memory' | 'user', label: string) => {
    triggerHaptic('warning')

    if (!(await confirm({ destructive: true, title: mm.resetConfirm(label) }))) {
      return
    }

    setBusy(true)

    try {
      const result = await resetMemory(target)
      notify({ kind: 'success', message: '', title: mm.resetDone(result.deleted.join(', ') || label) })
    } catch (err) {
      notifyError(err, mm.resetFailed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <ListRow
        action={
          <Button disabled={busy} onClick={() => void reset('memory', mm.memoryFile)} size="sm" variant="destructive">
            {r.resetAction}
          </Button>
        }
        description={r.resetMemoryDesc}
        title={r.resetMemoryTitle}
      />
      <ListRow
        action={
          <Button disabled={busy} onClick={() => void reset('user', mm.userFile)} size="sm" variant="destructive">
            {r.resetAction}
          </Button>
        }
        description={r.resetProfileDesc}
        title={r.resetProfileTitle}
      />
    </>
  )
}

function MemorySections({ api }: { api: ConfigSettingsLayoutApi }) {
  const { t } = useI18n()
  const s = t.studio.settings.sections.memory
  const override = useStore($settingsScopeOverride)
  const context = placedFields(api, 'memory', 'context')
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <>
      <SettingsWindowSection aside={<SettingsScopeBadge page="memory" />} id="memory" page="memory" title={s.memory}>
        <ConfigRows api={api} keys={placedFields(api, 'memory', 'memory')} skeleton={4} />
        <OpenMemoryRow />
      </SettingsWindowSection>
      <SettingsWindowSection id="context" page="memory" title={s.context}>
        <ConfigRows api={api} keys={context.filter(key => key === COMPRESSION_SWITCH)} skeleton={1} />
        <FormDisclosure onOpenChange={setDetailsOpen} open={detailsOpen} title={s.contextDisclosure}>
          <ConfigRows api={api} keys={ordered(context.filter(key => key !== COMPRESSION_SWITCH))} />
        </FormDisclosure>
      </SettingsWindowSection>
      {/* The reset API edits the profile this window runs; while another profile is
          picked in the header these stay in System Status › Maintenance only. */}
      {override === null && (
        <SettingsWindowSection id="maintenance" page="memory" title={s.maintenance}>
          <MemoryResetRows />
        </SettingsWindowSection>
      )}
    </>
  )
}

/** Memory & Context: long-term memory, context and compression, maintenance (profile). */
export function MemoryPage(props: ConfigPageProps) {
  return (
    <ConfigPage legacySection="memory" {...props}>
      {api => <MemorySections api={api} />}
    </ConfigPage>
  )
}
