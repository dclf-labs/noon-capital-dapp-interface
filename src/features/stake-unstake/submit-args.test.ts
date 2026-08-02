import { getAddress } from 'viem'
import { describe, expect, it } from 'vitest'

import { getStakeDepositArgs, getUnstakeWithdrawArgs } from '@/features/stake-unstake/submit-args'
import { strToBn } from '@/lib/format'

const usn = { decimals: 18 }
const owner = '0x1111111111111111111111111111111111111111' as const
const handler = '0x0DaBc0D9B270c9B0C4C77AaCeAa712b56D0F9178' as const

describe('stake deposit args', () => {
  it('orders [assets, receiver] with truncated USN units', () => {
    const args = getStakeDepositArgs(usn, 12.345678901234567, owner)
    expect(args?.[0]).toBe(strToBn('12.345678901234', 18))
    expect(args?.[1]).toBe(getAddress(owner))
  })

  it('returns undefined when amount or receiver missing', () => {
    expect(getStakeDepositArgs(usn, undefined, owner)).toBeUndefined()
    expect(getStakeDepositArgs(usn, 1, undefined)).toBeUndefined()
  })
})

describe('unstake withdraw args', () => {
  it('orders [assets, withdrawHandler, owner] using USN asset amount', () => {
    const assetsOut = 99.5
    const args = getUnstakeWithdrawArgs(usn, assetsOut, handler, owner)
    expect(args?.[0]).toBe(strToBn(99.5, 18))
    expect(args?.[1]).toBe(getAddress(handler))
    expect(args?.[2]).toBe(getAddress(owner))
  })

  it('must not treat sUSN share input as withdraw assets', () => {
    // Regression: withdraw(assets) expects previewed USN out, not share amountIn.
    const sharesIn = 10
    const assetsOut = 10.25
    const wrong = getUnstakeWithdrawArgs(usn, sharesIn, handler, owner)
    const right = getUnstakeWithdrawArgs(usn, assetsOut, handler, owner)
    expect(wrong?.[0]).not.toBe(right?.[0])
    expect(right?.[0]).toBe(strToBn(10.25, 18))
  })

  it('truncates float-noisy asset amounts so they cannot inflate', () => {
    const noisy = 0.1 * 3
    const args = getUnstakeWithdrawArgs(usn, noisy, handler, owner)
    expect(noisy).toBeGreaterThan(0.3)
    expect(args?.[0]).toBe(strToBn('0.3', 18))
  })

  it('falls back for scientific-notation asset amounts without throwing', () => {
    const tiny = 1e-8
    const args = getUnstakeWithdrawArgs(usn, tiny, handler, owner)
    expect(args?.[0]).toBe(strToBn(tiny, 18))
  })
})
