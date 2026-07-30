import { createContext } from 'react'

export type SidebarCardStackTabsItem = 'tvl' | 'apy-7d' | 'apy-28d'

export type SidebarCardStackTabsProps = {
  children: React.ReactNode
}

export type SidebarCardStackTabsState = {
  activeCardId: SidebarCardStackTabsItem
  setActiveCardId: (id: SidebarCardStackTabsItem) => void
}

export const initialState: SidebarCardStackTabsState = {
  activeCardId: 'tvl',
  setActiveCardId: () => null,
}

export const SidebarCardStackTabsStateProviderContext =
  createContext<SidebarCardStackTabsState>(initialState)
