import { atom } from 'nanostores'

/** The workspace page's large title, published for the toolbar: once the page
 *  has scrolled the title out of view the toolbar fades it in (macOS large
 *  titles). `null` while no page header is mounted. Read-only for consumers;
 *  `publishWorkspacePageTitle` is the only writer. */
export interface WorkspacePageTitle {
  /** Distinguishes publishers so an unmounting page never clears its successor. */
  owner: symbol
  offscreen: boolean
  title: string
}

export const $workspacePageTitle = atom<WorkspacePageTitle | null>(null)

export function publishWorkspacePageTitle(next: WorkspacePageTitle): void {
  const current = $workspacePageTitle.get()

  if (
    current &&
    current.owner === next.owner &&
    current.title === next.title &&
    current.offscreen === next.offscreen
  ) {
    return
  }

  $workspacePageTitle.set(next)
}

export function clearWorkspacePageTitle(owner: symbol): void {
  if ($workspacePageTitle.get()?.owner === owner) {
    $workspacePageTitle.set(null)
  }
}
