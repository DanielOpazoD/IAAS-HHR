import { useEffect } from 'react'

/**
 * Shows the browser's native "Leave page?" dialog when `dirty` is true.
 * Use this to warn users about unsaved form changes.
 */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
}
