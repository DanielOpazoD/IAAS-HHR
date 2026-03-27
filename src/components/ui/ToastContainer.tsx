import type { Toast } from '@/hooks/useToast'

const ICONS: Record<Toast['type'], string> = {
  success: 'M5 13l4 4L19 7',
  error: 'M6 18L18 6M6 6l12 12',
  info: 'M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z',
}

const COLORS: Record<Toast['type'], string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const ICON_COLORS: Record<Toast['type'], string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in ${COLORS[toast.type]}`}
        >
          <svg className={`w-5 h-5 flex-shrink-0 ${ICON_COLORS[toast.type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS[toast.type]} />
          </svg>
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-400 hover:text-gray-600 p-0.5"
            aria-label="Cerrar notificación"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
