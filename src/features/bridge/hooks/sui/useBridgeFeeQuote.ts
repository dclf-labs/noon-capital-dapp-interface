import { type Address } from 'viem'

import { type Token } from '@/config/token'
import useLayerzeroBridgeFeeQuote from '@/features/bridge/hooks/sui/useLayerzeroBridgeFeeQuote'
import { type EVMConnection, type SuiConnection } from '@/lib/connection'

const useBridgeFeeQuote = (
  connection: SuiConnection,
  tokenIn: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  return useLayerzeroBridgeFeeQuote(
    connection,
    tokenIn,
    amount,
    receiverAddress,
    destinationConnection,
  )
}

export default useBridgeFeeQuote
