import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { CURRENT_SEASON_START_DATE } from '@/constants/common'
import { type Connection } from '@/lib/connection'
import { appEnv } from '@/lib/env'
import { queryKeys } from '@/lib/query-keys'

export type Leaderboard = {
  rank: number
  points: string
  walletAddress: string
  description: string | null
  username: string
  isUser: boolean
  rankChange: number
  last24HoursPoints: string
}

export type RelativeLeaderboardResponse = {
  userRank: number
  totalUsers: number
  rankings: Leaderboard[]
}

const useRelativeLeaderboard = (connection: Connection) => {
  const fetcher = async () => {
    return await fetch(
      `${appEnv.api.baseUrl}/api/v1/leaderboard/${connection.address?.toLowerCase()}?limit=4&start_date=${CURRENT_SEASON_START_DATE}`,
    )
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch relative leaderboard data')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json)
      .then((leaderboardData) => (leaderboardData ?? {}) as RelativeLeaderboardResponse)
      .catch(() => {
        return {} as RelativeLeaderboardResponse
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    enabled: true,
    queryFn: fetcher,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 2,
    refetchIntervalInBackground: false,
    queryKey: queryKeys.referral.relativeLeaderboard(connection?.address),
    select: (data) => {
      return data
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

export default useRelativeLeaderboard
