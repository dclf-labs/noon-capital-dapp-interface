import { useMemo } from 'react'

import moment from 'moment'

import {
  CURRENT_SEASON_TOKEN_ALLOCATION_PERCENTAGE,
  DEFAULT_POINTS_ESTIMATE_FDV_IN_BILLIONS,
  DEFAULT_POINTS_ESTIMATE_STAKING_PERIOD,
  DEFAULT_TOTAL_NOON_POINTS_DISTRIBUTEDBY_EOS,
  POINTS_12MONTH_BOOSTER,
} from '@/constants/common'
import { getStakingPeriodInDays } from '@/features/api/lib/points-estimator'
import { down, toNum } from '@/lib/format'

const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0

const useTotalPointsDollarEstimate = ({
  totalPoints = 0,
  fdvInBillions = DEFAULT_POINTS_ESTIMATE_FDV_IN_BILLIONS,
  totalDistributedPoints = DEFAULT_TOTAL_NOON_POINTS_DISTRIBUTEDBY_EOS,
  stakingPeriod = DEFAULT_POINTS_ESTIMATE_STAKING_PERIOD,
}: {
  totalPoints: number | undefined
  fdvInBillions: number | undefined
  totalDistributedPoints: number | undefined
  stakingPeriod: number | undefined
}) => {
  const estimatedPointsDollarValueCellC25 = useMemo(() => {
    const fdvInMillions = fdvInBillions * 1000
    return (fdvInMillions * CURRENT_SEASON_TOKEN_ALLOCATION_PERCENTAGE * 1_000_000) / 100 // Converting from 0.74% to ratio.
  }, [fdvInBillions])

  const estimatedPointsDollarValueCellC26 = useMemo(() => {
    if (!totalPoints) {
      return 0
    }

    return totalPoints / totalDistributedPoints
  }, [totalPoints, totalDistributedPoints])

  const estimatedPointsDollarValue = useMemo(() => {
    const basePointsDollarValue = down(
      (estimatedPointsDollarValueCellC25 * estimatedPointsDollarValueCellC26) /
        POINTS_12MONTH_BOOSTER,
      3,
    )

    const days = getStakingPeriodInDays(toNum(stakingPeriod))
    const LN_DIV_YEAR =
      Math.log(POINTS_12MONTH_BOOSTER) / (isLeapYear(moment().get('year')) ? 366 : 365)
    const exponentialMultiplier = Math.exp(LN_DIV_YEAR * days)

    return down(basePointsDollarValue * exponentialMultiplier, 3)
  }, [estimatedPointsDollarValueCellC25, estimatedPointsDollarValueCellC26, stakingPeriod])

  return estimatedPointsDollarValue
}

export default useTotalPointsDollarEstimate
