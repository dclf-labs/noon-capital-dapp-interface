import { describe, expect, it } from 'vitest'

import { getStakeUnstakePrimaryAction } from '@/features/stake-unstake/primary'

const base = {
  mode: 'stake' as const,
  step: 0,
  isConnected: true,
  isBalanceLoading: false,
  isAllowanceLoading: false,
  amountIn: 1,
  amountOut: 2,
  isFetchingQuote: false,
  isQuoteError: false,
  isInsufficientBalance: false,
  requiresApproval: true,
  isApproved: true,
  isBusyApprove: false,
  isBusySubmit: false,
  submitFailed: false,
}

describe('getStakeUnstakePrimaryAction', () => {
  it('gates connect / loading / amount / quote', () => {
    expect(getStakeUnstakePrimaryAction({ ...base, isConnected: false }).label).toBe(
      'Connect wallet',
    )
    expect(getStakeUnstakePrimaryAction({ ...base, isBalanceLoading: true }).loading).toBe(true)
    expect(getStakeUnstakePrimaryAction({ ...base, amountIn: undefined }).label).toBe(
      'Enter amount',
    )
    expect(getStakeUnstakePrimaryAction({ ...base, isFetchingQuote: true }).label).toBe(
      'Fetching quote',
    )
    expect(getStakeUnstakePrimaryAction({ ...base, isQuoteError: true }).label).toBe(
      'Quote unavailable',
    )
    expect(getStakeUnstakePrimaryAction({ ...base, isInsufficientBalance: true }).disabled).toBe(
      true,
    )
  })

  it('requires approval for stake but not unstake', () => {
    expect(
      getStakeUnstakePrimaryAction({
        ...base,
        isApproved: false,
        tokenInSymbol: 'USN',
      }).label,
    ).toBe('Approve USN')

    expect(
      getStakeUnstakePrimaryAction({
        ...base,
        mode: 'unstake',
        requiresApproval: false,
        isApproved: false,
        tokenInSymbol: 'sUSN',
      }).label,
    ).toBe('Unstake sUSN')
  })

  it('shows Retry approve / Approving states', () => {
    expect(
      getStakeUnstakePrimaryAction({
        ...base,
        isApproved: false,
        approveStatus: 'TXN_FAILURE',
      }).label,
    ).toBe('Retry approve')

    expect(
      getStakeUnstakePrimaryAction({
        ...base,
        isApproved: false,
        isBusyApprove: true,
      }),
    ).toMatchObject({ label: 'Approving', disabled: true, loading: true })
  })

  it('disables action CTA without amountOut', () => {
    expect(getStakeUnstakePrimaryAction({ ...base, amountOut: undefined }).disabled).toBe(true)
  })

  it('shows Stake / Unstake with token symbol on step 0', () => {
    expect(
      getStakeUnstakePrimaryAction({
        ...base,
        mode: 'stake',
        tokenInSymbol: 'USN',
      }).label,
    ).toBe('Stake USN')
  })

  it('shows Confirm / Retry labels per mode', () => {
    expect(getStakeUnstakePrimaryAction({ ...base, step: 1, mode: 'stake' }).label).toBe(
      'Confirm stake',
    )
    expect(getStakeUnstakePrimaryAction({ ...base, step: 1, mode: 'unstake' }).label).toBe(
      'Confirm unstake',
    )
    expect(
      getStakeUnstakePrimaryAction({
        ...base,
        step: 1,
        mode: 'unstake',
        submitFailed: true,
      }).label,
    ).toBe('Retry unstake')
  })

  it('disables confirm while submitting', () => {
    expect(
      getStakeUnstakePrimaryAction({
        ...base,
        step: 1,
        isBusySubmit: true,
      }),
    ).toMatchObject({ label: 'Staking', disabled: true, loading: true })
  })
})
