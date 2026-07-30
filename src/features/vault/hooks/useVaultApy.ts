import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { REFETCH_INTERVAL_COLLATERAL_PRICE } from '@/constants/api'
import { down } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

const useVaultApy = () => {
  const fetcher = async () => {
    return await fetch(
      `https://app.lagoon.finance/api/vault?chainId=239&address=0x279385c180f5d01c4a4bdff040f17b8957304762&includeApr=true`,
    )
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch yield app tvl.')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((data) => {
        return {
          apy: down(data?.state?.monthlyApr?.weeklyApr, 3),
        }
      })
      .catch((err) => {
        console.error('Error fetching yield app tvl:', err)
        return {
          apy: down(1.06, 2),
        }
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    queryFn: async () => await fetcher(),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    refetchInterval: REFETCH_INTERVAL_COLLATERAL_PRICE,
    queryKey: queryKeys.vault.lagoonApy(),
    enabled: true,
    select: (data) => {
      return {
        apy: down(data?.apy || 1.06, 2),
      }
    },
  })

  return useMemo(
    () => ({
      data: data || {
        apy: down(1.06, 2),
      },
      isError,
      isLoading,
      isFetching: isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default useVaultApy
