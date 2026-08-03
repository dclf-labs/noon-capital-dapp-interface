import { describe, expect, it } from 'vitest'

import {
  formatCooldownRemaining,
  getWithdrawClaimLabel,
  getWithdrawUnlockAt,
  isWithdrawRequestClaimable,
} from '@/features/stake-unstake/withdraw-claim'

const DAY = 86_400_000

describe('withdraw claim helpers', () => {
  it('computes unlock time from timestamp + period', () => {
    expect(getWithdrawUnlockAt(1_000, DAY)).toBe(1_000 + DAY)
  })

  it('is claimable only after cooldown and when not claimed', () => {
    const timestamp = 1_000_000
    const period = DAY
    const unlock = timestamp + period

    expect(isWithdrawRequestClaimable({ claimed: false, timestamp }, period, unlock - 1)).toBe(
      false,
    )
    expect(isWithdrawRequestClaimable({ claimed: false, timestamp }, period, unlock)).toBe(true)
    expect(isWithdrawRequestClaimable({ claimed: true, timestamp }, period, unlock + 10)).toBe(
      false,
    )
    expect(isWithdrawRequestClaimable({ claimed: false, timestamp }, 0, unlock)).toBe(false)
  })

  it('formats remaining cooldown compactly', () => {
    const now = 0
    expect(formatCooldownRemaining(DAY + 3_600_000, now)).toBe('1d 1h')
    expect(formatCooldownRemaining(3_600_000 + 120_000, now)).toBe('1h 2m')
    expect(formatCooldownRemaining(90_000, now)).toBe('1m')
    expect(formatCooldownRemaining(0, now)).toBe('Ready')
  })

  it('builds claim button labels', () => {
    expect(
      getWithdrawClaimLabel({ claimed: true, claimable: true, isBusy: false, failed: false }),
    ).toBe('Claimed')
    expect(
      getWithdrawClaimLabel({ claimed: false, claimable: false, isBusy: false, failed: false }),
    ).toBe('Cooling down')
    expect(
      getWithdrawClaimLabel({ claimed: false, claimable: true, isBusy: true, failed: false }),
    ).toBe('Claiming')
    expect(
      getWithdrawClaimLabel({ claimed: false, claimable: true, isBusy: false, failed: true }),
    ).toBe('Retry claim')
    expect(
      getWithdrawClaimLabel({ claimed: false, claimable: true, isBusy: false, failed: false }),
    ).toBe('Claim')
  })
})
