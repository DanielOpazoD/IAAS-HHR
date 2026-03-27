import { useState, useCallback, useRef } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

/**
 * Hook for showing temporary toast notifications.
 * Returns { toasts, addToast, removeToast } and a pre-built ToastContainer.
 */
export function useToast(duration = 3500) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'success') => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, message, type }])
      const timer = setTimeout(() => removeToast(id), duration)
      timersRef.current.set(id, timer)
      return id
    },
    [duration, removeToast]
  )

  return { toasts, addToast, removeToast }
}
