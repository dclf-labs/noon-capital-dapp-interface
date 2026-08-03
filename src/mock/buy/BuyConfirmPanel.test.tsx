import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Token } from '@/config/token'
import { BuyConfirmPanel } from '@/mock/buy/BuyConfirmPanel'

const usdc: Token = {
  symbol: 'USDC',
  name: 'USDC',
  decimals: 6,
  iconSlug: 'usdc',
  contractAddress: '0xusdc' as Token['contractAddress'],
}

const usn: Token = {
  symbol: 'USN',
  name: 'USN',
  decimals: 18,
  iconSlug: 'usn',
  contractAddress: '0xusn' as Token['contractAddress'],
}

describe('BuyConfirmPanel', () => {
  it('wires back and primary actions', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    const onPrimary = vi.fn()
    render(
      <BuyConfirmPanel
        amountIn={100}
        amountOut={99.5}
        tokenIn={usdc}
        tokenOut={usn}
        primaryLabel="Confirm the transaction"
        onBack={onBack}
        onPrimary={onPrimary}
      />,
    )

    expect(screen.getByText(/confirm your buy transaction/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Confirm the transaction' }))
    expect(onPrimary).toHaveBeenCalledTimes(1)
  })

  it('disables primary while loading', () => {
    render(
      <BuyConfirmPanel
        amountIn={1}
        amountOut={1}
        primaryLoading
        primaryLabel="Confirm"
        onPrimary={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
  })
})
