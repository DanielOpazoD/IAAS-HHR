import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '@/components/ui/Badge'

describe('Badge', () => {
  it('renders value text', () => {
    render(<Badge value="SI" />)
    expect(screen.getByText('SI')).toBeInTheDocument()
  })

  it('shows red style for positive value (SI) with default positiveColor', () => {
    const { container } = render(<Badge value="SI" />)
    const span = container.querySelector('span')!
    expect(span.className).toContain('bg-red-100')
    expect(span.className).toContain('text-red-700')
  })

  it('shows green style for negative value (NO) with default positiveColor', () => {
    const { container } = render(<Badge value="NO" />)
    const span = container.querySelector('span')!
    expect(span.className).toContain('bg-green-100')
    expect(span.className).toContain('text-green-700')
  })

  it('shows red style for SI with gray positiveColor', () => {
    const { container } = render(<Badge value="SI" positiveColor="gray" />)
    const span = container.querySelector('span')!
    expect(span.className).toContain('bg-red-100')
  })

  it('shows gray style for NO with gray positiveColor', () => {
    const { container } = render(<Badge value="NO" positiveColor="gray" />)
    const span = container.querySelector('span')!
    expect(span.className).toContain('text-gray-500')
    expect(span.className).not.toContain('bg-green-100')
  })
})
