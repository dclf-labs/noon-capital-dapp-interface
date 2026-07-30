import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { type Token } from '@/config/token'
import { DEFAULT_COLLATERAL_PRICE, REFETCH_INTERVAL_COLLATERAL_PRICE } from '@/constants/api'
import { appEnv } from '@/lib/env'
import { down, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

export type GeckoPriceToken = {
  symbol: string
  price: string
  chain: string
  coingeckoId: string
}

export type GeckoPriceResponse = {
  [chain: string]: {
    chain: string
    gasPrice: string
    tokens: GeckoPriceToken[]
  }
}

const useGeckoPrice = (token: Token | undefined) => {
  const fetcher = async (token?: Token | undefined) => {
    return await fetch(`${appEnv.api.baseUrl}/api/v1/comprehensive-pricing`)
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch gecko price quote.')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json as GeckoPriceResponse)
      .then((data) => {
        const allTokens = Object.values(data || {})
          .filter((item) => item && Array.isArray(item?.tokens))
          .flatMap((item) => item?.tokens || [])

        return toNum(allTokens?.find((t) => !!t?.symbol && t?.symbol === token?.symbol)?.price || 1)
      })
      .catch((err) => {
        console.error('Error fetching gecko price quote:', err)
        return DEFAULT_COLLATERAL_PRICE
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    queryFn: async () => await fetcher(token),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    refetchInterval: REFETCH_INTERVAL_COLLATERAL_PRICE,
    queryKey: queryKeys.price.gecko(token?.symbol?.toString()),
    enabled: !!token?.symbol,
    select: (data) => {
      return down(toNum(data || 1) || 1, 3)
    },
  })

  return useMemo(
    () => ({
      data: data || 1,
      isError,
      isLoading,
      isFetching: isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default useGeckoPrice
