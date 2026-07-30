import { createContext } from 'react'

export type BridgeSourceNetworkSelectorProviderProps = {
  children: React.ReactNode
}

export type BridgeSourceNetworkSelectorProviderState = {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  onOpenChange: (isOpen: boolean) => void
  onToggle: () => void
}

const initialState: BridgeSourceNetworkSelectorProviderState = {
  isOpen: false,
  onOpen: () => null,
  onClose: () => null,
  onToggle: () => null,
  onOpenChange: () => null,
}

export const BridgeSourceNetworkSelectorContext =
  createContext<BridgeSourceNetworkSelectorProviderState>(initialState)
