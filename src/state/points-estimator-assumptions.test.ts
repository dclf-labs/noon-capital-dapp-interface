import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePointsEstimatorAssumptionsStore } from '@/state/points-estimator-assumptions'

describe('usePointsEstimatorAssumptionsStore', () => {
  beforeEach(() => {
    usePointsEstimatorAssumptionsStore.setState({
      fdv: 1,
      stakingPeriod: 12,
    })
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    })
  })

  it('updates fdv in memory', () => {
    usePointsEstimatorAssumptionsStore.getState().setFdv(2.5)
    expect(usePointsEstimatorAssumptionsStore.getState().fdv).toBe(2.5)
  })

  it('persists staking period to localStorage', () => {
    usePointsEstimatorAssumptionsStore.getState().setStakingPeriod(24)
    expect(usePointsEstimatorAssumptionsStore.getState().stakingPeriod).toBe(24)
    expect(localStorage.setItem).toHaveBeenCalledWith('noon-points-staking-period', '24')
  })

  it('keeps the in-memory staking period when localStorage throws', () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw new Error('quota')
    })
    usePointsEstimatorAssumptionsStore.getState().setStakingPeriod(36)
    expect(usePointsEstimatorAssumptionsStore.getState().stakingPeriod).toBe(36)
  })
})
