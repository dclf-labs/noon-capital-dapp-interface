import { useMemo, useState } from 'react'

import {
  BridgeSourceNetworkSelectorContext,
  type BridgeSourceNetworkSelectorProviderProps,
} from '@/features/shell/network-selector/bridgeSourceNetworkContext'

export const BridgeSourceNetworkSelectorProvider = ({
  children,
}: BridgeSourceNetworkSelectorProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  const onToggle = () => setIsOpen((isOpen) => !isOpen)
  const onOpenChange = (open: boolean) => setIsOpen(open)

  const value = useMemo(() => ({ isOpen, onOpen, onClose, onToggle, onOpenChange }), [isOpen])

  return (
    <BridgeSourceNetworkSelectorContext.Provider value={value}>
      {children}
    </BridgeSourceNetworkSelectorContext.Provider>
  )
}

export default BridgeSourceNetworkSelectorProvider
