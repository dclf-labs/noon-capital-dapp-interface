import { useMemo } from 'react'

import moment from 'moment'
import { mainnet } from 'wagmi/chains'

import type { ProtocolChainId } from '@/config/chain-id'
import {
  CURRENT_SEASON,
  DEFAULT_POINTS_ESTIMATE_FDV_IN_BILLIONS,
  DEFAULT_TOTAL_NOON_POINTS_DISTRIBUTEDBY_EOS,
} from '@/constants/common'
import useGovernanceUserData from '@/features/api/hooks/useGovernanceUserData'
import useTotalPointsAtTGE from '@/features/api/hooks/useTotalPointsAtTGE'
import useTotalPointsDollarEstimate from '@/features/api/hooks/useTotalPointsDollarEstimate'
import useTotalPointsForSeason from '@/features/api/hooks/useTotalPointsForSeason'
import useUserVestingSchedule from '@/features/api/hooks/useUserVestingSchedule'
import useOpenStakingPortfolio from '@/features/governance/hooks/useOpenStakingPortfolio'
import { useEvmTargetSession } from '@/hooks/connection/useWalletSession'
import type { UnifiedConnection } from '@/lib/connection'
import { bnToStr, toBn, toNum } from '@/lib/format'
import { calculateGovernanceCurve } from '@/lib/utils'
import usePointsEstimatorAssumptionsStore from '@/state/points-estimator-assumptions'

export type GovernancePowerChartEntry = {
  type: string
  value: number
  label: string
  fill: string
  stroke: string
  strokeWidth: number
  tag: string
}

const useGovernancePowerMax = () => {
  const connection = useEvmTargetSession(mainnet.id as ProtocolChainId)
  const tgeDistribution = useGovernanceUserData(connection)
  const vestingSchedule = useUserVestingSchedule(connection)
  const {
    portfolio: openStakingPortfolio,
    currentPositionsDollarValue: openStakingCurrentPositionsDollarValue,
    rewardsAvailableDollarValue: openStakingRewardsDollarValue,
    openStakingMaxDollarValue,
  } = useOpenStakingPortfolio(connection)
  const { stakingPeriod } = usePointsEstimatorAssumptionsStore()

  const noonMarketPrice = useMemo(
    () => toNum(tgeDistribution?.data?.noonMarketPrice),
    [tgeDistribution?.data?.noonMarketPrice],
  )

  const fdv = useMemo(
    () => toNum(DEFAULT_POINTS_ESTIMATE_FDV_IN_BILLIONS) * noonMarketPrice,
    [noonMarketPrice],
  )

  const totalPointsAtTGE = useTotalPointsAtTGE()
  const totalPoints = useTotalPointsForSeason(CURRENT_SEASON, connection as UnifiedConnection)

  const estimatedPointsDollarValue = useTotalPointsDollarEstimate({
    totalPoints: totalPoints?.totalPoints || 0,
    fdvInBillions: fdv,
    totalDistributedPoints: totalPointsAtTGE?.data || DEFAULT_TOTAL_NOON_POINTS_DISTRIBUTEDBY_EOS,
    stakingPeriod,
  })

  const maxPosition = useMemo(() => {
    const data = vestingSchedule?.data?.map(
      (vest: {
        id: string | number
        totalAmount: string | number | bigint | undefined
        endTime: string | number | bigint | undefined
        startTime: string | number | bigint | undefined
      }) => {
        return {
          id: vest.id,
          noonStaked: toNum(bnToStr(toBn(vest.totalAmount), 18)),
          maxNoonStaked12Months: toNum(bnToStr(toBn(vest.totalAmount), 18)) / 0.1,
          finalPercentage: calculateGovernanceCurve(
            moment(toNum(vest.endTime) * 1000).diff(moment(toNum(vest.startTime) * 1000), 'days'),
            365,
            moment(toNum(vest.endTime) * 1000).diff(moment(toNum(vest.startTime) * 1000), 'months'),
          ),
        }
      },
    )

    return data?.reduce(
      (acc: number, curr: { maxNoonStaked12Months: number; finalPercentage: number }) => {
        return acc + curr.maxNoonStaked12Months * curr.finalPercentage
      },
      0,
    )
  }, [vestingSchedule?.data])

  const maxPositionDollarValue = useMemo(
    () => (maxPosition || 0) * noonMarketPrice,
    [maxPosition, noonMarketPrice],
  )

  const noonClaimed = useMemo(
    () => toNum(bnToStr(tgeDistribution?.data?.noonClaimed, 18)),
    [tgeDistribution?.data?.noonClaimed],
  )

  const noonOverallClaimable = useMemo(
    () => toNum(bnToStr(tgeDistribution?.data?.noonClaimable, 18)),
    [tgeDistribution?.data?.noonClaimable],
  )

  const noonClaimable = useMemo(
    () => noonOverallClaimable - noonClaimed,
    [noonOverallClaimable, noonClaimed],
  )

  const noonClaimableMax = useMemo(() => noonClaimable * 10, [noonClaimable])

  const noonClaimableMaxDollarValue = useMemo(
    () => noonClaimableMax * noonMarketPrice,
    [noonClaimableMax, noonMarketPrice],
  )

  const maxPositionOpenStaking = openStakingPortfolio.currentPositionsToken

  const maxPositionOpenStakingDollarValue = openStakingCurrentPositionsDollarValue

  const yourRewards = openStakingPortfolio.rewardsAvailableToken

  const yourRewardsDollarValue = openStakingRewardsDollarValue

  const currentPositionsTokenAmount = useMemo(
    () => (maxPosition || 0) + maxPositionOpenStaking,
    [maxPosition, maxPositionOpenStaking],
  )

  const currentPositionsDollarValue = useMemo(
    () => maxPositionDollarValue + maxPositionOpenStakingDollarValue,
    [maxPositionDollarValue, maxPositionOpenStakingDollarValue],
  )

  const availableRewardsTokenAmount = useMemo(
    () => noonClaimableMax + yourRewards,
    [noonClaimableMax, yourRewards],
  )

  const availableRewardsDollarValue = useMemo(
    () => noonClaimableMaxDollarValue + yourRewardsDollarValue,
    [noonClaimableMaxDollarValue, yourRewardsDollarValue],
  )

  const totalPositionMaxValue = useMemo(
    () =>
      maxPositionDollarValue +
      estimatedPointsDollarValue +
      noonClaimableMaxDollarValue +
      openStakingMaxDollarValue,
    [
      maxPositionDollarValue,
      estimatedPointsDollarValue,
      noonClaimableMaxDollarValue,
      openStakingMaxDollarValue,
    ],
  )

  const totalPositionMax = useMemo(
    () => (noonMarketPrice ? totalPositionMaxValue / noonMarketPrice : 0),
    [totalPositionMaxValue, noonMarketPrice],
  )

  const currentChartData = useMemo<GovernancePowerChartEntry[]>(
    () => [
      {
        type: 'current-positions',
        value: maxPositionDollarValue,
        label: 'CURRENT POSITIONS',
        fill: '#5A3300CC',
        stroke: '#E69A3DB2',
        strokeWidth: 1,
        tag: 'Active staking',
      },
      {
        type: 'prev-season-rewards-available',
        value: noonClaimableMaxDollarValue,
        label: 'Prev Season(s): Available rewards',
        fill: '#FFA42CB2',
        stroke: '#E69A3DB2',
        strokeWidth: 1,
        tag: 'Active staking',
      },
      {
        type: 'points-value',
        value: estimatedPointsDollarValue,
        label: 'Current season: Value of points (est.)',
        fill: '#C67000CC',
        stroke: '#E69A3DB2',
        strokeWidth: 1,
        tag: 'Active staking',
      },
    ],
    [estimatedPointsDollarValue, maxPositionDollarValue, noonClaimableMaxDollarValue],
  )

  const maxChartData = useMemo<GovernancePowerChartEntry[]>(
    () => [
      {
        type: 'open-staking-current-positions',
        value: maxPositionOpenStakingDollarValue,
        label: 'CURRENT POSITIONS',
        fill: '#FFA42CB2',
        stroke: '#E69A3DB2',
        strokeWidth: 1,
        tag: 'Open staking',
      },
      {
        type: 'open-staking-rewards',
        value: yourRewardsDollarValue,
        label: 'Your available rewards (est.)',
        fill: '#FFA42CB2',
        stroke: '#E69A3DB2',
        strokeWidth: 1,
        tag: 'Open staking',
      },
    ],
    [yourRewardsDollarValue, maxPositionOpenStakingDollarValue],
  )

  const chartData = useMemo(
    () => [...currentChartData, ...maxChartData],
    [currentChartData, maxChartData],
  )

  return {
    connection,
    noonMarketPrice,
    totalPositionMax,
    totalPositionMaxValue,
    maxPosition: maxPosition || 0,
    maxPositionDollarValue,
    noonClaimable,
    noonClaimableMax,
    noonClaimableMaxDollarValue,
    estimatedPointsDollarValue,
    totalPoints: totalPoints?.totalPoints || 0,
    maxPositionOpenStaking,
    maxPositionOpenStakingDollarValue,
    yourRewards,
    yourRewardsDollarValue,
    currentPositionsTokenAmount,
    currentPositionsDollarValue,
    availableRewardsTokenAmount,
    availableRewardsDollarValue,
    currentChartData,
    maxChartData,
    chartData,
  }
}

export default useGovernancePowerMax
