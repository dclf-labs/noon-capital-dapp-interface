import { type Address } from 'viem'

import { type Token } from '@/config/token'
import useLayerzeroBridgeSubmit from '@/features/bridge/hooks/sui/useLayerzeroBridgeSubmit'
import { isSuiOftSourceConfigured } from '@/features/bridge/lib/sui-oft'
import { isEVMAddressValid } from '@/lib/address'
import { type EVMConnection, type SuiConnection } from '@/lib/connection'

const useBridgeSubmit = (
  connection: SuiConnection | undefined,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  feeQuote: number | undefined,
  destinationConnection: EVMConnection,
) => {
  const layerzeroSubmit = useLayerzeroBridgeSubmit(
    connection,
    tokenIn,
    tokenOut,
    amount,
    receiverAddress,
    feeQuote,
    destinationConnection,
  )

  return isSuiOftSourceConfigured(tokenIn) &&
    !!connection?.config?.defaultGasToken?.decimals &&
    isEVMAddressValid(receiverAddress) &&
    !!amount &&
    !!destinationConnection?.config?.layerzeroOftEid
    ? layerzeroSubmit
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
