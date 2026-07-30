import { useMemo, useState } from 'react'

import {
  NetworkSelectorDialogContext,
  type NetworkSelectorProviderProps,
} from '@/features/shell/network-selector/context'

export const NetworkSelectorDialogProvider = ({ children }: NetworkSelectorProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  const onToggle = () => setIsOpen((isOpen) => !isOpen)
  const onOpenChange = (open: boolean) => setIsOpen(open)

  const value = useMemo(() => ({ isOpen, onOpen, onClose, onToggle, onOpenChange }), [isOpen])

  return (
    <NetworkSelectorDialogContext.Provider value={value}>
      {children}
    </NetworkSelectorDialogContext.Provider>
  )
}

export default NetworkSelectorDialogProvider
