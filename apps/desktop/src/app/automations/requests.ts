import { atom } from 'nanostores'

// The page head's "New" menu lives outside the tab bodies that own the create
// flows (the cron editor in CronView, the profile-keyed draft in WebhooksView),
// and the target tab may not be mounted yet when it is picked. A pending
// request survives that mount: the owner consumes it and clears it.

export type AutomationCreateKind = 'cron' | 'webhook'

export const $automationCreateRequest = atom<AutomationCreateKind | null>(null)

export function requestAutomationCreate(kind: AutomationCreateKind): void {
  $automationCreateRequest.set(kind)
}

/** True (and the request is cleared) when a pending request targets `kind`. */
export function takeAutomationCreateRequest(kind: AutomationCreateKind): boolean {
  if ($automationCreateRequest.get() !== kind) {
    return false
  }

  $automationCreateRequest.set(null)

  return true
}
