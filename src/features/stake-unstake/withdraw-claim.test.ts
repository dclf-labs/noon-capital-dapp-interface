import { describe, expect, it } from 'vitest'

import {
  COUNTDOWN_ZERO,
  formatCooldownRemaining,
  formatCountdownClock,
  formatWithdrawAmountDisplay,
  formatWithdrawRequestTimestamp,
  getCountdownParts,
  getWithdrawClaimLabel,
  getWithdrawUnlockAt,
  isValidWithdrawRequestId,
  isWithdrawRequestClaimable,
  shouldShowWithdrawCountdown,
} from '@/features/stake-unstake/withdraw-claim'
import { TxnStatus } from '@/lib/connection'

const DAY = 86_400_000

describe('withdraw claim helpers', () => {
  it('computes unlock time from timestamp + period', () => {
    expect(getWithdrawUnlockAt(1_000, DAY)).toBe(1_000 + DAY)
    expect(getWithdrawUnlockAt(Number.NaN, DAY)).toBe(0)
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
    expect(isWithdrawRequestClaimable({ claimed: false, timestamp: -1 }, period, unlock)).toBe(
      false,
    )
  })

  it('formats remaining cooldown compactly', () => {
    const now = 0
    expect(formatCooldownRemaining(DAY + 3_600_000, now)).toBe('1d 1h')
    expect(formatCooldownRemaining(3_600_000 + 120_000, now)).toBe('1h 2m')
    expect(formatCooldownRemaining(90_000, now)).toBe('1m')
    expect(formatCooldownRemaining(0, now)).toBe('Ready')
    expect(formatCooldownRemaining(Number.NaN, now)).toBe('Ready')
  })

  it('formats DD:HH:MM:SS countdown clock', () => {
    expect(formatCountdownClock(DAY + 3_600_000 + 120_000 + 5_000, 0)).toBe('01:01:02:05')
    expect(getCountdownParts(0, 0)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    expect(formatCountdownClock(0, 0)).toBe(COUNTDOWN_ZERO)
  })

  it('hides countdown when ready, claimed, or zeroed', () => {
    expect(
      shouldShowWithdrawCountdown({
        claimed: false,
        claimable: false,
        countdown: '01:00:00:00',
      }),
    ).toBe(true)
    expect(
      shouldShowWithdrawCountdown({
        claimed: false,
        claimable: true,
        countdown: COUNTDOWN_ZERO,
      }),
    ).toBe(false)
    expect(
      shouldShowWithdrawCountdown({
        claimed: true,
        claimable: false,
        countdown: '01:00:00:00',
      }),
    ).toBe(false)
  })

  it('formats UTC request timestamp', () => {
    expect(formatWithdrawRequestTimestamp(Date.UTC(2024, 0, 15, 12, 30))).toBe(
      '15th Jan 2024 • 12:30 PM UTC',
    )
    expect(formatWithdrawRequestTimestamp(0)).toBe('—')
    expect(formatWithdrawRequestTimestamp(Number.NaN)).toBe('—')
  })

  it('formats withdraw amount with symbol', () => {
    expect(formatWithdrawAmountDisplay(12.5, 'USN')).toMatch(/12\.5 USN/)
    expect(formatWithdrawAmountDisplay(Number.NaN, 'USN')).toBe('0 USN')
    expect(formatWithdrawAmountDisplay(1, '  ')).toMatch(/USN/)
  })

  it('validates request ids for submit', () => {
    expect(isValidWithdrawRequestId(0)).toBe(true)
    expect(isValidWithdrawRequestId(12)).toBe(true)
    expect(isValidWithdrawRequestId(-1)).toBe(false)
    expect(isValidWithdrawRequestId(1.5)).toBe(false)
    expect(isValidWithdrawRequestId(Number.NaN)).toBe(false)
  })

  it('builds claim button labels', () => {
    expect(getWithdrawClaimLabel({ claimed: true, claimable: true, failed: false })).toBe('Claimed')
    expect(getWithdrawClaimLabel({ claimed: false, claimable: false, failed: false })).toBe('Claim')
    expect(
      getWithdrawClaimLabel({
        claimed: false,
        claimable: true,
        failed: false,
        status: TxnStatus.PROCESSING,
      }),
    ).toBe('Claiming')
    expect(
      getWithdrawClaimLabel({
        claimed: false,
        claimable: true,
        failed: false,
        status: TxnStatus.TXN_SUBMITTED_ON_CHAIN,
      }),
    ).toBe('Claiming')
    expect(getWithdrawClaimLabel({ claimed: false, claimable: true, failed: true })).toBe(
      'Retry claim',
    )
    expect(getWithdrawClaimLabel({ claimed: false, claimable: true, failed: false })).toBe('Claim')
  })
})
