import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useFirstRowHighlight } from './use-first-row-highlight'

function List({ onValue, rows }: { onValue: (value: string) => void; rows: { selected?: boolean; value: string }[] }) {
  const ref = useFirstRowHighlight(onValue)

  return (
    <div ref={ref}>
      {rows.map(row => (
        <div aria-selected={row.selected ?? false} cmdk-item="" data-value={row.value} key={row.value} />
      ))}
    </div>
  )
}

const settle = () => new Promise(resolve => setTimeout(resolve, 0))

describe('useFirstRowHighlight', () => {
  it('hands the highlight to the first row when a swap leaves none', async () => {
    const onValue = vi.fn()
    const view = render(<List onValue={onValue} rows={[{ selected: true, value: 'a' }]} />)

    view.rerender(<List onValue={onValue} rows={[{ value: 'b' }, { value: 'c' }]} />)
    await settle()

    expect(onValue).toHaveBeenLastCalledWith('b')
  })

  it('leaves a surviving highlight alone', async () => {
    const onValue = vi.fn()
    const view = render(<List onValue={onValue} rows={[{ value: 'a' }, { selected: true, value: 'b' }]} />)

    view.rerender(<List onValue={onValue} rows={[{ selected: true, value: 'b' }, { value: 'c' }]} />)
    await settle()

    expect(onValue).not.toHaveBeenCalled()
  })
})
