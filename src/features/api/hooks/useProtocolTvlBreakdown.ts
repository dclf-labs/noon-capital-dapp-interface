import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { TVL_BREAKDOWN_CHART_COLORS } from '@/constants/ui'
import { appEnv } from '@/lib/env'
import { toNum } from '@/lib/format'
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

const useProtocolTvlBreakdown = () => {
  const fetcher = async () => {
    return await fetch(`${appEnv.api.baseUrl}/api/v1/capital`)
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch protocol tvl breakdown.')
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
    queryKey: queryKeys.protocol.tvlBreakdown(),
    refetchIntervalInBackground: false,
    select: (data: ProtocolTvlBreakdownResponse | undefined | null) => {
      // Filter out 'date' and 'tvl' keys, then map to breakdown items
      const breakdown = Object.keys(data || {})
        ?.filter((key) => key?.toLowerCase() !== 'date' && key?.toLowerCase() !== 'tvl')
        ?.map((key, index) => ({
          id: index + 1,
          label: index + 1,
          displayName: data?.[key]?.name || `Protocol ${index}`,
          value:
            toNum(data?.[key]?.deployed) ||
            toNum(data?.[key]?.position) ||
            toNum(data?.[key]?.onChain) + toNum(data?.[key]?.cex),
          fill: TVL_BREAKDOWN_CHART_COLORS?.[index + 1]?.fill,
          stroke: TVL_BREAKDOWN_CHART_COLORS?.[index + 1]?.stroke,
        }))
        // Sort by value in descending order
        ?.sort((a, b) => b.value - a.value)

      const remaining = breakdown?.slice(5) || []
      const topFour = breakdown?.slice(0, 5) || []
      const othersSum = remaining.reduce((sum, item) => sum + item.value, 0)
      const result = [...topFour]
      if (othersSum > 0) {
        result.push({
          id: 6,
          label: 6,
          value: othersSum,
          displayName: 'Others',
          fill: TVL_BREAKDOWN_CHART_COLORS?.[5]?.fill,
          stroke: TVL_BREAKDOWN_CHART_COLORS?.[5]?.stroke,
        })
      }

      return result
    },
  })

  return useMemo(
    () => ({
      data: data || [],
      isLoading,
      isError,
      isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default useProtocolTvlBreakdown
