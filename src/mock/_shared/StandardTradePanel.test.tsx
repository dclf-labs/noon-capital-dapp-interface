import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Token } from '@/config/token'
import { StandardTradePanel } from '@/mock/_shared/StandardTradePanel'

const usn = {
  symbol: 'USN',
  name: 'USN',
  decimals: 18,
  iconSlug: 'USN',
  contractAddress: '0x1' as Token['contractAddress'],
} satisfies Token

const usdt = {
  symbol: 'USDT',
  name: 'Tether',
  decimals: 6,
  iconSlug: 'USDT',
  contractAddress: '0x2' as Token['contractAddress'],
} satisfies Token

describe('StandardTradePanel (Buy-aligned form)', () => {
  it('renders hero pay amount, USD presets, and secondary receive row', () => {
    render(
      <StandardTradePanel
        payLabel="You're selling"
        receiveLabel="You're receiving"
        tokenIn={usn}
        tokenOut={usdt}
        amountIn={12.5}
        amountOut={12.4}
        payTokenUsdPrice={1}
        balanceInLabel="Bal: 100 USN"
        balanceOutLabel="Bal: 50 USDT"
        feeLabel="$0.2"
        unitRateLabel="0.99"
        primaryLabel="Sell USN"
        primaryDisabled={false}
        onAmountInChange={vi.fn()}
        onPrimary={vi.fn()}
      />,
    )

    expect(screen.getByText("You're selling")).toBeInTheDocument()
    expect(screen.getByLabelText(/usn amount/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$100' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$300' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$1000' })).toBeInTheDocument()
    expect(screen.getByText('Receiving')).toBeInTheDocument()
    expect(screen.getByText('Bal: 100 USN')).toBeInTheDocument()
    expect(screen.getByText('Bal: 50 USDT')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sell USN/i })).toBeEnabled()
  })

  it('maps USD presets to pay-token amounts via onAmountInChange', async () => {
    const user = userEvent.setup()
    const onAmountInChange = vi.fn()

    render(
      <StandardTradePanel
        tokenIn={usn}
        tokenOut={usdt}
        payTokenUsdPrice={1}
        balanceInLabel="Bal: —"
        primaryLabel="Enter amount"
        onAmountInChange={onAmountInChange}
        onPrimary={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: '$100' }))
    expect(onAmountInChange).toHaveBeenCalledWith(100)

    await user.click(screen.getByRole('button', { name: '$300' }))
    expect(onAmountInChange).toHaveBeenCalledWith(300)
  })

  it('disables USD presets when presetsDisabled', () => {
    render(
      <StandardTradePanel
        tokenIn={usn}
        tokenOut={usdt}
        presetsDisabled
        onAmountInChange={vi.fn()}
        onPrimary={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: '$100' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '$300' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '$1000' })).toBeDisabled()
  })
})
