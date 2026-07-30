import { useMemo } from 'react'

import { useReadContract } from '@starknet-react/core'
import { type Abi } from 'starknet'
import { type Address } from 'viem'

import { type Token } from '@/config/token'
import { BRIDGE_QUOTE_FEE_MULTIPLIER } from '@/constants/common'
import ABI from '@/lib/abis/evm/layerzero-hyperlane-token.json'
import { type EVMConnection, type StarknetConnection } from '@/lib/connection'
import { bnToStr, toBn, toNum } from '@/lib/format'

const useHyperlaneBridgeFeeQuote = (
  connection: StarknetConnection,
  tokenIn: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const { isLoading, isError, isFetching, data } = useReadContract({
    watch: true,
    functionName: 'quote_gas_payment',
    address: tokenIn?.contractAddress as Address,
    args: [toBn(destinationConnection?.config?.hyperlaneDomain)],
    enabled:
      !!tokenIn?.contractAddress &&
      !!connection?.config?.hyperlaneDomain &&
      !!destinationConnection?.config?.hyperlaneDomain &&
      !!receiverAddress &&
      !!amount &&
      !!tokenIn &&
      !!tokenIn?.decimals &&
      !!connection?.isConnected,
    abi: ABI as Abi,
  })

  return useMemo(() => {
    return {
      isLoading,
      isError,
      isFetching,
      data:
        toNum(bnToStr(toBn(data), connection?.config?.defaultGasToken?.decimals)) *
        BRIDGE_QUOTE_FEE_MULTIPLIER,
    }
  }, [isLoading, isError, isFetching, data, connection?.config?.defaultGasToken?.decimals])
}

export default useHyperlaneBridgeFeeQuote
