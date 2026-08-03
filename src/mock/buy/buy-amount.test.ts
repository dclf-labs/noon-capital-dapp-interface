import { describe, expect, it } from 'vitest'

import { buyTokenAmountFromUsd, payAmountFromBuyAmount } from '@/mock/buy/buy-amount'

describe('buyTokenAmountFromUsd', () => {
  it('uses 1:1 when buy-token USD price is missing', () => {
    expect(buyTokenAmountFromUsd(100, undefined)).toBe(100)
    expect(buyTokenAmountFromUsd(300, 0)).toBe(300)
  })

  it('divides by the buy-token USD price', () => {
    expect(buyTokenAmountFromUsd(100, 2)).toBe(50)
  })
})

describe('payAmountFromBuyAmount', () => {
  it('uses 1:1 when unit rate is missing', () => {
    expect(payAmountFromBuyAmount(100, undefined)).toBe(100)
  })

  it('divides buy amount by out-per-in rate', () => {
    // 1 USDT → 0.99 USN ⇒ need ~101.01 USDT for 100 USN
    expect(payAmountFromBuyAmount(100, 0.99)).toBeCloseTo(101.010101, 5)
  })
})
