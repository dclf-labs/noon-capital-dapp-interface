import { describe, expect, it } from 'vitest'

import {
  getAmountUsd,
  getPresetAmount,
  isBalancePresetDisabled,
  normalizePreviewQuote,
  normalizePreviewRoute,
  normalizeTradeAmount,
} from '@/features/_shared/trade-amounts'

describe('trade amount helpers', () => {
  it('clips trade amounts to input precision', () => {
    expect(normalizeTradeAmount(1.123456789)).toBe(1.123456)
    expect(normalizeTradeAmount(undefined)).toBe(0)
  })

  it('builds half / max presets from balance', () => {
    expect(getPresetAmount(10, 'max')).toBe(10)
    expect(getPresetAmount(10, 'half')).toBe(5)
  })

  it('disables presets while balance is loading or empty', () => {
    expect(isBalancePresetDisabled({ isLoading: true, data: 1 })).toBe(true)
    expect(isBalancePresetDisabled({ isError: true, data: 1 })).toBe(true)
    expect(isBalancePresetDisabled({ data: 0 })).toBe(true)
    expect(isBalancePresetDisabled({ data: 2 })).toBe(false)
  })

  it('computes USD notional safely', () => {
    expect(getAmountUsd(2, { data: 1.5 })).toBe(3)
    expect(getAmountUsd(2, { isLoading: true, data: 1.5 })).toBe(0)
    expect(getAmountUsd(undefined, { data: 1.5 })).toBe(0)
  })

  it('normalizes EVM and Starknet preview shapes', () => {
    expect(normalizePreviewQuote(1.25)).toBe(1.25)
    expect(normalizePreviewQuote({ quote: 2, route: ['a'] })).toBe(2)
    expect(normalizePreviewRoute({ quote: 2, route: ['a', 'b'] })).toEqual(['a', 'b'])
    expect(normalizePreviewRoute(1.25)).toEqual([])
  })
})
