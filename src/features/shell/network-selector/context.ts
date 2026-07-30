import { createContext } from 'react'

export type NetworkSelectorProviderProps = {
  children: React.ReactNode
}

export type NetworkSelectorProviderState = {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  onOpenChange: (isOpen: boolean) => void
  onToggle: () => void
}

const initialState: NetworkSelectorProviderState = {
  isOpen: false,
  onOpen: () => null,
  onClose: () => null,
  onToggle: () => null,
  onOpenChange: () => null,
}

export const NetworkSelectorDialogContext =
  createContext<NetworkSelectorProviderState>(initialState)
