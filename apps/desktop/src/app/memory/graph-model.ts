import type { StarmapGraph, StarmapMemoryCard, StarmapNode } from '@/types/hermes'

// Pure views over the learning graph for the Memory page: the map's filters,
// its counts line, and the rows of the editable list.

export type MemoryFilter = 'all' | 'learned' | 'used'

export const MEMORY_FILTERS: readonly MemoryFilter[] = ['all', 'used', 'learned']

/** A skill Hermes wrote itself (vs. bundled or installed). */
export function isLearnedSkill(node: StarmapNode): boolean {
  return node.kind === 'skill' && (node.createdBy === 'agent' || node.createdBy === 'learn')
}

/** The map for a filter: Used / Learned keep matching skills (memories hide) and
 *  the links whose both ends remain. The full graph stays the share source. */
export function filterGraph(graph: StarmapGraph, filter: MemoryFilter): StarmapGraph {
  if (filter === 'all') {
    return graph
  }

  const nodes = graph.nodes.filter(node =>
    filter === 'used' ? node.kind === 'skill' && node.useCount > 0 : isLearnedSkill(node)
  )

  const ids = new Set(nodes.map(node => node.id))

  return { ...graph, edges: graph.edges.filter(edge => ids.has(edge.source) && ids.has(edge.target)), nodes }
}

export interface GraphCounts {
  categories: number
  memories: number
  skills: number
}

export function graphCounts(graph: StarmapGraph): GraphCounts {
  const skills = graph.nodes.filter(node => node.kind === 'skill')

  return {
    categories: new Set(skills.map(node => node.category).filter(Boolean)).size,
    memories: graph.nodes.filter(node => node.kind === 'memory').length,
    skills: skills.length
  }
}

/** The id the backend gives a memory card's node (`agent/learning_graph.memory_node_id`). */
export function memoryNodeId(card: StarmapMemoryCard, index: number): string {
  return card.fingerprint ? `memory:${card.source}:${index}:${card.fingerprint}` : `memory:${card.source}:${index}`
}

export interface MemoryRow {
  card: StarmapMemoryCard
  id: string
  /** First lines of the entry, for the row preview. */
  preview: string
}

/** Memory entries of one file, in file order, that still have a node (a deleted
 *  entry drops out the moment its node is evicted). */
export function memoryRows(graph: StarmapGraph, source: StarmapMemoryCard['source']): MemoryRow[] {
  const nodeIds = new Set(graph.nodes.filter(node => node.kind === 'memory').map(node => node.id))

  return graph.memory
    .map((card, index) => ({ card, id: memoryNodeId(card, index) }))
    .filter(row => row.card.source === source && nodeIds.has(row.id))
    .map(row => ({ ...row, preview: row.card.body.trim() || row.card.title }))
}

/** Learned skills, most used first. */
export function learnedSkills(graph: StarmapGraph): StarmapNode[] {
  return graph.nodes
    .filter(isLearnedSkill)
    .sort((a, b) => b.useCount - a.useCount || a.label.localeCompare(b.label))
}

/** Characters a memory file uses, counted the way the memory tool does
 *  (entries joined by the `\n§\n` delimiter). Null when a card body was cut short
 *  by the graph scan, so the count would undershoot. */
export function memoryCharCount(rows: MemoryRow[]): null | number {
  if (rows.some(row => row.card.body.length >= 1200)) {
    return null
  }

  return rows.reduce((sum, row) => sum + row.card.body.length, 0) + Math.max(0, rows.length - 1) * 3
}
