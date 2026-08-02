import { describe, expect, it } from 'vitest'

import { formatTradeReceiveDisplay } from '@/features/_shared/trade-input-format'
import {
  computeMintPreviewAmountOut,
  computeRedeemPreviewAmountOut,
  isMintRedeemPricePending,
  isMintRedeemPriceUnavailable,
} from '@/features/mint-redeem/preview'

describe('mint preview quote', () => {
  it('returns collateralUsd * amountIn for USDC/USDT-style prices', () => {
    expect(computeMintPreviewAmountOut(100, 1)).toBe(100)
    expect(computeMintPreviewAmountOut(50, 1.02)).toBeCloseTo(51)
  })

  it('keeps fractional mint quotes stable for UI receive binding', () => {
    // 1,234.567891 USDC @ $0.999 → receive amountOut that panels show @ 2dp.
    const amountOut = computeMintPreviewAmountOut(1234.567891, 0.999)
    expect(amountOut).toBeCloseTo(1234.567891 * 0.999, 10)
    expect(formatTradeReceiveDisplay(amountOut)).toBe(
      formatTradeReceiveDisplay(1234.567891 * 0.999),
    )
  })

  it('returns 0 when amountIn is missing', () => {
    expect(computeMintPreviewAmountOut(undefined, 1)).toBe(0)
    expect(computeMintPreviewAmountOut(0, 1)).toBe(0)
  })

  it('throws when amount is set but tokenPrice is missing or zero', () => {
    expect(() => computeMintPreviewAmountOut(10, undefined)).toThrow(/price/i)
    expect(() => computeMintPreviewAmountOut(10, 0)).toThrow(/price/i)
  })
})

describe('redeem preview quote', () => {
  it('returns amountIn / tokenOutPrice for USDC at ~1', () => {
    expect(computeRedeemPreviewAmountOut(100, 1)).toBe(100)
    expect(computeRedeemPreviewAmountOut(100, 0.5)).toBe(200)
  })

  it('keeps fractional redeem quotes stable for UI receive binding', () => {
    // 100 USN ÷ $1.0025 USDT → collateral out shown @ 2dp in receive field.
    const amountOut = computeRedeemPreviewAmountOut(100, 1.0025)
    expect(amountOut).toBeCloseTo(100 / 1.0025, 10)
    expect(formatTradeReceiveDisplay(amountOut)).toBe('99.75')
  })

  it('guards divide-by-zero when tokenOutPrice is 0', () => {
    expect(() => computeRedeemPreviewAmountOut(10, 0)).toThrow(/price/i)
  })

  it('returns 0 when amountIn is missing', () => {
    expect(computeRedeemPreviewAmountOut(undefined, 1)).toBe(0)
  })
})

describe('mint/redeem price pending helpers', () => {
  it('marks price pending only while amount is entered and feed is loading', () => {
    expect(isMintRedeemPricePending(1, true)).toBe(true)
    expect(isMintRedeemPricePending(1, false)).toBe(false)
    expect(isMintRedeemPricePending(undefined, true)).toBe(false)
  })

  it('marks price unavailable after settle when missing, zero, or errored', () => {
    expect(isMintRedeemPriceUnavailable(1, false, undefined, false)).toBe(true)
    expect(isMintRedeemPriceUnavailable(1, false, 0, false)).toBe(true)
    expect(isMintRedeemPriceUnavailable(1, false, 1, true)).toBe(true)
    expect(isMintRedeemPriceUnavailable(1, true, undefined, false)).toBe(false)
    expect(isMintRedeemPriceUnavailable(1, false, 1, false)).toBe(false)
    expect(isMintRedeemPriceUnavailable(undefined, false, undefined, false)).toBe(false)
  })
})
