import { ReactNode, useId } from 'react'

interface FormFieldProps {
  label: string
  children: ReactNode
  className?: string
  /** Validation error message to display below the field */
  error?: string
  /** Shows a red asterisk next to the label */
  required?: boolean
}

/**
 * Consistent form field wrapper with label, optional required indicator,
 * and validation error display with proper ARIA attributes.
 */
export default function FormField({ label, children, className = '', error, required }: FormFieldProps) {
  const errorId = useId()

  return (
    <div className={className} {...(error ? { 'aria-describedby': errorId } : {})}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <p id={errorId} className="text-xs text-red-500 mt-1" role="alert">{error}</p>}
    </div>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${props.className || ''}`}
    />
  )
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${props.className || ''}`}
    >
      {children}
    </select>
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${props.className || ''}`}
    />
  )
}
