import { describe, expect, it } from 'vitest'

import type { StarmapGraph, StarmapNode } from '@/types/hermes'

import { filterGraph, graphCounts, learnedSkills, memoryCharCount, memoryNodeId, memoryRows } from './graph-model'

const skill = (id: string, overrides: Partial<StarmapNode> = {}): StarmapNode => ({
  category: 'coding',
  createdBy: null,
  id,
  kind: 'skill',
  label: id,
  pinned: false,
  state: 'active',
  useCount: 0,
  ...overrides
})

const cards = [
  { body: 'Prefers short answers.\nLead with the conclusion.', fingerprint: 'f1', source: 'memory' as const, title: 'Prefers short answers.' },
  { body: 'Uses nanostores.', fingerprint: 'f2', source: 'memory' as const, title: 'Uses nanostores.' },
  { body: 'Lives in Hangzhou.', fingerprint: 'f3', source: 'profile' as const, title: 'Lives in Hangzhou.' }
]

const graph: StarmapGraph = {
  clusters: [],
  edges: [
    { source: 'used', target: 'learned' },
    { source: 'used', target: 'idle' }
  ],
  memory: cards,
  nodes: [
    skill('used', { useCount: 4 }),
    skill('learned', { category: 'research', createdBy: 'agent', useCount: 2 }),
    skill('idle', { category: 'research' }),
    ...cards.map((card, index) => ({
      ...skill(memoryNodeId(card, index)),
      kind: 'memory' as const,
      label: card.title,
      memorySource: card.source
    }))
  ],
  stats: {}
}

describe('memory map filters', () => {
  it('keeps the whole graph for All', () => {
    expect(filterGraph(graph, 'all')).toBe(graph)
  })

  it('keeps used or learned skills and only the links between them', () => {
    const used = filterGraph(graph, 'used')

    expect(used.nodes.map(node => node.id)).toEqual(['used', 'learned'])
    expect(used.edges).toEqual([{ source: 'used', target: 'learned' }])

    expect(filterGraph(graph, 'learned').nodes.map(node => node.id)).toEqual(['learned'])
    expect(filterGraph(graph, 'learned').edges).toEqual([])
  })

  it('counts skills, memories and skill categories', () => {
    expect(graphCounts(graph)).toEqual({ categories: 2, memories: 3, skills: 3 })
  })
})

describe('memory list rows', () => {
  it('lists each file in order and drops entries whose node was removed', () => {
    expect(memoryRows(graph, 'memory').map(row => row.id)).toEqual(['memory:memory:0:f1', 'memory:memory:1:f2'])
    expect(memoryRows(graph, 'profile').map(row => row.preview)).toEqual(['Lives in Hangzhou.'])

    const evicted = { ...graph, nodes: graph.nodes.filter(node => node.id !== 'memory:memory:1:f2') }

    expect(memoryRows(evicted, 'memory').map(row => row.id)).toEqual(['memory:memory:0:f1'])
  })

  it('counts characters the way the memory tool joins entries', () => {
    const rows = memoryRows(graph, 'memory')

    expect(memoryCharCount(rows)).toBe(cards[0].body.length + cards[1].body.length + 3)
    expect(memoryCharCount([{ ...rows[0], card: { ...rows[0].card, body: 'x'.repeat(1200) } }])).toBeNull()
  })

  it('lists only the skills Hermes wrote, most used first', () => {
    const graphWithMore = { ...graph, nodes: [...graph.nodes, skill('learned-2', { createdBy: 'learn', useCount: 9 })] }

    expect(learnedSkills(graphWithMore).map(node => node.id)).toEqual(['learned-2', 'learned'])
  })
})
