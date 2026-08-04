import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Token } from '@/config/token'
import { BuyPageView } from '@/mock/buy/BuyPageView'

const useIsMobileMock = vi.hoisted(() => vi.fn(() => false))

vi.mock('@/hooks/ui/useIsMobile', () => ({
  useIsMobile: () => useIsMobileMock(),
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

function renderBuy(props: Partial<ComponentProps<typeof BuyPageView>> = {}, path = '/swap/buy') {
  const onUsdPreset = vi.fn()
  const onBuyAmountChange = vi.fn()
  const onPrimary = vi.fn()
  const onTokenOutChange = vi.fn()
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <BuyPageView
        tokenIn={usdt}
        tokenOut={usn}
        tokensIn={[usdt]}
        tokensOut={[usn]}
        balanceInLabel="Bal: 1,000 USDT"
        networkFeeLabel="$0.2"
        primaryLabel="Enter amount"
        primaryDisabled
        buyTokenUsdPrice={1}
        onUsdPreset={onUsdPreset}
        onBuyAmountChange={onBuyAmountChange}
        onPrimary={onPrimary}
        onTokenOutChange={onTokenOutChange}
        {...props}
      />
    </MemoryRouter>,
  )
  return { ...utils, onUsdPreset, onBuyAmountChange, onPrimary, onTokenOutChange }
}

describe('BuyPageView', () => {
  afterEach(() => {
    vi.useRealTimers()
    useIsMobileMock.mockReturnValue(false)
  })

  it('renders the Buy hero with an empty buy-token amount', () => {
    renderBuy()

    expect(screen.getByRole('navigation', { name: /product/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/usn amount/i)).toHaveValue('')
    expect(screen.getByLabelText(/usn amount/i)).toHaveAttribute('placeholder', '0')
    expect(screen.queryByText(/≈/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enter amount/i })).toBeDisabled()
  })

  it('maps USD presets to buy-token amounts via onUsdPreset', async () => {
    const user = userEvent.setup()
    const { onUsdPreset } = renderBuy()

    await user.click(screen.getByRole('button', { name: '$100' }))
    expect(onUsdPreset).toHaveBeenCalledWith(100)
  })

  it('commits typed buy-token amounts', async () => {
    const user = userEvent.setup()
    const onBuyAmountChange = vi.fn()
    renderBuy({ onBuyAmountChange, onUsdPreset: undefined })

    const amount = screen.getByLabelText(/usn amount/i)
    await user.clear(amount)
    await user.type(amount, '12.5')
    expect(onBuyAmountChange).toHaveBeenCalled()
    expect(onBuyAmountChange.mock.calls.at(-1)?.[0]).toBe(12.5)
  })

  it('opens the buy-token dropdown and selects an option after the pill settles', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const susn = {
      ...usn,
      symbol: 'sUSN',
      iconSlug: 'sUSN',
      contractAddress: '0x3' as Token['contractAddress'],
    }
    const { onTokenOutChange } = renderBuy({ tokensOut: [usn, susn] })

    const trigger = screen.getByRole('button', { name: /select buy token/i })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByRole('option', { name: 'sUSN' }))
    expect(onTokenOutChange).toHaveBeenCalledWith(susn)

    await act(async () => {
      vi.advanceTimersByTime(260)
    })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('links inactive product tabs to vaults and bridge', () => {
    renderBuy()
    expect(screen.getByRole('link', { name: 'Vaults' })).toHaveAttribute('href', '/vaults')
    expect(screen.getByRole('link', { name: 'Bridge' })).toHaveAttribute('href', '/bridge')
  })

  it('shows the network DEX in the Powered by row', () => {
    renderBuy({
      poweredBy: {
        venue: 'syncswap',
        name: 'Syncswap',
        logoSrc: '/assets/tokens/SYNCSWAP.svg',
        href: 'https://syncswap.xyz/',
      },
    })
    expect(screen.getByText('Powered by')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Syncswap home' })).toHaveAttribute(
      'href',
      'https://syncswap.xyz/',
    )
  })

  it('reveals the native gas fee when hovering the fee value on desktop', async () => {
    useIsMobileMock.mockReturnValue(false)
    const user = userEvent.setup()
    renderBuy({
      networkFeeLabel: '$0.2',
      networkFeeNativeLabel: '<0.1 ETH',
    })

    await user.hover(screen.getByRole('button', { name: 'Network fee details' }))
    expect(await screen.findByText('<0.1 ETH')).toBeInTheDocument()
  })

  it('shows network fee explainer from the info icon', async () => {
    useIsMobileMock.mockReturnValue(false)
    const user = userEvent.setup()
    renderBuy({
      networkFeeLabel: '$0.2',
      networkFeeNativeLabel: '<0.1 ETH',
    })

    await user.hover(screen.getByRole('button', { name: 'About network fee' }))
    expect(
      await screen.findByText(/paid to the network to process your transaction/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/estimate and can vary by chain/i)).toBeInTheDocument()
  })

  it('opens the native gas fee in a shadcn popover on mobile', async () => {
    useIsMobileMock.mockReturnValue(true)
    const user = userEvent.setup()
    renderBuy({
      networkFeeLabel: '$0.2',
      networkFeeNativeLabel: '<0.1 ETH',
    })

    await user.click(screen.getByRole('button', { name: /network fee details/i }))
    expect(await screen.findByText('<0.1 ETH')).toBeInTheDocument()
  })
})
