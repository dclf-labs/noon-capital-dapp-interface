import { createContext } from 'react'

export type ChainFamilySelectorModalProviderProps = {
  children: React.ReactNode
}

export type ChainFamilySelectorModalProviderState = {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  onOpenChange: (isOpen: boolean) => void
  onToggle: () => void
}

const initialState: ChainFamilySelectorModalProviderState = {
  isOpen: false,
  onOpen: () => null,
  onClose: () => null,
  onToggle: () => null,
  onOpenChange: () => null,
}

export const ChainFamilySelectorModalContext =
  createContext<ChainFamilySelectorModalProviderState>(initialState)
