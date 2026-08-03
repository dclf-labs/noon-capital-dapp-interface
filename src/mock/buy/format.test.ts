import { describe, expect, it } from 'vitest'

import { formatBuyBalanceLabel, formatBuyUsdAmount } from '@/mock/buy/format'

describe('formatBuyUsdAmount', () => {
  it('formats positive amounts and treats empty as 0', () => {
    expect(formatBuyUsdAmount(0)).toBe('0')
    expect(formatBuyUsdAmount(-1)).toBe('0')
    expect(formatBuyUsdAmount(1000)).toBe('1,000')
    expect(formatBuyUsdAmount(100.5)).toBe('100.5')
  })
})

describe('formatBuyBalanceLabel', () => {
  it('prefixes a USD balance', () => {
    expect(formatBuyBalanceLabel(100_000)).toBe('Bal: $100,000')
    expect(formatBuyBalanceLabel(Number.NaN)).toBe('Bal: —')
  })
})
