import { useStore } from '@nanostores/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

import { getHermesConfigRecord } from '@/hermes'
import { useI18n } from '@/i18n'
import { getServers } from '@/lib/mcp-servers'
import { rollbackSentence } from '@/lib/update-copy'
import { resolveVersionStatus } from '@/lib/version-status'
import { $connection } from '@/store/session'
import { $backendUpdateApply, $backendUpdateStatus, $desktopVersion, $updateApply, $updateStatus } from '@/store/updates'

/**
 * The Update row names the same install the statusbar names — same target
 * selection, same resolver. Reduced to the label string: an in-flight apply
 * rewrites these stores on every progress line, and only a changed string
 * should rebuild the palette's groups.
 */
export function useUpdateVersionLabel(): string {
  const { t } = useI18n()
  const connection = useStore($connection)
  const desktopVersion = useStore($desktopVersion)
  const clientStatus = useStore($updateStatus)
  const clientApply = useStore($updateApply)
  const backendStatus = useStore($backendUpdateStatus)
  const backendApply = useStore($backendUpdateApply)

  return useMemo(() => {
    const backend = connection?.mode === 'remote'
    const apply = backend ? backendApply : clientApply
    const status = backend ? backendStatus : clientStatus

    return resolveVersionStatus({
      applying: apply.applying || apply.stage === 'restart',
      behind: status?.behind ?? 0,
      channel: status?.channel === 'stable' ? 'stable' : 'main',
      copy: t.shell.statusbar,
      latestTag: status?.latestTag,
      remote: backend,
      rollback: rollbackSentence(status, t.settings.about.channel.rollbackBody),
      restarting: apply.stage === 'restart',
      sha: status?.currentSha?.slice(0, 7) ?? null,
      target: backend ? 'backend' : 'client',
      updateAvailable: status?.updateAvailable,
      version: backend ? status?.currentVersion : desktopVersion?.appVersion
    }).label
  }, [backendApply, backendStatus, clientApply, clientStatus, connection?.mode, desktopVersion?.appVersion, t])
}

/**
 * Live ⌘/⌃-held state while the palette is open: rows with a modifier variant
 * (projects) preview it by swapping their label. Window-level listeners because
 * focus sits in the search input; blur clears so a ⌘-Tab away doesn't strand
 * the preview on.
 */
export function useModifierHeld(): boolean {
  const [held, setHeld] = useState(false)

  useEffect(() => {
    const sync = (event: KeyboardEvent) => setHeld(event.metaKey || event.ctrlKey)
    const clear = () => setHeld(false)

    window.addEventListener('keydown', sync, { capture: true })
    window.addEventListener('keyup', sync, { capture: true })
    window.addEventListener('blur', clear)

    return () => {
      window.removeEventListener('keydown', sync, { capture: true })
      window.removeEventListener('keyup', sync, { capture: true })
      window.removeEventListener('blur', clear)
    }
  }, [])

  return held
}

/**
 * Configured MCP server names, for the typed "MCP servers" rows. getServers is
 * the shared choke point that also drops malformed (null/scalar) entries, so
 * the palette never lists a server the MCP tab dropped.
 */
export function usePaletteMcpServers(): string[] {
  const configQuery = useQuery({
    queryKey: ['command-palette', 'config'],
    queryFn: () => getHermesConfigRecord()
  })

  return useMemo(() => Object.keys(getServers(configQuery.data ?? null)).sort(), [configQuery.data])
}
