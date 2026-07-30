import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { CURRENT_SEASON_REFERRAL_CAMPAIGN_ID } from '@/constants/common'
import type { Address } from '@/lib/address'
import { isAddressValid } from '@/lib/address'
import { appEnv } from '@/lib/env'
import { toBn } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

export type ReferralCampaignLeaderboardResponse = {
  walletAddress: string
  username: string | null
  referralCount: number
  referralPoints: string
  rank: number
  isKOL: boolean
  campaignSpecificData: {
    referredAddresses: string[]
  }
}[]

const useReferralCampaignLeaderboard = (
  startDate: string | undefined = '2025-09-01T03:00:00:00.000Z',
  endDate: string | undefined = '2025-10-01T03:00:00:00.000Z',
) => {
  const fetcher = async () => {
    return await fetch(
      `${appEnv.api.baseUrl}/api/v1/campaigns/9/referral-leaderboard?periodStart=${startDate}&periodEnd=${endDate}&limit=10000&offset=0&orderBy=both`,
    )
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch referral campaign leaderboard data')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json?.data as ReferralCampaignLeaderboardResponse)
      .then((leaderboardData) =>
        leaderboardData
          ?.map((l) => ({
            ...l,
            referralPoints: l?.referralPoints?.split('.')?.at(0) || '0',
          }))
          ?.filter(
            (l) => isAddressValid(l?.walletAddress as Address) && toBn(l?.referralPoints) > toBn(0),
          ),
      )
      .then((leaderboardData) => (leaderboardData || []) as ReferralCampaignLeaderboardResponse)
      .catch(() => {
        return [] as ReferralCampaignLeaderboardResponse
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
    queryKey: queryKeys.referral.campaignLeaderboard(
      CURRENT_SEASON_REFERRAL_CAMPAIGN_ID,
      startDate,
      endDate,
    ),
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

export default useReferralCampaignLeaderboard
