import { useMemo } from 'react'

import { type Address } from 'viem'

import { type Token } from '@/config/token'
import useHyperlaneBridgeSubmitFee from '@/features/bridge/hooks/evm/useHyperlaneBridgeSubmitFee'
import useLayerzeroBridgeSubmitFee from '@/features/bridge/hooks/evm/useLayerzeroBridgeSubmitFee'
import { isHyperlaneBridgeRoute } from '@/features/bridge/route'
import { type EVMConnection } from '@/lib/connection'

const useBridgeSubmitFee = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  feeQuote: number | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const hyperlaneSubmitFee = useHyperlaneBridgeSubmitFee(
    connection,
    tokenIn,
    tokenOut,
    amount,
    receiverAddress,
    feeQuote,
    destinationConnection,
  )

  const layerzeroSubmitFee = useLayerzeroBridgeSubmitFee(
    connection,
    tokenIn,
    tokenOut,
    amount,
    receiverAddress,
    feeQuote,
    destinationConnection,
  )

  return useMemo(() => {
    if (
      isHyperlaneBridgeRoute(connection.config?.useHyperlane, destinationConnection?.config?.id)
    ) {
      return hyperlaneSubmitFee
    }
    return layerzeroSubmitFee
  }, [
    connection.config?.useHyperlane,
    destinationConnection?.config?.id,
    hyperlaneSubmitFee,
    layerzeroSubmitFee,
  ])
}

export default useBridgeSubmitFee
