import { atom } from 'nanostores'

import type { RuntimeReadinessResult } from '@/lib/runtime-readiness'
import type { StatusResponse } from '@/types/hermes'

/**
 * Hermes Studio: the ambient status poll's latest answers. One always-mounted
 * host (app/shell/status-snapshot-host.tsx) runs the poll and publishes here, so
 * the status bar can stay off by default without stopping the free-tier refresh
 * and gateway health that other surfaces (toolbar, sidebar) read.
 */
export const $statusSnapshot = atom<null | StatusResponse>(null)
export const $inferenceStatus = atom<null | RuntimeReadinessResult>(null)
