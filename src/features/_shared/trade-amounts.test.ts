import { describe, expect, it } from 'vitest'

import {
  getAmountUsd,
  getPresetAmount,
  isBalancePresetDisabled,
  NATIVE_GAS_RESERVE,
  normalizePreviewQuote,
  normalizePreviewRoute,
  normalizeTradeAmount,
  TRADE_INPUT_DECIMALS,
} from '@/features/_shared/trade-amounts'

describe('normalizeTradeAmount', () => {
  it('clips to the configured trade input decimals', () => {
    expect(TRADE_INPUT_DECIMALS).toBe(6)
    expect(normalizeTradeAmount(1.123456789)).toBe(1.123456)
    expect(normalizeTradeAmount(1.123456789, 2)).toBe(1.12)
    expect(normalizeTradeAmount(undefined)).toBe(0)
    expect(normalizeTradeAmount('3.1415926535')).toBe(3.141592)
  })
})

describe('getPresetAmount', () => {
  it('builds half / max presets from balance at 6dp', () => {
    expect(getPresetAmount(10, 'max')).toBe(10)
    expect(getPresetAmount(10, 'half')).toBe(5)
    expect(getPresetAmount(10.1234567, 'max')).toBe(10.123456)
    expect(getPresetAmount(10.1234567, 'half')).toBe(5.061728)
  })

  it('applies a reserve for native Max without going negative', () => {
    expect(getPresetAmount(1, 'max', 6, NATIVE_GAS_RESERVE)).toBe(0.99)
    expect(getPresetAmount(0.005, 'max', 6, NATIVE_GAS_RESERVE)).toBe(0)
    expect(getPresetAmount(1, 'half', 6, NATIVE_GAS_RESERVE)).toBe(0.495)
  })

  it('treats missing balance as zero', () => {
    expect(getPresetAmount(undefined, 'max')).toBe(0)
    expect(getPresetAmount(undefined, 'half')).toBe(0)
  })
})

describe('isBalancePresetDisabled', () => {
  it('disables presets while balance is loading, errored, or empty', () => {
    expect(isBalancePresetDisabled({ isLoading: true, data: 1 })).toBe(true)
    expect(isBalancePresetDisabled({ isError: true, data: 1 })).toBe(true)
    expect(isBalancePresetDisabled({ data: 0 })).toBe(true)
    expect(isBalancePresetDisabled({ data: 2 })).toBe(false)
  })
})

describe('getAmountUsd', () => {
  it('computes USD notional safely', () => {
    expect(getAmountUsd(2, { data: 1.5 })).toBe(3)
    expect(getAmountUsd(2, { isLoading: true, data: 1.5 })).toBe(0)
    expect(getAmountUsd(2, { isError: true, data: 1.5 })).toBe(0)
    expect(getAmountUsd(undefined, { data: 1.5 })).toBe(0)
  })
})

describe('preview normalization', () => {
  it('normalizes EVM and Starknet preview shapes', () => {
    expect(normalizePreviewQuote(1.25)).toBe(1.25)
    expect(normalizePreviewQuote({ quote: 2, route: ['a'] })).toBe(2)
    expect(normalizePreviewQuote(null)).toBeUndefined()
    expect(normalizePreviewQuote(undefined)).toBeUndefined()
    expect(normalizePreviewQuote({ route: ['a'] } as never)).toBeUndefined()
    expect(normalizePreviewRoute({ quote: 2, route: ['a', 'b'] })).toEqual(['a', 'b'])
    expect(normalizePreviewRoute(1.25)).toEqual([])
    expect(normalizePreviewRoute(null)).toEqual([])
    expect(normalizePreviewRoute({ quote: 1, route: undefined })).toEqual([])
  })
})
