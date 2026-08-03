import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Token } from '@/config/token'
import { BridgeFlowView } from '@/pages/bridge/BridgeFlowView'

const connectWalletFamily = vi.fn()

vi.mock('@/wallet/useConnectWalletFamily', () => ({
  useConnectWalletFamily: () => connectWalletFamily,
}))

vi.mock('@/hooks/ui/useIsMobile', () => ({
  useIsMobile: () => false,
}))

const susn: Token = {
  symbol: 'sUSN',
  name: 'sUSN',
  decimals: 18,
  iconSlug: 'susn',
  contractAddress: '0xsusn' as Token['contractAddress'],
}

const basePanel = {
  isConnected: false,
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
  receiverValue: '',
  receiverPlaceholder: '0x…',
  onOpenReceiverModal: vi.fn(),
  isFetchingFee: false,
  isInsufficientBalance: false,
  primaryLabel: 'Next',
  primaryDisabled: true,
  onAmountChange: vi.fn(),
  onHalf: vi.fn(),
  onMax: vi.fn(),
  onPrimary: vi.fn(),
}

describe('BridgeFlowView connect CTA', () => {
  beforeEach(() => {
    connectWalletFamily.mockReset().mockResolvedValue(undefined)
  })

  it.each([
    ['evm', 'evm'],
    ['starknet', 'starknet'],
    ['sui', 'sui'],
  ] as const)('opens %s wallet UI when chainFamily is %s', async (_label, family) => {
    const user = userEvent.setup()
    const onPrimary = vi.fn()
    render(
      <BridgeFlowView
        {...basePanel}
        step={0}
        chainFamily={family}
        showHero={false}
        onPrimary={onPrimary}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Connect wallet' }))
    expect(connectWalletFamily).toHaveBeenCalledExactlyOnceWith(family)
    expect(onPrimary).not.toHaveBeenCalled()
  })

  it('does not open wallet UI when already connected', async () => {
    const user = userEvent.setup()
    const onPrimary = vi.fn()
    render(
      <BridgeFlowView
        {...basePanel}
        step={0}
        chainFamily="evm"
        showHero={false}
        isConnected
        primaryDisabled={false}
        primaryLabel="Next"
        onPrimary={onPrimary}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(connectWalletFamily).not.toHaveBeenCalled()
    expect(onPrimary).toHaveBeenCalledTimes(1)
  })
})
