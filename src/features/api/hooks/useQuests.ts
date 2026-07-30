import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { appEnv } from '@/lib/env'
import { queryKeys } from '@/lib/query-keys'

export type QuestsResponse = {
  quests: {
    type: string
    title: string
    description: string
    xpReward: number
    order: number
  }[]
  tiers: {
    tier: string
    name: string
    minXp: number
  }[]
  maxXp: number
  totalQuests: number
  achievement: {
    name: string
    description: string
    reward: string
  }
}

export const DEFAULT_QUESTS_RESPONSE: QuestsResponse = {
  quests: [],
  tiers: [],
  maxXp: 0,
  totalQuests: 11,
  achievement: {
    name: '',
    description: '',
    reward: '',
  },
}

const useQuests = () => {
  const fetcher = async () => {
    return await fetch(`${appEnv.api.baseUrl}/api/v1/quests/info`)
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch quests info data')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => (json || DEFAULT_QUESTS_RESPONSE) as QuestsResponse)
      .catch(() => {
        return DEFAULT_QUESTS_RESPONSE
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
    queryKey: queryKeys.quests.catalog(),
    select: (data) => {
      return data || DEFAULT_QUESTS_RESPONSE
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

export default useQuests
