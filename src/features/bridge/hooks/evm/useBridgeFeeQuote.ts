import { useMemo } from 'react'

import { type Address } from 'viem'

import { type Token } from '@/config/token'
import useHyperlaneBridgeFeeQuote from '@/features/bridge/hooks/evm/useHyperlaneBridgeFeeQuote'
import useLayerzeroBridgeFeeQuote from '@/features/bridge/hooks/evm/useLayerzeroBridgeFeeQuote'
import { isHyperlaneBridgeRoute } from '@/features/bridge/route'
import { type EVMConnection } from '@/lib/connection'

const useBridgeFeeQuote = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const hyperlaneQuote = useHyperlaneBridgeFeeQuote(
    connection,
    tokenIn,
    tokenOut,
    amount,
    receiverAddress,
    destinationConnection,
  )

  const layerzeroQuote = useLayerzeroBridgeFeeQuote(
    connection,
    tokenIn,
    tokenOut,
    amount,
    receiverAddress,
    destinationConnection,
  )

  return useMemo(() => {
    if (
      isHyperlaneBridgeRoute(connection.config?.useHyperlane, destinationConnection?.config?.id)
    ) {
      return hyperlaneQuote
    }
    return layerzeroQuote
  }, [
    connection.config?.useHyperlane,
    destinationConnection?.config?.id,
    hyperlaneQuote,
    layerzeroQuote,
  ])
}

export default useBridgeFeeQuote
