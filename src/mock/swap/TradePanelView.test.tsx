import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Token } from '@/config/token'
import { formatTokenAmount, formatUsd } from '@/features/_shared/trade-display'
import {
  formatTradePayDisplay,
  formatTradeReceiveDisplay,
  toTradeReceiveStoredAmount,
  TRADE_PAY_DECIMALS,
  TRADE_RECEIVE_DISPLAY_DECIMALS,
} from '@/features/_shared/trade-input-format'
import { down } from '@/lib/format'
import { TradePanelView, type TradePanelViewProps } from '@/mock/swap/TradePanelView'

const usdc: Token = {
  symbol: 'USDC',
  name: 'USD Coin',
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

function renderTrade(overrides: Partial<TradePanelViewProps> = {}) {
  const props: TradePanelViewProps = {
    mode: 'buy',
    step: 0,
    isConnected: true,
    tokenIn: usdc,
    tokenOut: usn,
    tokensIn: [usdc],
    tokensOut: [usn],
    amountIn: undefined,
    amountOut: undefined,
    amountInUsd: 0,
    isFetchingQuote: false,
    isInsufficientBalance: false,
    isApproved: true,
    primaryLabel: 'Next',
    primaryDisabled: false,
    onAmountInChange: vi.fn(),
    onHalf: vi.fn(),
    onMax: vi.fn(),
    onTokenInChange: vi.fn(),
    onTokenOutChange: vi.fn(),
    onPrimary: vi.fn(),
    ...overrides,
  }
  const view = render(<TradePanelView {...props} />)
  return { props, ...view }
}

function payInput() {
  return screen.getAllByPlaceholderText('0.00')[0] as HTMLInputElement
}

function receiveInput() {
  // Receive uses "…" while quoting, otherwise "0.00" (same as pay when idle — pick last).
  const ellipsis = screen.queryByPlaceholderText('…')
  if (ellipsis) return ellipsis as HTMLInputElement
  const inputs = screen.getAllByPlaceholderText('0.00')
  return inputs[inputs.length - 1] as HTMLInputElement
}

describe('TradePanelView input formatting', () => {
  it('formats pay amount with thousand separators and up to 6 decimals', () => {
    renderTrade({ amountIn: 1234567.8912345 })
    expect(payInput().value).toBe(formatTradePayDisplay(1234567.8912345))
    expect(payInput().value).toBe('1,234,567.891234')
  })

  it('rejects more than 6 decimal places when typing into pay input', async () => {
    const user = userEvent.setup()
    const onAmountInChange = vi.fn()
    renderTrade({ onAmountInChange })

    await user.click(payInput())
    await user.keyboard('1.123456789')

    const last = onAmountInChange.mock.calls.at(-1)?.[0] as number | undefined
    expect(last).toBe(1.123456)
  })

  it('parses comma-grouped pay input back to a numeric amount', async () => {
    const user = userEvent.setup()
    const onAmountInChange = vi.fn()
    renderTrade({ onAmountInChange })

    await user.click(payInput())
    await user.keyboard('1234.56')

    expect(onAmountInChange).toHaveBeenCalled()
    const last = onAmountInChange.mock.calls.at(-1)?.[0] as number | undefined
    expect(last).toBe(1234.56)

    // Re-render with committed value and assert grouped display
    renderTrade({ amountIn: 1234.56 })
    expect(screen.getAllByPlaceholderText('0.00')[0]).toHaveValue('1,234.56')
  })

  it('clears pay amount when the field is emptied', async () => {
    const user = userEvent.setup()
    const onAmountInChange = vi.fn()
    renderTrade({ amountIn: 12.34, onAmountInChange })

    await user.clear(payInput())
    expect(onAmountInChange).toHaveBeenCalledWith(undefined)
  })

  it('displays receive amount with at most 2 decimals and thousand separators', () => {
    const amountOut = 98765.432198
    renderTrade({ amountOut })

    expect(receiveInput().value).toBe(formatTradeReceiveDisplay(amountOut))
    expect(receiveInput().value).toBe('98,765.43')
  })

  it('keeps full 6dp receive value in the title while showing 2dp', () => {
    const amountOut = 12.345678
    renderTrade({ amountOut })

    const stored = toTradeReceiveStoredAmount(amountOut)
    expect(stored).toBe(12.345678)
    expect(receiveInput().value).toBe('12.34')
    expect(receiveInput()).toHaveAttribute('title', '12.345678')
  })

  it('shows loading placeholder only when fetching and no receive amount yet', () => {
    const { rerender } = renderTrade({ isFetchingQuote: true, amountOut: undefined })
    expect(receiveInput()).toHaveAttribute('placeholder', '…')
    expect(receiveInput().value).toBe('')

    rerender(
      <TradePanelView
        {...{
          mode: 'buy',
          step: 0,
          isConnected: true,
          tokenIn: usdc,
          tokenOut: usn,
          tokensIn: [usdc],
          tokensOut: [usn],
          amountInUsd: 0,
          isFetchingQuote: true,
          isInsufficientBalance: false,
          isApproved: true,
          primaryLabel: 'Next',
          primaryDisabled: false,
          onAmountInChange: vi.fn(),
          onHalf: vi.fn(),
          onMax: vi.fn(),
          onTokenInChange: vi.fn(),
          onTokenOutChange: vi.fn(),
          onPrimary: vi.fn(),
          amountOut: 1.234567,
        }}
      />,
    )
    expect(receiveInput().value).toBe('1.23')
    expect(receiveInput()).toHaveAttribute('placeholder', '0.00')
  })

  it('wires Half / Max buttons and disables them when presetsDisabled', async () => {
    const user = userEvent.setup()
    const onHalf = vi.fn()
    const onMax = vi.fn()
    const { rerender } = renderTrade({ onHalf, onMax, presetsDisabled: false })

    await user.click(screen.getByRole('button', { name: 'Half' }))
    await user.click(screen.getByRole('button', { name: 'Max' }))
    expect(onHalf).toHaveBeenCalledTimes(1)
    expect(onMax).toHaveBeenCalledTimes(1)

    rerender(
      <TradePanelView
        mode="buy"
        step={0}
        isConnected
        tokenIn={usdc}
        tokenOut={usn}
        tokensIn={[usdc]}
        tokensOut={[usn]}
        amountInUsd={0}
        isFetchingQuote={false}
        isInsufficientBalance={false}
        isApproved
        primaryLabel="Next"
        primaryDisabled={false}
        presetsDisabled
        onAmountInChange={vi.fn()}
        onHalf={onHalf}
        onMax={onMax}
        onTokenInChange={vi.fn()}
        onTokenOutChange={vi.fn()}
        onPrimary={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Half' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Max' })).toBeDisabled()
  })

  it('blocks trading when wallet network is unsupported', () => {
    renderTrade({ unsupported: true })
    expect(screen.getByText(/Wallet network does not match/i)).toBeInTheDocument()
    expect(screen.queryByText('You pay')).not.toBeInTheDocument()
  })

  it('shows confirm copy with human-readable amounts and min received', () => {
    const amountIn = 1000.123456
    const amountOut = 999.654321
    const minReceived = toTradeReceiveStoredAmount(down(amountOut * 0.99, TRADE_PAY_DECIMALS))
    renderTrade({
      step: 1,
      amountIn,
      amountOut,
      onBack: vi.fn(),
    })

    expect(screen.getByText(/Confirm buy/i)).toBeInTheDocument()
    const section = screen.getByText(/Confirm buy/i).closest('section') as HTMLElement
    const confirmRow = `${formatTokenAmount(amountIn, 'USDC', TRADE_PAY_DECIMALS)} → ${formatTokenAmount(amountOut, 'USN', TRADE_RECEIVE_DISPLAY_DECIMALS)}`
    const minRow = `Min received (1% slippage) ${formatTokenAmount(minReceived, 'USN', TRADE_RECEIVE_DISPLAY_DECIMALS)}`
    expect(confirmRow).toBe('1,000.12 USDC → 999.65 USN')
    expect(minRow).toBe('Min received (1% slippage) 989.65 USN')
    expect(within(section).getByText(confirmRow)).toBeInTheDocument()
    expect(within(section).getByText(minRow)).toBeInTheDocument()
  })

  it('renders USD notional under the pay field', () => {
    renderTrade({ amountIn: 10, amountInUsd: 10.125 })
    expect(screen.getByText(formatUsd(10.125))).toBeInTheDocument()
    expect(screen.getByText('~$10.12')).toBeInTheDocument()
  })
})
