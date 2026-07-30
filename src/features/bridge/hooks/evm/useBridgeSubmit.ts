import { useMemo } from 'react'

import { STARKNET_BRIDGE_DESTINATION } from '@/constants/common'
import useHyperlaneBridgeSubmit from '@/features/bridge/hooks/evm/useHyperlaneBridgeSubmit'
import useLayerzeroBridgeSubmit from '@/features/bridge/hooks/evm/useLayerzeroBridgeSubmit'
import { type EVMConnection } from '@/lib/connection'
import { toNum } from '@/lib/format'

const useBridgeSubmit = (
  connection: EVMConnection,
  destinationConnection: EVMConnection | undefined,
) => {
  const hyperlaneSubmit = useHyperlaneBridgeSubmit()
  const layerzeroSubmit = useLayerzeroBridgeSubmit()

  return useMemo(() => {
    if (
      destinationConnection?.config?.id === STARKNET_BRIDGE_DESTINATION?.id ||
      connection.config?.useHyperlane?.[toNum(destinationConnection?.config?.id)]
    ) {
      return hyperlaneSubmit
    }

    return layerzeroSubmit
  }, [
    connection.config?.useHyperlane,
    destinationConnection?.config?.id,
    hyperlaneSubmit,
    layerzeroSubmit,
  ])
}

export default useBridgeSubmit
