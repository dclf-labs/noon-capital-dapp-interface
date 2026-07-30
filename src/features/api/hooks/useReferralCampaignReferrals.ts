import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { CURRENT_SEASON_REFERRAL_CAMPAIGN_ID } from '@/constants/common'
import type { EVMConnection } from '@/lib/connection'
import { appEnv } from '@/lib/env'
import { bnToInt, toBn } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

export type ReferralCampaignReferralsResponse = {
  referredAddress: string
  username: string | null
  points: string
  timestamp: string
  isKOL: boolean
}[]

const useReferralCampaignReferrals = (connection: EVMConnection) => {
  const fetcher = async (connection: EVMConnection) => {
    return await fetch(
      `${appEnv.api.baseUrl}/api/v1/referrals/${connection?.address?.toLowerCase()}`,
    )
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch campaign referrals data')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json?.referrals as ReferralCampaignReferralsResponse)
      .then((leaderboardData) => (leaderboardData || []) as ReferralCampaignReferralsResponse)
      .catch(() => {
        return [] as ReferralCampaignReferralsResponse
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    enabled: true,
    queryFn: async () => fetcher(connection),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 2,
    refetchIntervalInBackground: false,
    queryKey: queryKeys.referral.referrals(
      connection?.address,
      CURRENT_SEASON_REFERRAL_CAMPAIGN_ID,
    ),
    select: (data) => {
      let totalPoints = toBn(0)
      for (const referral of data) {
        totalPoints += toBn(referral?.points)
      }
      return {
        totalPoints: bnToInt(totalPoints || '0', 18),
        referrals: data,
        numberOfReferrals: data?.length || 0,
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

export default useReferralCampaignReferrals
