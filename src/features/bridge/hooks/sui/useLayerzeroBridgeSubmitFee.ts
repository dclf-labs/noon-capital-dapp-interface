import { useMemo } from 'react'

import { type Address } from 'viem'

import { type Token } from '@/config/token'
import { type EVMConnection, type SuiConnection } from '@/lib/connection'
import { toNum } from '@/lib/format'

/** Sui gas is paid with the LZ native fee + PTB gas; surface LZ fee as submit fee proxy. */
const useLayerzeroBridgeSubmitFee = (
  _connection: SuiConnection,
  _tokenIn: Token | undefined,
  _tokenOut: Token | undefined,
  _amount: number | undefined,
  _receiverAddress: Address | undefined,
  nativeFee: number | undefined,
  _destinationConnection: EVMConnection | undefined,
) => {
  return useMemo(
    () => ({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: toNum(nativeFee),
      gasUsed: 0n,
    }),
    [nativeFee],
  )
}

export default useLayerzeroBridgeSubmitFee
