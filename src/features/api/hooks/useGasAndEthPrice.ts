import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { appEnv } from '@/lib/env'
import { toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

export const REFETCH_INTERVAL_GAS_AND_ETH_PRICE = 30 * 60 * 1000 // 30 minutes.

export const DEFAULT_GAS_TRACKER_API_RESPONSE = {
  1: {
    gasPrice: '93597989',
    price: '2103.25',
    ethPrice: '2103.25',
  },
  50104: {
    gasPrice: '10000000000000',
    price: '0.008294',
  },
  239: {
    gasPrice: '450000000000',
    price: '0.003574',
  },
  324: {
    gasPrice: '6508000000',
    price: '2103.25',
  },
  starknet: {
    gasPrice: '6508000000',
    price: '0.0326',
  },
  999: {
    gasPrice: '100000000',
    price: '36.26',
  },
  cacheTimestamp: Date.now(),
} as unknown as GasTrackerApiResponse

export type GasTrackerApiResponse = {
  [key: string | number]: {
    gasPrice: string | number
    price?: string | number
    ethPrice?: string | number
  }
} & { cacheTimestamp?: number }

/** Prefer live value when > 0; otherwise keep the bundled default (API may send `"0"`). */
function coalescePositive(
  live: string | number | undefined,
  fallback: string | number | undefined,
): number {
  const liveNum = toNum(live)
  if (liveNum > 0) return liveNum
  return toNum(fallback)
}

const useGasAndEthPrice = () => {
  const fetcher = async () => {
    return await fetch(`${appEnv.api.baseUrl}/api/v1/gas-and-eth-price`)
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw Error('Failed to get response from api.')
        },
        (err: Error) => {
          throw Error(err?.message)
        },
      )
      .then(
        (data) => {
          return data as GasTrackerApiResponse
        },
        (err: Error) => {
          throw Error(err?.message)
        },
      )
      .catch((err: Error) => {
        console.error('Failed fetching gas price and eth price:', err)
        throw Error(err?.message)
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    queryFn: fetcher,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true,
    refetchInterval: REFETCH_INTERVAL_GAS_AND_ETH_PRICE,
    queryKey: queryKeys.price.ethAndGas(),
    enabled: true,
    select: (data: GasTrackerApiResponse | undefined) => {
      const ethUsd = coalescePositive(
        data?.['ethereum']?.price ?? data?.['ethereum']?.ethPrice,
        DEFAULT_GAS_TRACKER_API_RESPONSE?.[1]?.ethPrice ??
          DEFAULT_GAS_TRACKER_API_RESPONSE?.[1]?.price,
      )
      const ethGas = coalescePositive(
        data?.['ethereum']?.gasPrice,
        DEFAULT_GAS_TRACKER_API_RESPONSE?.[1]?.gasPrice,
      )

      return {
        1: {
          price: ethUsd,
          gasPrice: ethGas,
        },
        324: {
          price: ethUsd,
          gasPrice: ethGas,
        },
        // Base / other ETH-gas L2s share mainnet ETH USD via resolveNativeGasUsdPrice fallback.
        8453: {
          price: ethUsd,
          gasPrice: ethGas,
        },
        50104: {
          price: coalescePositive(
            data?.['sophon']?.price,
            DEFAULT_GAS_TRACKER_API_RESPONSE?.[50104]?.price,
          ),
          gasPrice: coalescePositive(
            data?.['sophon']?.gasPrice,
            DEFAULT_GAS_TRACKER_API_RESPONSE?.[50104]?.gasPrice,
          ),
        },
        239: {
          price: coalescePositive(
            data?.['tac']?.price,
            DEFAULT_GAS_TRACKER_API_RESPONSE?.[239]?.price,
          ),
          gasPrice: coalescePositive(
            data?.['tac']?.gasPrice,
            DEFAULT_GAS_TRACKER_API_RESPONSE?.[239]?.gasPrice,
          ),
        },
        999: {
          price: coalescePositive(
            data?.['hyperliquid']?.price,
            DEFAULT_GAS_TRACKER_API_RESPONSE?.[999]?.price,
          ),
          gasPrice: coalescePositive(
            data?.['hyperliquid']?.gasPrice,
            DEFAULT_GAS_TRACKER_API_RESPONSE?.[999]?.gasPrice,
          ),
        },
        starknet: {
          price: coalescePositive(
            data?.['starknet']?.price,
            DEFAULT_GAS_TRACKER_API_RESPONSE?.['starknet']?.price,
          ),
          gasPrice: coalescePositive(
            data?.['starknet']?.gasPrice ?? data?.['ethereum']?.gasPrice,
            DEFAULT_GAS_TRACKER_API_RESPONSE?.['starknet']?.gasPrice,
          ),
        },
      }
    },
  })

  return useMemo(
    () => ({
      data: data as { [key: string | number]: { price: number; gasPrice: number } },
      isLoading,
      isError,
      isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default useGasAndEthPrice
