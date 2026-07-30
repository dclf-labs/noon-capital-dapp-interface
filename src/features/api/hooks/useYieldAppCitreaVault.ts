import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { REFETCH_INTERVAL_COLLATERAL_PRICE } from '@/constants/api'
import { bnToStr, down, toBn } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

const useYieldAppCitreaVault = () => {
  const fetcher = async () => {
    return await fetch(
      `https://yield.accountable.capital/api/loan/address/0x9d384052c46959fE0AA601D312D1B3F7B4eD4E5b`,
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
          tvl: down(data?.loan_computed?.tvl, 3),
          tvlUsd: down(data?.loan_computed?.tvl_in_usd, 3),
          apy: down(data?.loan_computed?.net_apy, 3),
          assetToShareRatio: down(
            bnToStr(toBn(data?.on_chain_loan?.vault?.assetShareRatio), 36),
            3,
          ),
          sharePrice: down(bnToStr(toBn(data?.on_chain_loan?.vault?.sharePrice), 36), 3),
        }
      })
      .catch((err) => {
        console.error('Error fetching yield app tvl:', err)
        return {
          tvl: 10 * 10 ** 18,
          tvlUsd: down(775293.57196999, 3),
          apy: down(2.125, 2),
          assetToShareRatio: 0,
          sharePrice: 1,
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
    queryKey: queryKeys.yieldApp.citreaWbtcTvl(),
    enabled: true,
    select: (data) => {
      return {
        tvl: down(data?.tvl || 10 * 10 ** 18, 3),
        tvlUsd: down(data?.tvlUsd || 10, 3),
        apy: down(data?.apy || 2.125, 2),
        assetToShareRatio: down(data?.assetToShareRatio || 0, 3),
        sharePrice: down(data?.sharePrice || 1, 3),
      }
    },
  })

  return useMemo(
    () => ({
      data: data || {
        tvl: down(10 * 10 ** 18, 3),
        tvlUsd: down(10, 3),
        apy: down(2.125, 2),
        assetToShareRatio: down(0, 3),
        sharePrice: down(1, 3),
      },
      isError,
      isLoading,
      isFetching: isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default useYieldAppCitreaVault
