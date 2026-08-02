import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { REFETCH_INTERVAL_COLLATERAL_PRICE } from '@/constants/api'
import { bnToStr, down, toBn } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

const useYieldAppEthTbtcTvl = () => {
  const fetcher = async () => {
    return await fetch(
      `https://yield.accountable.capital/api/loan/address/0x6F055f7b883E9Cb929885263b8779393BF7e394B`,
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
          tvl: down(bnToStr(BigInt('12805351597553699000'), 0), 3),
          tvlUsd: down(851030.861821821, 3),
          apy: down(4.157265, 2),
          assetToShareRatio: down(bnToStr(BigInt('234686768243255340000000000000000'), 36), 3),
          sharePrice: 1.0037,
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
    queryKey: queryKeys.yieldApp.ethTbtcTvl(),
    enabled: true,
    select: (data) => {
      return {
        tvl: down(data?.tvl ?? Number(bnToStr(BigInt('12805351597553699000'), 0)), 3),
        tvlUsd: down(data?.tvlUsd ?? 851030.861821821, 3),
        apy: down(data?.apy ?? 4.157265, 2),
        assetToShareRatio: down(
          data?.assetToShareRatio ?? bnToStr(BigInt('234686768243255340000000000000000'), 36),
          3,
        ),
        sharePrice: 1.0037,
      }
    },
  })

  return useMemo(
    () => ({
      data: data ?? {
        tvl: down(bnToStr(BigInt('12805351597553699000'), 0), 3),
        tvlUsd: down(851030.861821821, 3),
        apy: down(4.157265, 2),
        assetToShareRatio: down(bnToStr(BigInt('234686768243255340000000000000000'), 36), 3),
        sharePrice: 1.0037,
      },
      isError,
      isLoading,
      isFetching: isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default useYieldAppEthTbtcTvl
