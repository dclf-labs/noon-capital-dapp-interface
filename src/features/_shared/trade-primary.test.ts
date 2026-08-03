import { describe, expect, it } from 'vitest'

import { getTradePrimaryAction } from '@/features/_shared/trade-primary'

const base = {
  mode: 'buy' as const,
  step: 0,
  isConnected: true,
  isBalanceLoading: false,
  amountIn: 1,
  amountOut: 2,
  isFetchingQuote: false,
  isQuoteError: false,
  isInsufficientBalance: false,
  isApproved: true,
  requiresApproval: true,
  isBusySubmit: false,
}

describe('getTradePrimaryAction', () => {
  it('gates on connect / loading / amount / quote', () => {
    expect(getTradePrimaryAction({ ...base, isConnected: false }).label).toBe('Connect wallet')
    expect(getTradePrimaryAction({ ...base, isBalanceLoading: true }).loading).toBe(true)
    expect(getTradePrimaryAction({ ...base, amountIn: undefined }).label).toBe('Enter amount')
    expect(getTradePrimaryAction({ ...base, isFetchingQuote: true }).label).toBe('Fetching quote')
    expect(getTradePrimaryAction({ ...base, isQuoteError: true }).disabled).toBe(true)
    expect(getTradePrimaryAction({ ...base, isInsufficientBalance: true }).disabled).toBe(true)
  })

  it('requires approval before next on EVM-style flows', () => {
    const action = getTradePrimaryAction({
      ...base,
      isApproved: false,
      requiresApproval: true,
      tokenInSymbol: 'USDC',
    })
    expect(action.label).toBe('Approve USDC')
    expect(action.disabled).toBe(false)
  })

  it('requires a route for Starknet-style next', () => {
    expect(
      getTradePrimaryAction({
        ...base,
        requiresApproval: false,
        hasRoute: false,
      }).disabled,
    ).toBe(true)
  })

  it('shows confirm / retry labels on step 1', () => {
    expect(
      getTradePrimaryAction({
        ...base,
        step: 1,
        mode: 'buy',
        requiresApproval: false,
      }).label,
    ).toBe('Confirm the transaction')
    expect(
      getTradePrimaryAction({
        ...base,
        step: 1,
        mode: 'sell',
        requiresApproval: false,
      }).label,
    ).toBe('Confirm sell')
    expect(
      getTradePrimaryAction({
        ...base,
        step: 1,
        submitFailed: true,
        requiresApproval: false,
      }).label,
    ).toBe('Retry swap')
  })
})
