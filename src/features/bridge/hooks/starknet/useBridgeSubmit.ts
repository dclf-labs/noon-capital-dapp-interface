import { type Address } from 'viem'

import { type Token } from '@/config/token'
import useHyperlaneBridgeSubmit from '@/features/bridge/hooks/starknet/useHyperlaneBridgeSubmit'
import { isEVMAddressValid } from '@/lib/address'
import { type EVMConnection, type StarknetConnection } from '@/lib/connection'

const useBridgeSubmit = (
  connection: StarknetConnection | undefined,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  feeQuote: number | undefined,
  destinationConnection: EVMConnection,
) => {
  const hyperlaneSubmit = useHyperlaneBridgeSubmit(
    connection,
    tokenIn,
    tokenOut,
    amount,
    receiverAddress,
    feeQuote,
    destinationConnection,
  )

  return !!tokenIn?.hyperlane &&
    !!connection?.config?.defaultGasToken?.decimals &&
    !!connection?.config?.hyperlaneMailbox &&
    !!connection?.config?.hyperlaneDomain &&
    isEVMAddressValid(receiverAddress) &&
    !!amount &&
    !!destinationConnection?.config?.hyperlaneDomain
    ? hyperlaneSubmit
    : {
        mutationStatus: {
          isPending: false,
          isError: false,
          isSuccess: false,
        },
        onSubmit: () => {},
        txnHash: undefined,
      }
}

export default useBridgeSubmit
