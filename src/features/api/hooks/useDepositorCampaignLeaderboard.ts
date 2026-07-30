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
  rank: number
  totalDepositPoints?: string
}[]

const useDepositorCampaignLeaderboard = (
  startDate: string | undefined = '2025-12-01T00:00:00:00.000Z',
  endDate: string | undefined = '2025-11-01T00:00:00:00.000Z',
) => {
  const fetcher = async () => {
    return await fetch(
      `${appEnv.api.baseUrl}/api/v1/deposits/leaderboard?protocol=usn,EULER_USN,EULER_USDC,EULER_USDT,EULER_SUSN,susn,SYNCSWAP_USN_USDT,SYNCSWAP_USN_SUSN,SYNCSWAP_ZKSYNC_USN_USDT,SYNCSWAP_ZKSYNC_USN_SUSN,UNISWAP_V3_USN_USDT,UNISWAP_V3_USN_SUSN,PENDLE_SUSN_LP,PENDLE_USN_LP&start_date=${startDate}&end_date=${endDate}`,
    )
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch depositor campaign leaderboard data')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json as ReferralCampaignLeaderboardResponse)
      .then((leaderboardData) =>
        leaderboardData
          ?.map((l) => ({
            ...l,
            totalDepositPoints: l?.totalDepositPoints?.split('.')?.at(0) || '0',
          }))
          ?.filter(
            (l) =>
              isAddressValid(l?.walletAddress as Address) && toBn(l?.totalDepositPoints) > toBn(0),
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
    queryKey: queryKeys.referral.depositorLeaderboard(
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

export default useDepositorCampaignLeaderboard
