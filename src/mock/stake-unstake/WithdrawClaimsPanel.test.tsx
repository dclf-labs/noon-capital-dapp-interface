import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as ConfigModule from '@/config'
import { TxnStatus } from '@/lib/connection'
import { WithdrawClaimsPanel } from '@/mock/stake-unstake/WithdrawClaimsPanel'

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
      iconSlug: 'usn',
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
      // Invalid row — filtered out before render.
      {
        requestId: -3,
        amount: 9,
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

  it('lists claimable and cooling-down requests with capital card chrome', () => {
    render(<WithdrawClaimsPanel />)
    expect(screen.getByRole('region', { name: 'Withdrawal requests' })).toBeInTheDocument()
    expect(screen.getAllByText(/In process/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/12\.5 USN/i)).toBeInTheDocument()
    expect(screen.getByText(/UNSTAKE #0/i)).toBeInTheDocument()
    expect(screen.getByText(/UNSTAKE #1/i)).toBeInTheDocument()
    expect(screen.queryByText(/UNSTAKE #-3/i)).not.toBeInTheDocument()
    // Ready rows hide the zeroed clock; cooling rows keep DD:HH:MM:SS.
    expect(screen.queryByLabelText(/Countdown 00:00:00:00/i)).not.toBeInTheDocument()
    expect(screen.getAllByLabelText(/^Countdown /i).length).toBe(1)
    expect(screen.getByRole('button', { name: /Claim request 0/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Claim request 1/i })).toBeDisabled()
  })

  it('invokes claim submit for claimable request', async () => {
    const user = userEvent.setup()
    render(<WithdrawClaimsPanel />)
    await user.click(screen.getByRole('button', { name: /Claim request 0/i }))
    expect(submit).toHaveBeenCalledTimes(1)
    expect(submit.mock.calls[0]?.[1]).toBe(0)
  })

  it('shows Claiming on the active claim and locks sibling CTAs', async () => {
    const user = userEvent.setup()
    submit.mockImplementation((_c, _id, _ok, setStatus) => {
      setStatus?.(TxnStatus.PROCESSING)
    })

    render(<WithdrawClaimsPanel />)
    await user.click(screen.getByRole('button', { name: /Claim request 0/i }))

    expect(screen.getByRole('button', { name: /Claiming request 0/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Claim request 1/i })).toBeDisabled()
    expect(screen.queryByRole('button', { name: /^Claim request 0$/i })).not.toBeInTheDocument()
  })

  it('does not start a second claim while one is in flight', async () => {
    const user = userEvent.setup()
    submit.mockImplementation(() => {
      /* leave busyId set — never settles */
    })

    render(<WithdrawClaimsPanel />)
    await user.click(screen.getByRole('button', { name: /Claim request 0/i }))
    expect(submit).toHaveBeenCalledTimes(1)

    // Sibling is locked; clicking it must not fire another submit.
    const sibling = screen.getByRole('button', { name: /Claim request 1/i })
    expect(sibling).toBeDisabled()
    await user.click(sibling)
    expect(submit).toHaveBeenCalledTimes(1)
  })
})
