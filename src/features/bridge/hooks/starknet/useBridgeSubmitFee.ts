import { type Address } from 'viem'

import { type Token } from '@/config/token'
import useHyperlaneBridgeSubmitFee from '@/features/bridge/hooks/starknet/useHyperlaneBridgeSubmitFee'
import { type EVMConnection, type StarknetConnection } from '@/lib/connection'

const useBridgeSubmitFee = (
  connection: StarknetConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  nativeFee: number | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const hyperlaneSubmitFee = useHyperlaneBridgeSubmitFee(
    connection,
    tokenIn,
    tokenOut,
    amount,
    receiverAddress,
    nativeFee,
    destinationConnection,
  )

  return hyperlaneSubmitFee
}

export default useBridgeSubmitFee
