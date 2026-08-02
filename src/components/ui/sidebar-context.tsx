import { createContext, type Dispatch, type SetStateAction, useContext } from 'react'

export type SidebarContextValue = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  animate: boolean
}

export const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
