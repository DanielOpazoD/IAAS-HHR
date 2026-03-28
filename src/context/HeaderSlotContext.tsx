import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

interface HeaderSlotContextValue {
  slot: ReactNode
  setSlot: (node: ReactNode) => void
  clearSlot: () => void
}

const HeaderSlotContext = createContext<HeaderSlotContextValue>({
  slot: null,
  setSlot: () => {},
  clearSlot: () => {},
})

// eslint-disable-next-line react-refresh/only-export-components
export const useHeaderSlot = () => useContext(HeaderSlotContext)

export function HeaderSlotProvider({ children }: { children: ReactNode }) {
  const [slot, setSlotState] = useState<ReactNode>(null)
  const setSlot = useCallback((node: ReactNode) => setSlotState(node), [])
  const clearSlot = useCallback(() => setSlotState(null), [])

  return (
    <HeaderSlotContext.Provider value={{ slot, setSlot, clearSlot }}>
      {children}
    </HeaderSlotContext.Provider>
  )
}
