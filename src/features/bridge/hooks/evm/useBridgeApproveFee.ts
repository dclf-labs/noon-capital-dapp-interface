import { useMemo } from 'react'

import { type Token } from '@/config/token'
import useHyperlaneBridgeApproveFee from '@/features/bridge/hooks/evm/useHyperlaneBridgeApproveFee'
import useLayerzeroBridgeApproveFee from '@/features/bridge/hooks/evm/useLayerzeroBridgeApproveFee'
import { isHyperlaneBridgeRoute } from '@/features/bridge/route'
import { type EVMConnection } from '@/lib/connection'

const useBridgeApproveFee = (
  connection: EVMConnection,
  token: Token | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const hyperlaneApproveFee = useHyperlaneBridgeApproveFee(connection, token)
  const layerzeroApproveFee = useLayerzeroBridgeApproveFee(connection, token)

  return useMemo(() => {
    if (
      isHyperlaneBridgeRoute(connection.config?.useHyperlane, destinationConnection?.config?.id)
    ) {
      return hyperlaneApproveFee
    }
    return layerzeroApproveFee
  }, [
    connection.config?.useHyperlane,
    destinationConnection?.config?.id,
    hyperlaneApproveFee,
    layerzeroApproveFee,
  ])
}

export default useBridgeApproveFee
