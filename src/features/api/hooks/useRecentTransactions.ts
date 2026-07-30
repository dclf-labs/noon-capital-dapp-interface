import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { type EVMConnection } from '@/lib/connection'
import { appEnv } from '@/lib/env'
import { queryKeys } from '@/lib/query-keys'
import { type Activity, type RecentTransactions } from '@/lib/types'

const useRecentTransactions = (connection: EVMConnection) => {
  const fetcher = async () => {
    return await fetch(`${appEnv.api.baseUrl}/api/v1/user/${connection.address?.toLowerCase()}`)
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch user activity data')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json)
      .then((userActivityData) => (userActivityData ?? {}) as Activity)
      .then((activity) => (activity?.recentTransactions || []) as RecentTransactions[])
      .catch(() => {
        return [] as RecentTransactions[]
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
    queryKey: queryKeys.user.recentTransactions(connection?.address),
    select: (data) => {
      return data && data?.length ? (data as RecentTransactions[]) : ([] as RecentTransactions[])
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

export default useRecentTransactions
