import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as ConfigModule from '@/config'
import { WithdrawClaimsPanel } from '@/pages/stake-unstake/WithdrawClaimsPanel'

const submit = vi.fn()
const refetch = vi.fn()

vi.mock('@/hooks/connection/useWalletSession', () => ({
  useEvmTargetSession: () => ({
    isConnected: true,
    unsupported: false,
    address: '0x1111111111111111111111111111111111111111',
    config: {
      id: 1,
      stakeWithdrawHandler: '0x0DaBc0D9B270c9B0C4C77AaCeAa712b56D0F9178',
      usn: '0xdA67B4284609d2d48e5d10cfAc411572727dc1eD',
    },
  }),
}))

vi.mock('@/config', async (importOriginal) => {
  const actual = await importOriginal<typeof ConfigModule>()
  return {
    ...actual,
    getToken: () => ({
      symbol: 'USN',
      decimals: 18,
      contractAddress: '0xdA67B4284609d2d48e5d10cfAc411572727dc1eD',
    }),
  }
})

vi.mock('@/features/withdraw', () => ({
  useWithdrawPeriod: () => ({ isLoading: false, isError: false, data: 7 * 86_400_000 }),
  useWithdrawRequests: () => ({
    isLoading: false,
    isError: false,
    data: [
      {
        requestId: 0,
        amount: 12.5,
        timestamp: Date.now() - 8 * 86_400_000,
        claimed: false,
      },
      {
        requestId: 1,
        amount: 3,
        timestamp: Date.now(),
        claimed: false,
      },
    ],
    refetch,
  }),
  useWithdrawSubmit: () => submit,
}))

describe('WithdrawClaimsPanel behaviour', () => {
  beforeEach(() => {
    submit.mockReset()
    refetch.mockReset()
  })

  it('lists claimable and cooling-down requests', () => {
    render(<WithdrawClaimsPanel />)
    expect(screen.getByText(/Request #0/i)).toBeInTheDocument()
    expect(screen.getByText(/Ready to claim/i)).toBeInTheDocument()
    expect(screen.getByText(/Cooldown/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Claim' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cooling down' })).toBeDisabled()
  })

  it('invokes claim submit for claimable request', async () => {
    const user = userEvent.setup()
    render(<WithdrawClaimsPanel />)
    await user.click(screen.getByRole('button', { name: 'Claim' }))
    expect(submit).toHaveBeenCalledTimes(1)
    expect(submit.mock.calls[0]?.[1]).toBe(0)
  })
})
