import { describe, expect, it } from 'vitest'

import {
  formatBalanceLabel,
  formatNativeFee,
  formatTokenAmount,
  formatUnitRate,
  formatUsd,
} from '@/features/_shared/trade-display'
import {
  formatTradePayDisplay,
  formatTradeReceiveDisplay,
} from '@/features/_shared/trade-input-format'

describe('trade display formatters', () => {
  it('formats USD and token labels for UI binding', () => {
    expect(formatUsd(12.345)).toContain('$')
    expect(formatTokenAmount(1.5, 'USN', 18)).toContain('USN')
    expect(formatBalanceLabel(2, 'USDC', 6)).toMatch(/^Bal:/)
    expect(formatNativeFee(0.001, 'ETH', 18)).toContain('ETH')
    expect(formatUnitRate(1.23456).length).toBeGreaterThan(0)
  })

  it('uses human-readable grouping for large USD notionals', () => {
    expect(formatUsd(12345.67)).toMatch(/12,345\.67|\$12,345/)
  })
})

describe('trade pay/receive display pairing', () => {
  it('keeps pay display precise and receive display short', () => {
    const amount = 1234567.891234
    expect(formatTradePayDisplay(amount)).toBe('1,234,567.891234')
    expect(formatTradeReceiveDisplay(amount)).toBe('1,234,567.89')
  })
})
