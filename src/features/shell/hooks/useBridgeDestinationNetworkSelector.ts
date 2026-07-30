import { useContext } from 'react'

import { BridgeDestinationNetworkSelectorContext } from '@/features/shell/network-selector/bridgeDestinationNetworkContext'

const useBridgeDestinationNetworkSelector = () =>
  useContext(BridgeDestinationNetworkSelectorContext)

export default useBridgeDestinationNetworkSelector
