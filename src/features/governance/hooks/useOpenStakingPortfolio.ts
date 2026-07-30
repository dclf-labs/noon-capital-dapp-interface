import { useMemo } from 'react'

import useGovernanceUserData from '@/features/api/hooks/useGovernanceUserData'
import useOpenStakes from '@/features/governance/hooks/useOpenStakes'
import {
  computeOpenStakingPortfolio,
  deriveOpenStakingMonthContext,
  OPEN_GOVERNANCE_MONTHLY_SCHEDULE,
  type OpenStakingPortfolio,
} from '@/features/governance/lib/openStakingPortfolio'
import type { EVMConnection } from '@/lib/connection'
import { bnToStr, toBn, toNum } from '@/lib/format'

const useOpenStakingPortfolio = (connection: EVMConnection) => {
  const tgeDistribution = useGovernanceUserData(connection)
  const openStakes = useOpenStakes(connection)

  const noonMarketPrice = useMemo(
    () => toNum(tgeDistribution?.data?.noonMarketPrice),
    [tgeDistribution?.data?.noonMarketPrice],
  )

  const totalOpenStakedOverall = useMemo(() => {
    const raw = toNum(bnToStr(toBn(tgeDistribution?.data?.totalOpenStaked), 18))
    return Number.isFinite(raw) ? Math.max(0, raw) : 0
  }, [tgeDistribution?.data?.totalOpenStaked])

  const governanceNowMs = Date.now()

  const monthContext = useMemo(
    () =>
      deriveOpenStakingMonthContext(
        OPEN_GOVERNANCE_MONTHLY_SCHEDULE,
        totalOpenStakedOverall,
        governanceNowMs,
      ),
    [totalOpenStakedOverall, governanceNowMs],
  )

  const portfolio = useMemo<OpenStakingPortfolio>(
    () =>
      computeOpenStakingPortfolio(
        OPEN_GOVERNANCE_MONTHLY_SCHEDULE,
        openStakes?.data,
        monthContext.nowMs,
        monthContext.currentMonthIndex,
        monthContext.currentMonthRewards,
        monthContext.currentMonthPoolTotal,
        totalOpenStakedOverall,
      ),
    [openStakes?.data, monthContext, totalOpenStakedOverall],
  )

  const currentPositionsDollarValue = useMemo(
    () => portfolio.currentPositionsToken * noonMarketPrice,
    [portfolio.currentPositionsToken, noonMarketPrice],
  )

  const rewardsAvailableDollarValue = useMemo(
    () => portfolio.rewardsAvailableToken * noonMarketPrice,
    [portfolio.rewardsAvailableToken, noonMarketPrice],
  )

  const openStakingMaxDollarValue = useMemo(
    () => portfolio.openStakingMaxToken * noonMarketPrice,
    [portfolio.openStakingMaxToken, noonMarketPrice],
  )

  const slotsPositionDollarValue = useMemo(
    () => portfolio.slotsPositionToken * noonMarketPrice,
    [portfolio.slotsPositionToken, noonMarketPrice],
  )

  return {
    openStakes,
    tgeDistribution,
    noonMarketPrice,
    totalOpenStakedOverall,
    currentMonthPoolTotal: monthContext.currentMonthPoolTotal,
    currentMonthRewards: monthContext.currentMonthRewards,
    currentOpenGovernanceMonthIndex: monthContext.currentMonthIndex,
    governanceNowMs,
    portfolio,
    currentPositionsDollarValue,
    rewardsAvailableDollarValue,
    openStakingMaxDollarValue,
    slotsPositionDollarValue,
  }
}

export default useOpenStakingPortfolio
