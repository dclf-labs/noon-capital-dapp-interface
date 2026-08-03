import { describe, expect, it } from 'vitest'

import { getBridgePrimaryAction } from '@/features/bridge/primary'

const base = {
  step: 0,
  isConnected: true,
  hasSourceNetwork: true,
  hasDestinationNetwork: true,
  pairAllowed: true,
  hasReceiver: true,
  hasToken: true,
  amount: 1,
  isBalanceLoading: false,
  isAllowanceLoading: false,
  isFeeLoading: false,
  isFeeError: false,
  isInsufficientBalance: false,
  routeDisabled: false,
  requiresApproval: true,
  isApproved: true,
  isBusyApprove: false,
  isBusySubmit: false,
  submitFailed: false,
}

describe('getBridgePrimaryAction', () => {
  it('gates connect / networks / receiver / amount / fee', () => {
    expect(getBridgePrimaryAction({ ...base, isConnected: false }).label).toBe('Connect wallet')
    expect(getBridgePrimaryAction({ ...base, unsupported: true }).label).toBe('Switch network')
    expect(getBridgePrimaryAction({ ...base, hasSourceNetwork: false }).label).toBe(
      'Select source network',
    )
    expect(getBridgePrimaryAction({ ...base, hasDestinationNetwork: false }).label).toBe(
      'Select destination network',
    )
    expect(getBridgePrimaryAction({ ...base, pairAllowed: false }).label).toBe('Unsupported route')
    expect(getBridgePrimaryAction({ ...base, hasReceiver: false }).label).toBe(
      'Enter receiver address',
    )
    expect(getBridgePrimaryAction({ ...base, hasToken: false }).label).toBe('Select token')
    expect(getBridgePrimaryAction({ ...base, isBalanceLoading: true }).label).toBe('Loading')
    expect(getBridgePrimaryAction({ ...base, isAllowanceLoading: true }).label).toBe('Loading')
    expect(getBridgePrimaryAction({ ...base, amount: undefined }).label).toBe('Enter amount')
    expect(getBridgePrimaryAction({ ...base, isFeeLoading: true }).label).toBe('Fetching fee')
    expect(getBridgePrimaryAction({ ...base, isFeeError: true }).label).toBe('Fee unavailable')
    expect(getBridgePrimaryAction({ ...base, isInsufficientBalance: true }).label).toBe(
      'Insufficient balance',
    )
  })

  it('requires LayerZero approve then next, Hyperlane skips approve', () => {
    expect(
      getBridgePrimaryAction({
        ...base,
        isApproved: false,
        tokenSymbol: 'sUSN',
      }).label,
    ).toBe('Approve sUSN')

    expect(
      getBridgePrimaryAction({
        ...base,
        requiresApproval: false,
        isApproved: false,
      }).label,
    ).toBe('Next')
  })

  it('surfaces route kill switch, submit gate, and confirm/retry', () => {
    expect(
      getBridgePrimaryAction({
        ...base,
        routeDisabled: true,
        routeDisabledLabel: 'Sui → Ethereum bridge unavailable',
      }).label,
    ).toBe('Sui → Ethereum bridge unavailable')

    expect(
      getBridgePrimaryAction({
        ...base,
        submitDisabled: true,
        submitDisabledLabel: 'OFT not configured',
      }).label,
    ).toBe('OFT not configured')

    expect(getBridgePrimaryAction({ ...base, step: 1 }).label).toBe('Confirm bridge')
    expect(
      getBridgePrimaryAction({
        ...base,
        step: 1,
        submitFailed: true,
      }).label,
    ).toBe('Retry bridge')
  })
})
