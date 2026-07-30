import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { appEnv } from '@/lib/env'
import { queryKeys } from '@/lib/query-keys'

export type ProtocolTvlBreakdownResponse = {
  [platform: string]: {
    name?: string
    deployed?: string
    position?: string
    return?: string
    onChain?: string
    cex?: string
  }
} & { date: string; tvl: string }

const useProtocolTvl = () => {
  const fetcher = async () => {
    return await fetch(`${appEnv.api.baseUrl}/api/v1/capital`)
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch protocol TVL.')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json as ProtocolTvlBreakdownResponse)
      .catch((err) => {
        console.error('Error fetching protocol tvl breakdown:', err)
        throw new Error(err)
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    enabled: true,
    queryFn: fetcher,
    queryKey: queryKeys.protocol.tvl(),
    refetchIntervalInBackground: false,
    select: (data: ProtocolTvlBreakdownResponse | undefined | null) => {
      return data?.tvl
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

export default useProtocolTvl
