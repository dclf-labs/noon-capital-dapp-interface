import { useMemo } from 'react'

import { type Token } from '@/config/token'
import useHyperlaneBridgeAllowance from '@/features/bridge/hooks/evm/useHyperlaneBridgeAllowance'
import useLayerzeroBridgeAllowance from '@/features/bridge/hooks/evm/useLayerzeroBridgeAllowance'
import { type EVMConnection } from '@/lib/connection'
import { toNum } from '@/lib/format'

const useBridgeAllowance = (
  connection: EVMConnection,
  token: Token | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const hyperlaneAllowance = useHyperlaneBridgeAllowance(connection, token)
  const layerzeroAllowance = useLayerzeroBridgeAllowance(connection, token)

  return useMemo(() => {
    if (connection.config?.useHyperlane?.[toNum(destinationConnection?.config?.id)]) {
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
