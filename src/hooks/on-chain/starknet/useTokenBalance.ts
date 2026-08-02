import { useMemo } from 'react'

import { useReadContract } from '@starknet-react/core'
import { type Abi } from 'starknet'

import { type Token } from '@/config/token'
import { IDLE_TOKEN_QUERY, type TokenQueryResult } from '@/hooks/on-chain/types'
import { starknetAbis } from '@/lib/abis'
import type { StarknetAddress } from '@/lib/address'
import { isStarknetAddressValid } from '@/lib/address'
import { type StarknetConnection } from '@/lib/connection'
import { rawUnitsToNumber } from '@/lib/format'

const useTokenBalance = (
  connection: StarknetConnection | undefined,
  token: Token | undefined,
): TokenQueryResult => {
  const enabled = Boolean(
    connection?.isConnected &&
    isStarknetAddressValid(connection?.address) &&
    isStarknetAddressValid(token?.contractAddress) &&
    !connection.unsupported,
  )

  const { data, isLoading, isError, isFetching } = useReadContract({
    watch: true,
    functionName: 'balance_of',
    address: token?.contractAddress as StarknetAddress,
    args: [connection?.address as StarknetAddress],
    enabled,
    abi: starknetAbis.layerzeroHyperlaneToken as Abi,
  })

  return useMemo(
    () =>
      enabled
        ? {
            data: rawUnitsToNumber(data, token?.decimals),
            isLoading,
            isError,
            isFetching,
          }
        : { ...IDLE_TOKEN_QUERY, isError },
    [data, enabled, isError, isFetching, isLoading, token?.decimals],
  )
}

export default useTokenBalance
