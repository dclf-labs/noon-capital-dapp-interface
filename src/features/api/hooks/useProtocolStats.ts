import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import moment from 'moment'

import { appEnv } from '@/lib/env'
import { bnToStr, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { type ApyChartData } from '@/lib/types'

export type ProtocolStatsResponse = {
  tvl: string
  usnAmount: string
  susnAmount: string
  usnPercentage: string
  susnPercentage: string
  apyTimeSeries: {
    [date: string]: string
  }
  apy: string
  apy30Days: string
  apy30DaysTimeSeries: {
    [date: string]: string
  }
  apy28Days: string
  apy28DaysTimeSeries: {
    [date: string]: string
  }
}

export const DEFAULT_PROTOCOL_STATS: ProtocolStatsResponse = {
  tvl: '0',
  usnAmount: '0',
  susnAmount: '0',
  apyTimeSeries: {},
  usnPercentage: '0',
  susnPercentage: '0',
  apy: '0',
  apy30Days: '0',
  apy30DaysTimeSeries: {},
  apy28Days: '0',
  apy28DaysTimeSeries: {},
}

const useProtocolStats = () => {
  const fetcher = async () => {
    return await fetch(`${appEnv.api.baseUrl}/api/v1/protocol-metrics`)
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch protocol stats.')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json as ProtocolStatsResponse)
      .catch((err) => {
        console.error('Error fetching protocol stats:', err)
        throw new Error(err)
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    enabled: true,
    queryFn: fetcher,
    queryKey: queryKeys.protocol.stats(),
    refetchIntervalInBackground: false,
    select: (data: ProtocolStatsResponse | undefined | null) => {
      const _data = data || DEFAULT_PROTOCOL_STATS

      const tvl = toNum(bnToStr(_data?.tvl, 18))
      const usnPercentage = toNum(_data?.usnPercentage)
      const susnPercentage = toNum(_data?.susnPercentage)

      const apys = Object.keys(_data?.apyTimeSeries || {})
        .map(
          (label: string) =>
            ({
              label: moment(new Date(label.toString())).format('DD MMM YYYY'),
              value: toNum(data?.apyTimeSeries?.[label.toString()]),
            }) as ApyChartData,
        )
        .sort((a, b) => {
          const aTime = new Date(a.label).getTime()
          const bTime = new Date(b.label).getTime()
          return aTime - bTime
        })

      const apys30Days = Object.keys(_data?.apy30DaysTimeSeries || {})
        .map(
          (label: string) =>
            ({
              label: moment(new Date(label.toString())).format('DD MMM YYYY'),
              value: toNum(data?.apy30DaysTimeSeries?.[label.toString()]),
            }) as ApyChartData,
        )
        .sort((a, b) => {
          const aTime = new Date(a.label).getTime()
          const bTime = new Date(b.label).getTime()
          return aTime - bTime
        })

      const apy28Days = Object.keys(_data?.apy28DaysTimeSeries || {})
        .map(
          (label: string) =>
            ({
              label: moment(new Date(label.toString())).format('DD MMM YYYY'),
              value: toNum(data?.apy28DaysTimeSeries?.[label.toString()]),
            }) as ApyChartData,
        )
        .sort((a, b) => {
          const aTime = new Date(a.label).getTime()
          const bTime = new Date(b.label).getTime()
          return aTime - bTime
        })

      return {
        tvl,
        apys: apys,
        usnPercentage,
        susnPercentage,
        apys7Days: apys?.slice(-7),
        apys30Days: apys30Days?.slice(-30),
        apy28Days: apy28Days?.slice(-28),
        sevenDayApy: toNum(data?.apy || apys?.at(-1)?.value || '0'),
        thirtyDayApy: toNum(data?.apy30Days || apys30Days?.at(-1)?.value || '0'),
        twentyEightDayApy: toNum(data?.apy28Days || apy28Days?.at(-1)?.value || '0'),
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

export default useProtocolStats
