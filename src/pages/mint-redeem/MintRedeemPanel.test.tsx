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
import { MintRedeemPanel, type MintRedeemPanelProps } from '@/pages/mint-redeem/MintRedeemPanel'

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

function renderPanel(overrides: Partial<MintRedeemPanelProps> = {}) {
  const props: MintRedeemPanelProps = {
    mode: 'mint',
    step: 0,
    isConnected: true,
    tokenIn: usdc,
    tokenOut: usn,
    variableTokens: [usdc],
    amountIn: undefined,
    amountOut: undefined,
    amountInUsd: 0,
    isFetchingQuote: false,
    isInsufficientBalance: false,
    isApproved: true,
    isWhitelisted: true,
    primaryLabel: 'Next',
    primaryDisabled: false,
    onAmountInChange: vi.fn(),
    onHalf: vi.fn(),
    onMax: vi.fn(),
    onVariableTokenChange: vi.fn(),
    onPrimary: vi.fn(),
    ...overrides,
  }
  const view = render(<MintRedeemPanel {...props} />)
  return { props, ...view }
}

function payInput() {
  return screen.getAllByPlaceholderText('0.00')[0] as HTMLInputElement
}

function receiveInput() {
  const ellipsis = screen.queryByPlaceholderText('…')
  if (ellipsis) return ellipsis as HTMLInputElement
  const inputs = screen.getAllByPlaceholderText('0.00')
  return inputs[inputs.length - 1] as HTMLInputElement
}

describe('MintRedeemPanel behaviour', () => {
  it('asks to connect when wallet is disconnected', () => {
    renderPanel({ isConnected: false })
    expect(screen.getByText(/Connect a wallet on Home to mint/i)).toBeInTheDocument()
  })

  it('blocks mint/redeem when wallet network is unsupported', () => {
    renderPanel({ unsupported: true })
    expect(screen.getByText(/only available on Ethereum mainnet/i)).toBeInTheDocument()
  })

  it('shows whitelist banner when wallet is not whitelisted', () => {
    renderPanel({ isWhitelisted: false })
    expect(screen.getByText(/not whitelisted for direct mint/i)).toBeInTheDocument()
  })

  it('formats pay amount with thousand separators and up to 6 decimals', () => {
    renderPanel({ amountIn: 1234567.8912345 })
    expect(payInput().value).toBe(formatTradePayDisplay(1234567.8912345))
    expect(payInput().value).toBe('1,234,567.891234')
  })

  it('rejects more than 6 decimal places when typing into pay input', async () => {
    const user = userEvent.setup()
    const onAmountInChange = vi.fn()
    renderPanel({ onAmountInChange })

    await user.click(payInput())
    await user.keyboard('1.123456789')

    const last = onAmountInChange.mock.calls.at(-1)?.[0] as number | undefined
    expect(last).toBe(1.123456)
  })

  it('displays receive amount with at most 2 decimals while storing 6dp in title', () => {
    const amountOut = 98765.432198
    renderPanel({ amountOut })

    expect(receiveInput().value).toBe(formatTradeReceiveDisplay(amountOut))
    expect(receiveInput().value).toBe('98,765.43')
    expect(receiveInput()).toHaveAttribute('title', String(toTradeReceiveStoredAmount(amountOut)))
  })

  it('shows loading placeholder only when fetching and no receive amount yet', () => {
    renderPanel({ isFetchingQuote: true, amountOut: undefined })
    expect(receiveInput()).toHaveAttribute('placeholder', '…')
  })

  it('wires Half / Max and disables them when presetsDisabled', async () => {
    const user = userEvent.setup()
    const onHalf = vi.fn()
    const onMax = vi.fn()
    const { rerender } = renderPanel({ onHalf, onMax, presetsDisabled: false })

    await user.click(screen.getByRole('button', { name: 'Half' }))
    await user.click(screen.getByRole('button', { name: 'Max' }))
    expect(onHalf).toHaveBeenCalledTimes(1)
    expect(onMax).toHaveBeenCalledTimes(1)

    rerender(
      <MintRedeemPanel
        mode="mint"
        step={0}
        isConnected
        tokenIn={usdc}
        tokenOut={usn}
        variableTokens={[usdc]}
        amountInUsd={0}
        isFetchingQuote={false}
        isInsufficientBalance={false}
        isApproved
        isWhitelisted
        primaryLabel="Next"
        primaryDisabled={false}
        presetsDisabled
        onAmountInChange={vi.fn()}
        onHalf={onHalf}
        onMax={onMax}
        onVariableTokenChange={vi.fn()}
        onPrimary={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Half' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Max' })).toBeDisabled()
  })

  it('lets redeem pick collateral out while mint picks collateral in', () => {
    const { rerender } = renderPanel({
      mode: 'mint',
      tokenIn: usdc,
      tokenOut: usn,
      variableTokens: [usdc],
    })
    expect(screen.getByDisplayValue('USDC')).toBeInTheDocument()
    expect(screen.getByDisplayValue('USN')).toBeInTheDocument()

    rerender(
      <MintRedeemPanel
        mode="redeem"
        step={0}
        isConnected
        tokenIn={usn}
        tokenOut={usdc}
        variableTokens={[usdc]}
        amountInUsd={0}
        isFetchingQuote={false}
        isInsufficientBalance={false}
        isApproved
        isWhitelisted
        primaryLabel="Next"
        primaryDisabled={false}
        onAmountInChange={vi.fn()}
        onHalf={vi.fn()}
        onMax={vi.fn()}
        onVariableTokenChange={vi.fn()}
        onPrimary={vi.fn()}
      />,
    )
    expect(screen.getByDisplayValue('USN')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveValue(`${usdc.contractAddress}:${usdc.symbol}`)
  })

  it('shows confirm copy with amounts and invokes primary', async () => {
    const user = userEvent.setup()
    const onPrimary = vi.fn()
    const amountIn = 1000.123456
    const amountOut = 999.654321
    renderPanel({
      step: 1,
      amountIn,
      amountOut,
      onBack: vi.fn(),
      onPrimary,
      primaryLabel: 'Confirm mint',
    })

    expect(screen.getByRole('heading', { name: /Confirm mint/i })).toBeInTheDocument()
    const section = screen
      .getByRole('heading', { name: /Confirm mint/i })
      .closest('section') as HTMLElement
    expect(
      within(section).getByText(
        `${formatTokenAmount(amountIn, 'USDC', TRADE_PAY_DECIMALS)} → ${formatTokenAmount(amountOut, 'USN', TRADE_RECEIVE_DISPLAY_DECIMALS)}`,
      ),
    ).toBeInTheDocument()
    expect(within(section).getByText(/Slippage 0%/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm mint' }))
    expect(onPrimary).toHaveBeenCalledTimes(1)
  })

  it('renders USD notional under the pay field', () => {
    renderPanel({ amountIn: 50, amountInUsd: 49.999 })
    expect(screen.getByText(formatUsd(49.999))).toBeInTheDocument()
    expect(screen.getByText('~$49.99')).toBeInTheDocument()
  })

  it('shows success state with explorer link and reset', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    renderPanel({
      step: 2,
      txnUrl: 'https://etherscan.io/tx/0xabc',
      onReset,
    })

    expect(screen.getByText(/Mint submitted/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View on explorer/i })).toHaveAttribute(
      'href',
      'https://etherscan.io/tx/0xabc',
    )
    await user.click(screen.getByRole('button', { name: /Mint more/i }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
