import { describe, expect, it } from 'vitest'

import { fileExtension, matchesView, viewKindOf } from './view-kind'

describe('artifact views', () => {
  it('splits HTML files into web pages and keeps the other kinds', () => {
    expect(viewKindOf({ kind: 'file', value: '/tmp/site/index.html' })).toBe('web')
    expect(viewKindOf({ kind: 'file', value: '/tmp/page.HTM?x=1' })).toBe('web')
    expect(viewKindOf({ kind: 'file', value: '/tmp/notes.md' })).toBe('file')
    expect(viewKindOf({ kind: 'image', value: '/tmp/a.png' })).toBe('image')
    expect(viewKindOf({ kind: 'link', value: 'https://example.com/a.html' })).toBe('link')
  })

  it('filters by view, with All matching everything', () => {
    const page = { kind: 'file' as const, value: 'report.html' }

    expect(matchesView(page, 'all')).toBe(true)
    expect(matchesView(page, 'web')).toBe(true)
    expect(matchesView(page, 'file')).toBe(false)
  })

  it('reads the extension for file thumbnails', () => {
    expect(fileExtension('/tmp/Q3.xlsx')).toBe('XLSX')
    expect(fileExtension('/tmp/README')).toBe('')
  })
})
