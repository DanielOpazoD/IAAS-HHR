import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import SkeletonTable from '@/components/ui/SkeletonTable'

describe('SkeletonTable', () => {
  it('renders with default 6 rows and 5 cols', () => {
    const { container } = render(<SkeletonTable />)
    const rows = container.querySelectorAll('.divide-y > div')
    expect(rows).toHaveLength(6)
    // Each row has 5 columns
    const firstRowCols = rows[0].querySelectorAll('div')
    expect(firstRowCols).toHaveLength(5)
  })

  it('renders with custom rows and cols', () => {
    const { container } = render(<SkeletonTable rows={3} cols={4} />)
    const rows = container.querySelectorAll('.divide-y > div')
    expect(rows).toHaveLength(3)
    const firstRowCols = rows[0].querySelectorAll('div')
    expect(firstRowCols).toHaveLength(4)
  })

  it('has animate-pulse class for loading animation', () => {
    const { container } = render(<SkeletonTable />)
    expect(container.firstElementChild?.className).toContain('animate-pulse')
  })

  it('renders header placeholders matching cols count', () => {
    const { container } = render(<SkeletonTable cols={3} />)
    const headerCols = container.querySelector('.bg-gray-50\\/80')?.querySelectorAll('div')
    expect(headerCols).toHaveLength(3)
  })

  it('renders footer placeholder', () => {
    const { container } = render(<SkeletonTable />)
    const footer = container.querySelector('.border-t')
    expect(footer).toBeInTheDocument()
  })
})
