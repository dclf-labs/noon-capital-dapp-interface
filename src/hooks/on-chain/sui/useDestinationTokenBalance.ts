import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import suiConfig from '@/config/chains/sui'
import { type Token } from '@/config/token'
import type { ProtocolChainConfig } from '@/config/types'
import { IDLE_TOKEN_QUERY, type TokenQueryResult } from '@/hooks/on-chain/types'
import { isSuiAddressValid, normalizeSuiAddress, type SuiAddress } from '@/lib/address'
import { rawUnitsToNumber } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { getSuiCoinType } from '@/lib/sui-coin'

type SuiGetBalanceResult = {
  coinType: string
  coinObjectCount: number
  totalBalance: string
}

/** Read-only destination sessions may be plain EVMConnection stubs (no chainFamily). */
type DestinationSession = {
  address?: string | undefined
  config?: ProtocolChainConfig | undefined
}

/**
 * Sui coin balance for a bridge destination / typed receiver via `suix_getBalance`.
 * Does not require a connected Sui wallet.
 */
const useDestinationTokenBalance = (
  connection: DestinationSession | undefined,
  token: Token | undefined,
  userAddress: SuiAddress | undefined,
): TokenQueryResult => {
  const address = (connection?.address || userAddress) as SuiAddress | undefined
  const normalizedAddress = useMemo(
    () => (address && isSuiAddressValid(address) ? normalizeSuiAddress(address) : undefined),
    [address],
  )
  const coinType = useMemo(() => getSuiCoinType(token), [token])
  const rpcUrl = connection?.config?.rpcUrl || suiConfig.rpcUrl

  const queryKey = useMemo(
    () => queryKeys.token.balance('sui', coinType, normalizedAddress, connection?.config?.id),
    [coinType, normalizedAddress, connection?.config?.id],
  )

  const isEnabled = useMemo(
    () => !!normalizedAddress && !!coinType && !!rpcUrl && token?.decimals != null,
    [normalizedAddress, coinType, rpcUrl, token?.decimals],
  )

  const { isLoading, isError, data, isFetching } = useQuery({
    queryFn: async () => {
      if (!normalizedAddress || !coinType || !rpcUrl || !token) {
        throw new Error('Sui connection not found or invalid parameters')
      }

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'suix_getBalance',
          params: [normalizedAddress, coinType],
        }),
      })

      if (!response.ok) {
        throw new Error(`Sui RPC error: ${response.status}`)
      }

      const json = (await response.json()) as {
        result?: SuiGetBalanceResult
        error?: { message: string }
      }

      if (json.error) {
        throw new Error(json.error.message)
      }

      return rawUnitsToNumber(json.result?.totalBalance, token.decimals)
    },
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    queryKey,
    refetchInterval: connection?.config?.dataRefreshInterval,
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
        : { ...IDLE_TOKEN_QUERY, isError },
    [data, isEnabled, isError, isFetching, isLoading],
  )
}

export default useDestinationTokenBalance
