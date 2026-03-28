import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Icon from '@/components/ui/Icon'

describe('Icon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<Icon name="edit" />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('applies className', () => {
    const { container } = render(<Icon name="search" className="w-8 h-8 text-red-500" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('class')).toContain('w-8')
  })

  it('applies custom strokeWidth', () => {
    const { container } = render(<Icon name="alert" strokeWidth={1.5} />)
    const path = container.querySelector('path')!
    expect(path.getAttribute('stroke-width')).toBe('1.5')
  })

  it('renders different paths for different icons', () => {
    const { container: c1 } = render(<Icon name="edit" />)
    const { container: c2 } = render(<Icon name="trash" />)
    const d1 = c1.querySelector('path')!.getAttribute('d')
    const d2 = c2.querySelector('path')!.getAttribute('d')
    expect(d1).not.toBe(d2)
  })

  it('uses default className w-5 h-5', () => {
    const { container } = render(<Icon name="plus" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('class')).toContain('w-5 h-5')
  })
})
