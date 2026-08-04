import { useMemo } from 'react'

import { type Address } from 'viem'

import { type Token } from '@/config/token'
import { type EVMConnection, type SuiConnection } from '@/lib/connection'

/**
 * Sui PTB execution gas is not estimated yet.
 * UI “Bridge fee” comes from the LZ `quoteSend` native fee; do not reuse that
 * quote here or the UI double-counts it as both Bridge and Network.
 */
const useLayerzeroBridgeSubmitFee = (
  _connection: SuiConnection,
  _tokenIn: Token | undefined,
  _tokenOut: Token | undefined,
  _amount: number | undefined,
  _receiverAddress: Address | undefined,
  _nativeFee: number | undefined,
  _destinationConnection: EVMConnection | undefined,
) => {
  return useMemo(
    () => ({
      isLoading: false,
      isError: false,
      isFetching: false,
      /** USD notional — unavailable until PTB gas is estimated. */
      data: 0,
      native: 0,
      gasUsed: 0n,
      isReady: false,
    }),
    [],
  )
}

export default useLayerzeroBridgeSubmitFee
