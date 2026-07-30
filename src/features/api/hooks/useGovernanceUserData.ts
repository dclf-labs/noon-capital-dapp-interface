import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { getAddressOrZeroAddress } from '@/lib/address'
import type { Connection, EVMConnection, StarknetConnection } from '@/lib/connection'
import { appEnv } from '@/lib/env'
import { queryKeys } from '@/lib/query-keys'

export type GovernanceResponse = {
  noonClaimed: string
  noonClaimable: string
  noonBalance: string
  snoonBalance: string
  snoonRewards: string
  snoonVipRewards: string
  votingPower: string
  noonStaked: string
  noonVipStaked: string
  votingPowerPercentage: string
  merkleProof: string[]
  merkleRoot: string
  cacheTimestamp: number
  totalVotingPower: string
  noonMarketPrice: string
  totalTokensClaimed: string
  openStaking: {
    noonStaked: string
    readyToClaim: string
    rewardForOpenStaking: string
    position: string
    thisMonthEstimatedEarnings: string
  }
  totalOpenStaked: string
  buybackReward: {
    totalDistributed: {
      raw: string
      noon: string
    }
    totalClaimed: {
      raw: string
      noon: string
    }
    monthly: {
      month: string
      distributed: {
        raw: string
        noon: string
      }
      claimed: {
        raw: string
        noon: string
      }
    }[]
  }
  rewardsClaimable: string
  rewardsMerkleRoot: string
  rewardsMerkleProof: string[]
  openStakingWithdrawalProofs: {
    tokenId: string
    amount: string
    userAddress: string
    proof: string[]
  }[]
}

export const DEFAULT_GOVERNANCE_RESPONSE: GovernanceResponse = {
  noonClaimed: '0',
  noonClaimable: '0',
  noonBalance: '0',
  snoonBalance: '0',
  snoonRewards: '0',
  snoonVipRewards: '0',
  votingPower: '0',
  noonStaked: '0',
  noonVipStaked: '0',
  votingPowerPercentage: '0',
  merkleProof: [],
  merkleRoot: '',
  cacheTimestamp: Date.now(),
  totalVotingPower: '0',
  noonMarketPrice: '0.02495',
  totalTokensClaimed: '0',
  openStaking: {
    noonStaked: '0',
    readyToClaim: '0',
    rewardForOpenStaking: '0',
    position: '0',
    thisMonthEstimatedEarnings: '0',
  },
  rewardsClaimable: '0',
  rewardsMerkleProof: [],
  rewardsMerkleRoot: '',
  totalOpenStaked: '0',
  buybackReward: {
    totalDistributed: {
      raw: '0',
      noon: '0',
    },
    totalClaimed: {
      raw: '0',
      noon: '0',
    },
    monthly: [
      {
        month: '2026-01-01',
        distributed: {
          raw: '0',
          noon: '0',
        },
        claimed: {
          raw: '0',
          noon: '0',
        },
      },
    ],
  },
  openStakingWithdrawalProofs: [],
}

const useGovernanceUserData = (connection: Connection | StarknetConnection | EVMConnection) => {
  const fetcher = async () => {
    return await fetch(
      `${appEnv.api.baseUrl}/api/v1/governance/${getAddressOrZeroAddress(connection.address)?.toLowerCase() || ''}?proof=true`,
    )
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch user governance data')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => (json || DEFAULT_GOVERNANCE_RESPONSE) as GovernanceResponse)
      .catch(() => {
        return DEFAULT_GOVERNANCE_RESPONSE
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
    queryKey: queryKeys.governance.user(connection?.address),
    select: (data) => {
      return data || DEFAULT_GOVERNANCE_RESPONSE
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

export default useGovernanceUserData
