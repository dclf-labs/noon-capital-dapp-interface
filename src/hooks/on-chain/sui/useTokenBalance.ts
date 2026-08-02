import { useMemo } from 'react'

import { useCurrentAccount } from '@mysten/dapp-kit-react'
import { useQuery } from '@tanstack/react-query'

import suiConfig from '@/config/chains/sui'
import { type Token } from '@/config/token'
import { IDLE_TOKEN_QUERY, type TokenQueryResult } from '@/hooks/on-chain/types'
import { type SuiConnection } from '@/lib/connection'
import { rawUnitsToNumber } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { getSuiCoinType } from '@/lib/sui-coin'
import { useSuiClient } from '@/wallet/sui/legacy-hooks'

/**
 * Connected-wallet Sui coin balance via dapp-kit client.
 */
const useTokenBalance = (
  connection: SuiConnection | undefined,
  token: Token | undefined,
): TokenQueryResult => {
  const client = useSuiClient()
  const account = useCurrentAccount()
  const address = connection?.address || account?.address
  const coinType = useMemo(() => getSuiCoinType(token), [token])

  const queryKey = useMemo(
    () => queryKeys.token.balanceConnected('sui', coinType, address, connection?.config?.id),
    [coinType, address, connection?.config?.id],
  )

  const isEnabled = useMemo(
    () =>
      !!address &&
      !!coinType &&
      token?.decimals != null &&
      !!connection?.isConnected &&
      !connection?.unsupported,
    [address, coinType, token?.decimals, connection?.isConnected, connection?.unsupported],
  )

  const { isLoading, isError, data, isFetching } = useQuery({
    queryFn: async () => {
      if (!address || !coinType || !token) {
        throw new Error('Sui connection not found or invalid parameters')
      }

      const result = await client.getBalance({ owner: address, coinType })
      return rawUnitsToNumber(result.totalBalance, token.decimals)
    },
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    queryKey,
    refetchInterval: connection?.config?.dataRefreshInterval || suiConfig.dataRefreshInterval,
    enabled: isEnabled,
  })

  return useMemo(
    () =>
      isEnabled
        ? {
            data: data || 0,
            isLoading,
            isError,
            isFetching,
          }
        : IDLE_TOKEN_QUERY,
    [data, isEnabled, isError, isFetching, isLoading],
  )
}

export default useTokenBalance
