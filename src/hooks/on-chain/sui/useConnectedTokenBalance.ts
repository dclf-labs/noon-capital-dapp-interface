import { useMemo } from 'react'

import { useCurrentAccount } from '@mysten/dapp-kit-react'
import { useQuery } from '@tanstack/react-query'

import suiConfig from '@/config/chains/sui'
import { SUI_SUSN_COIN_TYPE } from '@/config/chains/sui'
import { type Token } from '@/config/token'
import { type SuiConnection } from '@/lib/connection'
import { bnToStr, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { useSuiClient } from '@/wallet/sui/legacy-hooks'

const getSuiCoinType = (token: Token | undefined): string | undefined => {
  if (!token) return undefined
  if (token.symbol === 'sUSN') return SUI_SUSN_COIN_TYPE
  if (token.symbol === 'SUI' || token.isNative) return '0x2::sui::SUI'
  return undefined
}

/**
 * Connected-wallet Sui coin balance via dapp-kit client.
 */
const useConnectedTokenBalance = (
  connection: SuiConnection | undefined,
  token: Token | undefined,
) => {
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
      !!token?.decimals &&
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
      return toNum(bnToStr(result.totalBalance, token.decimals))
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
    () => ({
      isLoading: isEnabled ? isLoading : false,
      isError,
      data: isEnabled ? data || 0 : 0,
      isFetching: isEnabled ? isFetching : false,
    }),
    [isLoading, isError, data, isFetching, isEnabled],
  )
}

export default useConnectedTokenBalance
