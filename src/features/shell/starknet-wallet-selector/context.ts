import { createContext } from 'react'

export type StarknetWalletSelectorProviderProps = {
  children: React.ReactNode
}

export type StarknetWalletSelectorProviderState = {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  onOpenChange: (isOpen: boolean) => void
  onToggle: () => void
}

const initialState: StarknetWalletSelectorProviderState = {
  isOpen: false,
  onOpen: () => null,
  onClose: () => null,
  onToggle: () => null,
  onOpenChange: () => null,
}

export const StarknetWalletSelectorContext =
  createContext<StarknetWalletSelectorProviderState>(initialState)
