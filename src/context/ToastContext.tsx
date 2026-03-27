import { createContext, useContext, ReactNode } from 'react'
import { useToast, Toast } from '@/hooks/useToast'
import ToastContainer from '@/components/ui/ToastContainer'

interface ToastContextType {
  addToast: (message: string, type?: Toast['type']) => string
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, addToast, removeToast } = useToast()

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * Access toast notifications from any component.
 * Usage: const { addToast } = useToastContext()
 *        addToast('Registro guardado', 'success')
 */
export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToastContext must be used within ToastProvider')
  return context
}
