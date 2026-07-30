import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { REFETCH_INTERVAL_COLLATERAL_PRICE } from '@/constants/api'
import { bnToStr, down } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

const useVesuVaultTvl = () => {
  const fetcher = async () => {
    return await fetch(`https://api.vesu.xyz/vaults`)
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch vesu vault tvl.')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((data) => {
        return data?.data || []
      })
      .then((vaults) =>
        vaults
          ?.filter(
            (v: { address: string }) =>
              v?.address?.toLowerCase() ===
                '0x04424dec8280f518b35be33139f44ef9fa0855b117f16cda2a30f1b64c27864a'.toLowerCase() ||
              v?.address?.toLowerCase() ===
                '0x4424dec8280f518b35be33139f44ef9fa0855b117f16cda2a30f1b64c27864a'.toLowerCase(),
          )
          ?.at(0),
      )
      .then((data) => {
        return {
          tvl: down(bnToStr(data?.stats?.tvl?.assets?.value, 18), 3),
          tvlUsd: down(bnToStr(data?.stats?.tvl?.usd?.value, 18), 3),
          apy: down(bnToStr(data?.stats?.apr?.thirtyDays?.value, 16), 3),
          assetToShareRatio: down(bnToStr(data?.sharePrice?.value, 18), 3),
        }
      })
      .catch((err) => {
        console.error('Error fetching vesu vault tvl:', err)
        return {
          tvl: down(5.16, 3),
          tvlUsd: down(365490, 3),
          apy: down(5.48, 2),
          assetToShareRatio: down(1, 3),
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
    queryKey: queryKeys.vesu.tvl(),
    enabled: true,
    select: (data) => {
      return data
    },
  })

  return useMemo(
    () => ({
      data: data,
      isError,
      isLoading,
      isFetching: isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default useVesuVaultTvl
