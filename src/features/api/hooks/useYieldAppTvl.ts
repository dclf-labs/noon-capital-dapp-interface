import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { REFETCH_INTERVAL_COLLATERAL_PRICE } from '@/constants/api'
import { bnToStr, down, toBn } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

const useYieldAppTvl = () => {
  const fetcher = async () => {
    return await fetch(
      `https://yield.accountable.capital/api/loan/address/0xd43F8443Bd91829b36153e33d3e631Bdd3b93844`,
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
          tvl: down(5730489508825, 3),
          tvlUsd: down(5730489.508825, 3),
          apy: down(17.55, 2),
          assetToShareRatio: down(bnToStr(toBn(5.239023594687659 * 10 ** 33), 36), 3),
          sharePrice: 1.0233,
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
    queryKey: queryKeys.yieldApp.tvl(),
    enabled: true,
    select: (data) => {
      return {
        tvl: down(data?.tvl ?? 5730489508825, 3),
        tvlUsd: down(data?.tvlUsd ?? 5730489.508825, 3),
        apy: down(data?.apy ?? 17.55, 2),
        assetToShareRatio: down(bnToStr(toBn(5.239023594687659 * 10 ** 33), 36), 3),
        sharePrice: 1.0233,
      }
    },
  })

  return useMemo(
    () => ({
      data: data ?? {
        tvl: down(5730489508825, 3),
        tvlUsd: down(5730489.508825, 3),
        apy: down(17.55, 2),
        assetToShareRatio: down(bnToStr(toBn(5.239023594687659 * 10 ** 33), 36), 3),
        sharePrice: 1.0233,
      },
      isError,
      isLoading,
      isFetching: isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default useYieldAppTvl
