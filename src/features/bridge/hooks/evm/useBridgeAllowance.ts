import { useMemo } from 'react'

import { type Token } from '@/config/token'
import useHyperlaneBridgeAllowance from '@/features/bridge/hooks/evm/useHyperlaneBridgeAllowance'
import useLayerzeroBridgeAllowance from '@/features/bridge/hooks/evm/useLayerzeroBridgeAllowance'
import { isHyperlaneBridgeRoute } from '@/features/bridge/route'
import { type EVMConnection } from '@/lib/connection'

const useBridgeAllowance = (
  connection: EVMConnection,
  token: Token | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const hyperlaneAllowance = useHyperlaneBridgeAllowance(connection, token)
  const layerzeroAllowance = useLayerzeroBridgeAllowance(connection, token)

  return useMemo(() => {
    if (
      isHyperlaneBridgeRoute(connection.config?.useHyperlane, destinationConnection?.config?.id)
    ) {
      return hyperlaneAllowance
    }
    return layerzeroAllowance
  }, [
    connection.config?.useHyperlane,
    destinationConnection?.config?.id,
    hyperlaneAllowance,
    layerzeroAllowance,
  ])
}

export default useBridgeAllowance
