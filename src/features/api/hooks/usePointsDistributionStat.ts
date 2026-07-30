import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { CURRENT_SEASON_START_DATE } from '@/constants/common'
import { appEnv } from '@/lib/env'
import { bnToInt, floor } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

export type PointsDistributionStat = {
  totalPointsIssued: string
  pointsIssuedLast24Hours: string
  pointsIssuedLast7Days: string
  distributionRate: {
    dailyRate: string
    weeklyRate: string
    monthlyRate: string
  }
  byProtocol: {
    [name: string]: {
      totalPoints: string
      last24Hours: string
      percentageOfTotal: string
      distributionRate: string
    }
  }
}

export const DEFAULT_POINTS_DISTRIBUTION_STAT: PointsDistributionStat = {
  totalPointsIssued: '0',
  pointsIssuedLast24Hours: '0',
  pointsIssuedLast7Days: '0',
  distributionRate: {
    dailyRate: '0',
    weeklyRate: '0',
    monthlyRate: '0',
  },
  byProtocol: {},
}

const usePointsDistributionStat = () => {
  const fetcher = async () => {
    return await fetch(
      `${appEnv.api.baseUrl}/api/v1/points-distribution-stats?start_date=${CURRENT_SEASON_START_DATE}`,
    )
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch points stats distribution')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json as PointsDistributionStat)
      .then((distributionStat) => distributionStat)
      .catch(() => {
        return DEFAULT_POINTS_DISTRIBUTION_STAT as PointsDistributionStat
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    enabled: true,
    queryFn: fetcher,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    retry: 2,
    queryKey: queryKeys.points.distribution(),
    select: (data) => {
      const totalPointsIssued = bnToInt(data?.totalPointsIssued, 18)
      const dailyPointsRate = bnToInt(data?.distributionRate?.dailyRate, 18)
      const msPointsRate = floor(dailyPointsRate / (24 * 60 * 60 * 1000))
      return {
        totalPointsIssued,
        rateMs: msPointsRate,
        rate24Hrs: dailyPointsRate,
      }
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

export default usePointsDistributionStat
