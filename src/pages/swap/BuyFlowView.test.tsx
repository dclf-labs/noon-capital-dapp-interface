import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Token } from '@/config/token'
import { getTacChainId } from '@/lib/chain'
import { BuyFlowView } from '@/pages/swap/BuyFlowView'

const connectWalletFamily = vi.fn()
const selectActiveChain = vi.fn()
let resolvedChainId = 1

vi.mock('@/wallet/useConnectWalletFamily', () => ({
  useConnectWalletFamily: () => connectWalletFamily,
}))

vi.mock('@/hooks/connection', () => ({
  useResolvedChain: () => ({
    chainId: resolvedChainId,
    chainFamily: 'evm',
    config: {},
  }),
  useSelectActiveChain: () => ({
    selectedChainId: resolvedChainId,
    selectActiveChain,
    isSwitchingEvmNetwork: false,
  }),
}))

vi.mock('@/hooks/ui/useIsMobile', () => ({
  useIsMobile: () => false,
}))

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

const baseProps = {
  mode: 'buy' as const,
  chainFamily: 'evm' as const,
  step: 0,
  isConnected: true,
  tokenIn: usdt,
  tokenOut: usn,
  tokensIn: [usdt],
  tokensOut: [usn],
  amountInUsd: 0,
  isFetchingQuote: false,
  isInsufficientBalance: false,
  isApproved: true,
  primaryLabel: 'Enter amount',
  primaryDisabled: true,
  buyTokenUsdPrice: 1,
  unitOutPerIn: 1,
  onAmountInChange: vi.fn(),
  onHalf: vi.fn(),
  onMax: vi.fn(),
  onTokenInChange: vi.fn(),
  onTokenOutChange: vi.fn(),
  onPrimary: vi.fn(),
}

describe('BuyFlowView', () => {
  beforeEach(() => {
    resolvedChainId = 1
    connectWalletFamily.mockReset().mockResolvedValue(undefined)
    selectActiveChain.mockReset()
  })

  it('renders Figma buy step 0 with empty amount and placeholder 0', () => {
    render(
      <MemoryRouter initialEntries={['/swap/buy']}>
        <BuyFlowView {...baseProps} />
      </MemoryRouter>,
    )
    const amount = screen.getByLabelText(/usn amount/i)
    expect(amount).toHaveValue('')
    expect(amount).toHaveAttribute('placeholder', '0')
    expect(screen.queryByText(/≈/)).not.toBeInTheDocument()
  })

  it('routes USD presets through onBuyAmountChange as buy-token amounts', async () => {
    const user = userEvent.setup()
    const onBuyAmountChange = vi.fn()
    render(
      <MemoryRouter initialEntries={['/swap/buy']}>
        <BuyFlowView {...baseProps} onBuyAmountChange={onBuyAmountChange} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '$100' }))
    expect(onBuyAmountChange).toHaveBeenCalledWith(100)
  })

  it.each([
    ['evm', 'evm'],
    ['starknet', 'starknet'],
    ['sui', 'sui'],
  ] as const)(
    'opens %s wallet UI from Connect wallet when chainFamily is %s',
    async (_label, family) => {
      const user = userEvent.setup()
      const onPrimary = vi.fn()
      render(
        <MemoryRouter initialEntries={['/swap/buy']}>
          <BuyFlowView
            {...baseProps}
            isConnected={false}
            chainFamily={family}
            onPrimary={onPrimary}
          />
        </MemoryRouter>,
      )

      await user.click(screen.getByRole('button', { name: 'Connect wallet' }))
      expect(connectWalletFamily).toHaveBeenCalledExactlyOnceWith(family)
      expect(onPrimary).not.toHaveBeenCalled()
    },
  )

  it('does not open wallet UI when already connected', async () => {
    const user = userEvent.setup()
    const onPrimary = vi.fn()
    render(
      <MemoryRouter initialEntries={['/swap/buy']}>
        <BuyFlowView
          {...baseProps}
          isConnected
          chainFamily="starknet"
          primaryLabel="Buy USN"
          primaryDisabled={false}
          onPrimary={onPrimary}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Buy USN' }))
    expect(connectWalletFamily).not.toHaveBeenCalled()
    expect(onPrimary).toHaveBeenCalledTimes(1)
  })

  it('opens the switch-network modal when the product network is unsupported', async () => {
    resolvedChainId = getTacChainId() ?? 239
    const user = userEvent.setup()
    const onPrimary = vi.fn()
    render(
      <MemoryRouter initialEntries={['/swap/buy']}>
        <BuyFlowView {...baseProps} isConnected onPrimary={onPrimary} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Switch network' }))
    expect(onPrimary).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: /switch network/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ethereum/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^tac$/i })).not.toBeInTheDocument()
  })

  it('renders Figma confirm step with fee + compact amounts', () => {
    const onBack = vi.fn()
    render(
      <MemoryRouter initialEntries={['/swap/buy']}>
        <BuyFlowView
          {...baseProps}
          step={1}
          amountIn={21}
          amountOut={0.001}
          feeLabel="$0.2"
          feeNativeLabel="<0.1 ETH"
          primaryLabel="Confirm the transaction"
          primaryDisabled={false}
          onBack={onBack}
        />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', { name: /confirm your buy transaction/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Swapping')).toBeInTheDocument()
    expect(screen.getByText('To Receive')).toBeInTheDocument()
    expect(screen.getByText('21')).toBeInTheDocument()
    expect(screen.getByText('<0.1')).toBeInTheDocument()
    expect(screen.getByText('$0.2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm the transaction/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('renders Figma success step with explorer + buy more', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    render(
      <MemoryRouter initialEntries={['/swap/buy']}>
        <BuyFlowView
          {...baseProps}
          step={2}
          amountOut={150_000}
          txnUrl="https://etherscan.io/tx/0xabc"
          onReset={onReset}
        />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', { name: /you have successfully bought/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/150(\.0+)?K/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view explorer/i })).toHaveAttribute(
      'href',
      'https://etherscan.io/tx/0xabc',
    )
    await user.click(screen.getByRole('button', { name: /buy more/i }))
    expect(onReset).toHaveBeenCalled()
  })
})
