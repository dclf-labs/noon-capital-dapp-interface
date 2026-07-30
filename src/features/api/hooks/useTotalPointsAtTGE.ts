import { useMemo } from 'react'

import moment from 'moment'

import {
  CURRENT_SEASON_END_DATE,
  DEFAULT_POINTS_FUTURE_DISTRIBUTION_RATE_MULTIPLIER,
} from '@/constants/common'
import usePointsDistributionStat from '@/features/api/hooks/usePointsDistributionStat'
import { floor, toNum } from '@/lib/format'

const useTotalPointsAtTGE = () => {
  const { data, isLoading, isError, isFetching } = usePointsDistributionStat()

  const totalPointsAtTGE = useMemo(() => {
    const tge = moment(CURRENT_SEASON_END_DATE).startOf('day')
    const now = moment().startOf('day')
    const diffInDays = tge.diff(now, 'days')
    const rate = toNum(data?.rate24Hrs)
    const totalPointsIssued = toNum(data?.totalPointsIssued)
    const pointsToBeDistributedInFuture =
      toNum(rate) * toNum(diffInDays) * DEFAULT_POINTS_FUTURE_DISTRIBUTION_RATE_MULTIPLIER
    return floor(totalPointsIssued + pointsToBeDistributedInFuture)
  }, [data])

  return useMemo(
    () => ({
      data: totalPointsAtTGE,
      isLoading,
      isError,
      isFetching,
    }),
    [isError, isLoading, isFetching, totalPointsAtTGE],
  )
}

export default useTotalPointsAtTGE
