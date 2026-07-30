import { useMemo } from 'react'

import { useReadContract } from '@starknet-react/core'
import { type Abi } from 'starknet'

import { type Token } from '@/config/token'
import ABI from '@/lib/abis/evm/layerzero-hyperlane-token.json'
import type { StarknetAddress } from '@/lib/address'
import { type StarknetConnection } from '@/lib/connection'
import { bnToStr, toNum } from '@/lib/format'

const useTokenBalance = (connection: StarknetConnection | undefined, token: Token | undefined) => {
  const enabled = Boolean(
    connection?.isConnected &&
    connection?.address &&
    token?.contractAddress &&
    !connection.unsupported,
  )

  const { data, isLoading, isError, isFetching } = useReadContract({
    watch: true,
    functionName: 'balance_of',
    address: token?.contractAddress as StarknetAddress,
    args: [connection?.address as StarknetAddress],
    enabled,
    abi: ABI as Abi,
  })

  return useMemo(
    () => ({
      data: enabled ? toNum(bnToStr(data, token?.decimals)) || 0 : 0,
      isLoading: enabled ? isLoading : false,
      isError,
      isFetching: enabled ? isFetching : false,
    }),
    [data, enabled, isError, isFetching, isLoading, token?.decimals],
  )
}

export default useTokenBalance
