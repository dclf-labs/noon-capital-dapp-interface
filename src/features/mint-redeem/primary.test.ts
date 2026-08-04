import { describe, expect, it } from 'vitest'

import { getMintRedeemPrimaryAction } from '@/features/mint-redeem/primary'

const base = {
  mode: 'mint' as const,
  step: 0,
  isConnected: true,
  isBalanceLoading: false,
  isAllowanceLoading: false,
  isWhitelistLoading: false,
  isWhitelisted: true,
  amountIn: 1,
  amountOut: 2,
  isFetchingQuote: false,
  isQuoteError: false,
  isInsufficientBalance: false,
  isApproved: true,
  isBusyApprove: false,
  isBusySubmit: false,
  submitFailed: false,
}

describe('getMintRedeemPrimaryAction', () => {
  it('gates connect before loading', () => {
    expect(getMintRedeemPrimaryAction({ ...base, isConnected: false }).label).toBe('Connect wallet')
  })

  it('shows Loading when balance, allowance, or whitelist is loading', () => {
    expect(getMintRedeemPrimaryAction({ ...base, isBalanceLoading: true }).label).toBe('Loading')
    expect(getMintRedeemPrimaryAction({ ...base, isAllowanceLoading: true }).loading).toBe(true)
    expect(getMintRedeemPrimaryAction({ ...base, isWhitelistLoading: true }).disabled).toBe(true)
  })

  it('surfaces whitelist RPC failures separately from not-whitelisted', () => {
    expect(
      getMintRedeemPrimaryAction({
        ...base,
        isWhitelistError: true,
        isWhitelisted: false,
      }).label,
    ).toBe('Whitelist check failed')
  })

  it('gates whitelist before amount entry', () => {
    expect(
      getMintRedeemPrimaryAction({
        ...base,
        isWhitelisted: false,
      }).label,
    ).toBe('Not whitelisted')
  })

  it('shows Enter amount when amountIn is missing', () => {
    expect(getMintRedeemPrimaryAction({ ...base, amountIn: undefined }).label).toBe('Enter amount')
  })

  it('shows Fetching quote / Quote unavailable / Insufficient balance', () => {
    expect(getMintRedeemPrimaryAction({ ...base, isFetchingQuote: true }).label).toBe(
      'Fetching quote',
    )
    expect(getMintRedeemPrimaryAction({ ...base, isQuoteError: true }).label).toBe(
      'Quote unavailable',
    )
    expect(getMintRedeemPrimaryAction({ ...base, isInsufficientBalance: true }).disabled).toBe(true)
  })

  it('shows Retry approve when approveStatus is TXN_FAILURE', () => {
    expect(
      getMintRedeemPrimaryAction({
        ...base,
        isApproved: false,
        approveStatus: 'TXN_FAILURE',
      }).label,
    ).toBe('Retry approve')
  })

  it('disables Approve while isBusyApprove', () => {
    const action = getMintRedeemPrimaryAction({
      ...base,
      isApproved: false,
      isBusyApprove: true,
      tokenInSymbol: 'USDC',
    })
    expect(action.label).toBe('Approving')
    expect(action.disabled).toBe(true)
    expect(action.loading).toBe(true)
  })

  it('requires approval then action+token, then confirm', () => {
    expect(
      getMintRedeemPrimaryAction({
        ...base,
        isApproved: false,
        tokenInSymbol: 'USDC',
      }).label,
    ).toBe('Approve USDC')

    expect(
      getMintRedeemPrimaryAction({
        ...base,
        mode: 'mint',
        tokenOutSymbol: 'USN',
      }).label,
    ).toBe('Mint USN')
    expect(
      getMintRedeemPrimaryAction({
        ...base,
        mode: 'redeem',
        tokenInSymbol: 'USN',
      }).label,
    ).toBe('Redeem USN')

    expect(
      getMintRedeemPrimaryAction({
        ...base,
        step: 1,
        mode: 'redeem',
      }).label,
    ).toBe('Confirm redeem')
  })

  it('disables action CTA when amountOut is missing even if approved', () => {
    expect(
      getMintRedeemPrimaryAction({
        ...base,
        amountOut: undefined,
      }).disabled,
    ).toBe(true)
  })

  it('uses Confirm mint vs Confirm redeem labels', () => {
    expect(getMintRedeemPrimaryAction({ ...base, step: 1, mode: 'mint' }).label).toBe(
      'Confirm mint',
    )
    expect(getMintRedeemPrimaryAction({ ...base, step: 1, mode: 'redeem' }).label).toBe(
      'Confirm redeem',
    )
  })

  it('shows Retry mint / Retry redeem when submitFailed', () => {
    expect(
      getMintRedeemPrimaryAction({
        ...base,
        step: 1,
        mode: 'mint',
        submitFailed: true,
      }).label,
    ).toBe('Retry mint')
    expect(
      getMintRedeemPrimaryAction({
        ...base,
        step: 1,
        mode: 'redeem',
        submitFailed: true,
      }).label,
    ).toBe('Retry redeem')
  })

  it('disables confirm when not approved, amountOut missing, or busy submitting', () => {
    expect(
      getMintRedeemPrimaryAction({
        ...base,
        step: 1,
        isApproved: false,
      }).disabled,
    ).toBe(true)
    expect(
      getMintRedeemPrimaryAction({
        ...base,
        step: 1,
        amountOut: undefined,
      }).disabled,
    ).toBe(true)
    expect(
      getMintRedeemPrimaryAction({
        ...base,
        step: 1,
        isBusySubmit: true,
      }),
    ).toMatchObject({ label: 'Minting', disabled: true, loading: true })
  })
})
