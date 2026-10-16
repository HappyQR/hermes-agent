import type { ArtifactRecord } from './artifact-utils'

// The page's five filters (prototype All/Web/Images/Files/Links). Web is a view
// over `file` artifacts that are HTML documents — the index keeps its three
// kinds (artifact-utils), so Files here means files that are not web pages.

export const ARTIFACT_VIEWS = ['all', 'web', 'image', 'file', 'link'] as const

export type ArtifactView = (typeof ARTIFACT_VIEWS)[number]

export type ArtifactViewKind = Exclude<ArtifactView, 'all'>

const HTML_RE = /\.html?(?:[?#].*)?$/i

export function viewKindOf(artifact: Pick<ArtifactRecord, 'kind' | 'value'>): ArtifactViewKind {
  if (artifact.kind === 'file' && HTML_RE.test(artifact.value)) {
    return 'web'
  }

  return artifact.kind
}

export function matchesView(artifact: Pick<ArtifactRecord, 'kind' | 'value'>, view: ArtifactView): boolean {
  return view === 'all' || viewKindOf(artifact) === view
}

/** The extension shown on a file thumbnail ("PDF", "XLSX"…). */
export function fileExtension(value: string): string {
  const match = /\.([a-z0-9]{1,8})(?:[?#].*)?$/i.exec(value)

  return match ? match[1].toUpperCase() : ''
}
