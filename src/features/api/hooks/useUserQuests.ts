import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import type { Connection } from '@/lib/connection'
import { appEnv } from '@/lib/env'
import { queryKeys } from '@/lib/query-keys'

export type UserQuestsResponse = {
  walletAddress: string
  username: string
  title: string
  tier: string
  totalXp: number
  maxXp: number
  questsCompleted: number
  totalQuests: number
  quests: {
    questType: string
    title: string
    description: string
    xpReward: number
    status: string
    progress: number
    target: number
    completedAt: string | null
    order: number
  }[]
  achievementUnlocked: boolean
}

export const DEFAULT_USER_QUESTS_RESPONSE: UserQuestsResponse = {
  walletAddress: '',
  username: '',
  title: '',
  tier: '',
  totalXp: 0,
  maxXp: 0,
  questsCompleted: 0,
  totalQuests: 0,
  quests: [],
  achievementUnlocked: false,
}

const useUserQuests = (connection: Connection) => {
  const fetcher = async () => {
    return await fetch(
      `${appEnv.api.baseUrl}/api/v1/quests/${connection.address?.toLowerCase() || '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'}`,
    )
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch user data')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => (json || DEFAULT_USER_QUESTS_RESPONSE) as UserQuestsResponse)
      .catch(() => {
        return DEFAULT_USER_QUESTS_RESPONSE
      })
  }

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    enabled: true,
    queryFn: fetcher,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 2,
    refetchIntervalInBackground: false,
    queryKey: queryKeys.quests.user(connection?.address),
    select: (data) => {
      return data || DEFAULT_USER_QUESTS_RESPONSE
    },
  })

  return useMemo(
    () => ({
      data,
      isLoading,
      isError,
      isFetching,
      refetch,
    }),
    [data, isError, isLoading, isFetching, refetch],
  )
}

export default useUserQuests
