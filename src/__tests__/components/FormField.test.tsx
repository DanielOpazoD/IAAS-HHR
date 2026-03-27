import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FormField, { Input, Select, Textarea } from '@/components/ui/FormField'

describe('FormField', () => {
  it('renders label text', () => {
    render(<FormField label="Nombre"><input /></FormField>)
    expect(screen.getByText('Nombre')).toBeInTheDocument()
  })

  it('shows required asterisk when required prop is true', () => {
    const { container } = render(<FormField label="Nombre" required><input /></FormField>)
    const asterisk = container.querySelector('[aria-hidden="true"]')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk?.textContent).toBe('*')
  })

  it('does not show asterisk when required is false', () => {
    const { container } = render(<FormField label="Nombre"><input /></FormField>)
    const asterisk = container.querySelector('[aria-hidden="true"]')
    expect(asterisk).toBeNull()
  })

  it('displays error message with role alert', () => {
    render(<FormField label="RUT" error="RUT inválido"><input /></FormField>)
    const errorEl = screen.getByRole('alert')
    expect(errorEl).toBeInTheDocument()
    expect(errorEl.textContent).toBe('RUT inválido')
  })

  it('does not show error when no error prop', () => {
    render(<FormField label="RUT"><input /></FormField>)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('sets aria-describedby when error is present', () => {
    const { container } = render(<FormField label="RUT" error="Invalid"><input /></FormField>)
    const wrapper = container.firstElementChild
    expect(wrapper?.getAttribute('aria-describedby')).toBeTruthy()
  })
})

describe('Input', () => {
  it('renders with proper classes', () => {
    render(<Input placeholder="test" />)
    const input = screen.getByPlaceholderText('test')
    expect(input.className).toContain('border')
    expect(input.className).toContain('rounded-lg')
  })
})

describe('Select', () => {
  it('renders children options', () => {
    render(
      <Select>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })
})

describe('Textarea', () => {
  it('renders with proper classes', () => {
    render(<Textarea data-testid="ta" />)
    const ta = screen.getByTestId('ta')
    expect(ta.className).toContain('border')
    expect(ta.tagName).toBe('TEXTAREA')
  })
})
