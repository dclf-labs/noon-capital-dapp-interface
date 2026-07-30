import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import type { Address } from '@/lib/address'
import { isAddressValid } from '@/lib/address'
import { appEnv } from '@/lib/env'
import { down, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

export type PointsApyEstimateResponse = {
  wallet_address: string
  point_value: number
  average_point_apy: number
  protocols: {
    [name: string]: {
      apy: string
      averagePosition: string
      daysActive: number
      usdValue: string
      totalPoints: string
    }
  }
}

/* Default points apy estimate */
export const DEFAULT_POINTS_APY_ESTIMATE = {
  wallet_address: '',
  point_value: 0,
  average_point_apy: 0,
  protocols: {},
} as PointsApyEstimateResponse

const usePointsApyEstimate = ({
  address,
  pointsDollarValue = 0,
}: {
  address: Address | undefined
  pointsDollarValue: number
}) => {
  const fetcher = async () => {
    if (!address) {
      return DEFAULT_POINTS_APY_ESTIMATE
    }

    return await fetch(
      `${appEnv.api.baseUrl}/api/v1/calculate-point-apy/${address?.toLowerCase()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          point_value: toNum(pointsDollarValue),
          current: true,
        }),
      },
    )
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch points apy estimate data.')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json as PointsApyEstimateResponse)
      .catch((err) => {
        console.error('Error fetching points apy estimate data:', err)
        return DEFAULT_POINTS_APY_ESTIMATE
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    queryFn: fetcher,
    queryKey: queryKeys.points.apyEstimate(address, pointsDollarValue),
    placeholderData: DEFAULT_POINTS_APY_ESTIMATE,
    initialData: () => DEFAULT_POINTS_APY_ESTIMATE,
    enabled: isAddressValid(address),
    select: (data: PointsApyEstimateResponse) => {
      return down(toNum(data?.average_point_apy || 0) * 100, 2)
    },
  })

  return useMemo(
    () => ({
      data,
      isLoading,
      isError,
      isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default usePointsApyEstimate
