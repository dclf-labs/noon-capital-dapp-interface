import { describe, expect, it } from 'vitest'

import {
  formatBalanceLabel,
  formatConfirmAmount,
  formatNativeFee,
  formatNativeFeeDetail,
  formatTokenAmount,
  formatUnitRate,
  formatUsd,
} from '@/features/_shared/trade-display'
import {
  formatTradePayDisplay,
  formatTradeReceiveDisplay,
  toTradeReceiveStoredAmount,
  TRADE_PAY_DECIMALS,
  TRADE_RECEIVE_DISPLAY_DECIMALS,
} from '@/features/_shared/trade-input-format'
import { down } from '@/lib/format'

describe('trade display formatters', () => {
  it('formats USD notionals with ~$ prefix and exactly 2dp (floor)', () => {
    expect(formatUsd(12.345)).toBe('~$12.34')
    expect(formatUsd(12345.67)).toBe('~$12,345.67')
    expect(formatUsd(0)).toBe('~$0.00')
    expect(formatUsd(undefined)).toBe('~$0.00')
  })

  it('formats token amounts with symbol and compact threshold', () => {
    // Pay path downs to 6dp then Intl rounds to 2 displayed digits.
    expect(formatTokenAmount(1.5, 'USN', 18)).toBe('1.50 USN')
    expect(formatTokenAmount(1234.567891, 'USDC', TRADE_PAY_DECIMALS)).toBe('1,234.57 USDC')
    // Receive path downs to 2dp first (truncates), then formats.
    expect(formatTokenAmount(999.654321, 'USN', TRADE_RECEIVE_DISPLAY_DECIMALS)).toBe('999.65 USN')
    // At/above 100k: compact notation.
    expect(formatTokenAmount(150_000, 'USN', 2)).toMatch(/150K|150\.00K|150K USN/i)
  })

  it('formats balance, native fee dust, and unit rate for UI binding', () => {
    expect(formatBalanceLabel(2, 'USDC', 6)).toBe('Bal: 2.00 USDC')
    expect(formatNativeFee(0.001, 'ETH', 18)).toBe('<0.01 ETH')
    expect(formatNativeFee(0.02, 'ETH', 18)).toBe('~0.02 ETH')
    expect(formatUnitRate(1.23456)).toBe('1.2345')
  })

  it('formats native fee detail without collapsing dust under 0.01', () => {
    expect(formatNativeFeeDetail(0.000042, 'ETH')).toBe('~0.000042 ETH')
    expect(formatNativeFeeDetail(0.02, 'SOPH')).toBe('~0.02 SOPH')
    expect(formatNativeFeeDetail(0, 'ETH')).toBe('~0 ETH')
  })

  it('formats confirm/success amounts with compact and dust labels', () => {
    expect(formatConfirmAmount(21)).toBe('21.00')
    expect(formatConfirmAmount(0.001)).toBe('<0.01')
    expect(formatConfirmAmount(150_000)).toMatch(/150(\.0+)?K/i)
    expect(formatConfirmAmount(undefined)).toBe('0')
  })
})

describe('trade pay/receive display pairing', () => {
  it('keeps pay display precise and receive display short', () => {
    const amount = 1234567.891234
    expect(formatTradePayDisplay(amount)).toBe('1,234,567.891234')
    expect(formatTradeReceiveDisplay(amount)).toBe('1,234,567.89')
  })

  it('matches confirm-row pairing: pay@6dp label vs receive@2dp label', () => {
    const amountIn = 1000.123456
    const amountOut = 999.654321
    expect(formatTokenAmount(amountIn, 'USDC', TRADE_PAY_DECIMALS)).toBe('1,000.12 USDC')
    expect(formatTokenAmount(amountOut, 'USN', TRADE_RECEIVE_DISPLAY_DECIMALS)).toBe('999.65 USN')
  })

  it('computes buy/sell min-received (1% slippage) the same way as TradePanelView', () => {
    const amountOut = 999.654321
    const minReceived = toTradeReceiveStoredAmount(down(amountOut * 0.99, TRADE_PAY_DECIMALS))
    expect(minReceived).toBe(989.657777)
    expect(formatTokenAmount(minReceived, 'USN', TRADE_RECEIVE_DISPLAY_DECIMALS)).toBe('989.65 USN')
    // Display truncates; stored 6dp used for submit stays higher.
    expect(minReceived).toBeGreaterThan(989.65)
  })
})
