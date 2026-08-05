import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TxnStatus } from '@/lib/connection'
import { WithdrawRequestCard } from '@/mock/stake-unstake/WithdrawRequestCard'

const DAY = 86_400_000
const token = {
  symbol: 'USN',
  decimals: 18,
  iconSlug: 'usn',
  contractAddress: '0xdA67B4284609d2d48e5d10cfAc411572727dc1eD',
} as const

describe('WithdrawRequestCard', () => {
  it('renders claimable row without countdown and invokes onClaim', async () => {
    const user = userEvent.setup()
    const onClaim = vi.fn()
    const now = Date.now()

    render(
      <WithdrawRequestCard
        request={{
          requestId: 4,
          amount: 10,
          timestamp: now - 8 * DAY,
          claimed: false,
        }}
        token={token as never}
        periodMs={7 * DAY}
        nowMs={now}
        failed={false}
        claimLocked={false}
        onClaim={onClaim}
      />,
    )

    expect(screen.queryByLabelText(/^Countdown /i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Claim request 4/i })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: /Claim request 4/i }))
    expect(onClaim).toHaveBeenCalledWith(4)
  })

  it('shows countdown while cooling and disables claim', () => {
    const now = Date.now()
    render(
      <WithdrawRequestCard
        request={{
          requestId: 2,
          amount: 3,
          timestamp: now,
          claimed: false,
        }}
        token={token as never}
        periodMs={7 * DAY}
        nowMs={now}
        failed={false}
        claimLocked={false}
        onClaim={vi.fn()}
      />,
    )

    expect(screen.getByLabelText(/^Countdown /i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Claim request 2/i })).toBeDisabled()
  })

  it('swaps claim CTA for View Explorer when txnUrl is set', () => {
    const now = Date.now()
    render(
      <WithdrawRequestCard
        request={{
          requestId: 1,
          amount: 1,
          timestamp: now - 8 * DAY,
          claimed: false,
        }}
        token={token as never}
        periodMs={7 * DAY}
        nowMs={now}
        failed={false}
        claimLocked={false}
        txnUrl="https://etherscan.io/tx/0xabc"
        onClaim={vi.fn()}
      />,
    )

    expect(screen.getByRole('link', { name: /View Explorer/i })).toHaveAttribute(
      'href',
      'https://etherscan.io/tx/0xabc',
    )
    expect(screen.queryByRole('button', { name: /Claim/i })).not.toBeInTheDocument()
  })

  it('shows Retry claim when failed', () => {
    const now = Date.now()
    render(
      <WithdrawRequestCard
        request={{
          requestId: 9,
          amount: 1,
          timestamp: now - 8 * DAY,
          claimed: false,
        }}
        token={token as never}
        periodMs={7 * DAY}
        nowMs={now}
        failed
        claimLocked={false}
        claimStatus={TxnStatus.TXN_FAILURE}
        onClaim={vi.fn()}
      />,
    )

    expect(screen.getByText(/Failed/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retry claim request 9/i })).toBeEnabled()
  })
})
