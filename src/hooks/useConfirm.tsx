import { useState, useCallback, useRef } from 'react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

/**
 * Hook to manage ConfirmDialog state with async/await pattern.
 *
 * @example
 * const { confirm, ConfirmDialog } = useConfirm()
 * const ok = await confirm('¿Eliminar registro?', { variant: 'danger' })
 * if (ok) { ... }
 */
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean
    message: string
    title?: string
    variant?: 'danger' | 'default'
  }>({ open: false, message: '' })

  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback(
    (message: string, options?: { title?: string; variant?: 'danger' | 'default' }): Promise<boolean> => {
      return new Promise((resolve) => {
        resolveRef.current = resolve
        setState({ open: true, message, ...options })
      })
    },
    []
  )

  const handleConfirm = useCallback(() => {
    setState((s) => ({ ...s, open: false }))
    resolveRef.current?.(true)
    resolveRef.current = null
  }, [])

  const handleCancel = useCallback(() => {
    setState((s) => ({ ...s, open: false }))
    resolveRef.current?.(false)
    resolveRef.current = null
  }, [])

  const ConfirmDialogElement = (
    <ConfirmDialog
      open={state.open}
      message={state.message}
      title={state.title}
      variant={state.variant}
      confirmLabel={state.variant === 'danger' ? 'Eliminar' : 'Confirmar'}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return { confirm, ConfirmDialog: ConfirmDialogElement }
}
