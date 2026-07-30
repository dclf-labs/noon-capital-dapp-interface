import { type Address } from 'viem'

import { type Token } from '@/config/token'
import useHyperlaneBridgeFeeQuote from '@/features/bridge/hooks/starknet/useHyperlaneBridgeFeeQuote'
import { type EVMConnection, type StarknetConnection } from '@/lib/connection'

const useBridgeFeeQuote = (
  connection: StarknetConnection,
  tokenIn: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const hyperlaneQuote = useHyperlaneBridgeFeeQuote(
    connection,
    tokenIn,
    amount,
    receiverAddress,
    destinationConnection,
  )

  return hyperlaneQuote
}

export default useBridgeFeeQuote
