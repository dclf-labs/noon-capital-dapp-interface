import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Token } from '@/config/token'
import { formatTokenAmount, formatUsd } from '@/features/_shared/trade-display'
import {
  formatTradePayDisplay,
  formatTradeReceiveDisplay,
  TRADE_PAY_DECIMALS,
  TRADE_RECEIVE_DISPLAY_DECIMALS,
} from '@/features/_shared/trade-input-format'
import { BridgePanel, type BridgePanelProps } from '@/mock/bridge/BridgePanel'

const susn: Token = {
  symbol: 'sUSN',
  name: 'sUSN',
  decimals: 18,
  iconSlug: 'susn',
  contractAddress: '0xsusn' as Token['contractAddress'],
}

function renderPanel(overrides: Partial<BridgePanelProps> = {}) {
  const props: BridgePanelProps = {
    step: 0,
    isConnected: true,
    sourceNetworks: [{ id: 1, name: 'Ethereum' }],
    destinationNetworks: [{ id: 324, name: 'zkSync' }],
    sourceChainId: 1,
    destinationChainId: 324,
    onSourceChange: vi.fn(),
    onDestinationChange: vi.fn(),
    tokens: [susn],
    token: susn,
    onTokenChange: vi.fn(),
    amountUsd: 0,
    receiverLabel: 'EVM receiver',
    receiverValue: '0x1111111111111111111111111111111111111111',
    receiverPlaceholder: '0x…',
    onReceiverChange: vi.fn(),
    isFetchingFee: false,
    isInsufficientBalance: false,
    primaryLabel: 'Next',
    primaryDisabled: false,
    onAmountChange: vi.fn(),
    onHalf: vi.fn(),
    onMax: vi.fn(),
    onPrimary: vi.fn(),
    ...overrides,
  }
  return { props, ...render(<BridgePanel {...props} />) }
}

function payInput() {
  return screen.getAllByPlaceholderText('0.00')[0] as HTMLInputElement
}

function receiveInput() {
  const inputs = screen.getAllByPlaceholderText('0.00')
  return inputs[inputs.length - 1] as HTMLInputElement
}

describe('BridgePanel behaviour', () => {
  it('asks to connect when wallet is disconnected', () => {
    renderPanel({ isConnected: false })
    expect(screen.getByText(/Connect a wallet on Home to bridge/i)).toBeInTheDocument()
  })

  it('formats 1:1 pay/receive UI values and wires primary', async () => {
    const user = userEvent.setup()
    const onPrimary = vi.fn()
    const amount = 12.3456789
    renderPanel({ amount, amountUsd: 12.3456789, onPrimary })

    expect(payInput().value).toBe(formatTradePayDisplay(amount))
    expect(payInput().value).toBe('12.345678')
    expect(receiveInput().value).toBe(formatTradeReceiveDisplay(amount))
    expect(receiveInput().value).toBe('12.34')
    expect(screen.getByText(formatUsd(12.3456789))).toBeInTheDocument()
    expect(screen.getByText('~$12.34')).toBeInTheDocument()
    expect(screen.getByText(/1:1 amount/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPrimary).toHaveBeenCalledTimes(1)
  })

  it('shows confirm and success states with exact bridge amounts', () => {
    const amount = 1234.567891
    const { rerender } = renderPanel({
      step: 1,
      amount,
      primaryLabel: 'Confirm bridge',
      onBack: vi.fn(),
      protocolLabel: 'Hyperlane',
    })
    const section = screen
      .getByRole('heading', { name: /Confirm bridge/i })
      .closest('section') as HTMLElement
    expect(
      within(section).getByText(
        `${formatTokenAmount(amount, 'sUSN', TRADE_PAY_DECIMALS)} → ${formatTokenAmount(amount, 'sUSN', TRADE_RECEIVE_DISPLAY_DECIMALS)}`,
      ),
    ).toBeInTheDocument()
    // Pay label uses 6dp→Intl(2) (can round up); receive label downs to 2dp first.
    expect(within(section).getByText(/1,234\.57 sUSN → 1,234\.56 sUSN/)).toBeInTheDocument()
    expect(within(section).getByText(/Route Hyperlane/i)).toBeInTheDocument()

    rerender(
      <BridgePanel
        step={2}
        isConnected
        sourceNetworks={[]}
        destinationNetworks={[]}
        onSourceChange={vi.fn()}
        onDestinationChange={vi.fn()}
        onTokenChange={vi.fn()}
        amountUsd={0}
        receiverLabel="EVM receiver"
        receiverValue=""
        receiverPlaceholder="0x…"
        onReceiverChange={vi.fn()}
        isFetchingFee={false}
        isInsufficientBalance={false}
        primaryLabel="Done"
        primaryDisabled={false}
        onAmountChange={vi.fn()}
        onHalf={vi.fn()}
        onMax={vi.fn()}
        onPrimary={vi.fn()}
        onReset={vi.fn()}
        txnUrl="https://etherscan.io/tx/0x1"
      />,
    )
    expect(screen.getByText(/15–20 minutes/i)).toBeInTheDocument()
  })
})
