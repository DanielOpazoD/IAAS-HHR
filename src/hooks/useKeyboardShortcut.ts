import { useEffect } from 'react'

/**
 * Registers a keyboard shortcut. Calls handler when the key combo is pressed.
 * Automatically cleans up on unmount.
 */
export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  options: { ctrl?: boolean; disabled?: boolean } = {}
) {
  const { ctrl = false, disabled = false } = options

  useEffect(() => {
    if (disabled) return

    const onKeyDown = (e: KeyboardEvent) => {
      const ctrlMatch = ctrl ? (e.ctrlKey || e.metaKey) : true
      if (ctrlMatch && e.key === key) {
        e.preventDefault()
        handler()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [key, handler, ctrl, disabled])
}
