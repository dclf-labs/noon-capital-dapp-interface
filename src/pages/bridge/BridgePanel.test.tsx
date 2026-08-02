import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Token } from '@/config/token'
import { BridgePanel, type BridgePanelProps } from '@/pages/bridge/BridgePanel'

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

describe('BridgePanel behaviour', () => {
  it('asks to connect when wallet is disconnected', () => {
    renderPanel({ isConnected: false })
    expect(screen.getByText(/Connect a wallet on Home to bridge/i)).toBeInTheDocument()
  })

  it('shows 1:1 receive amount and wires primary', async () => {
    const user = userEvent.setup()
    const onPrimary = vi.fn()
    renderPanel({ amount: 12.345678, onPrimary })
    expect(screen.getByText(/1:1 amount/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPrimary).toHaveBeenCalledTimes(1)
  })

  it('shows confirm and success states', () => {
    const { rerender } = renderPanel({
      step: 1,
      amount: 1,
      primaryLabel: 'Confirm bridge',
      onBack: vi.fn(),
      protocolLabel: 'Hyperlane',
    })
    expect(screen.getByRole('heading', { name: /Confirm bridge/i })).toBeInTheDocument()
    expect(screen.getByText(/Route Hyperlane/i)).toBeInTheDocument()

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
