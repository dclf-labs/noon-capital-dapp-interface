import { useMemo } from 'react'

import { useReadContract } from '@starknet-react/core'
import { type Abi } from 'starknet'
import { type Address } from 'viem'

import { type Token } from '@/config/token'
import { BRIDGE_QUOTE_FEE_MULTIPLIER } from '@/constants/common'
import { starknetAbis } from '@/lib/abis'
import { type EVMConnection, type StarknetConnection } from '@/lib/connection'
import { bnToStr, toBn, toNum } from '@/lib/format'

const useHyperlaneBridgeFeeQuote = (
  connection: StarknetConnection,
  tokenIn: Token | undefined,
  _amount: number | undefined,
  _receiverAddress: Address | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  // `quote_gas_payment` only needs the destination Hyperlane domain — amount and
  // receiver are unused by the call (kept in the signature for hook parity).
  const { isLoading, isError, isFetching, data } = useReadContract({
    watch: true,
    functionName: 'quote_gas_payment',
    address: tokenIn?.contractAddress as Address,
    args: [toBn(destinationConnection?.config?.hyperlaneDomain)],
    enabled:
      !!tokenIn?.contractAddress &&
      !!connection?.config?.hyperlaneDomain &&
      !!destinationConnection?.config?.hyperlaneDomain &&
      !!tokenIn?.decimals &&
      !!connection?.isConnected,
    abi: starknetAbis.layerzeroHyperlaneToken as Abi,
  })

  return useMemo(() => {
    const native =
      data == null
        ? undefined
        : toNum(bnToStr(toBn(data), connection?.config?.defaultGasToken?.decimals)) *
          BRIDGE_QUOTE_FEE_MULTIPLIER
    return {
      isLoading,
      isError,
      isFetching,
      /** Native STRK amount; `undefined` until the quote is ready (not `0`). */
      data: native != null && native > 0 ? native : undefined,
    }
  }, [isLoading, isError, isFetching, data, connection?.config?.defaultGasToken?.decimals])
}

export default useHyperlaneBridgeFeeQuote
