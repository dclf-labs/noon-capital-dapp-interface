import { type Address } from 'viem'

import { type Token } from '@/config/token'
import useLayerzeroBridgeSubmitFee from '@/features/bridge/hooks/sui/useLayerzeroBridgeSubmitFee'
import { type EVMConnection, type SuiConnection } from '@/lib/connection'

const useBridgeSubmitFee = (
  connection: SuiConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  nativeFee: number | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  return useLayerzeroBridgeSubmitFee(
    connection,
    tokenIn,
    tokenOut,
    amount,
    receiverAddress,
    nativeFee,
    destinationConnection,
  )
}

export default useBridgeSubmitFee
