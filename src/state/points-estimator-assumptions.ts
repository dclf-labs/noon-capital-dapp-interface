import { create } from 'zustand'

import {
  DEFAULT_POINTS_ESTIMATE_FDV_IN_BILLIONS,
  DEFAULT_POINTS_ESTIMATE_STAKING_PERIOD,
} from '@/constants/common'
import { toNum, toStr } from '@/lib/format'

const STORAGE_KEY = 'noon-points-staking-period'

function readStoredStakingPeriod(): number {
  if (typeof window === 'undefined') return toNum(DEFAULT_POINTS_ESTIMATE_STAKING_PERIOD)
  try {
    return toNum(localStorage.getItem(STORAGE_KEY) || DEFAULT_POINTS_ESTIMATE_STAKING_PERIOD)
  } catch {
    return toNum(DEFAULT_POINTS_ESTIMATE_STAKING_PERIOD)
  }
}

type PointsEstimatorAssumptionsStore = {
  fdv: number
  stakingPeriod: number
  setFdv: (fdv: number) => void
  setStakingPeriod: (stakingPeriod: number) => void
}

/**
 * UI assumptions for the points / value estimator.
 * Persist staking period only (localStorage); FDV stays in-memory.
 */
export const usePointsEstimatorAssumptionsStore = create<PointsEstimatorAssumptionsStore>(
  (set) => ({
    fdv: toNum(DEFAULT_POINTS_ESTIMATE_FDV_IN_BILLIONS),
    stakingPeriod: readStoredStakingPeriod(),
    setFdv: (fdv: number) => {
      set({ fdv: toNum(fdv) })
    },
    setStakingPeriod: (stakingPeriod: number) => {
      const next = toNum(stakingPeriod)
      try {
        localStorage.setItem(STORAGE_KEY, toStr(next))
      } catch {
        // Ignore quota / private-mode failures
      }
      set({ stakingPeriod: next })
    },
  }),
)

export default usePointsEstimatorAssumptionsStore
