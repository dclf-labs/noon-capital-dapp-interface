import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { type Token } from '@/config/token'
import { DEFAULT_COLLATERAL_PRICE, REFETCH_INTERVAL_COLLATERAL_PRICE } from '@/constants/api'
import { down, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

const useCollateralPrice = (token: Token | undefined) => {
  const fetcher = async (_token?: Token | undefined) => {
    return DEFAULT_COLLATERAL_PRICE
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    queryFn: async () => await fetcher(token),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    refetchInterval: REFETCH_INTERVAL_COLLATERAL_PRICE,
    queryKey: queryKeys.price.collateral(token?.symbol?.toString()),
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

export default useCollateralPrice
