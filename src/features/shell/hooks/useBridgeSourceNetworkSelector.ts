import { useContext } from 'react'

import { BridgeSourceNetworkSelectorContext } from '@/features/shell/network-selector/bridgeSourceNetworkContext'

const useBridgeSourceNetworkSelector = () => useContext(BridgeSourceNetworkSelectorContext)

export default useBridgeSourceNetworkSelector
