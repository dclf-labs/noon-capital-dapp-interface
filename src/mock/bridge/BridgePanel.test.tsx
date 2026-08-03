import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Token } from '@/config/token'
import { formatUsd } from '@/features/_shared/trade-display'
import {
  formatTradePayDisplay,
  formatTradeReceiveDisplay,
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
    onOpenReceiverModal: vi.fn(),
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
  return screen.getByLabelText(/Send amount/i) as HTMLInputElement
}

function receiveInput() {
  return screen.getByLabelText(/Receive amount/i) as HTMLInputElement
}

describe('BridgePanel behaviour', () => {
  it('renders the step-0 card when disconnected (connect CTA owned by flow view)', () => {
    renderPanel({ isConnected: false })
    expect(screen.getByText(/Youre sending|You're sending/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
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

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPrimary).toHaveBeenCalledTimes(1)
  })

  it('opens the change-address modal from the CHANGE chip', async () => {
    const user = userEvent.setup()
    const onOpenReceiverModal = vi.fn()
    renderPanel({ onOpenReceiverModal })
    await user.click(screen.getByRole('button', { name: /change receiving address/i }))
    expect(onOpenReceiverModal).toHaveBeenCalledTimes(1)
  })

  it('exposes half/max and collapsible bridging fees', async () => {
    const user = userEvent.setup()
    renderPanel({
      feeLabel: '$0.3',
      networkFeeLabel: '$0.1',
      gasFeeLabel: '$0.2',
      protocolFeeLabel: '$0',
    })
    expect(screen.getByRole('button', { name: 'HALF' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'MAX' })).toBeInTheDocument()
    expect(screen.getByText('Bridging fees')).toBeInTheDocument()
    expect(screen.getByText('$0.3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /bridging fees details/i }))
    expect(screen.getByText('Protocol fee')).toBeInTheDocument()
    expect(screen.getByText('Network fee')).toBeInTheDocument()
    expect(screen.getByText('Gas fee')).toBeInTheDocument()
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(screen.getByText('$0.1')).toBeInTheDocument()
    expect(screen.getByText('$0.2')).toBeInTheDocument()
  })
})
