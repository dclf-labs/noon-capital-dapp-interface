import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Token } from '@/config/token'
import { BuySuccessPanel } from '@/mock/buy/BuySuccessPanel'

const usn: Token = {
  symbol: 'USN',
  name: 'USN',
  decimals: 18,
  iconSlug: 'usn',
  contractAddress: '0xusn' as Token['contractAddress'],
}

describe('BuySuccessPanel', () => {
  it('renders amount, safe explorer link, and Buy More', async () => {
    const user = userEvent.setup()
    const onBuyMore = vi.fn()
    render(
      <BuySuccessPanel
        amountOut={12.345678}
        tokenOut={usn}
        txnUrl="https://etherscan.io/tx/0xabc"
        onBuyMore={onBuyMore}
      />,
    )

    expect(screen.getByText(/successfully bought/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view explorer/i })).toHaveAttribute(
      'href',
      'https://etherscan.io/tx/0xabc',
    )
    await user.click(screen.getByRole('button', { name: 'Buy More' }))
    expect(onBuyMore).toHaveBeenCalledTimes(1)
  })

  it('blocks unsafe explorer URLs', () => {
    render(
      <BuySuccessPanel
        amountOut={1}
        tokenOut={usn}
        txnUrl="javascript:alert(1)"
        onBuyMore={vi.fn()}
      />,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view explorer/i })).toBeDisabled()
  })
})
