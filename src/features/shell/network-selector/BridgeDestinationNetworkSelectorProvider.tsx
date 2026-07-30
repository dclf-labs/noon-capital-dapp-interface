import { useMemo, useState } from 'react'

import {
  BridgeDestinationNetworkSelectorContext,
  type BridgeDestinationNetworkSelectorProviderProps,
} from '@/features/shell/network-selector/bridgeDestinationNetworkContext'

export const BridgeDestinationNetworkSelectorProvider = ({
  children,
}: BridgeDestinationNetworkSelectorProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  const onToggle = () => setIsOpen((isOpen) => !isOpen)
  const onOpenChange = (open: boolean) => setIsOpen(open)

  const value = useMemo(() => ({ isOpen, onOpen, onClose, onToggle, onOpenChange }), [isOpen])

  return (
    <BridgeDestinationNetworkSelectorContext.Provider value={value}>
      {children}
    </BridgeDestinationNetworkSelectorContext.Provider>
  )
}

export default BridgeDestinationNetworkSelectorProvider
