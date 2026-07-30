import { useMemo } from 'react'

import { type Address } from 'viem'

import { type Token } from '@/config/token'
import { STARKNET_BRIDGE_DESTINATION } from '@/constants/common'
import useHyperlaneBridgeFeeQuote from '@/features/bridge/hooks/evm/useHyperlaneBridgeFeeQuote'
import useLayerzeroBridgeFeeQuote from '@/features/bridge/hooks/evm/useLayerzeroBridgeFeeQuote'
import { type EVMConnection } from '@/lib/connection'
import { toNum } from '@/lib/format'

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
      destinationConnection?.config?.id === STARKNET_BRIDGE_DESTINATION?.id ||
      connection.config?.useHyperlane?.[toNum(destinationConnection?.config?.id)]
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
