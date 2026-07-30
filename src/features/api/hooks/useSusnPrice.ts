import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { appEnv } from '@/lib/env'
import { toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

const useSusnPrice = () => {
  const fetcher = async () => {
    if (!appEnv.api.baseUrl) {
      return '0'
    }

    return await fetch(`${appEnv.api.baseUrl}/api/susn-price`)
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }
          throw new Error('Failed to fetch susn price.')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json as { susnPrice: string })
      .then((data) => data?.susnPrice)
      .catch((err) => {
        console.error('Error fetching susn price:', err)
        return '0'
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    queryFn: fetcher,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryKey: queryKeys.price.susn(),
    refetchIntervalInBackground: false,
    enabled: true,
    select: (data) => {
      return toNum(data)
    },
  })

  return useMemo(
    () => ({
      data: data || 0,
      isLoading,
      isError,
      isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default useSusnPrice
