// Attribute-safe selector fragment. jsdom (vitest) does not ship `CSS.escape`.
const cssEscape = (value: string): string => {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }

  return value.replace(/[^a-zA-Z0-9_:-]/g, ch => `\\${ch}`)
}

/**
 * The pending-approval stack renders once per pane, tagged with the owning
 * session so a split view can't jump one pane's control into a sibling's
 * approval. Callers scroll it with `block: 'nearest'`, which keeps the jump a
 * minimal scroll within the transcript's own scroll container instead of an
 * unqualified scrollIntoView that would also nudge an overflow-hidden ancestor.
 */
export function findSessionApprovalStack(sessionId: string | null): HTMLElement | null {
  if (!sessionId) {
    return null
  }

  return document.querySelector<HTMLElement>(`[data-approval-stack][data-session-id="${cssEscape(sessionId)}"]`)
}

/** The pending clarify card inside one chat surface (questions render inline in
 *  that surface's transcript), for the same nearest-edge jump. */
export function findSurfaceClarifyCard(surfaceId: string | null): HTMLElement | null {
  const root = surfaceId
    ? document.querySelector<HTMLElement>(`[data-composer-surface-id="${cssEscape(surfaceId)}"]`)
    : null

  return root?.querySelector<HTMLElement>('form[data-clarify-batch], form[data-clarify-choices]') ?? null
}
