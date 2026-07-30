import { createContext } from 'react'

export type BridgeDestinationNetworkSelectorProviderProps = {
  children: React.ReactNode
}

export type BridgeDestinationNetworkSelectorProviderState = {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  onOpenChange: (isOpen: boolean) => void
  onToggle: () => void
}

const initialState: BridgeDestinationNetworkSelectorProviderState = {
  isOpen: false,
  onOpen: () => null,
  onClose: () => null,
  onToggle: () => null,
  onOpenChange: () => null,
}

export const BridgeDestinationNetworkSelectorContext =
  createContext<BridgeDestinationNetworkSelectorProviderState>(initialState)
