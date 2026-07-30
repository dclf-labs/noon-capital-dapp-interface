import { useMemo } from 'react'

import { type Address } from 'viem'

import { type Token } from '@/config/token'
import { STARKNET_BRIDGE_DESTINATION } from '@/constants/common'
import useHyperlaneBridgeSubmitFee from '@/features/bridge/hooks/evm/useHyperlaneBridgeSubmitFee'
import useLayerzeroBridgeSubmitFee from '@/features/bridge/hooks/evm/useLayerzeroBridgeSubmitFee'
import { type EVMConnection } from '@/lib/connection'
import { toNum } from '@/lib/format'

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
      destinationConnection?.config?.id === STARKNET_BRIDGE_DESTINATION?.id ||
      connection.config?.useHyperlane?.[toNum(destinationConnection?.config?.id)]
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
