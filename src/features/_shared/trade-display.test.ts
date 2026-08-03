import { describe, expect, it } from 'vitest'

import {
  formatBalanceLabel,
  formatConfirmAmount,
  formatFeeUsd,
  formatNativeFee,
  formatNativeFeeDetail,
  formatPercent,
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
  it('formats USD notionals with ~$ prefix, max 1dp, no trailing zeros', () => {
    expect(formatUsd(12.345)).toBe('~$12.3')
    expect(formatUsd(12345.67)).toBe('~$12,345.6')
    expect(formatUsd(0)).toBe('~$0')
    expect(formatUsd(undefined)).toBe('~$0')
    expect(formatUsd(12)).toBe('~$12')
    expect(formatUsd(0.05)).toBe('<$0.1')
  })

  it('formats network/gas fee USD without approximate prefix', () => {
    expect(formatFeeUsd(12.345)).toBe('$12.3')
    expect(formatFeeUsd(0.21)).toBe('$0.2')
    expect(formatFeeUsd(undefined)).toBe('$0')
    expect(formatFeeUsd(0.00008)).toBe('<$0.1')
  })

  it('formats token amounts with symbol and compact threshold', () => {
    expect(formatTokenAmount(1.5, 'USN', 18)).toBe('1.5 USN')
    expect(formatTokenAmount(1234.567891, 'USDC', TRADE_PAY_DECIMALS)).toBe('1,234.5 USDC')
    expect(formatTokenAmount(999.654321, 'USN', TRADE_RECEIVE_DISPLAY_DECIMALS)).toBe('999.6 USN')
    expect(formatTokenAmount(150_000, 'USN', 2)).toMatch(/150K|150\.0K|150K USN/i)
    expect(formatTokenAmount(0.004, 'USN', 18)).toBe('<0.1 USN')
    expect(formatTokenAmount(2, 'USDC', 6)).toBe('2 USDC')
  })

  it('formats balance, native fee dust, and unit rate for UI binding', () => {
    expect(formatBalanceLabel(2, 'USDC', 6)).toBe('Bal: 2 USDC')
    expect(formatNativeFee(0.001, 'ETH', 18)).toBe('<0.1 ETH')
    expect(formatNativeFee(0.02, 'ETH', 18)).toBe('<0.1 ETH')
    expect(formatNativeFee(0.2, 'ETH', 18)).toBe('0.2 ETH')
    expect(formatUnitRate(1.23456)).toBe('1.2')
  })

  it('formats native fee detail with the same 1dp dust floor', () => {
    expect(formatNativeFeeDetail(0.000042, 'ETH')).toBe('<0.1 ETH')
    expect(formatNativeFeeDetail(0.2, 'SOPH')).toBe('0.2 SOPH')
    expect(formatNativeFeeDetail(0, 'ETH')).toBe('0 ETH')
  })

  it('formats percentages with max 2dp and no trailing zeros', () => {
    expect(formatPercent(17.55)).toBe('17.55%')
    expect(formatPercent(10)).toBe('10%')
    expect(formatPercent(4.1)).toBe('4.1%')
    expect(formatPercent(0.004)).toBe('<0.01%')
  })

  it('formats confirm/success amounts with compact and dust labels', () => {
    expect(formatConfirmAmount(21)).toBe('21')
    expect(formatConfirmAmount(21.5)).toBe('21.5')
    expect(formatConfirmAmount(0.001)).toBe('<0.1')
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
    expect(formatTokenAmount(amountIn, 'USDC', TRADE_PAY_DECIMALS)).toBe('1,000.1 USDC')
    expect(formatTokenAmount(amountOut, 'USN', TRADE_RECEIVE_DISPLAY_DECIMALS)).toBe('999.6 USN')
  })

  it('computes buy/sell min-received (1% slippage) the same way as TradePanelView', () => {
    const amountOut = 999.654321
    const minReceived = toTradeReceiveStoredAmount(down(amountOut * 0.99, TRADE_PAY_DECIMALS))
    expect(minReceived).toBe(989.657777)
    expect(formatTokenAmount(minReceived, 'USN', TRADE_RECEIVE_DISPLAY_DECIMALS)).toBe('989.6 USN')
    expect(minReceived).toBeGreaterThan(989.65)
  })
})
