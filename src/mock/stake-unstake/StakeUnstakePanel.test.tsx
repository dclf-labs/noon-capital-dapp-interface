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
import {
  StakeUnstakePanel,
  type StakeUnstakePanelProps,
} from '@/mock/stake-unstake/StakeUnstakePanel'

const usn: Token = {
  symbol: 'USN',
  name: 'USN',
  decimals: 18,
  iconSlug: 'usn',
  contractAddress: '0xusn' as Token['contractAddress'],
}

const susn: Token = {
  symbol: 'sUSN',
  name: 'sUSN',
  decimals: 18,
  iconSlug: 'susn',
  contractAddress: '0xsusn' as Token['contractAddress'],
}

function renderPanel(overrides: Partial<StakeUnstakePanelProps> = {}) {
  const props: StakeUnstakePanelProps = {
    mode: 'stake',
    step: 0,
    isConnected: true,
    tokenIn: usn,
    tokenOut: susn,
    amountInUsd: 0,
    isFetchingQuote: false,
    isInsufficientBalance: false,
    isApproved: true,
    requiresApproval: true,
    primaryLabel: 'Next',
    primaryDisabled: false,
    onAmountInChange: vi.fn(),
    onHalf: vi.fn(),
    onMax: vi.fn(),
    onPrimary: vi.fn(),
    ...overrides,
  }
  return { props, ...render(<StakeUnstakePanel {...props} />) }
}

function payInput() {
  return screen.getAllByPlaceholderText('0')[0] as HTMLInputElement
}

function receiveInput() {
  const inputs = screen.getAllByPlaceholderText('0')
  return inputs[inputs.length - 1] as HTMLInputElement
}

describe('StakeUnstakePanel behaviour', () => {
  it('asks to connect when wallet is disconnected', () => {
    renderPanel({ isConnected: false })
    expect(screen.getByText(/Connect a wallet on Home to stake/i)).toBeInTheDocument()
  })

  it('blocks when wallet network is unsupported', () => {
    renderPanel({ unsupported: true })
    expect(screen.getByText(/only available on Ethereum mainnet/i)).toBeInTheDocument()
  })

  it('formats pay/receive amounts like other trade panels', () => {
    renderPanel({ amountIn: 1234.5678912, amountOut: 1234.5678912 })
    expect(payInput().value).toBe(formatTradePayDisplay(1234.5678912))
    expect(payInput().value).toBe('1,234.567891')
    expect(receiveInput().value).toBe(formatTradeReceiveDisplay(1234.5678912))
    expect(receiveInput().value).toBe('1,234.567891')
    expect(receiveInput()).toHaveAttribute(
      'title',
      String(toTradeReceiveStoredAmount(1234.5678912)),
    )
  })

  it('renders USD notional and exact confirm amounts', () => {
    renderPanel({ amountIn: 10, amountInUsd: 10.129, amountOut: 9.876543 })
    expect(screen.getByText(formatUsd(10.129))).toBeInTheDocument()
    expect(screen.getByText('~$10.1')).toBeInTheDocument()

    renderPanel({
      step: 1,
      amountIn: 10.123456,
      amountOut: 9.876543,
      onBack: vi.fn(),
      primaryLabel: 'Confirm stake',
    })
    const section = screen
      .getByRole('heading', { name: /Confirm stake/i })
      .closest('section') as HTMLElement
    expect(
      within(section).getByText(
        `${formatTokenAmount(10.123456, 'USN', TRADE_PAY_DECIMALS)} → ${formatTokenAmount(9.876543, 'sUSN', TRADE_RECEIVE_DISPLAY_DECIMALS)}`,
      ),
    ).toBeInTheDocument()
  })

  it('wires Half / Max and primary', async () => {
    const user = userEvent.setup()
    const onHalf = vi.fn()
    const onMax = vi.fn()
    const onPrimary = vi.fn()
    renderPanel({ onHalf, onMax, onPrimary, amountIn: 1, amountOut: 1 })

    await user.click(screen.getByRole('button', { name: 'Half' }))
    await user.click(screen.getByRole('button', { name: 'Max' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onHalf).toHaveBeenCalledTimes(1)
    expect(onMax).toHaveBeenCalledTimes(1)
    expect(onPrimary).toHaveBeenCalledTimes(1)
  })

  it('shows unstake cooldown copy on confirm and success', () => {
    const { rerender } = renderPanel({
      mode: 'unstake',
      step: 1,
      tokenIn: susn,
      tokenOut: usn,
      amountIn: 1,
      amountOut: 1,
      requiresApproval: false,
      primaryLabel: 'Confirm unstake',
      onBack: vi.fn(),
    })
    expect(screen.getByText(/starts a cooldown/i)).toBeInTheDocument()

    rerender(
      <StakeUnstakePanel
        mode="unstake"
        step={2}
        isConnected
        tokenIn={susn}
        tokenOut={usn}
        amountInUsd={0}
        isFetchingQuote={false}
        isInsufficientBalance={false}
        isApproved
        requiresApproval={false}
        primaryLabel="Done"
        primaryDisabled={false}
        onAmountInChange={vi.fn()}
        onHalf={vi.fn()}
        onMax={vi.fn()}
        onPrimary={vi.fn()}
        onReset={vi.fn()}
        txnUrl="https://etherscan.io/tx/0x1"
      />,
    )
    expect(screen.getByText(/Claim it from the Withdraw tab/i)).toBeInTheDocument()
  })
})
