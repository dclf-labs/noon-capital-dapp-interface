import { useMemo } from 'react'

import useHyperlaneBridgeSubmit from '@/features/bridge/hooks/evm/useHyperlaneBridgeSubmit'
import useLayerzeroBridgeSubmit from '@/features/bridge/hooks/evm/useLayerzeroBridgeSubmit'
import { isHyperlaneBridgeRoute } from '@/features/bridge/route'
import { type EVMConnection } from '@/lib/connection'

const useBridgeSubmit = (
  connection: EVMConnection,
  destinationConnection: EVMConnection | undefined,
) => {
  const hyperlaneSubmit = useHyperlaneBridgeSubmit()
  const layerzeroSubmit = useLayerzeroBridgeSubmit()

  return useMemo(() => {
    if (
      isHyperlaneBridgeRoute(connection.config?.useHyperlane, destinationConnection?.config?.id)
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
