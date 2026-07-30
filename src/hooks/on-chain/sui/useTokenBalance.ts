import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import suiConfig from '@/config/chains/sui'
import { SUI_SUSN_COIN_TYPE } from '@/config/chains/sui'
import { type Token } from '@/config/token'
import { isSuiAddressValid, normalizeSuiAddress, type SuiAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { bnToStr, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

type SuiGetBalanceResult = {
  coinType: string
  coinObjectCount: number
  totalBalance: string
}

const NATIVE_SUI_COIN_TYPE = '0x2::sui::SUI'

const getSuiCoinType = (token: Token | undefined): string | undefined => {
  if (!token) return undefined
  if (token.symbol === 'sUSN') return SUI_SUSN_COIN_TYPE
  if (token.symbol === 'SUI' || token.isNative) return NATIVE_SUI_COIN_TYPE
  return undefined
}

/**
 * Fetches a Sui coin balance for a receiver address via `suix_getBalance`.
 * Used for EVM → Sui bridge destination balance display (no Sui wallet adapter).
 */
const useSuiTokenBalance = (
  connection: EVMConnection | undefined,
  token: Token | undefined,
  userAddress: SuiAddress | undefined,
) => {
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
    () => !!normalizedAddress && !!coinType && !!rpcUrl && !!token?.decimals,
    [normalizedAddress, coinType, rpcUrl, token?.decimals],
  )

  const fetcher = async () => {
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

    return toNum(bnToStr(json.result?.totalBalance, token.decimals))
  }

  const { isLoading, isError, data, isFetching } = useQuery({
    queryFn: fetcher,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    queryKey,
    refetchInterval: connection?.config?.dataRefreshInterval,
    enabled: isEnabled,
  })

  return useMemo(
    () => ({
      isLoading,
      isError,
      data: data || 0,
      isFetching,
    }),
    [isLoading, isError, data, isFetching],
  )
}

export default useSuiTokenBalance
