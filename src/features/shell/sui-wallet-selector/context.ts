import { createContext } from 'react'

export type SuiWalletSelectorProviderProps = {
  children: React.ReactNode
}

export type SuiWalletSelectorProviderState = {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  onOpenChange: (isOpen: boolean) => void
  onToggle: () => void
}

const initialState: SuiWalletSelectorProviderState = {
  isOpen: false,
  onOpen: () => null,
  onClose: () => null,
  onToggle: () => null,
  onOpenChange: () => null,
}

export const SuiWalletSelectorContext = createContext<SuiWalletSelectorProviderState>(initialState)
