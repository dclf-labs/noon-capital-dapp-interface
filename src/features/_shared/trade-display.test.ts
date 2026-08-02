import { describe, expect, it } from 'vitest'

import {
  formatBalanceLabel,
  formatNativeFee,
  formatTokenAmount,
  formatUnitRate,
  formatUsd,
} from '@/features/_shared/trade-display'

describe('trade display formatters', () => {
  it('formats USD and token labels for UI binding', () => {
    expect(formatUsd(12.345)).toContain('$')
    expect(formatTokenAmount(1.5, 'USN', 18)).toContain('USN')
    expect(formatBalanceLabel(2, 'USDC', 6)).toMatch(/^Bal:/)
    expect(formatNativeFee(0.001, 'ETH', 18)).toContain('ETH')
    expect(formatUnitRate(1.23456).length).toBeGreaterThan(0)
  })
})
